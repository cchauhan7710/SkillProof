import "./config/env.js"
import fs from "fs"
import path from "path"
import app from "./app.js"
import connectDB from "./db/index.js"

// ── Ensure temp upload directory exists (critical for Render deploys) ──
const tempDir = path.resolve("public/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`📁 Created temp directory: ${tempDir}`);
}

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("❌ Express server error:", err);
    });

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📡 Health check: http://localhost:${port}/api/v1/health`);
      console.log(`🐍 Python NLP URL: ${process.env.PYTHON_NLP_URL || 'http://localhost:8001'}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  });