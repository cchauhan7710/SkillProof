import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

// ---------------- SKILL SUBDOCUMENT ----------------
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  resumeConfidence: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low"
  },

  confidenceScore: {
    type: Number,
    default: 0
  },

  github: {
    status: { 
      type: String,
      default: "Not Verified"
    },
    loc: {
      type: Number,
      default: 0
    },
    commits: {
      type: Number,
      default: 0
    },
    depth: {
      type: String,
      enum: ["Basic", "Medium", "High"],
      default: "Basic"
    },
    lastUsed: {
      type: Date
    },
    verifiedRepos: {
      type: [String],
      default: []
    }
  },

  fakeSkillRisk: {
    score: {
      type: Number,
      default: 0
    },
    label: {
      type: String,
      enum: ["Low Risk", "Moderate Risk", "High Risk"],
      default: "Low Risk"
    }
  },

  // LLM Accuracy Synthesis
  accuracyScore: {
    type: Number,
    default: null
  },
  verdict: {
    type: String,
    enum: ["Proven", "Plausible", "Overstated", "Unverified"],
    default: "Unverified"
  },
  reasoning: {
    type: String,
    default: ""
  }

}, { _id: false });


// ---------------- MAIN SCHEMA ----------------
const resumeAnalysisSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  resumeFileUrl: {
    type: String,
    required: true
  },

  githubUsername: {
    type: String,
    default: null
  },

  candidateName: {
    type: String,
    default: "Core Build"
  },

  contactInfo: {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" }
  },

  extractedText: {
    type: String,
    default: ""
  },

  skills: {
    type: [skillSchema],
    default: []
  },

  summary: {
    totalSkills: {
      type: Number,
      default: 0
    },
    verifiedSkills: {
      type: Number,
      default: 0
    },
    fakeSkills: {
      type: Number,
      default: 0
    },
    trustScore: {
      type: Number,
      default: 0
    }
  },
  
  projectAudit: [{
    name: String,
    totalLoc: Number,
    totalCommits: Number,
    skills: [String],
    relevanceScore: Number
  }],

  ai_summary: {
    type: String,
    default: ""
  },

  job_fit: [{
    role: String,
    match_score: Number,
    reasoning: String
  }],

  failureReason: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "processing"
  }

}, { timestamps: true });

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema);