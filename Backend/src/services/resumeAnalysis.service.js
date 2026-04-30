import fs from 'fs';
import ResumeAnalysis from '../models/ResumeAnalysis.model.js';
import { callPythonNLP } from './nlpBridge.service.js';

/**
 * Maps the Python api.py JSON response to the MongoDB ResumeAnalysis schema.
 *
 * Python api.py returns:
 * {
 *   skills: [
 *     { skill, resume_confidence, status, loc, commits, depth }
 *   ],
 *   fake_skill_risk: { "React": { score: 10, label: "Genuine" } },
 *   github_analysis: {}
 * }
 */
const mapPythonResponseToSchema = (pyData) => {
    const skillsArray    = pyData.skills        || [];
    const fakeRiskMap    = pyData.fake_skill_risk || {};

    const scoredSkills = skillsArray.map(s => {
        const skillName = s.skill || '';
        
        // Case-insensitive lookup for risk data
        const entryKey = Object.keys(fakeRiskMap).find(k => k.toLowerCase() === skillName.toLowerCase());
        const fakeData = entryKey ? fakeRiskMap[entryKey] : {};
        
        // Map confidence string to numeric score for the UI bar
        const confidenceLevels = { 'High': 90, 'Medium': 60, 'Low': 30 };
        const scoreVal = confidenceLevels[s.resume_confidence] || 50;

        return {
            name:             skillName,
            resumeConfidence: s.resume_confidence || 'Low',
            confidenceScore:  scoreVal,
            github: {
                status:        s.status   || 'Not Verified',
                loc:           s.loc      || 0,
                commits:       s.commits  || 0,
                depth:         s.depth    || 'Basic',
                lastUsed:      null,
                verifiedRepos: s.verifiedRepos || []
            },
            fakeSkillRisk: {
                score: fakeData.score ?? 50,
                label: fakeData.label || 'Low Risk'
            },
            // LLM Accuracy Synthesis fields
            accuracyScore: s.accuracy_score ?? null,
            verdict:       s.verdict       || 'Unverified',
            reasoning:     s.reasoning     || ''
        };
    });

    const totalSkills    = scoredSkills.length;
    const verifiedSkills = scoredSkills.filter(s => s.github.status === 'Verified').length;
    
    const fakeSkills     = scoredSkills.filter(
        s => s.fakeSkillRisk.label === 'High Risk'
    ).length;

    const trustScore = totalSkills > 0
        ? Math.round(
            scoredSkills.reduce((acc, s) => acc + (100 - s.fakeSkillRisk.score), 0) / totalSkills
          )
        : 0;

    return {
        candidateName: pyData.candidate_name || "Core Build",
        contactInfo: {
            email: pyData.contact_info?.email || "",
            phone: pyData.contact_info?.phone || "",
            location: pyData.contact_info?.location || ""
        },
        skills:      scoredSkills,
        summary:     { totalSkills, verifiedSkills, fakeSkills, trustScore },
        projectAudit: pyData.project_audit || [],
        jobFit:      pyData.job_fit        || [],
        aiSummary:   pyData.ai_summary     || ''
    };
};

/**
 * Full pipeline orchestrator.
 * Called in the background after creating the ResumeAnalysis document.
 *
 * @param {string} analysisId      - MongoDB ObjectId of the ResumeAnalysis document.
 * @param {string} localFilePath   - Absolute local path to the uploaded resume file.
 * @param {string|null} githubUsername
 */
export const processResumeAnalysis = async (analysisId, localFilePath, githubUsername = null) => {
    try {
        console.log(`\n[Pipeline] 🚀 Starting analysis ${analysisId}`);
        console.log(`[Pipeline] File: ${localFilePath} | GitHub: ${githubUsername || 'none'}`);

        // ── Call Python NLP ──────────────────────────────────────────────
        console.log('[Pipeline] → Sending to Python FastAPI /analyze-resume …');
        const pyData = await callPythonNLP(localFilePath, githubUsername);
        console.log('[Pipeline] ← Python responded. Mapping to schema…');

        // ── Map & Persist ────────────────────────────────────────────────
        const { candidateName, contactInfo, skills, summary, projectAudit, jobFit, aiSummary } = mapPythonResponseToSchema(pyData);

        await ResumeAnalysis.findByIdAndUpdate(
            analysisId,
            { candidateName, contactInfo, skills, summary, projectAudit, job_fit: jobFit, ai_summary: aiSummary, status: 'completed' },
            { new: true }
        );

        console.log(
            `[Pipeline] ✅ Done. Trust: ${summary.trustScore}% | ` +
            `Skills: ${summary.totalSkills} | Verified: ${summary.verifiedSkills}\n`
        );

    } catch (error) {
        let errorMsg = error.message;
        if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
                errorMsg = error.response.data;
            } else if (error.response.data.detail) {
                errorMsg = error.response.data.detail;
            } else {
                errorMsg = JSON.stringify(error.response.data);
            }
        }
        console.error(`[Pipeline] ❌ Error for ${analysisId}:`, errorMsg, '\nFull Error:', error);
        await ResumeAnalysis.findByIdAndUpdate(analysisId, { status: 'failed', failureReason: errorMsg });

    } finally {
        // Clean up temp file regardless of success or failure
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log('[Pipeline] Temp file cleaned up.');
        }
    }
};
