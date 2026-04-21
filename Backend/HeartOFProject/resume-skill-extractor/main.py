from text_extractor import extract_text
from text_cleaner import clean_text
from skill_extractor import extract_skills_and_confidence as extract_skills
from github_fetcher import get_recent_repos
from github_skill_verifier import verify_skills
from fake_skill_detector import fake_skill_score, fake_label
import os
import json
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def run(resume_path, github_username=None, json_output=False):
    # Muffle all stdout from sub-modules if in JSON mode to prevent console pollution
    original_stdout = sys.stdout
    if json_output:
        sys.stdout = open(os.devnull, 'w')

    results = {
        "resume_skills": {},
        "github_verification": {},
        "fake_skill_detection": {},
        "project_audit": [],
        "error": None,
        "github_username": github_username
    }

    try:
        if not json_output: print("📄 Reading resume...")
        raw_text = extract_text(resume_path)

        if not json_output: print("🧹 Cleaning text...")
        cleaned_text = clean_text(raw_text)

        # ---------------- Resume Skill Extraction ----------------
        if not json_output: print("🧠 Extracting skills and confidence from resume...")
        skill_data = extract_skills(cleaned_text)

        if not skill_data:
            if json_output: 
                print(json.dumps({"error": "No skills detected"}))
                return
            else:
                print("No skills detected.")
                return

        results["resume_skills"] = skill_data

        if not json_output:
            print("\n✅ Extracted Skills & Confidence:")
            for skill, level in skill_data.items():
                print(f"- {skill}: {level}")

        # Use keys for verification
        skills_list = list(skill_data.keys())

        # ---------------- GitHub Verification + Depth ----------------
        if github_username:
            if not json_output: print("\n🔗 Fetching recent GitHub repositories...")
            repos = get_recent_repos(github_username)

            if repos:
                if not json_output: print("🔍 Scanning actual code, commits & LOC...")
                github_results = verify_skills(skills_list, repos, github_username)
                results["github_verification"] = github_results

                if not json_output:
                    print("\n✅ GitHub Skill Verification (Depth Score):")
                    for skill_lower, data in github_results.items():
                        print(
                            f"- {data['display_name']}: {data['status']} | "
                            f"LOC: {data['loc']} | "
                            f"Commits: {data['commits']} | "
                            f"Depth: {data['depth']}"
                        )

        # ---------------- Fake Skill Detection ----------------
        if not json_output: print("\n🚨 Fake-Skill Detection Score:")
        for skill in skills_list:
            score = fake_skill_score(
                skill,
                skill_data.get(skill, "Low"),
                results["github_verification"].get(skill.lower())
            )
            label = fake_label(score)
            
            results["fake_skill_detection"][skill] = {
                "score": score,
                "label": label
            }

            if not json_output:
                print(
                    f"- {skill}: Risk Score = {score}/100 | "
                    f"Assessment = {label}"
                )

        # ---------------- Final JSON Output ----------------
        if json_output:
            sys.stdout = original_stdout
            print(json.dumps(results))

    except Exception as e:
        if json_output:
            sys.stdout = original_stdout
            print(json.dumps({"error": str(e)}))
        else:
            print(f"Error during execution: {e}")


if __name__ == "__main__":
    # Command line argument handling
    # Usage: python main.py <resume_path> [github_username] [--json]
    
    args = sys.argv[1:]
    
    if not args:
        # Default test mode if no args provided (backward compatibility)
        RESUME_FILE = "Rahul_Chauhan_Test_Resume.docx"
        GITHUB_USERNAME = "cchauhan7710"
        run(RESUME_FILE, GITHUB_USERNAME, json_output=False)
    else:
        resume_path = args[0]
        github_username = None
        json_mode = False
        
        for arg in args[1:]:
            if arg == "--json":
                json_mode = True
            else:
                github_username = arg
                
        run(resume_path, github_username, json_output=json_mode)
