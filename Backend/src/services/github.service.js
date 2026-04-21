import axios from 'axios';
import { apiError } from '../utils/apiError.js';

// Framework → parent language mapping for intelligent cross-referencing
const frameworkMapping = {
    'react':        ['javascript', 'typescript'],
    'vue':          ['javascript', 'typescript'],
    'angular':      ['typescript', 'javascript'],
    'node.js':      ['javascript', 'typescript'],
    'express':      ['javascript', 'typescript'],
    'next.js':      ['javascript', 'typescript'],
    'django':       ['python'],
    'flask':        ['python'],
    'fastapi':      ['python'],
    'laravel':      ['php'],
    'spring':       ['java', 'kotlin'],
    'flutter':      ['dart'],
    'react native': ['javascript', 'typescript'],
    'tailwind':     ['css', 'html'],
    'bootstrap':    ['css', 'html'],
    'mongodb':      ['javascript', 'python', 'java'],
    'postgresql':   ['sql', 'psql'],
};

const getGithubConfig = () => {
    const config = { headers: { 'Accept': 'application/vnd.github.v3+json' } };
    if (process.env.GITHUB_PAT) {
        config.headers['Authorization'] = `Bearer ${process.env.GITHUB_PAT}`;
    }
    return config;
};

const fetchUserRepos = async (username) => {
    try {
        const url      = `https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=100`;
        const response = await axios.get(url, getGithubConfig());
        return response.data.filter(repo => !repo.fork);
    } catch (error) {
        console.error(`[GitHub Service] Error fetching repos for ${username}:`, error.message);
        return null;
    }
};

const fetchRepoLanguages = async (username, repoName) => {
    try {
        const url      = `https://api.github.com/repos/${username}/${repoName}/languages`;
        const response = await axios.get(url, getGithubConfig());
        return response.data;
    } catch (error) {
        console.error(`[GitHub Service] Error fetching languages for ${repoName}:`, error.message);
        return {};
    }
};

/**
 * Verifies a list of skills against the user's GitHub repositories.
 * Returns aggregated stats per skill: bytes, simulated commits, dates, repos.
 *
 * @param {string}   username - GitHub username.
 * @param {string[]} skills   - List of skill names from AI extraction.
 * @returns {Promise<Object>} - Map of skill → GitHub stats.
 */
export const verifySkillsOnGithub = async (username, skills) => {
    if (!username) return {};

    const repos = await fetchUserRepos(username);
    if (!repos || repos.length === 0) return {};

    const skillStats = {};
    skills.forEach(skill => {
        skillStats[skill.toLowerCase()] = {
            totalBytes:       0,
            simulatedCommits: 0,
            oldestDate:       null,
            newestDate:       null,
            found:            false,
            verifiedRepos:    new Set()
        };
    });

    // Scan top 15 most recently updated repos to keep it fast
    const activeRepos        = repos.slice(0, 15);
    const repoLanguagePromises = activeRepos.map(repo => fetchRepoLanguages(username, repo.name));
    const reposLanguages     = await Promise.all(repoLanguagePromises);

    activeRepos.forEach((repo, index) => {
        const languagesInRepo = reposLanguages[index] || {};
        const repoLowerName   = repo.name.toLowerCase();
        const repoDescription = (repo.description || '').toLowerCase();
        const createdAt       = new Date(repo.created_at);
        const updatedAt       = new Date(repo.updated_at);

        Object.keys(skillStats).forEach(skillName => {
            const skillLower = skillName.toLowerCase();
            let isMatch = false;
            let contributionBytes = 0;

            // 1. Direct language match
            if (Object.keys(languagesInRepo).some(lang => lang.toLowerCase() === skillLower)) {
                isMatch = true;
                const matchedLang = Object.keys(languagesInRepo).find(l => l.toLowerCase() === skillLower);
                contributionBytes = languagesInRepo[matchedLang] || 0;
            }

            // 2. Framework → parent language mapping
            if (!isMatch && frameworkMapping[skillLower]) {
                const parents    = frameworkMapping[skillLower];
                const foundParent = Object.keys(languagesInRepo).find(lang => parents.includes(lang.toLowerCase()));
                if (foundParent) {
                    isMatch = true;
                    contributionBytes = languagesInRepo[foundParent];
                }
            }

            // 3. Repo name / description keyword match
            if (!isMatch && (repoLowerName.includes(skillLower) || repoDescription.includes(skillLower))) {
                isMatch = true;
                contributionBytes = Object.values(languagesInRepo)[0] || 5000;
            }

            if (isMatch) {
                skillStats[skillName].found = true;
                skillStats[skillName].totalBytes       += contributionBytes;
                skillStats[skillName].simulatedCommits += Math.floor(contributionBytes / 2000) || 1;
                skillStats[skillName].verifiedRepos.add(repo.name);

                if (!skillStats[skillName].oldestDate || createdAt < skillStats[skillName].oldestDate) {
                    skillStats[skillName].oldestDate = createdAt;
                }
                if (!skillStats[skillName].newestDate || updatedAt > skillStats[skillName].newestDate) {
                    skillStats[skillName].newestDate = updatedAt;
                }
            }
        });
    });

    // Convert Sets → Arrays for JSON serialization
    Object.keys(skillStats).forEach(skill => {
        skillStats[skill].verifiedRepos = Array.from(skillStats[skill].verifiedRepos);
    });

    return skillStats;
};
