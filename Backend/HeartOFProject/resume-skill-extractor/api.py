from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from text_extractor import extract_text
from text_cleaner import clean_text
from skill_extractor import extract_skills_and_confidence   # ← correct function name
from github_fetcher import get_recent_repos
from github_skill_verifier import verify_skills
from info_extractor import extract_info
from fake_skill_detector import fake_skill_score, fake_label
from groq_analysis import generate_candidate_summary, generate_job_fit, synthesize_skill_accuracy

app = FastAPI(title="AI Resume Skill Verification API")

print("\n" + "="*40)
print(">>> PYTHON NLP CORE v2.0 READY <<<")
print(">>> PORT: 8001 | AUTH: LOADED <<<")
print("="*40 + "\n")


def extract_github_username_from_text(text: str):
    if not text:
        return None

    patterns = [
        r"github\.com/([A-Za-z0-9-]+)(?:/[A-Za-z0-9_.-]+)?",
        r"GitHub\s*[:\-]?\s*([A-Za-z0-9-]+)",
        r"@([A-Za-z0-9-]+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            username = match.group(1).strip()
            if username and '/' not in username:
                return username
    return None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    github_username: str = Form(None)
):
    # ---------------- Save Resume ----------------
    print(f"\nDEBUG: [API] Received analysis request for github_username: '{github_username}'")
    token = os.getenv("GITHUB_TOKEN")
    print(f"DEBUG: [API] GITHUB_TOKEN status: {'LOADED' if token else 'MISSING'}")
    
    resume_path = os.path.join(UPLOAD_DIR, resume.filename)
    with open(resume_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    # ---------------- Resume Processing ----------------
    raw_text     = extract_text(resume_path)
    """
    Simple regex-based extraction for Name, Email, and Phone.
    """
    cleaned_text = clean_text(raw_text)

    # If no username was passed, look for one inside the resume text.
    if github_username:
        github_username = github_username.strip()
    if not github_username:
        github_username = extract_github_username_from_text(raw_text)
        if github_username:
            print(f"DEBUG: [API] Extracted GitHub username from resume: '{github_username}'")

    if not github_username:
        raise HTTPException(
            status_code=400,
            detail='GitHub profile not found in resume. Please include a GitHub link or enter your GitHub username.'
        )

    # extract_skills_and_confidence returns {skill: confidence_level}
    skill_confidence = extract_skills_and_confidence(cleaned_text)
    skills_list      = list(skill_confidence.keys())

    # ---------------- Extract Info ----------------
    info = extract_info(raw_text)

    result = {
        "candidate_name": info["candidate_name"],
        "contact_info": {
            "email":    info["email"],
            "phone":    info["phone"],
            "location": info["location"]
        },
        "skills":          [],
        "github_analysis": {},
        "fake_skill_risk": {},
        "project_audit":   [],
        "ai_summary":      "",
        "job_fit":         [],
        "skill_accuracy":  {}
    }

    # ---------------- GitHub Verification ----------------
    github_results = {}
    repos = []
    if github_username and skills_list:
        repos = get_recent_repos(github_username)
        if repos:
            github_results = verify_skills(skills_list, repos, github_username)
            
            for r in repos:
                result["project_audit"].append({
                    "name": r.get("name", ""),
                    "description": r.get("description", ""),
                    "url": r.get("html_url", ""),
                    "skills": list(r.get("languages", {}).keys()),
                    "totalLoc": r.get("total_loc", 0),
                    "totalCommits": r.get("total_commits", 0),
                    "relevanceScore": 90
                })

    # ---------------- LLM Skill Accuracy Synthesis ----------------
    print("\n🔬 [Groq] Synthesizing skill accuracy (resume claim vs GitHub evidence)...")
    skill_accuracy = synthesize_skill_accuracy(skills_list, skill_confidence, github_results)
    result["skill_accuracy"] = skill_accuracy

    # ---------------- Build Response ----------------
    for skill in skills_list:
        github_data = github_results.get(skill.lower(), {
            "status": "Not Verified",
            "loc":     0,
            "commits": 0,
            "depth":   "Low",
            "verified_repos": []
        })

        # Extract LLM accuracy verdict first (needed for risk scoring)
        accuracy             = skill_accuracy.get(skill, {})
        skill_verdict        = accuracy.get("verdict", "Unverified")
        skill_accuracy_score = accuracy.get("accuracy_score", None)

        # LLM-driven risk score (falls back to weight formula if LLM unavailable)
        score = fake_skill_score(
            skill,
            skill_confidence.get(skill, "Low"),
            github_data,
            verdict=skill_verdict,
            accuracy_score=skill_accuracy_score
        )

        result["skills"].append({
            "skill":              skill,
            "resume_confidence":  skill_confidence.get(skill, "Low"),
            "status":             github_data.get("status",  "Not Verified"),
            "loc":                github_data.get("loc",     0),
            "commits":            github_data.get("commits", 0),
            "depth":              github_data.get("depth",   "Low"),
            "verifiedRepos":      github_data.get("verified_repos", []),
            "accuracy_score":     skill_accuracy_score,
            "verdict":            skill_verdict,
            "reasoning":          accuracy.get("reasoning", ""),
        })

        result["fake_skill_risk"][skill] = {
            "score": score,
            "label": fake_label(score)
        }

    # ---------------- Groq AI Summary + Job Fit ----------------
    print("\n🧠 [Groq] Generating AI candidate summary and job-fit analysis...")
    result["ai_summary"] = generate_candidate_summary(cleaned_text, skills_list)
    result["job_fit"]    = generate_job_fit(cleaned_text, skills_list, github_results, repos=repos)

    return result
