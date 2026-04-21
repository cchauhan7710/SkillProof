import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiKey } from '../models/ApiKey.model.js';

/**
 * POST /api/v1/api-keys
 * Generate a new API key for the logged-in user.
 * The raw key is returned ONCE — never stored.
 */
const generateApiKey = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) throw new apiError(400, 'Key name is required.');

  const rawKey  = ApiKey.generateRawKey();
  const keyHash = ApiKey.hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 12); // "vf_" + 9 chars

  const keyDoc = await ApiKey.create({
    user:      req.user._id,
    name:      name.trim(),
    keyHash,
    keyPrefix,
  });

  return res.status(201).json(new ApiResponse(201, {
    id:        keyDoc._id,
    name:      keyDoc.name,
    key:       rawKey,       // ← shown ONCE; never retrievable again
    keyPrefix: keyDoc.keyPrefix,
    createdAt: keyDoc.createdAt,
    warning:   'Save this key now. It will not be shown again.',
  }, 'API key created.'));
});

/**
 * GET /api/v1/api-keys
 * List all API keys for the logged-in user (hashes never exposed).
 */
const listApiKeys = asyncHandler(async (req, res) => {
  const keys = await ApiKey.find({ user: req.user._id })
    .select('-keyHash')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, keys, 'API keys fetched.'));
});

/**
 * DELETE /api/v1/api-keys/:id
 * Revoke (soft-delete) an API key.
 */
const revokeApiKey = asyncHandler(async (req, res) => {
  const keyDoc = await ApiKey.findOne({ _id: req.params.id, user: req.user._id });
  if (!keyDoc) throw new apiError(404, 'API key not found.');

  keyDoc.isActive = false;
  await keyDoc.save();

  return res.status(200).json(new ApiResponse(200, { id: keyDoc._id }, 'API key revoked.'));
});

/**
 * DELETE /api/v1/api-keys/:id/hard
 * Permanently delete an API key record.
 */
const deleteApiKey = asyncHandler(async (req, res) => {
  const keyDoc = await ApiKey.findOne({ _id: req.params.id, user: req.user._id });
  if (!keyDoc) throw new apiError(404, 'API key not found.');

  await ApiKey.findByIdAndDelete(keyDoc._id);
  return res.status(200).json(new ApiResponse(200, {}, 'API key permanently deleted.'));
});

export { generateApiKey, listApiKeys, revokeApiKey, deleteApiKey };
