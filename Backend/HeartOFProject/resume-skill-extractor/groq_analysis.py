"""
groq_analysis.py
================
Advanced Groq LLaMA 3.3 70B powered analysis:
  1. generate_candidate_summary()   — Professional AI summary of the candidate
  2. generate_job_fit()             — Top 3 recommended job roles with reasoning
  3. synthesize_skill_accuracy()    — LLM-driven skill accuracy by reconciling
                                      resume claims vs GitHub evidence
"""

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def _get_client():
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        return None
    return Groq(api_key=GROQ_API_KEY)


def generate_candidate_summary(resume_text: str, skills: list) -> str:
    """
    Generate a concise professional summary of the candidate using LLaMA 3.3 70B.

    Args:
        resume_text: Raw/cleaned resume text
        skills: List of extracted skill names

    Returns:
        A 3-4 sentence professional summary string, or a fallback message.
    """
    client = _get_client()
    if not client:
        return "AI summary unavailable — GROQ_API_KEY not configured."

    skills_str = ", ".join(skills[:20]) if skills else "various technologies"

    prompt = f"""Based on the following resume content, write a concise 3-4 sentence professional summary 
for this candidate. Focus on their experience level, key technical strengths, and what makes them stand out.
Write in third person (e.g., "The candidate is..."). Be specific and professional.

Key Skills Detected: {skills_str}

Resume Content:
{resume_text[:4000]}

Write ONLY the summary paragraph. No headers, no bullet points, no extra text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional technical recruiter who writes concise, "
                        "accurate candidate summaries. Be specific, avoid generic filler phrases."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=300,
        )
        summary = response.choices[0].message.content.strip()
        print(f"✅ [Groq] Candidate summary generated ({len(summary)} chars).")
        return summary
    except Exception as e:
        print(f"❌ [Groq] Summary generation failed: {e}")
        return "AI summary could not be generated at this time."


def generate_job_fit(resume_text: str, skills: list, github_data: dict, repos: list = None) -> list:
    """
    Suggest top 3 job roles using LLaMA 3.3 70B.
    Enriched with GitHub Project Portfolio — NLP analysis of actual repos
    (names, descriptions, languages, commits) as the PRIMARY role signal.

    Args:
        resume_text: Cleaned resume text
        skills:      List of extracted skill names
        github_data: {skill_lower: {status, depth, loc, commits}} per skill
        repos:       Enriched repo list from github_fetcher (name, description, languages, commits)

    Returns:
        List of dicts: [{"role": str, "match_score": int, "reasoning": str}, ...]
        Or an empty list on failure.
    """
    client = _get_client()
    if not client:
        return []

    # --- Skill Verification Context (secondary signal) ---
    skill_summary_parts = []
    for skill in skills[:20]:
        gh = github_data.get(skill.lower(), {})
        status = gh.get("status", "Not Verified")
        depth = gh.get("depth", "Low")
        skill_summary_parts.append(f"{skill} ({status}, depth: {depth})")
    skill_context = ", ".join(skill_summary_parts) if skill_summary_parts else ", ".join(skills[:20])

    # --- GitHub Project Portfolio (primary signal — NLP over repo metadata) ---
    if repos:
        portfolio_lines = []
        for r in repos[:8]:  # Top 8 most recent repos
            name     = r.get("name", "unnamed")
            desc     = (r.get("description") or "").strip() or "No description"
            commits  = r.get("total_commits", 0)
            top_langs = list(r.get("languages", {}).keys())[:4]
            langs_str = ", ".join(top_langs) if top_langs else "Unknown"
            loc      = r.get("total_loc", 0)
            portfolio_lines.append(
                f'• "{name}": {desc} | Tech: {langs_str} | LOC: {loc:,} | Commits: {commits}'
            )
        project_portfolio = "\n".join(portfolio_lines)
    else:
        project_portfolio = "No GitHub repository data available."

    prompt = f"""Analyze the following developer profile and recommend the TOP 3 most suitable job roles.

INSTRUCTION: Use the GitHub Project Portfolio as your PRIMARY signal — it shows what the candidate
actually builds. Use Verified Skills as a SECONDARY confirmation. Use the Resume as background only.

GitHub Project Portfolio (NLP-analyzed from actual repos):
{project_portfolio}

Verified Skill Stack:
{skill_context}

Resume Summary (first 2000 chars):
{resume_text[:2000]}

Return ONLY a valid JSON array with exactly 3 objects, no markdown, no explanation.
Each object must have these exact keys:
- "role": job title string
- "match_score": integer from 0-100 representing fit percentage
- "reasoning": one sentence referencing SPECIFIC projects or languages from the portfolio

