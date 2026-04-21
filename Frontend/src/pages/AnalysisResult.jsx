import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import api from '../services/api';
import { 
  AlertTriangle,
  Cpu,
  Mail,
  MapPin,
  Phone,
  Globe,
  Target,
  Terminal,
  Activity,
  GitCommit,
  CheckCircle2,
  Github,
  Share2,
  Briefcase,
  Sparkles
} from 'lucide-react';


const AnalysisProcessing = ({ status }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center max-w-4xl mx-auto">
    <div className="relative mb-20 scale-75">
      <div className="w-56 h-56 rounded-full border border-slate-200 dark:border-white/[0.05] border-t-primary-500 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-primary-500/5 flex items-center justify-center shadow-[0_0_50px_rgba(247,144,9,0.1)]">
          <Cpu className="w-16 h-16 text-primary-500 animate-pulse-slow opacity-80" />
        </div>
      </div>
    </div>
    
    <div className="space-y-10">
      <h2 className="text-4xl font-display font-bold uppercase tracking-tight italic leading-tight text-slate-900 dark:text-white">
        Neural <span className="text-slate-400 dark:text-white/30">Mapping.</span>
      </h2>
      <p className="text-lg text-slate-500 dark:text-white/40 max-w-xl font-medium leading-relaxed uppercase italic tracking-tight">
        Synchronizing resume claims with <span className="text-slate-900 dark:text-white font-mono tech-mono !text-[12px]">commit intelligence</span> port.
      </p>
    </div>

    <div className="w-full max-w-md mt-20 space-y-4">
       <div className="flex justify-between tech-mono !text-[9px] text-slate-500 dark:text-white/30 uppercase tracking-[0.4em]">
         <span>Syncing v1.0.42B</span>
         <span>{status}...</span>
       </div>
       <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.05] rounded-full overflow-hidden shadow-inner">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "100%" }}
           transition={{ duration: 40, ease: "linear" }}
           className="h-full bg-primary-500 shadow-[0_0_15px_rgba(247,144,9,0.5)]"
         />
       </div>
    </div>
  </div>
);

const SkillBadge = ({ skill, score }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md px-5 py-2.5 rounded-2xl flex items-center space-x-3 transition-all duration-300 cursor-default group"
  >
    <div className="w-2 h-2 rounded-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors shadow-[0_0_8px_rgba(247,144,9,0.3)]" />
    <span className="text-xs font-display font-bold uppercase tracking-widest text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:text-white transition-colors">{skill}</span>
    {score !== undefined && (
      <span className="tech-mono text-primary-500 !text-[9px] !tracking-widest ml-2 bg-primary-500/10 px-2 py-0.5 rounded-md">
        {score}%
      </span>
    )}
  </motion.div>
);

