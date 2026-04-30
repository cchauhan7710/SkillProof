import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui';
import { Navbar } from '../components/layout/Navbar';
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
    /* ── Full-screen, no scroll ── */
    <div className="relative min-h-full bg-slate-50 dark:bg-[#080808] flex flex-col selection:bg-amber-400/25">

      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.09) 0%, transparent 65%)' }}
      />

      <Navbar />

      {/* ── Centered card ── */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl border border-slate-200 dark:border-white/[0.07]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/70 dark:via-white/10 to-transparent" />

            <div className="relative z-10 px-8 py-7">

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <LogIn className="w-5 h-5 text-white dark:text-black" />
                </motion.div>
                <h1 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                  Welcome <span className="text-slate-400 dark:text-white/20 font-light italic">back.</span>
                </h1>
                <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-slate-400 dark:text-white/25 mt-1">
                  Establish Secure Link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-1.5">
                  <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.3em] text-slate-400 dark:text-white/25">
                    Email
                  </label>
                  <Input
                    type="text"
                    placeholder="identity@v1.link"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    icon={Mail}
                    className="!py-2.5 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-3">
                    <label className="font-mono text-[8px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25">
                      Password
                    </label>
                    <a href="#" className="font-mono text-[7px] uppercase tracking-[0.2em] text-slate-300 dark:text-white/15 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Forgot?
                    </a>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    icon={Lock}
                    className="!py-2.5 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-500/5 border border-red-500/15 text-red-500/80 px-4 py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-widest text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="btn-apple h-11 w-full text-[10px] font-bold uppercase tracking-widest group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing In…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-5 text-center border-t border-slate-200 dark:border-white/[0.04] pt-5">
                <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/20 mb-3">
                  No account?
                </p>
                <Link to="/register">
                  <button className="btn-apple-secondary h-9 w-full text-[9px] font-bold tracking-widest uppercase">
                    Create Account
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
