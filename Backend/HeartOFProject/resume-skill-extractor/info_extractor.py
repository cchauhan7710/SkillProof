import re
import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def extract_info_regex(text):
    """
    Fallback regex-based extraction for Name, Email, and Phone.
    """
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
    
    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    candidate_name = lines[0] if lines else "Unknown Candidate"
    
    location = "Global Hub"
    location_keywords = ["New York", "San Francisco", "London", "Berlin", "Remote", "India", "USA", "UK", "Canada", "Australia"]
    for line in lines[:15]:
        for kw in location_keywords:
            if kw.lower() in line.lower():
                location = line
                break
        if location != "Global Hub":
            break

    url_pattern = r'https?://[^\s()<>]+|www\.[^\s()<>]+|github\.com/[^\s()<>]+|linkedin\.com/in/[^\s()<>]+|[a-zA-Z0-9-]+\.(?:com|io|net|org|dev|app|co)/[^\s()<>]*'
    raw_links = list(set(re.findall(url_pattern, text)))
    clean_links = []
    for l in raw_links:
        l = re.sub(r'[,.]$', '', l)
        if '@' not in l:
            clean_links.append(l)
    clean_links = list(set(clean_links))

    return {
        "candidate_name": candidate_name[:50],
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "location": location[:100],
        "links": clean_links
    }

def extract_info(text):
    """
    Main entry point — uses Groq LLaMA 3.3 70B to extract info, falls back to regex.
    """
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
        print("🤖 [Groq] Using LLaMA 3.3 70B for metadata extraction...")
        try:
            client = Groq(api_key=GROQ_API_KEY)
            prompt = f"""Analyze the provided resume text and extract the candidate's personal information.

Format the output strictly as a JSON object with the following keys:
- "candidate_name": Full name of the candidate (string). If not found, use "Unknown Candidate".
- "email": First email address found (string). If not found, use null.
- "phone": First phone number found (string). If not found, use null.
- "location": City, state, or country (string). If not found, use "Global Hub".
- "links": List of profile links (GitHub, LinkedIn, Portfolio) (array of strings). Do not include mailto links.

Return ONLY a valid JSON object. No markdown, no explanation, no code fences. Example: {{"candidate_name": "Jane Doe", "email": "j@doe.com", "phone": "123-456-7890", "location": "New York", "links": ["github.com/janedoe"]}}

Resume Text (start):
{text[:4000]}
"""
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at parsing resumes. Return valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=512,
            )

            content = response.choices[0].message.content.strip()
            
            # Strip markdown block if model includes it
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
            
            # Validate output matches expected keys
            required_keys = ["candidate_name", "email", "phone", "location", "links"]
            if all(key in result for key in required_keys):
                print("✅ [Groq] Metadata extraction successful.")
                return result
            else:
                print("⚠️ [Groq] JSON missing expected keys, falling back...")
                
        except json.JSONDecodeError as e:
            print(f"❌ [Groq] JSON parse error: {e}. Falling back to regex.")
        except Exception as e:
            print(f"❌ [Groq] Metadata extraction API failed: {e}. Falling back to regex.")

    print("⚠️  [Regex] Using fallback regex metadata extraction...")
    return extract_info_regex(text)
