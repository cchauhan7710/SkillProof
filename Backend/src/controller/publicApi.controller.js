import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import ResumeAnalysis from '../models/ResumeAnalysis.model.js';
import { processResumeAnalysis } from '../services/resumeAnalysis.service.js';

const ensureTempDir = () => {
  const tempDir = path.resolve('public', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

const sanitizeFilename = (name) => {
  const safeName = path.basename(name || 'resume').replace(/[^a-zA-Z0-9._-]/g, '_');
  return safeName || 'resume.pdf';
};

const generateTempFilename = (filename) => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`;
};

const saveBufferToTemp = async (buffer, filename) => {
  const tempDir = ensureTempDir();
  const filePath = path.join(tempDir, generateTempFilename(filename));
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
};

const saveResumeFromBase64 = async (base64String, filename) => {
  if (!base64String || typeof base64String !== 'string') {
    throw new apiError(400, 'resume_base64 must be a base64 encoded string.');
  }

  const match = base64String.match(/^data:([a-zA-Z0-9+/.-]+\/[a-zA-Z0-9+/.-]+);base64,(.+)$/);
  let rawBase64 = base64String;
  let extension = path.extname(sanitizeFilename(filename || 'resume.pdf')) || '.pdf';

  if (match) {
    const mimeType = match[1].toLowerCase();
    rawBase64 = match[2];
    if (mimeType.includes('pdf')) extension = '.pdf';
    else if (mimeType.includes('wordprocessingml.document')) extension = '.docx';
    else if (mimeType.includes('msword')) extension = '.doc';
  }

  const buffer = Buffer.from(rawBase64, 'base64');
  if (!buffer.length) {
    throw new apiError(400, 'Invalid base64 resume payload.');
  }

  const savedName = sanitizeFilename(filename || `resume${extension}`);
  return saveBufferToTemp(buffer, savedName);
};

const downloadResumeFromUrl = async (resumeUrl, filename) => {
  if (!resumeUrl || typeof resumeUrl !== 'string') {
    throw new apiError(400, 'resume_url must be a valid URL string.');
  }

  const response = await axios.get(resumeUrl, {
    responseType: 'arraybuffer',
    timeout: 20000,
    headers: { 'User-Agent': 'Resume-Analyzer/1.0' }
  });

  const contentType = (response.headers['content-type'] || '').toLowerCase();
  let extension = path.extname(new URL(resumeUrl).pathname) || '.pdf';
  if (contentType.includes('pdf')) extension = '.pdf';
  else if (contentType.includes('wordprocessingml.document')) extension = '.docx';
  else if (contentType.includes('msword')) extension = '.doc';

  const savedName = sanitizeFilename(filename || `resume${extension}`);
  return saveBufferToTemp(Buffer.from(response.data), savedName);
};

/**
 * POST /api/public/v1/analyze
 * Upload a resume (PDF/DOCX) + optional github_username.
 * Returns an analysis ID to poll for results.
 */
const publicAnalyze = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.path) {
    throw new apiError(400, 'Resume file is required (field name: resume). Accepts PDF or DOCX.');
  }

  const localFilePath  = path.resolve(req.file.path);
  const githubUsername = req.body.github_username || null;

  const resumeAnalysis = await ResumeAnalysis.create({
    user:          req.user._id,
    resumeFileUrl: req.file.originalname,
    githubUsername,
    status:        'processing',
  });

  // Fire-and-forget background pipeline
  processResumeAnalysis(resumeAnalysis._id, localFilePath, githubUsername)
    .catch(err => console.error('[PublicAPI] Pipeline error:', err.message));

  return res.status(201).json(new ApiResponse(201, {
    analysisId: resumeAnalysis._id,
    status:     'processing',
    pollUrl:    `/api/public/v1/analyze/${resumeAnalysis._id}`,
    message:    'Analysis started. Poll pollUrl every 3-5s until status is "completed".',
  }, 'Analysis initiated.'));
});

/**
 * POST /api/public/v1/analyze/json
 * Accepts JSON payload with either resume_base64 or resume_url.
 * Also accepts optional github_username and resume_filename.
 */
const publicAnalyzeJson = asyncHandler(async (req, res) => {
  const githubUsername = req.body.github_username || null;
  const resumeFilename = req.body.resume_filename || 'resume';

  let localFilePath;
  if (req.body.resume_base64) {
    localFilePath = await saveResumeFromBase64(req.body.resume_base64, resumeFilename);
  } else if (req.body.resume_url) {
    localFilePath = await downloadResumeFromUrl(req.body.resume_url, resumeFilename);
  } else {
    throw new apiError(400, 'Please provide resume_base64 or resume_url in the JSON body.');
  }

  const resumeAnalysis = await ResumeAnalysis.create({
    user:          req.user._id,
    resumeFileUrl: path.basename(localFilePath),
    githubUsername,
    status:        'processing',
  });

  processResumeAnalysis(resumeAnalysis._id, localFilePath, githubUsername)
    .catch(err => console.error('[PublicAPI] JSON pipeline error:', err.message));

  return res.status(201).json(new ApiResponse(201, {
    analysisId: resumeAnalysis._id,
    status:     'processing',
    pollUrl:    `/api/public/v1/analyze/${resumeAnalysis._id}`,
    message:    'Analysis started. Poll pollUrl every 3-5s until status is "completed".',
  }, 'Analysis initiated.'));
});

/**
 * GET /api/public/v1/analyze/:id
 * Poll for analysis result.
 */
const publicGetAnalysis = asyncHandler(async (req, res) => {
  const analysis = await ResumeAnalysis.findById(req.params.id);

  if (!analysis) throw new apiError(404, 'Analysis not found.');
  if (analysis.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, 'Not authorized to access this analysis.');
  }

  // Shape a clean public-friendly response
  const payload = {
    id:            analysis._id,
    status:        analysis.status,
    githubUsername: analysis.githubUsername,
    candidateName: analysis.candidateName,
    contactInfo:   analysis.contactInfo,
    trustScore:    analysis.summary?.trustScore ?? null,
    totalCommits:  analysis.summary?.totalCommits ?? null,
    skills:        (analysis.skills ?? []).map(s => ({
      name:           s.name,
      verified:       s.github?.status === 'Verified',
      confidence:     s.confidenceScore ?? 0,
      linesOfCode:    s.github?.loc ?? 0,
      commits:        s.github?.commits ?? 0,
      riskScore:      s.fakeSkillRisk?.score ?? 0,
    })),
    projects:      (analysis.projectAudit ?? []).map(p => ({
      name:           p.name,
      skills:         p.skills ?? [],
      relevanceScore: p.relevanceScore ?? 0,
      totalLoc:       p.totalLoc ?? 0,
      totalCommits:   p.totalCommits ?? 0,
    })),
    recommendations: analysis.recommendations ?? [],
    createdAt:     analysis.createdAt,
    completedAt:   analysis.updatedAt,
  };

  return res.status(200).json(new ApiResponse(200, payload, 'Analysis fetched.'));
});

/**
 * GET /api/public/v1/analyses
 * List all analyses belonging to the API key owner.
 * Supports ?limit=20&page=1&status=completed
 */
const publicListAnalyses = asyncHandler(async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
  const page   = Math.max(parseInt(req.query.page)  || 1, 1);
  const skip   = (page - 1) * limit;
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [analyses, total] = await Promise.all([
    ResumeAnalysis.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id status githubUsername candidateName summary.trustScore createdAt updatedAt'),
    ResumeAnalysis.countDocuments(filter),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    data:       analyses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Analyses listed.'));
});

/**
 * DELETE /api/public/v1/analyze/:id
 * Delete an analysis record.
 */
const publicDeleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await ResumeAnalysis.findById(req.params.id);
  if (!analysis) throw new apiError(404, 'Analysis not found.');
  if (analysis.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, 'Not authorized.');
  }
  await ResumeAnalysis.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, {}, 'Analysis deleted.'));
});

export {
  publicAnalyze,
  publicAnalyzeJson,
  publicGetAnalysis,
  publicListAnalyses,
  publicDeleteAnalysis,
};