Example format:
[
  {{"role": "Full Stack Developer", "match_score": 92, "reasoning": "Built ecom-store and task-api using React + Node.js with 300+ commits each."}},
  {{"role": "ML Engineer", "match_score": 75, "reasoning": "ml-price-predictor repo shows hands-on Python ML work with scikit-learn."}},
  {{"role": "Backend Engineer", "match_score": 68, "reasoning": "Strong REST API patterns seen across 4 Node.js repos with verified GitHub depth."}}
]"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a senior technical recruiter specializing in developer roles. "
                        "Return only valid JSON arrays. No markdown fences."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=512,
        )

        content = response.choices[0].message.content.strip()
        print(f"DEBUG: [Groq] Job fit raw: {content[:300]}")

        # Strip markdown code fences if present
        if "```" in content:
            parts = content.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("["):
                    content = part
                    break

        result = json.loads(content)
        if isinstance(result, list) and len(result) > 0:
            print(f"✅ [Groq] Job fit analysis complete — {len(result)} roles suggested.")
            return result

        return []
    except json.JSONDecodeError as e:
        print(f"❌ [Groq] Job fit JSON parse error: {e}")
        return []
    except Exception as e:
        print(f"❌ [Groq] Job fit generation failed: {e}")
        return []


def synthesize_skill_accuracy(skills_list: list, skill_confidence: dict, github_results: dict) -> dict:
    """
    Reconcile what the resume claims vs what GitHub actually proves for each skill.
    Uses a single batched Groq LLM call for all skills (efficient).

    Args:
        skills_list:      List of skill name strings (e.g. ["React", "Python"])
        skill_confidence: {skill: "High"|"Medium"|"Low"} — from resume extraction
        github_results:   {skill_lower: {status, loc, commits, depth, verified_repos}}

    Returns:
        {
          "React": {
            "accuracy_score": 87,
            "verdict": "Proven",         # Proven | Plausible | Overstated | Unverified
            "reasoning": "..."
          },
          ...
        }
        Returns an empty dict on failure.
    """
    client = _get_client()
    if not client:
        return {}

    if not skills_list:
        return {}

    # Build a compact evidence snapshot per skill for the LLM
    evidence_rows = []
    for skill in skills_list:
        sk_lower = skill.lower()
        gh = github_results.get(sk_lower, {})
        evidence_rows.append({
            "skill":             skill,
            "resume_claim":      skill_confidence.get(skill, "Low"),
            "github_status":     gh.get("status", "Not Verified"),
            "github_depth":      gh.get("depth", "Low"),
            "loc":               gh.get("loc", 0),
            "commits":           gh.get("commits", 0),
            "verified_repo_count": len(gh.get("verified_repos", []))
        })

    evidence_json = json.dumps(evidence_rows, indent=2)

    prompt = f"""You are a senior technical recruiter reviewing a software developer's skill claims vs their actual GitHub activity.

For each skill below, reconcile the resume claim with the GitHub evidence and produce an accuracy verdict.

Verdict definitions:
- "Proven"     — GitHub evidence strongly supports or exceeds the claim (high LOC/commits, verified repos)
- "Plausible"  — Some GitHub evidence exists but insufficient to fully confirm the claim
- "Overstated" — Claim is High/Medium but GitHub evidence is absent or very weak
- "Unverified" — No GitHub data available; cannot confirm or deny

accuracy_score rules (0-100):
- Start at 50 (neutral)
- +30 if github_status is "Verified" AND github_depth is "High"
- +20 if github_status is "Verified" AND github_depth is "Medium"
- +10 if github_status is "Verified" AND github_depth is "Basic"
- +10 if resume_claim is "High" AND verified
- -20 if resume_claim is "High" BUT github_status is "Not Verified"
- -10 if resume_claim is "Medium" BUT github_status is "Not Verified"
- Adjust within 0-100 range

Skill Evidence Data:
{evidence_json}

Return ONLY a valid JSON object (no markdown, no explanation) where each key is the exact skill name, like:
{{
  "React": {{"accuracy_score": 85, "verdict": "Proven", "reasoning": "High resume claim backed by 15,000+ LOC across 4 verified repos."}},
  "Kubernetes": {{"accuracy_score": 35, "verdict": "Overstated", "reasoning": "Claimed as High but no GitHub repos show Kubernetes usage."}}
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise skill-accuracy evaluator. "
                        "Return only a valid JSON object mapping skill names to accuracy verdicts. "
                        "No markdown fences, no extra text."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1024,
        )

        content = response.choices[0].message.content.strip()
        print(f"DEBUG: [Groq] Skill accuracy raw: {content[:400]}")

        # Strip markdown fences if present
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
            print(f"✅ [Groq] Skill accuracy synthesis complete — {len(result)} skills evaluated.")
            return result

        return {}

    except json.JSONDecodeError as e:
        print(f"❌ [Groq] Skill accuracy JSON parse error: {e}")
        return {}
    except Exception as e:
        print(f"❌ [Groq] Skill accuracy synthesis failed: {e}")
        return {}
