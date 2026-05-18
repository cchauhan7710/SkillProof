import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Mail, Lock, ArrowRight, Loader2, LogIn } from 'lucide-react';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-black flex flex-col selection:bg-primary-500/20 transition-colors duration-500 overflow-x-hidden">
      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      
      {/* Interactive animated gradient orbs */}
      <motion.div
        animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.08, 1], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none filter blur-[120px] z-0"
        style={{ background: 'radial-gradient(circle, rgba(73,197,182,0.18) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12], scale: [1, 1.05, 1], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none filter blur-[100px] z-0"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)' }}
      />

      <Navbar />

      {/* ── Centered card ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          {/* Card Wrapper with glowing hover border */}
          <div className="relative rounded-[2.2rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] group border border-slate-200/50 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] backdrop-blur-2xl transition-all duration-500 hover:border-[#49c5b6]/30">
            {/* Top gradient edge */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#49c5b6]/80 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 px-8 sm:px-10 py-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-105 transition-transform"
                >
                  <LogIn className="w-5 h-5 text-white dark:text-black" />
                </motion.div>
                <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
                  Welcome <span className="text-[#49c5b6] italic font-normal">back.</span>
                </h1>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mt-2 font-bold">
                  Establish Secure Link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2.5">
                  <label className="font-mono text-xs pl-3 uppercase tracking-[0.15em] text-slate-500 dark:text-white/45 font-bold">
                    Email Identity
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    icon={Mail}
                    className="!py-3.5 !pl-11 !rounded-2xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-base focus:border-[#49c5b6]/50 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-3">
                    <label className="font-mono text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-white/45 font-bold">
                      Password Code
                    </label>
                    <a href="#" className="font-mono text-xs uppercase tracking-[0.1em] text-slate-400 dark:text-white/30 hover:text-[#49c5b6] dark:hover:text-[#49c5b6] transition-colors font-bold">
                      Forgot?
                    </a>
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter your security password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    icon={Lock}
                    className="!py-3.5 !pl-11 !rounded-2xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-base focus:border-[#49c5b6]/50 transition-all duration-300"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-rose-500/5 border border-rose-500/15 text-rose-500 px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider text-center font-bold"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="btn-apple h-13 w-full text-sm font-bold uppercase tracking-widest group rounded-2xl bg-[#49c5b6] dark:bg-[#49c5b6] text-white hover:shadow-[#49c5b6]/20 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Signing In…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 text-sm">
                      Sign In <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center border-t border-slate-200 dark:border-white/[0.04] pt-8">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 mb-4 font-bold">
                  No account?
                </p>
                <Link to="/register">
                  <button className="btn-apple-secondary h-11 w-full text-xs font-bold tracking-wider uppercase rounded-xl hover:border-[#49c5b6]/40 transition-colors">
                    Create Account
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};
