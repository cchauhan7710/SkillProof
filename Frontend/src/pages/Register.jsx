import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui';
import { Navbar } from '../components/layout/Navbar';
import { User, Lock, Mail, ArrowRight, Loader2, Camera, Type } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', password: '',
  });
  const [avatar, setAvatar]               = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const fileInputRef                      = useRef(null);
  const { register }                      = useAuth();
  const navigate                          = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) return setError('Avatar is required.');
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      data.append('avatar', avatar);
      await register(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registry failed. Check server logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── Full-screen, no scroll ── */
    <div className="relative min-h-full bg-slate-50 dark:bg-[#080808] flex flex-col selection:bg-amber-400/25">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)' }}
      />

      <Navbar />

      {/* ── Centered card ── */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          {/* Card */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl border border-slate-200 dark:border-white/[0.07]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/70 dark:via-white/10 to-transparent" />

            <div className="relative z-10 px-8 py-6">

              {/* Header */}
              <div className="text-center mb-5">
                <h1 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                  Create <span className="text-slate-400 dark:text-white/20 font-light italic">account.</span>
                </h1>
                <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-slate-400 dark:text-white/25 mt-1">
                  New Identity Mapping
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* ── Avatar Upload (inline, compact) ── */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    onClick={() => fileInputRef.current.click()}
                    className="relative flex-shrink-0 w-16 h-16 rounded-xl cursor-pointer border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center overflow-hidden shadow transition-all hover:border-amber-500/40 group"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-white/20 group-hover:text-amber-500 transition-colors">
                        <Camera size={18} />
                        <span className="font-mono text-[7px] uppercase tracking-wider">Upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="font-mono text-[7px] uppercase tracking-wider text-white">Change</span>
                    </div>
                  </motion.div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-slate-500 dark:text-white/30 font-medium">
                      Profile Avatar
                    </p>
                    <p className="font-mono text-[7px] uppercase tracking-wider text-slate-400 dark:text-white/20 mt-1">
                      Required · JPG, PNG, WEBP
                    </p>
                  </div>
                </div>

                {/* ── Name + Handle (2-col) ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/25">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      required
                      icon={Type}
                      className="!py-2.5 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/25">
                      Handle
                    </label>
                    <Input
                      type="text"
                      placeholder="jane_dev"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      icon={User}
                      className="!py-2.5 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm"
                    />
                  </div>
                </div>

                {/* ── Email ── */}
                <div className="space-y-1">
                  <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/25">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    icon={Mail}
                    className="!py-2.5 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm"
                  />
                </div>

                {/* ── Password ── */}
                <div className="space-y-1">
                  <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/25">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    icon={Lock}
                    className="!py-2.5 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm"
                  />
                </div>

                {/* ── Error ── */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-500/5 border border-red-500/15 text-red-500/80 px-4 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest text-center"
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Initializing…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-4 text-center border-t border-slate-200 dark:border-white/[0.04] pt-4">
                <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/20 mb-3">
                  Already registered?
                </p>
                <Link to="/login">
                  <button className="btn-apple-secondary h-9 w-full text-[9px] font-bold tracking-widest uppercase">
                    Sign In
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
