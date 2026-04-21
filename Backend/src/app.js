import express from "express"
import cors from "cors"
import cookiesparser from "cookie-parser"

const app = express()

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.FRONTEND_URL === "*" 
            ? "*" 
            : process.env.FRONTEND_URL?.split(",");
        
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins === "*" || allowedOrigins?.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
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