import os
import requests

def get_recent_repos(github_username, max_repos=10):
    """Fetch public GitHub repositories for a username with mechanical metadata (LOC/Commits).
    """
    print(f"\nDEBUG: [GitHub] --- START FETCH FOR USER: '{github_username}' ---")
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    
    if token:
        # Support both 'ghp_' (Classic) and newer tokens
        # Classic tokens often work better with 'Token' prefix or plain Bearer
        headers["Authorization"] = f"token {token}"
        print(f"DEBUG: [GitHub] Using authenticated request (token ends in ...{token[-4:]})")
    else:
        print("DEBUG: [GitHub] WARNING: No GITHUB_TOKEN found. Rate limits will be low.")
        print(f"DEBUG: [GitHub] Current Env Keys: {list(os.environ.keys())}")

    # 1. Fetch repositories
    url = f"https://api.github.com/users/{github_username}/repos?sort=updated&per_page={max_repos}"
    print(f"DEBUG: [GitHub] Fetching repos for {github_username}...")
    
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        print(f"DEBUG: [GitHub] Repos API Status: {resp.status_code}")
        
        # Check rate limits
        remaining = resp.headers.get('X-RateLimit-Remaining')
        reset_time = resp.headers.get('X-RateLimit-Reset')
        print(f"DEBUG: [GitHub] Rate Limit Remaining: {remaining}")
        
        if resp.status_code == 401:
            print("DEBUG: [GitHub] ERROR: Unauthorized. Check your GITHUB_TOKEN.")
        elif resp.status_code == 403:
            print("DEBUG: [GitHub] ERROR: Rate limit exceeded or forbidden.")
        
        if resp.status_code != 200:
            print(f"DEBUG: [GitHub] Error Response: {resp.text}")
            resp.raise_for_status()

        repos_data = resp.json()
        print(f"DEBUG: [GitHub] Successfully found {len(repos_data)} repositories.")
        
        enriched_repos = []
        for r in repos_data:
            repo_name = r.get("name")
            
            # 2. Fetch Language Statistics (LOC)
            lang_url = f"https://api.github.com/repos/{github_username}/{repo_name}/languages"
            lang_resp = requests.get(lang_url, headers=headers, timeout=10)
            
            if lang_resp.status_code == 200:
                languages = lang_resp.json()
                total_loc = sum(languages.values())
                print(f"DEBUG: [GitHub] FETCH SUCCESS: {repo_name} | LOC: {total_loc}")
            else:
                print(f"DEBUG: [GitHub] FETCH FAILED: {repo_name} (Status: {lang_resp.status_code})")
                languages = {}
                total_loc = 0
            
            # 3. Simple Commit Estimation
            commit_url = f"https://api.github.com/repos/{github_username}/{repo_name}/commits?per_page=1"
            commit_resp = requests.get(commit_url, headers=headers, timeout=10)
            
            total_commits = 1
            if commit_resp.status_code == 200 and commit_resp.headers.get('link'):
                import re
                match = re.search(r'page=(\d+)>; rel="last"', commit_resp.headers.get('link'))
                if match:
                    total_commits = int(match.group(1))

            enriched_repos.append({
                "name": repo_name,
                "html_url": r.get("html_url"),
                "description": r.get("description") or "",
                "languages": languages,
                "total_loc": total_loc,
                "total_commits": total_commits,
                "updated_at": r.get("updated_at")
            })
            
        return enriched_repos
    except Exception as e:
        print(f"DEBUG: [GitHub] Fatal Fetch Error: {str(e)}")
        return []
