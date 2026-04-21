import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 64,
  },
  // Store only the SHA-256 hash — never the raw key
  keyHash: {
    type: String,
    required: true,
    unique: true,
  },
  // First 8 chars of raw key for display (e.g. "vf_a1b2c3...")
  keyPrefix: {
    type: String,
    required: true,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  requestCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Static helper: hash a raw key
apiKeySchema.statics.hashKey = (rawKey) =>
  crypto.createHash('sha256').update(rawKey).digest('hex');

// Static helper: generate a new key string (vf_ prefix)
apiKeySchema.statics.generateRawKey = () =>
  `vf_${crypto.randomBytes(32).toString('hex')}`;

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);
