import { Router } from 'express';
import {
    createResumeAnalysis,
    getUserResumeAnalyses,
    getResumeAnalysisById,
    updateResumeAnalysis,
    deleteResumeAnalysis
} from '../controller/resumeAnalysis.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route('/')
    // multer saves the file to public/temp before the controller runs
    .post(upload.single('resume'), createResumeAnalysis)
    .get(getUserResumeAnalyses);

router.route('/:id')
    .get(getResumeAnalysisById)
    .put(updateResumeAnalysis)
    .delete(deleteResumeAnalysis);

export default router;
