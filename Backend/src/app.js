import express from "express"
import cors from "cors"
import cookiesparser from "cookie-parser"

const app = express()

app.use(cors({
    origin: (origin, callback) => {
        // Strip trailing slashes from the env variable for safe matching
        const rawUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const allowedOrigins = rawUrl === "*" 
            ? "*" 
            : rawUrl.split(",").map(url => url.replace(/\/+$/, ""));
            
        const backendUrl = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");
        if (allowedOrigins !== "*" && !allowedOrigins.includes(backendUrl)) {
            allowedOrigins.push(backendUrl);
        }
        
        // Allow requests with no origin (like mobile apps/postman) or null origin (file:// protocols)
        if (!origin || origin === "null") return callback(null, true);

        // Strip trailing slash from incoming origin just in case
        const safeOrigin = origin.replace(/\/+$/, "");

        if (allowedOrigins === "*" || allowedOrigins.includes(safeOrigin)) {
            callback(null, true);
        } else {
            console.warn(`🚨 CORS Warning: Unrecognized Origin: ${origin}`);
            // Passing false prevents CORS headers from being set, letting the browser block it properly
            // rather than throwing a 500 Internal Server Error.
            callback(null, false);
        }
    },
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookiesparser());

app.get("/", (req, res) => {
    res.status(200).send("🚀 VibeFlow API is live and running! Check /api/v1/health for status.");
});


// ── Health Check ──────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});


// ── import routes ─────────────────────────────────────────────────────
import userRouter          from "./routes/user.routes.js"
import resumeAnalysisRouter from "./routes/resumeAnalysis.routes.js"
import apiKeyRouter        from "./routes/apiKey.routes.js"
import publicApiRouter     from "./routes/publicApi.routes.js"

// ── internal (session/cookie auth) routes ──────────────────────────────
app.use("/api/v1/users",           userRouter)
app.use("/api/v1/resume-analysis", resumeAnalysisRouter)
app.use("/api/v1/api-keys",        apiKeyRouter)     // key management (JWT protected)

// ── public (API-key auth) routes ───────────────────────────────────────
app.use("/api/public/v1",          publicApiRouter)  // external integrations

// ── global error handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
    const status  = err.statusCode || 500;
    const message = err.message    || "Internal Server Error";
    return res.status(status).json({ success: false, statusCode: status, message });
});

export default app;