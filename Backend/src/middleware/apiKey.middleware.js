import { ApiKey } from '../models/ApiKey.model.js';
import { apiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Middleware: verifyApiKey
 * Reads X-API-Key header, hashes it, looks up in DB.
 * Attaches req.apiKeyDoc and req.apiUser to the request.
 */
export const verifyApiKey = asyncHandler(async (req, res, next) => {
  const raw = req.headers['x-api-key'];

  if (!raw) {
    throw new apiError(401, 'Missing X-API-Key header.');
  }

  const hash = ApiKey.hashKey(raw);

  const keyDoc = await ApiKey.findOne({ keyHash: hash, isActive: true })
    .populate('user', '-password -refreshToken');

  if (!keyDoc) {
    throw new apiError(401, 'Invalid or revoked API key.');
  }

  // Update usage stats (non-blocking)
  ApiKey.findByIdAndUpdate(keyDoc._id, {
    lastUsedAt: new Date(),
    $inc: { requestCount: 1 },
  }).exec();

  req.apiKeyDoc = keyDoc;
  req.user = keyDoc.user;   // allows reuse of existing controllers
  next();
});
