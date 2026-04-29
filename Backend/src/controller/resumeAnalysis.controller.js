import path from 'path';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import ResumeAnalysis from '../models/ResumeAnalysis.model.js';
import { processResumeAnalysis } from '../services/resumeAnalysis.service.js';

// @desc    Upload resume + trigger NLP analysis
// @route   POST /api/v1/resume-analysis
// @access  Private  (multer.single('resume') applied in route)
const createResumeAnalysis = asyncHandler(async (req, res) => {
    console.log('[Controller] POST /resume-analysis hit');
    console.log('[Controller] req.file:', req.file ? `name=${req.file.originalname}, size=${req.file.size}, hasBuffer=${!!req.file.buffer}` : 'UNDEFINED');
    console.log('[Controller] req.user:', req.user ? req.user._id : 'UNDEFINED');

    if (!req.file || !req.file.buffer) {
        console.error('[Controller] ERROR: No file or buffer on req.file');
        throw new apiError(400, 'Resume file is required (PDF or DOCX).');
    }

    const githubUsername = req.body.github_username || null;
    console.log('[Controller] githubUsername:', githubUsername);

    let resumeAnalysis;
    try {
        resumeAnalysis = await ResumeAnalysis.create({
            user:          req.user._id,
            resumeFileUrl: req.file.originalname,
            githubUsername,
            status:        'processing'
        });
        console.log('[Controller] DB document created:', resumeAnalysis._id);
    } catch (dbErr) {
        console.error('[Controller] DB CREATE ERROR:', dbErr.message);
        throw new apiError(500, `DB Error: ${dbErr.message}`);
    }

    // Kick off background processing — do NOT await (fire and forget)
    processResumeAnalysis(resumeAnalysis._id, req.file, githubUsername)
        .catch(err => console.error('[Controller] Background pipeline error:', err.message));

    return res
        .status(201)
        .json(new ApiResponse(201, resumeAnalysis, 'Analysis started. Poll /:id for results.'));
});

// @desc    Get all analyses for logged-in user
// @route   GET /api/v1/resume-analysis
// @access  Private
const getUserResumeAnalyses = asyncHandler(async (req, res) => {
    const analyses = await ResumeAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, analyses, 'Analyses fetched.'));
});

// @desc    Get single analysis by ID
// @route   GET /api/v1/resume-analysis/:id
// @access  Private
const getResumeAnalysisById = asyncHandler(async (req, res) => {
    const analysis = await ResumeAnalysis.findById(req.params.id);

    if (!analysis) throw new apiError(404, 'Analysis not found.');
    if (analysis.user.toString() !== req.user._id.toString()) {
        throw new apiError(403, 'Not authorized to access this analysis.');
    }

    return res.status(200).json(new ApiResponse(200, analysis, 'Analysis fetched.'));
});

// @desc    Update analysis
// @route   PUT /api/v1/resume-analysis/:id
// @access  Private
const updateResumeAnalysis = asyncHandler(async (req, res) => {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    if (!analysis) throw new apiError(404, 'Analysis not found.');
    if (req.user && analysis.user.toString() !== req.user._id.toString()) {
        throw new apiError(403, 'Not authorized.');
    }

    const updated = await ResumeAnalysis.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, updated, 'Analysis updated.'));
});

// @desc    Delete analysis
// @route   DELETE /api/v1/resume-analysis/:id
// @access  Private
const deleteResumeAnalysis = asyncHandler(async (req, res) => {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    if (!analysis) throw new apiError(404, 'Analysis not found.');
    if (analysis.user.toString() !== req.user._id.toString()) {
        throw new apiError(403, 'Not authorized.');
    }

    await ResumeAnalysis.findByIdAndDelete(req.params.id);
    return res.status(200).json(new ApiResponse(200, {}, 'Analysis deleted.'));
});

export {
    createResumeAnalysis,
    getUserResumeAnalyses,
    getResumeAnalysisById,
    updateResumeAnalysis,
    deleteResumeAnalysis
};
