import json
import os
import spacy
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Global nlp object for lazy loading
_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        print("📥 Loading NLP model (once)...")
        _nlp = spacy.load("en_core_web_sm")
    return _nlp

def load_skills():
    try:
        # Support running from any working directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(base_dir, "skills.json"), "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def extract_skills_rule_based(text):
    """Fallback rule-based skill extraction using spaCy + skills.json whitelist."""
    skill_db = load_skills()
    found_skills = set()

    for category in skill_db:
        for skill in skill_db[category]:
            if skill.lower() in text.lower():
                found_skills.add(skill)

    # NLP-based phrase matching
    nlp = get_nlp()
    doc = nlp(text)
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.lower()
        for category in skill_db:
            for skill in skill_db[category]:
                if skill.lower() in chunk_text:
                    found_skills.add(skill)

    return {skill: "Medium" for skill in sorted(found_skills)}

def is_tech_skill(skill_name, skill_db):
    """
    STRICT WHITELIST FILTER v2.0
    - PASS if skill matches a term in skills.json
    - PASS if skill is a single atomic word (e.g. 'Cloudinary')
    - BLOCK if skill is a phrase (2+ words) and NOT in the whitelist.
    """
    skill_lower = skill_name.strip().lower()

    # 1. Exact or Partial Match in the Tech Whitelist
    for category in skill_db:
        whitelist_terms = [s.lower() for s in skill_db[category]]
        if skill_lower in whitelist_terms:
            return True
        for term in whitelist_terms:
            if term == skill_lower or (len(term) > 3 and term in skill_lower):
                return True

    # 2. Allow single atomic words (likely new libraries/tools)
    noise_words = ["design", "management", "solutions", "systems", "development", "analytical", "communication"]
    words = skill_name.split()
    if len(words) == 1:
        if words[0].lower() in noise_words:
            print(f"DEBUG: [Filter] Blocking single-word noise: {skill_name}")
            return False
        return True

    # 3. Everything else (phrases not in whitelist) is BLOCKED
    print(f"DEBUG: [Filter] BLOCKING non-whitelisted phrase: {skill_name}")
    return False

def extract_skills_and_confidence(text):
    """Main entry point — uses Groq LLaMA 3.3 70B, falls back to rule-based."""
    skill_db = load_skills()

    # Try Groq AI extraction first
    results = None
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
        print("🤖 [Groq] Using LLaMA 3.3 70B for skill extraction...")
        results = extract_skills_groq(text)
    else:
        print("⚠️  GROQ_API_KEY not set — falling back to rule-based extraction.")

    if not results:
        print("⚠️  Groq extraction failed or returned empty — falling back to rule-based.")
        results = extract_skills_rule_based(text)

    # Apply strict whitelist filter
    filtered = {}
    for skill, confidence in results.items():
        if is_tech_skill(skill, skill_db):
            filtered[skill] = confidence

    print(f"✅ [Groq Extractor] Final skill count after filter: {len(filtered)}")
    return filtered

def extract_skills_groq(text):
    """
    Extract skills using Groq LLaMA 3.3 70B.
    Returns {skill_name: confidence_level} or None on failure.
    """
    try:
        client = Groq(api_key=GROQ_API_KEY)

        prompt = f"""Analyze the following resume text and extract ONLY SPECIFIC TECHNOLOGIES:
programming languages, frameworks, libraries, databases, cloud platforms, and DevOps tools.

STRICT RULES:
1. EXCLUDE soft skills (e.g., Leadership, Communication, Problem Solving).
2. EXCLUDE project descriptions (e.g., "AI Chatbot Integration", "Responsive Design").
3. EXCLUDE academic subjects unless they are specific software tools.
4. Return ATOMIC names only: "React" not "React Frontend Development", "Node.js" not "Node.js Backend".
5. Assign confidence based on context evidence:
   - "High"   = used in multiple projects / explicitly listed as primary skill
   - "Medium" = mentioned once or in a project
   - "Low"    = briefly mentioned / listed without context

Return ONLY a valid JSON object. No markdown, no explanation. Example:
{{"React": "High", "Node.js": "Medium", "MongoDB": "High", "Python": "Low"}}

Resume Text:
{text[:5000]}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise Technical Stack Extractor. "
                        "Your output must be ONLY a valid JSON object mapping technology names "
                        "to confidence levels (High/Medium/Low). Nothing else."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=1024,
        )

        content = response.choices[0].message.content.strip()
        print(f"DEBUG: [Groq] Raw response: {content[:300]}")

        # Strip any accidental markdown code fences
        if "```" in content:
            parts = content.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    content = part
                    break

        result = json.loads(content)
        if isinstance(result, dict) and len(result) > 0:
            print(f"✅ [Groq] Extracted {len(result)} skills successfully.")
            return result

        print("⚠️  [Groq] Response was empty or invalid dict.")
        return None

    except json.JSONDecodeError as e:
        print(f"❌ [Groq] JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"❌ [Groq] API call failed: {e}")
        return None
