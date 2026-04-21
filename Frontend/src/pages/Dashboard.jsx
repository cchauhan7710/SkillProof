import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Github, ShieldCheck, Zap, TrendingUp, Clock,
  ArrowUpRight, Target, Cpu, Activity, CheckCircle2, Plus,
  Loader2, GitCommit, Terminal, Search, Scan, Database,
  ExternalLink, X, Code, ChevronRight, AlertTriangle, Sparkles,
  BarChart3, Eye, Layers, RefreshCw, Trash2, Mail, Send, Copy, CheckCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/* ─────────────────────────────── helpers ─────────────────────────── */
const trustColor = (score) => {
  if (score >= 75) return { text: 'text-secondary-500', bg: 'bg-secondary-500', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.35)]', border: 'border-secondary-500/30' };
  if (score >= 45) return { text: 'text-primary-500',   bg: 'bg-primary-500',   glow: 'shadow-[0_0_20px_rgba(247,144,9,0.35)]', border: 'border-primary-500/30' };
  return               { text: 'text-slate-500 dark:text-white/40',         bg: 'bg-slate-200 dark:bg-white/20',       glow: '', border: 'border-slate-200 dark:border-slate-200 dark:border-white/10' };
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const statusMeta = (s) => ({
  completed: { label: 'Verified',    cls: 'border-secondary-500/20 bg-secondary-500/[0.08] text-secondary-400' },
  processing: { label: 'Scanning…',  cls: 'border-primary-500/20  bg-primary-500/[0.08]  text-primary-400'   },
  pending:    { label: 'Queued',     cls: 'border-slate-200 dark:border-slate-200 dark:border-white/10          bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.05]         text-slate-500 dark:text-white/40'      },
  failed:     { label: 'Failed',     cls: 'border-red-500/20        bg-red-500/[0.08]       text-red-400'       },
}[s] || { label: s, cls: 'border-slate-200 dark:border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40' });

/* ─────────────────────────────── mini bar chart ──────────────────── */
const MiniBarChart = ({ scores = [] }) => {
  const data = [...Array(Math.max(0, 8 - (scores?.length || 0))).fill(0), ...(scores || []).slice(-8)];
  const max  = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-12 w-full">
      {data.map((v, i) => {
        const h   = Math.max(8, (v / max) * 48);
        const col = v >= 75 ? 'bg-secondary-500/70' : v >= 45 ? 'bg-primary-500/70' : 'bg-slate-200 dark:bg-white/10';
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: h }}
            transition={{ delay: i * 0.06, duration: 0.6, ease: 'circOut' }}
            className={`flex-1 rounded-sm ${col}`}
          />
        );
      })}
    </div>
  );
};

/* ─────────────────────────────── skill pill ──────────────────────── */
const SkillPill = ({ skill }) => {
  const risk  = skill.fakeSkillRisk?.score ?? 50;
  const safe  = risk <= 30;
  const ghost = risk >= 70;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-medium tracking-wide border
      ${safe  ? 'border-secondary-500/20 bg-secondary-500/10 text-secondary-400' :
        ghost ? 'border-red-500/20 bg-red-500/10 text-red-400' :
                'border-primary-500/20 bg-primary-500/10 text-primary-400'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {skill.name}
    </span>
  );
};

