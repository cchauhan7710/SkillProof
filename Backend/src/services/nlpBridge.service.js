import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const PYTHON_NLP_URL = process.env.PYTHON_NLP_URL || 'http://localhost:8001';

/**
 * Sends the resume file to the HeartOFProject Python FastAPI server.
 * POST http://localhost:8001/analyze-resume
 *
 * @param {string} localFilePath     - Absolute path to the resume file on disk.
 * @param {string|null} githubUsername - Optional GitHub username for verification.
 * @returns {Promise<Object>}           Raw JSON response from Python API.
 */
export const callPythonNLP = async (localFilePath, githubUsername = null) => {
    try {
        const form = new FormData();
        form.append('resume', fs.createReadStream(localFilePath));
        if (githubUsername) {
            form.append('github_username', githubUsername);
        }

        console.log(`[nlpBridge] Sending request to Python service: ${PYTHON_NLP_URL}/analyze-resume`);

        const response = await axios.post(
            `${PYTHON_NLP_URL}/analyze-resume`,
            form,
            {
                headers: { ...form.getHeaders() },
                timeout: 120000 // 2 min — GitHub scanning can be slow
            }
        );

        return response.data;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error(`[nlpBridge] ERROR: Connection refused to Python NLP service at ${PYTHON_NLP_URL}.`);
            console.error(`[nlpBridge] Make sure the FastAPI service is running (npm run python).`);
            throw new Error(`Python NLP service is unreachable on ${PYTHON_NLP_URL}. Please ensure it is running.`);
        }
        
        console.error(`[nlpBridge] ERROR calling Python service:`, error.message);
        throw error;
    }
};
