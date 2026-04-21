import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { generateApiKey, listApiKeys, revokeApiKey, deleteApiKey } from '../controller/apiKey.controller.js';

const router = Router();

// All key-management routes require the user to be logged in
router.use(verifyJWT);

router.route('/')
  .post(generateApiKey)   // POST   /api/v1/api-keys
  .get(listApiKeys);      // GET    /api/v1/api-keys

router.route('/:id')
  .delete(revokeApiKey);  // DELETE /api/v1/api-keys/:id  (soft revoke)

router.route('/:id/hard')
  .delete(deleteApiKey);  // DELETE /api/v1/api-keys/:id/hard

export default router;