/* ─────────────────────────────── detail panel ───────────────────── */
const DetailPanel = ({ analysis, onClose, onDelete }) => {
  const navigate = useNavigate();
  if (!analysis) return null;

  const trusted    = analysis.summary?.trustScore ?? 0;
  const col        = trustColor(trusted);
  const totalSkills   = analysis.summary?.totalSkills    ?? 0;
  const verifiedSkills= analysis.summary?.verifiedSkills ?? 0;
  const fakeSkills    = analysis.summary?.fakeSkills     ?? 0;
  const skills        = analysis.skills ?? [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[60] cursor-zoom-out" />

      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 220 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-[#0a0a0a] z-[70]
                   border-l border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* ── header ── */}
        <header className="relative px-6 sm:px-10 pt-10 pb-8 border-b border-slate-200 dark:border-white/[0.06] flex justify-between items-start gap-6 bg-slate-50 dark:bg-white/[0.01]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-semibold text-secondary-500 tracking-wider uppercase">Forensic Detail</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate mb-4">
              {analysis.resumeFileUrl?.split('/').pop()?.split('_').slice(2).join('_') || 'Resume Audit'}
            </h2>
            <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500 dark:text-slate-300 dark:text-white/50">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                <Terminal size={12} /> {analysis._id.slice(-8).toUpperCase()}
              </span>
              {analysis.githubUsername && (
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md text-secondary-400">
                  <Github size={12} /> {analysis.githubUsername}
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                <Clock size={12} /> {fmtDate(analysis.createdAt)}
              </span>
            </div>
          </div>

          {/* trust ring */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-slate-200 dark:border-white/[0.05]">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
              <svg className="w-full h-full -rotate-90 drop-shadow-lg">
                <circle cx="50%" cy="50%" r="40%" strokeWidth="8%" fill="transparent" className="text-white/[0.05]" stroke="currentColor" />
                <motion.circle
                  cx="50%" cy="50%" r="40%" strokeWidth="8%" fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray="251%"
                  initial={{ strokeDashoffset: "251%" }}
                  animate={{ strokeDashoffset: `calc(251% - (251% * ${trusted}) / 100)` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className={col.text}
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl sm:text-2xl font-bold ${col.text}`}>
                  {trusted}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-widest">Score</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-300 dark:text-white/50 hover:bg-slate-200 dark:bg-white/10 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </header>

        {/* ── scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-10 bg-white dark:bg-[#0a0a0a]">

          {/* summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Skills',    value: totalSkills,    icon: Layers,       color: 'text-slate-700 dark:text-white/80', bg: 'bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.04]', border: 'border-slate-200 dark:border-slate-200 dark:border-white/[0.08]' },
              { label: 'Verified Evidence',  value: verifiedSkills, icon: ShieldCheck,  color: 'text-secondary-400', bg: 'bg-secondary-500/[0.05]', border: 'border-secondary-500/20' },
              { label: 'High Risk',     value: fakeSkills,     icon: AlertTriangle, color: 'text-primary-400', bg: 'bg-primary-500/[0.05]', border: 'border-primary-500/20' },
            ].map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`p-5 rounded-2xl flex flex-col gap-3 ${bg} border ${border} shadow-sm`}>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-medium text-slate-500 dark:text-slate-300 dark:text-white/50">{label}</span>
                   <Icon size={16} className={`${color} opacity-80`} />
                </div>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* skills grid */}
          {skills.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Terminal size={14} className="text-slate-500 dark:text-white/40"/> Analysis Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((skill, idx) => {
                  const risk     = skill.fakeSkillRisk?.score ?? 50;
                  const verified = skill.github?.status === 'Verified';
                  const risky    = risk >= 70;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white/90 truncate mr-2">
                          {skill.name}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0
                          ${verified ? 'border-secondary-500/30 text-secondary-400 bg-secondary-500/10' :
                            risky    ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                       'border-slate-200 dark:border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/40 bg-white/5'}`}>
                          {risky ? 'Risky' : verified ? 'Verified' : 'Unconfirmed'}
                        </span>
                      </div>
                      <div className="flex gap-3 flex-wrap text-xs text-slate-500 dark:text-white/40 mb-4">
                        <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-600 dark:text-white/60">
                          {skill.resumeConfidence} Conf
                        </span>
                        {skill.github?.loc > 0 && (
                          <span className="bg-secondary-500/10 text-secondary-400 px-2 py-0.5 rounded">
                            {skill.github.loc.toLocaleString()} LOC
                          </span>
                        )}
                        {skill.github?.commits > 0 && (
                          <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-600 dark:text-white/60">
                            {skill.github.commits} commits
                          </span>
                        )}
                      </div>
                      {/* risk bar */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - risk}%` }}
                          transition={{ delay: 0.2 + idx * 0.05, duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${verified ? 'bg-secondary-500' : risky ? 'bg-red-500' : 'bg-primary-500'}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* project audit */}
          {analysis.projectAudit && analysis.projectAudit.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Github size={14} className="text-slate-500 dark:text-white/40"/> Extracted Evidence
              </h3>
              <div className="space-y-3">
                {analysis.projectAudit.map((repo, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.04] transition-all gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white/90 truncate mb-2">
                        {repo.name}
                      </p>
                      <div className="flex gap-3 text-xs">
                        <span className="text-secondary-400 bg-secondary-500/10 px-2 py-0.5 rounded">{(repo.totalLoc || 0).toLocaleString()} LOC</span>
                        <span className="text-slate-500 dark:text-slate-300 dark:text-white/50 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{repo.totalCommits || 0} commits</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t border-slate-200 dark:border-white/5 pt-3 sm:border-0 sm:pt-0">
                       <p className="text-xs text-slate-500 dark:text-white/40 sm:mb-1 uppercase tracking-widest">Relevance</p>
                       <p className={`text-xl font-bold ${trustColor(repo.relevanceScore || 0).text}`}>
                         {repo.relevanceScore || 0}<span className="text-sm opacity-50">%</span>
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* footer actions */}
        <footer className="px-6 sm:px-10 py-6 border-t border-slate-200 dark:border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0a0a0a]">
          <span className="text-xs text-slate-400 dark:text-white/30 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-secondary-500/50" />
            Audit Snapshot
          </span>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onDelete(analysis._id);
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-lg font-bold text-sm transition-colors border border-red-500/20">
              <Trash2 size={16} /> Delete
            </button>
            <button
              onClick={() => { onClose(); navigate(`/analysis/${analysis._id}`); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-white/10">
              <Eye size={16} /> View Full Report
            </button>
          </div>
        </footer>
      </motion.aside>
    </AnimatePresence>
  );
};

/* ─────────────────────────────── mail modal ─────────────────────────── */
const MailModal = ({ analysis, onClose }) => {
  const trust    = analysis?.summary?.trustScore ?? 0;
  const skills   = (analysis?.skills ?? []).map(s => s.name).join(', ') || 'N/A';
  const github   = analysis?.githubUsername ? `https://github.com/${analysis.githubUsername}` : '';
  const auditId  = analysis?._id?.slice(-6).toUpperCase() ?? '';
  const fileName = analysis?.resumeFileUrl?.split('/').pop()?.split('_').slice(2).join('_') || 'Candidate';

  const defaultSubject = `SkillProof Results — ${fileName} (Score: ${trust}%)`;
  const defaultBody =
`Hi,

Please find below the automated AI Audit report summary for ${fileName}.

────────────────────────
Audit ID    : ${auditId}
Trust Score : ${trust}%
Verified Skills: ${skills}${
  github ? `\nGitHub Profile : ${github}` : ''
}
────────────────────────

For the full detailed report, please log in to the AI Audit dashboard.

Regards,
AI Audit System`;

  const [toEmail, setToEmail] = useState(analysis?.contactInfo?.email ?? '');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody]       = useState(defaultBody);
  const [copied, setCopied]   = useState(false);

  const handleSend = () => {
    const mailto = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Mail size={16} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Direct Mail</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/30">Audit #{auditId}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 py-5 space-y-4">

            {/* To */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25">To</label>
              <input
                type="email"
                placeholder="candidate@email.com"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl h-10 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-amber-500/40 focus:outline-none transition-all"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl h-10 px-4 text-sm text-slate-900 dark:text-white focus:border-amber-500/40 focus:outline-none transition-all"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25">Message</label>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {copied ? <CheckCheck size={12} className="text-secondary-400" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                rows={9}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-white/70 font-mono leading-relaxed focus:border-amber-500/40 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Trust score chip */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
              trust >= 75 ? 'bg-secondary-500/10 border-secondary-500/20 text-secondary-400' :
              trust >= 45 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40'
            }`}>
              <ShieldCheck size={12} />
              Trust Score · {trust}%
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.06] flex gap-3 bg-slate-50 dark:bg-white/[0.01]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-white/60 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!toEmail}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-lg disabled:opacity-30 disabled:pointer-events-none"
            >
              <Send size={14} /> Open Mail Client
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ─────────────────────────────── premium delete modal ─────────────────── */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[80]"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-sm bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 pointer-events-auto relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
               
               <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border border-red-500/30"
                    />
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Erase Audit Data</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50 mb-8 leading-relaxed">
                    This action is permanent. All forensic data and extracted competencies will be destroyed. Are you sure you want to proceed?
                  </p>
                  
                  <div className="flex w-full gap-3">
                    <button 
                      onClick={onClose}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={onConfirm}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all disabled:opacity-70"
                    >
                      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      {isDeleting ? 'Erasing...' : 'Confirm'}
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────── main dashboard ─────────────────── */
export const Dashboard = () => {
  const [analyses, setAnalyses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [scoreOp, setScoreOp]     = useState('gte');
  const [scoreVal, setScoreVal]   = useState('');
  const [auditToDelete, setAuditToDelete] = useState(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [mailTarget, setMailTarget]       = useState(null); // analysis to mail
  const { user }                  = useAuth();

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get('/resume-analysis');
      setAnalyses(res.data.data || []);
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const initiateDelete = (id) => {
    setAuditToDelete(id);
  };

  const confirmDelete = async () => {
    if (!auditToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/resume-analysis/${auditToDelete}`);
      setAnalyses(prev => prev.filter(a => a._id !== auditToDelete));
      setAuditToDelete(null);
      if (selected?._id === auditToDelete) setSelected(null);
    } catch (err) {
      console.error('[Dashboard] Error deleting audit:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  /* derived stats */
  const completed   = analyses.filter(a => a.status === 'completed');
  const avgTrust    = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.summary?.trustScore ?? 0), 0) / completed.length)
    : 0;
  const totalSkills = analyses.reduce((s, a) => s + (a.summary?.totalSkills ?? 0), 0);
  const trustScores = completed.map(a => a.summary?.trustScore ?? 0);

  /* filtered + sorted rows */
  const filtered = analyses
    .filter(a => {
      // text search
      const q = search.toLowerCase();
      const matchesSearch = !q
        || a._id.toLowerCase().includes(q)
        || (a.githubUsername || '').toLowerCase().includes(q)
        || a.status.toLowerCase().includes(q);

      // score threshold filter
      const threshold = scoreVal !== '' ? Number(scoreVal) : null;
      const trust = a.summary?.trustScore ?? 0;
      const matchesScore = threshold === null
        ? true
        : scoreOp === 'gte' ? trust >= threshold : trust <= threshold;

      return matchesSearch && matchesScore;
    })
    .sort((a, b) => {
      if (sortOrder === 'none') return 0;
      const ta = a.summary?.trustScore ?? 0;
      const tb = b.summary?.trustScore ?? 0;
      return sortOrder === 'desc' ? tb - ta : ta - tb;
    });

  const statCards = [
    { label: 'Total Audits',    value: analyses.length,   Icon: Scan,        color: 'text-slate-700 dark:text-white/80',      bg: 'bg-slate-50 dark:bg-white/[0.02]', border: 'border-slate-200 dark:border-slate-200 dark:border-white/[0.05]' },
    { label: 'Skills Found',    value: totalSkills,       Icon: Cpu,         color: 'text-primary-400',   bg: 'bg-primary-500/[0.05]', border: 'border-primary-500/20'   },
    { label: 'Avg Trust',       value: `${avgTrust}%`,    Icon: ShieldCheck, color: 'text-secondary-400', bg: 'bg-secondary-500/[0.05]', border: 'border-secondary-500/20' },
    { label: 'Verified',        value: completed.length,  Icon: CheckCircle2, color: 'text-slate-700 dark:text-white/80',     bg: 'bg-slate-50 dark:bg-white/[0.02]', border: 'border-slate-200 dark:border-slate-200 dark:border-white/[0.05]' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-500 text-slate-900 dark:text-white antialiased font-sans selection:bg-primary-500/30 selection:text-white pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">

        {/* ── hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12 sm:mb-16"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-secondary-500/10 border border-secondary-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[10px] font-bold text-secondary-400 tracking-wider uppercase">System Active</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 leading-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-300 dark:text-white/50 text-base sm:text-lg">
              Manage your technical audits, review extracted competencies, and cross-reference claims against GitHub evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-300 dark:text-white/50 hover:text-white hover:bg-slate-100 dark:bg-white/[0.08] transition-all shadow-sm">
              <RefreshCw size={18} className={refreshing ? 'animate-spin text-primary-400' : ''} />
            </button>
            <Link to="/upload" className="flex-1 lg:flex-none">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg shadow-white/5 hover:bg-white/90 transition-colors">
                <Plus size={18} />
                New Audit
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ── stat cards + trust chart ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-12 sm:mb-16">
          {statCards.map(({ label, value, Icon, color, bg, border }, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
               className={`p-6 rounded-2xl border ${border} ${bg} backdrop-blur-sm shadow-sm flex flex-col justify-between`}
             >
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 dark:text-white/50 uppercase tracking-widest">{label}</span>
                  <div className={`p-2 rounded-lg bg-slate-100 dark:bg-white/5 ${color}`}>
                    <Icon size={18} />
                  </div>
               </div>
               <p className={`text-3xl sm:text-4xl font-bold ${color}`}>{value}</p>
             </motion.div>
          ))}

          {/* trust pulse chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            className="sm:col-span-2 lg:col-span-1 p-6 rounded-2xl border border-slate-200 dark:border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 dark:text-white/50 uppercase tracking-widest">Trust Pulse</span>
               <Activity size={16} className="text-slate-400 dark:text-white/20" />
            </div>
            <MiniBarChart scores={trustScores} />
          </motion.div>
        </div>

        {/* ── audit table/list ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] shadow-xl overflow-hidden flex flex-col">

            {/* toolbar */}
            <div className="p-4 sm:p-6 sm:px-8 border-b border-slate-200 dark:border-white/[0.05] flex flex-col gap-4 bg-slate-50 dark:bg-white/[0.01]">

              {/* Row 1: title + search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-primary-500/60" />
                  <h2 className="text-sm font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider">Audit History</h2>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-white/40">
                    {filtered.length}/{analyses.length}
                  </span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by ID or Handle..."
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl h-10 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:bg-slate-100 dark:focus:bg-white/[0.05] focus:border-slate-300 dark:focus:border-white/20 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 2: sort + score filter */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Sort buttons */}
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25 mr-1">Sort Score</span>
                {[
                  { val: 'desc', label: '↓ High → Low' },
                  { val: 'asc',  label: '↑ Low → High' },
                  { val: 'none', label: 'Default' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setSortOrder(val)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      sortOrder === val
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {/* Divider */}
                <span className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />

                {/* Score threshold */}
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25 mr-1">Score</span>

                {/* Operator toggle */}
                <button
                  onClick={() => setScoreOp(p => p === 'gte' ? 'lte' : 'gte')}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/50 hover:border-slate-300 dark:hover:border-white/20 transition-all min-w-[44px] text-center"
                >
                  {scoreOp === 'gte' ? '≥' : '≤'}
                </button>

                <input
                  type="number"
                  min="0" max="100"
                  placeholder="Score"
                  value={scoreVal}
                  onChange={e => setScoreVal(e.target.value)}
                  className="w-20 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg h-8 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-slate-300 dark:focus:border-white/20 focus:outline-none transition-all"
                />

                {/* Clear filter */}
                {(scoreVal !== '' || sortOrder !== 'none') && (
                  <button
                    onClick={() => { setScoreVal(''); setSortOrder('none'); }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    Clear
                  </button>
                )}

              </div>
            </div>

            {/* list content */}
            <div className="bg-white dark:bg-[#0a0a0a]">
              {loading ? (
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center gap-4 px-4 text-center">
                  <Loader2 size={32} className="animate-spin text-primary-500/50" />
                  <span className="text-sm font-medium text-slate-500 dark:text-white/40">Syncing Secure Cluster...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 sm:py-28 flex flex-col items-center justify-center gap-4 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-400 dark:text-white/20 mb-2">
                    <Scan size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 dark:text-white/60">No Audit Records</h3>
                  <p className="text-sm text-slate-500 dark:text-white/40 max-w-sm mb-4">
                    {search ? 'Adjust your search terms to find records.' : 'Upload a resume to begin your first verification trace.'}
                  </p>
                  {!search && (
                    <Link to="/upload">
                      <button className="flex items-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-200 dark:bg-white/20 text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> Init Audit
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {/* Desktop Header */}
                  <div className="hidden lg:grid grid-cols-[2fr_1.5fr_2fr_1fr_auto] px-8 py-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-slate-200 dark:border-white/[0.04] text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-widest">
                    <span>Target</span>
                    <span>Confidence</span>
                    <span>Competency Profile</span>
                    <span>Status</span>
                    <span className="text-right">Action</span>
                  </div>

                  {filtered.map((a, i) => {
                    const trust   = a.summary?.trustScore ?? 0;
                    const col     = trustColor(trust);
                    const sm      = statusMeta(a.status);
                    const skills  = a.skills ?? [];
                    const topSkills = skills.slice(0, 3);

                    return (
                      <motion.div
                        key={a._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelected(a)}
                        className="flex flex-col lg:grid lg:grid-cols-[2fr_1.5fr_2fr_1fr_auto] gap-y-4 px-4 sm:px-6 lg:px-8 py-5 hover:bg-slate-50 dark:bg-slate-100 dark:bg-white/[0.03] cursor-pointer transition-colors group items-start lg:items-center"
                      >
                        {/* 1. Target Info */}
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-white/40 group-hover:text-primary-400 group-hover:border-primary-500/30 transition-colors shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-slate-800 dark:text-white/90 truncate group-hover:text-white transition-colors mb-0.5">
                              Audit #{a._id.slice(-6).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-white/40">
                              {a.githubUsername && (
                                <span className="text-secondary-400/80 flex items-center gap-1">
                                  <Github size={10} /> {a.githubUsername}
                                </span>
                              )}
                              <span>• {fmtDate(a.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Confidence / Trust */}
                        <div className="w-full lg:w-auto lg:pr-8">
                           <div className="flex justify-between lg:justify-start lg:gap-3 items-end mb-1.5">
                              <span className="text-xs text-slate-500 dark:text-white/40 lg:hidden">Trust Score</span>
                              <div className="flex items-baseline gap-0.5">
                                <span className={`text-xl font-bold ${col.text}`}>{trust}</span>
                                <span className="text-xs text-slate-400 dark:text-white/30">%</span>
                              </div>
                           </div>
                           <div className="h-1.5 w-full max-w-[12rem] bg-slate-100 dark:bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${col.bg} ${col.glow}`} style={{ width: `${trust}%` }} />
                           </div>
                        </div>

                        {/* 3. Skills */}
                        <div className="w-full lg:w-auto">
                          <span className="text-xs text-slate-500 dark:text-white/40 mb-2 block lg:hidden">Detected Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {topSkills.length > 0 ? topSkills.map((sk, si) => <SkillPill key={si} skill={sk} />) :
                              <span className="text-xs text-slate-400 dark:text-white/20 italic">No skills extracted</span>}
                            {skills.length > 3 && (
                              <span className="text-[10px] font-medium text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10 px-2 py-1 rounded-md">
                                +{skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 4. Status */}
                        <div className="w-full lg:w-auto flex justify-between items-center lg:block">
                           <span className="text-xs text-slate-500 dark:text-white/40 lg:hidden">Status</span>
                           <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${sm.cls}`}>
                             <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                             {sm.label}
                           </span>
                        </div>

                        {/* 5. Action */}
                        <div className="hidden lg:flex items-center justify-end gap-2">
                          {/* Mail button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMailTarget(a);
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400 dark:text-white/30 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                            title="Send Mail"
                          >
                            <Mail size={15} />
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              initiateDelete(a._id);
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400 dark:text-white/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
                            title="Delete Audit"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400 dark:text-white/30 group-hover:bg-slate-200 dark:group-hover:bg-white/[0.08] group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* footer */}
            <div className="px-4 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-slate-50 dark:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
              <span className="text-xs text-slate-500 dark:text-white/40">
                Showing {filtered.length} of {analyses.length} entries
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30">
                <ShieldCheck size={14} className="text-secondary-500/50" />
                End-to-End Encrypted Trace
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* detail panel overlay */}
      <DetailPanel analysis={selected} onClose={() => setSelected(null)} onDelete={initiateDelete} />

      {/* delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={!!auditToDelete}
        onClose={() => setAuditToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      {/* mail modal */}
      {mailTarget && (
        <MailModal analysis={mailTarget} onClose={() => setMailTarget(null)} />
      )}
    </div>
  );
};

export default Dashboard;
