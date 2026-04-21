import { Router } from 'express';
import { verifyApiKey } from '../middleware/apiKey.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import {
  publicAnalyze,
  publicAnalyzeJson,
  publicGetAnalysis,
  publicListAnalyses,
  publicDeleteAnalysis,
} from '../controller/publicApi.controller.js';

const router = Router();

// Every public API route is protected by X-API-Key header
router.use(verifyApiKey);

/**
 * POST   /api/public/v1/analyze          — upload resume, start analysis
 * POST   /api/public/v1/analyze/json     — send resume_base64 or resume_url in JSON
 * GET    /api/public/v1/analyze/:id      — poll result
 * DELETE /api/public/v1/analyze/:id      — delete record
 * GET    /api/public/v1/analyses         — list all (paginated)
 */
router.post('/analyze',          upload.single('resume'), publicAnalyze);
router.post('/analyze/json',     publicAnalyzeJson);
router.get('/analyze/:id',       publicGetAnalysis);
router.delete('/analyze/:id',    publicDeleteAnalysis);
router.get('/analyses',          publicListAnalyses);

export default router;
