def verify_skills(skills, repos, github_username=None):
    """Forensic Skill Verification by aggregating mechanical GitHub telemetry (LOC/Commits).
    
    Includes a 'Tech Association' map to bridge frameworks with their base languages.
    """
    if not skills:
        return {}

    # Bridge between Frameworks/Tools and Languages
    TECH_ASSOCIATION = {
        "react": ["javascript", "typescript"],
        "node": ["javascript"],
        "node.js": ["javascript"],
        "express": ["javascript"],
        "express.js": ["javascript"],
        "next.js": ["javascript", "typescript"],
        "vue": ["javascript"],
        "angular": ["typescript", "javascript"],
        "django": ["python"],
        "flask": ["python"],
        "fastapi": ["python"],
        "spring": ["java"],
        "laravel": ["php"],
        "mongodb": ["javascript"], # Mongoose/Drivers often count as JS
        "tailwind": ["css", "html"],
        "bootstrap": ["css", "html"]
    }

    results = {}
    for skill in skills:
        skill_lower = skill.lower()
        results[skill_lower] = {
            "display_name": skill,
            "status": "Not Verified",
            "loc": 0,
            "commits": 0,
            "depth": "Low",
            "verified_repos": []
        }

    if not repos:
        return results

    # 1. Forensic Aggregation Loop
    for repo in repos:
        repo_name = repo.get("name", "").lower()
        repo_desc = repo.get("description", "").lower()
        repo_langs = repo.get("languages", {}) # { "Python": 1234, ... }
        repo_commits = repo.get("total_commits", 0)

        for skill in skills:
            skill_lower = skill.lower()
            
            # Match strategy: Exact Match OR Description Match OR Language Match OR Associated Tech Match
            associated_techs = TECH_ASSOCIATION.get(skill_lower, [])
            
            found_in_repo = False
            if skill_lower in repo_name or skill_lower in repo_desc:
                found_in_repo = True
            
            # Case-insensitive language check + Associated tech check
            for lang_name in repo_langs.keys():
                lang_lower = lang_name.lower()
                if skill_lower == lang_lower or lang_lower in associated_techs:
                    found_in_repo = True
                    # Add specific LOC from this language
                    results[skill_lower]["loc"] += repo_langs[lang_name]

            if found_in_repo:
                results[skill_lower]["status"] = "Verified"
                results[skill_lower]["commits"] += repo_commits
                results[skill_lower]["verified_repos"].append(repo.get("name"))
                
                # Fallback: if we didn't add LOC via language match above (e.g. matched via description only)
                if results[skill_lower]["loc"] == 0:
                    results[skill_lower]["loc"] += repo.get("total_loc", 0)

    # 2. Forensic Depth Calculation (Standardized Enums: Basic, Medium, High)
    for skill_lower, data in results.items():
        if data["status"] == "Verified":
            if data["loc"] > 20000 or data["commits"] > 50:
                data["depth"] = "High"
            elif data["loc"] > 5000 or data["commits"] > 20:
                data["depth"] = "Medium"
            else:
                data["depth"] = "Basic"
                
    return results
