import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Button, Card, Input } from '../components/ui';
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Activity, 
  Target,
  Plus,
  Github,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Upload = () => {
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [githubUrl, setGithubUrl] = useState(''); // Now an optional manual override
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Redirect to login if not authenticated (after auth check completes)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true, state: { from: '/upload' } });
    }
  }, [user, authLoading, navigate]);

  // Show spinner while auth state is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#000000] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Show nothing while redirect is in-flight
  if (!user) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        const isPdf = selectedFile.type === 'application/pdf';
        const isWord = selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                       selectedFile.name.toLowerCase().endsWith('.docx');
        
        if (isPdf || isWord) {
            setFile(selectedFile);
        } else {
            alert('Port rejection: Only PDF or DOCX formats are supported at this terminal.');
        }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Single-step: send file + optional github username directly to Node backend.
      // Multer on the server saves the file; Node forwards it to Python NLP.
      const formData = new FormData();
      formData.append('resume', file);
      if (githubUrl.trim()) {
        // Accept full URL (https://github.com/user) or bare username
        const username = githubUrl.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
        formData.append('github_username', username);
      }

      const analysisRes = await api.post('/resume-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(10 + pct);
          }
        }
      });

      setUploadProgress(100);

      setTimeout(() => {
        navigate(`/analysis/${analysisRes.data.data._id}`);
      }, 500);

    } catch (err) {
      console.error('Registry Binding Failed:', err);
      alert(err.response?.data?.message || 'Neural Link Termination. Check file format or connection.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] selection:bg-primary-500/30 transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-24 sm:pt-32 md:pt-36 pb-20 md:pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 md:mb-16"
        >
          <div className="flex items-center space-x-2 px-3 md:px-4 py-1.5 rounded-full glass border-slate-200 dark:border-white/5 text-slate-500 dark:text-white/40 mb-4 md:mb-6 w-fit mx-auto scale-90 md:scale-100">
            <div className="w-1 h-1 bg-secondary-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[8px] md:text-[9px] font-mono tracking-[0.3em] uppercase text-slate-500 dark:text-white/40">Autonomous Scanner v1.4.2</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight italic uppercase leading-[0.9] text-slate-900 dark:text-white mb-4 md:mb-6">
            Neural <span className="text-slate-400 dark:text-white/20 uppercase font-light italic">Discovery.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-white/50 font-medium italic uppercase tracking-tighter max-w-sm md:max-w-lg mx-auto leading-tight">
             Upload any document and watch the system <span className="text-slate-900 dark:text-white">autonomously trace</span> your technical port on GitHub.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div 
            onClick={() => !isUploading && fileInputRef.current.click()}
            className={`relative group cursor-pointer transition-all duration-700 ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-[2.5rem] md:rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className={`relative glass-card border-slate-200 dark:border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-700 ${file ? 'border-secondary-500/20' : 'group-hover:border-slate-200 dark:border-white/10'}`}>
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div 
                    key="uploading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="space-y-6 md:space-y-8 w-full"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center">
                       <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary-500 animate-spin" />
                       <div className="absolute inset-0 border-2 border-slate-200 dark:border-white/5 rounded-full border-t-primary-500/60 animate-spin-slow" />
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      <p className="tech-mono !text-[9px] md:!text-[10px] text-primary-500 uppercase tracking-[0.2em] md:tracking-[0.4em] animate-pulse">Initializing Identity extraction...</p>
                      <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.03] rounded-full overflow-hidden max-w-[200px] mx-auto">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-primary-500 shadow-[0_0_15px_rgba(247,144,9,0.3)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] bg-secondary-500/5 border border-secondary-500/20 flex items-center justify-center text-secondary-500 mb-6 md:mb-8 shadow-2xl">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-lg md:text-xl font-display font-medium text-slate-900 dark:text-white italic tracking-tight uppercase mb-2 leading-none truncate max-w-[200px] md:max-w-xs">{file.name}</h3>
                    <p className="tech-mono !text-[8px] md:!text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em]">Document Port Synchronized</p>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                      className="mt-8 md:mt-10 btn-primary h-12 md:h-14 px-8 md:px-12 text-[10px] md:text-[11px] hover:scale-105 transition-transform duration-500 uppercase font-black tracking-widest bg-slate-900 text-white dark:bg-white dark:text-black rounded-full"
                    >
                      Initialize Analysis Registry
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-file"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 dark:text-white/20 mb-6 md:mb-8 hover:scale-110 transition-transform duration-700">
                      <UploadIcon size={20} className="md:w-6 md:h-6" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight uppercase mb-2 md:mb-3 leading-none italic">Choose Resume Port</h3>
                    <p className="tech-mono !text-[8px] md:!text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-6">Registry Format: <span className="text-slate-600 dark:text-white/60">PDF / DOCX</span></p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="mt-8 md:mt-12 group">
             <div className="flex items-center space-x-3 md:space-x-4 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:text-white/60 transition-colors cursor-pointer justify-center px-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.03]" />
                <span className="tech-mono !text-[8px] md:!text-[9px] uppercase tracking-[0.15em] md:tracking-[0.3em] italic whitespace-nowrap">Manual Trace Registry (Optional)</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.03]" />
             </div>
             
             <div className="mt-6 grid grid-cols-1 gap-4 max-w-xs md:max-w-sm mx-auto px-4 md:px-0">
                <div className="relative">
                   <Github className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20" />
                   <input 
                     type="text"
                     value={githubUrl}
                     onChange={(e) => setGithubUrl(e.target.value)}
                     placeholder="Override Discovery Engine (URL)"
                     className="w-full h-12 md:h-14 bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl md:rounded-2xl pl-12 pr-4 text-slate-900 dark:text-white text-[9px] md:text-[10px] font-mono tracking-widest placeholder:text-slate-400 dark:placeholder:text-white/20 focus:bg-white/[0.04] focus:border-white/20 transition-all outline-none"
                   />
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};
