def verify_skills(skills, repos, github_username=None):
    """Forensic Skill Verification by aggregating mechanical GitHub telemetry (LOC/Commits).
    
    Includes a 'Tech Association' map to bridge frameworks with their base languages.
    """
    if not skills:
        return {}

    # Bridge between Frameworks/Tools and Languages
    # GitHub detects base languages (JavaScript, Python, etc.), not frameworks.
    # This map lets us credit frameworks when their base language is found in repos.
    TECH_ASSOCIATION = {
        # JavaScript / TypeScript ecosystem
        "react":            ["javascript", "typescript", "jsx", "tsx"],
        "react.js":         ["javascript", "typescript"],
        "react native":     ["javascript", "typescript"],
        "reactnative":      ["javascript", "typescript"],
        "expo":             ["javascript", "typescript"],
        "node":             ["javascript"],
        "node.js":          ["javascript"],
        "express":          ["javascript"],
        "express.js":       ["javascript"],
        "next.js":          ["javascript", "typescript"],
        "nextjs":           ["javascript", "typescript"],
        "redux":            ["javascript", "typescript"],
        "redux toolkit":    ["javascript", "typescript"],
        "vue":              ["javascript", "typescript"],
        "vue.js":           ["javascript", "typescript"],
        "angular":          ["typescript", "javascript"],
        "svelte":           ["javascript", "typescript"],
        "nuxt":             ["javascript", "typescript"],
        "gatsby":           ["javascript", "typescript"],

        # CSS / Styling
        "tailwind":         ["css", "html", "javascript"],
        "tailwind css":     ["css", "html", "javascript"],
        "bootstrap":        ["css", "html"],
        "sass":             ["css"],
        "scss":             ["css"],

        # Python frameworks
        "django":           ["python"],
        "flask":            ["python"],
        "fastapi":          ["python"],
        "celery":           ["python"],
        "pandas":           ["python", "jupyter notebook"],
        "numpy":            ["python"],
        "scikit":           ["python"],
        "tensorflow":       ["python"],
        "pytorch":          ["python"],

        # Java / JVM
        "spring":           ["java", "kotlin"],
        "spring boot":      ["java", "kotlin"],
        "hibernate":        ["java"],
        "kotlin":           ["kotlin", "java"],

        # PHP
        "laravel":          ["php"],
        "symfony":          ["php"],

        # Databases (detected as language in some repos, otherwise match by name)
        "mongodb":          ["javascript", "typescript"],
        "mongoose":         ["javascript", "typescript"],
        "postgresql":       ["plpgsql", "sql", "python", "javascript"],
        "postgres":         ["plpgsql", "sql", "python", "javascript"],
        "mysql":            ["sql", "python", "javascript", "php"],
        "sqlite":           ["sql", "python"],
        "redis":            ["python", "javascript"],
        "firebase":         ["javascript", "typescript"],

        # DevOps / Tools
        "docker":           ["dockerfile", "shell", "python"],
        "kubernetes":       ["yaml", "shell"],
        "graphql":          ["javascript", "typescript", "python"],
        "jwt":              ["javascript", "typescript", "python"],
        "cloudinary":       ["javascript", "typescript", "python"],
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
