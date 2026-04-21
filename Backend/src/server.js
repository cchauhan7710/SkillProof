import "./config/env.js"
import app from "./app.js"
import connectDB from "./db/index.js"

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("❌ Express server error:", err);
    });

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📡 Health check: http://localhost:${port}/api/v1/health`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  });