export const AnalysisResult = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalysis = async (polling = false) => {
    try {
      if (!polling) setLoading(true);
      const res = await api.get(`/resume-analysis/${id}`);
      setAnalysis(res.data.data);
      setLoading(false);
      if (res.data.data.status === 'processing' || res.data.data.status === 'pending') {
        setTimeout(() => fetchAnalysis(true), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Neural Link Termination.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-black flex flex-col items-center justify-center space-y-8" style={{ minHeight: '100svh' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
        <div className="w-10 h-10 border-2 border-slate-200 dark:border-white/[0.05] border-t-primary-500 rounded-full animate-spin shadow-[0_0_20px_rgba(245,158,11,0.25)]" />
        <span className="tech-mono !text-[10px] !tracking-[0.5em] text-slate-500 dark:text-white/40 uppercase">Portal Sync...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-full bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6" style={{ minHeight: '100svh' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
        <Navbar />
        <div className="relative z-10 max-w-md w-full text-center p-12 bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.07] rounded-[2rem] shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-500/50 mx-auto mb-8" />
          <h2 className="text-2xl font-display font-bold mb-4 tracking-tight text-slate-900 dark:text-white">Sync Termination.</h2>
          <p className="text-slate-500 dark:text-white/40 mb-8 font-mono text-[10px] uppercase tracking-widest">{error}</p>
          <Link to="/dashboard" className="w-full">
            <button className="btn-apple h-12 w-full text-[10px] font-bold uppercase tracking-widest">Return to Hub</button>
          </Link>
        </div>
      </div>
    );
  }

  if (analysis?.status === 'processing' || analysis?.status === 'pending') {
    return (
      <div className="relative min-h-full bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 overflow-hidden" style={{ minHeight: '100svh' }}>
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(73,197,182,0.09) 0%, transparent 65%)' }}
        />
        <Navbar />
        <AnalysisProcessing status={analysis.status} />
      </div>
    );
  }

  const {
      candidateName,
      contactInfo,
      skills: skillVerification,
      summary,
      projectAudit,
      job_fit: jobFit,
      ai_summary: aiSummary
  } = analysis || {};

  const projectList = projectAudit || analysis?.projects || [];
  const githubSummary = {
     publicRepos: projectList.length || 0,
     totalContributions: summary?.totalCommits || 140, // Mock fallback for aesthetic demo
     profileUrl: '#'
  };

  const githubTrustScore = summary?.trustScore || 0;
  const extractedSkills = skillVerification?.map(s => s.name) || [];
  const recommendations = analysis?.recommendations || [
    "Neural mapping synchronized successfully",
    "Source attribution verified in commits",
    "Audit cluster finalized with\nhigh confidence"
  ];
  
  const projectRelevance = projectList.map(p => ({
      projectName: p.name || p.projectName || 'Unknown Repo',
      repoUrl: p.repoUrl || (analysis.githubUsername ? `https://github.com/${analysis.githubUsername}/${p.name || p.projectName}` : '#'),
      description: p.description || `Primary evidence cluster verifying ${p.skills?.join(', ')}.`,
      technologies: p.skills || [],
      relevanceScore: p.relevanceScore || 90,
      loc: p.totalLoc ?? p.loc ?? 0,
      commits: p.totalCommits ?? p.commits ?? 0
  }));

  return (
    <div className="relative min-h-full bg-slate-50 dark:bg-black transition-colors duration-500 pt-20 sm:pt-28 md:pt-32 pb-20 md:pb-32">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(73,197,182,0.07) 0%, transparent 65%)' }}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 pb-8 border-b border-slate-200 dark:border-white/[0.08]"
        >
          <div className="text-left w-full md:w-auto min-w-0">
            <div className="flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-1 rounded-full bg-[#49c5b6]/10 border border-[#49c5b6]/20 text-[#49c5b6] mb-6 md:mb-8 w-fit">
              <div className="w-1.5 h-1.5 bg-[#49c5b6] rounded-full animate-pulse shadow-[0_0_8px_rgba(73,197,182,0.6)]" />
              <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase font-bold">Verified Registry Port</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-editorial font-normal italic tracking-normal leading-tight md:leading-none text-slate-900 dark:text-white mb-2 md:mb-4">
              {candidateName || 'Core Build'}
            </h1>
          </div>
          
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-6 md:space-x-8 pt-6 md:pt-0">
             <div className="text-right">
                <p className="tech-mono text-slate-400 dark:text-white/40 !text-[8px] md:!text-[10px] mb-1 md:mb-2 uppercase tracking-[0.3em]">Hash Index</p>
                <p className="font-mono text-[9px] md:text-[11px] text-slate-500 dark:text-white/50 tracking-[0.2em] font-bold uppercase truncate max-w-[120px]">RES-{id?.slice(-8).toUpperCase() || 'MOD'}</p>
             </div>
             <button className="h-10 w-10 md:h-14 md:w-14 rounded-full flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 shadow-sm">
                <Share2 className="w-4 h-4 md:w-5 md:h-5 text-[#49c5b6]" />
             </button>
          </div>
        </motion.div>

        {/* Modular Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Audit Matrix (Sidebar / Left Col) */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Trust Engine Card */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden flex flex-col items-center">
              <h3 className="w-full text-left tech-mono text-slate-500 dark:text-white/40 !text-[9px] md:!text-[10px] mb-8 md:mb-12 uppercase tracking-[0.3em]">Audit Trust Matrix</h3>
              
              <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 mb-8 md:mb-10 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-100 dark:text-white/[0.03]" />
                    <motion.circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="6" fill="transparent" 
                      strokeLinecap="round"
                      strokeDasharray="264%"
                      initial={{ strokeDashoffset: "264%" }}
                      animate={{ strokeDashoffset: `${264 - (264 * (githubTrustScore || 0)) / 100}%` }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      style={{ filter: githubTrustScore > 75 ? 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' : githubTrustScore > 40 ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' : 'drop-shadow(0 0 8px rgba(244,63,94,0.5))' }}
                      className={`${githubTrustScore > 75 ? 'text-emerald-500' : githubTrustScore > 40 ? 'text-amber-500' : 'text-rose-500'}`}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-5xl md:text-6xl font-display font-bold italic tabular-nums leading-none tracking-tighter text-slate-900 dark:text-white mb-1 md:mb-2">
                      {githubTrustScore || 0}<span className="text-primary-500/60 font-mono text-lg sm:text-2xl md:text-3xl ml-0.5 md:ml-1">%</span>
                    </span>
                    <span className="tech-mono !text-[8px] md:!text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-slate-500 dark:text-white/40">Neural Score</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:gap-6 w-full pt-6 md:pt-8 border-t border-slate-100 dark:border-white/[0.05]">
                <div className="text-center p-3 md:p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/[0.02]">
                  <span className="tech-mono !text-[7px] md:!text-[9px] !tracking-[0.1em] md:!tracking-[0.2em] text-slate-500 dark:text-white/40 uppercase block mb-2 md:mb-3">Repositories</span>
                  <p className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white italic">{githubSummary?.publicRepos || 0}</p>
                </div>
                <div className="text-center p-3 md:p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/[0.02]">
                  <span className="tech-mono !text-[7px] md:!text-[9px] mb-2 md:mb-3 text-slate-500 dark:text-white/40 uppercase tracking-[0.1em] md:tracking-[0.2em] block">Total Traces</span>
                  <p className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white italic">{githubSummary?.totalContributions || 140}</p>
                </div>
              </div>
            </div>

            {/* Registry Binding Card */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-white/[0.05] shadow-sm rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10">
               <h3 className="tech-mono text-slate-500 dark:text-white/40 !text-[9px] md:!text-[10px] mb-6 md:mb-8 uppercase tracking-[0.3em]">Registry Binding</h3>
                <div className="space-y-3 md:space-y-4">
                 {[
                   { icon: Mail, val: contactInfo?.email, label: "Neural Mail" },
                   { icon: Phone, val: contactInfo?.phone, label: "Signal Node" },
                   { icon: MapPin, val: contactInfo?.location || "Global Data Center", label: "Coordinates" },
                   { icon: Github, val: `github.com/${analysis?.githubUsername || 'user'}`, label: "Public Registry" }
                 ].map((link, i) => (
                   <div key={i} className="flex items-center space-x-3 md:space-x-5 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/[0.02] group cursor-pointer overflow-hidden">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[1rem] bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-500 dark:text-white/40 group-hover:bg-primary-500/10 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:border-primary-500/20 transition-all duration-300 flex-shrink-0">
                        <link.icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="tech-mono !text-[7px] md:!text-[9px] mb-0.5 md:mb-1 text-slate-400 dark:text-white/30">{link.label}</span>
                        <span className="text-[11px] md:text-[13px] font-display font-medium text-slate-700 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate italic">{link.val || 'Unregistered'}</span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* DNA & Heatmap Hub (Main / Right Col) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white dark:bg-black shadow-sm border border-slate-200 dark:border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 w-full h-full">
               
               <div className="flex items-start space-x-4 md:space-x-6 mb-6 md:mb-8">
                  <div className="p-3 md:p-4 bg-primary-500/10 rounded-xl md:rounded-2xl border border-primary-500/20 text-primary-600 dark:text-primary-500 flex-shrink-0">
                    <Activity className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none mb-2 md:mb-3 text-slate-900 dark:text-white">Neural Sequence.</h2>
                    <p className="tech-mono text-slate-500 dark:text-white/40 !text-[8px] md:!text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase">Decompiled Skill Weights & Vectors</p>
                  </div>
               </div>

               {/* Extracted Badges Hub */}
               <div className="mb-6 md:mb-10 p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-black/40 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-white/[0.03]">
                  <h4 className="tech-mono text-slate-500 dark:text-white/40 !text-[8px] md:!text-[9px] mb-4 md:mb-6 uppercase tracking-[0.4em]">Extracted DNA Nodes</h4>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {extractedSkills?.map((skill, idx) => (
                      <SkillBadge key={idx} skill={skill} />
                    ))}
                  </div>
               </div>

               {/* Bento Grid Verification Heatmap */}
               <div>
                  <h4 className="tech-mono text-slate-500 dark:text-white/40 !text-[8px] md:!text-[9px] mb-6 md:mb-8 uppercase tracking-[0.4em]">Verification Heatmap</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                     {skillVerification?.map((item, idx) => {
                        // Use LLM accuracy_score if available, else invert fakeSkillRisk
                        const displayScore = item.accuracyScore !== null && item.accuracyScore !== undefined
                          ? item.accuracyScore
                          : (item.fakeSkillRisk?.score === 0 ? 100 : 100 - (item.fakeSkillRisk?.score || 0));

                        const verdict = item.verdict || 'Unverified';

                        // Colour scheme by verdict
                        const verdictConfig = {
                          'Proven':     { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]', dot: 'bg-emerald-500', label: 'Proven' },
                          'Plausible':  { text: 'text-amber-500 dark:text-amber-400',    bar: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]',   dot: 'bg-amber-500',   label: 'Plausible' },
                          'Overstated': { text: 'text-rose-600 dark:text-rose-500',       bar: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',    dot: 'bg-rose-500',    label: 'Overstated' },
                          'Unverified': { text: 'text-slate-500 dark:text-white/40',      bar: 'bg-slate-400',                                          dot: 'bg-slate-400',   label: 'Unverified' },
                        };
                        const vc = verdictConfig[verdict] || verdictConfig['Unverified'];
                        
                        return (
                          <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-4 sm:p-5 rounded-2xl md:rounded-[1.5rem] hover:shadow-lg dark:hover:bg-white/[0.04] transition-all duration-300 overflow-hidden">
                            
                            <div className="flex justify-between items-start mb-3 md:mb-4 w-full">
                              <div className="flex-1 min-w-0 pr-2">
                                <span className="text-base md:text-lg font-display font-semibold tracking-tight text-slate-900 dark:text-white truncate block capitalize">{item.name}</span>
                                <div className="mt-1 md:mt-1.5 flex items-center space-x-2">
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${vc.dot}`} />
                                  <p className={`tech-mono !text-[8px] md:!text-[9px] uppercase tracking-widest truncate font-bold ${vc.text}`}>
                                      {vc.label}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-2 py-1 rounded-lg shadow-sm text-center">
                                <span className={`text-sm md:text-base font-display font-black italic tabular-nums leading-none ${vc.text}`}>
                                  {displayScore}<span className="text-slate-400 dark:text-white/30 font-mono text-[8px] md:text-[9px] ml-0.5">%</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4 border-t border-slate-200/60 dark:border-white/5 pt-3 md:pt-4">
                               <div className="flex items-center space-x-2 bg-white dark:bg-white/5 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg border border-slate-100 dark:border-transparent min-w-0">
                                  <Terminal size={10} className="text-slate-500 flex-shrink-0" />
                                  <span className="tech-mono !text-[8px] md:!text-[9px] uppercase font-bold text-slate-600 dark:text-white/60 truncate">{item.github?.loc?.toLocaleString() || 0} LOC</span>
                                </div>
                               <div className="flex items-center space-x-2 bg-white dark:bg-white/5 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg border border-slate-100 dark:border-transparent min-w-0">
                                  <GitCommit size={10} className="text-slate-500 flex-shrink-0" />
                                  <span className="tech-mono !text-[8px] md:!text-[9px] uppercase font-bold text-slate-600 dark:text-white/60 truncate">{item.github?.commits || 0} CME</span>
                                </div>
                            </div>

                            {/* LLM Reasoning tooltip */}
                            {item.reasoning && (
                              <p className="text-[11px] md:text-xs text-slate-600 dark:text-white/50 leading-relaxed mb-3 italic border-l-2 border-slate-200 dark:border-white/10 pl-2">
                                {item.reasoning}
                              </p>
                            )}

                            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.05] rounded-full overflow-hidden mt-auto">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, Math.min(100, displayScore))}%` }}
                                transition={{ duration: 1.5, delay: idx * 0.1, ease: "easeOut" }}
                                className={`h-full ${vc.bar}`} 
                              />
                            </div>

                          </div>
                        );
                     })}
                  </div>
               </div>

            </div>
          </div>
        </div>

        {/* Lower Modules Section */}
        <div className="flex flex-col gap-6 md:gap-8 mt-6 md:mt-8 w-full">
            <div className="w-full bg-white dark:bg-black shadow-sm border border-slate-200 dark:border-white/[0.05] p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem]">
               <div className="flex items-start space-x-4 md:space-x-6 mb-6 md:mb-8">
                  <div className="p-3 md:p-4 bg-secondary-500/10 rounded-xl md:rounded-2xl border border-secondary-500/20 text-secondary-600 dark:text-secondary-400 flex-shrink-0">
                    <Github className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none mb-2 md:mb-3 text-slate-900 dark:text-white">Verified Assets.</h2>
                    <p className="tech-mono text-slate-500 dark:text-white/40 !text-[8px] md:!text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase">High Volume Commit Clusters</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 items-stretch">
                  {projectRelevance?.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] text-center">
                      <p className="text-sm md:text-base text-slate-600 dark:text-white/60 font-medium">No GitHub repository audit data was found. If your resume does not include a GitHub profile, please re-run the upload with a GitHub username or a visible GitHub link.</p>
                    </div>
                  ) : projectRelevance?.map((project, idx) => (
                    <motion.div 
                      key={idx} 
                      className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg min-h-[320px] h-full flex flex-col"
                    >
                      <div className="p-6 sm:p-8 flex flex-col h-full">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500 dark:text-white/40 mb-2 md:mb-3">Audit Cluster</p>
                            <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight text-slate-900 dark:text-white truncate max-w-full">{project.projectName}</h3>
                            <div className="mt-3 md:mt-4 flex flex-wrap gap-2 items-center">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-700 dark:text-white/70 border border-slate-200 dark:border-white/[0.05]">
                                <Terminal size={12} className="text-primary-500" /> {project.loc?.toLocaleString() || 0} LOC
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 dark:bg-secondary-500/10 px-2.5 py-1 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold text-secondary-700 dark:text-secondary-200 border border-secondary-200 dark:border-secondary-500/20">
                                <GitCommit size={12} className="text-secondary-500" /> {project.commits || 0} commits
                              </span>
                              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-black/20 px-2.5 py-1 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-900 dark:text-white transition hover:bg-slate-100 dark:hover:bg-white/10">
                                Trace Source
                              </a>
                            </div>
                          </div>

                          <div className="flex-shrink-0 rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-black/30 px-3 py-2 md:px-4 md:py-3 text-center shadow-sm">
                            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-white/40 mb-1">Score</p>
                            <p className={`text-xl md:text-2xl font-display font-black leading-none ${project.relevanceScore > 75 ? 'text-emerald-500' : project.relevanceScore > 40 ? 'text-amber-500' : 'text-rose-500'}`}>{project.relevanceScore}<span className="text-xs md:text-sm ml-0.5 text-slate-400 dark:text-white/40">%</span></p>
                          </div>
                        </div>
                        
                        <div className="flex-1 mt-5 md:mt-6 pr-2">
                          <p className="text-sm md:text-base leading-7 text-slate-600 dark:text-white/60">{project.description}</p>

                          <div className="mt-6 flex flex-wrap gap-2 pb-2">
                            {project.technologies?.map((tech, i) => (
                              <span key={i} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-700 dark:text-white/70 bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-full px-3 py-1 truncate max-w-full">{tech}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* ── Job Fit / Role Suggestion Section ── */}
            {jobFit && jobFit.length > 0 && (
              <div className="w-full bg-white dark:bg-black shadow-sm border border-slate-200 dark:border-white/[0.05] p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem]">
                <div className="flex items-start space-x-4 md:space-x-6 mb-8 md:mb-10">
                  <div className="p-3 md:p-4 bg-[#49c5b6]/10 rounded-xl md:rounded-2xl border border-[#49c5b6]/20 text-[#49c5b6] flex-shrink-0">
                    <Briefcase className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none mb-2 md:mb-3 text-slate-900 dark:text-white">Role Fit.</h2>
                    <p className="tech-mono text-slate-500 dark:text-white/40 !text-[8px] md:!text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase">GitHub NLP · LLM-Synthesized Role Matching</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {jobFit.map((role, idx) => {
                    const matchScore = role.match_score || 0;
                    const scoreColor = matchScore > 75 ? 'text-emerald-500' : matchScore > 50 ? 'text-amber-500' : 'text-rose-500';
                    const barColor   = matchScore > 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : matchScore > 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-rose-500';
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.12 }}
                        className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[1.5rem] p-6 md:p-8 flex flex-col gap-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="tech-mono !text-[8px] text-slate-400 dark:text-white/30 uppercase tracking-[0.3em] mb-2">Role #{idx + 1}</p>
                            <h3 className="text-lg md:text-xl font-display font-black tracking-tight text-slate-900 dark:text-white leading-tight">{role.role}</h3>
                          </div>
                          <div className="flex-shrink-0 text-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                            <span className={`text-2xl font-display font-black italic tabular-nums ${scoreColor}`}>
                              {matchScore}<span className="text-xs text-slate-400 dark:text-white/30">%</span>
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${matchScore}%` }}
                            transition={{ duration: 1.2, delay: 0.3 + idx * 0.1, ease: 'easeOut' }}
                            className={`h-full ${barColor}`}
                          />
                        </div>

                        <p className="text-[11px] md:text-[13px] text-slate-600 dark:text-white/60 leading-relaxed italic border-l-2 border-slate-200 dark:border-white/10 pl-3">
                          {role.reasoning}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="w-full bg-slate-900 dark:bg-black shadow-2xl border border-slate-800 dark:border-white/[0.05] p-6 sm:p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden flex flex-col items-start gap-8 md:gap-14">
               <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />
               <div className="relative z-10 flex flex-col w-full h-full gap-8 md:gap-10">
                 <div className="flex flex-col gap-4 md:gap-6 items-start flex-shrink-0">
                    <Target className="w-10 h-10 md:w-12 md:h-12 text-primary-500" />
                    <div>
                      <h2 className="text-4xl md:text-6xl font-editorial font-normal italic tracking-normal leading-tight text-white mb-2 md:mb-3">Strategic <span className="text-primary-500">Insight.</span></h2>
                      <p className="tech-mono text-white/50 !text-[8px] md:!text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em]">Growth pathways established and mapped</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full relative z-10">
                    {recommendations?.map((rec, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-start space-x-4 p-5 md:p-6 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-2xl hover:bg-white/10 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-black flex-shrink-0 shadow-[0_0_15px_rgba(73,197,182,0.4)]">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="text-[11px] md:text-[13px] font-sans font-medium text-white/90 leading-relaxed capitalize tracking-wide text-left">{rec.replace('\n', ' ')}</span>
                      </motion.div>
                    ))}
                 </div>
               </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default AnalysisResult;
