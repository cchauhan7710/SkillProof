import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve absolute path to public/temp (works regardless of CWD on Render)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.resolve(__dirname, '../../public/temp');

// Auto-create the temp directory if it doesn't exist (critical for Render deploys)
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_DIR);
  },
  filename: function (req, file, cb) {
    // Sanitize filename: replace spaces & special chars, add timestamp to avoid collisions
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')   // replace spaces/special chars
      .replace(/_+/g, '_');               // collapse multiple underscores
    const safeName = `${base}_${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

export const upload = multer({ storage });