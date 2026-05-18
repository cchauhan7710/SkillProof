import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
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
    <div className="relative min-h-screen bg-slate-50 dark:bg-black flex flex-col selection:bg-[#49c5b6]/20 transition-colors duration-500 overflow-x-hidden">
      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      
      {/* Interactive animated gradient orbs */}
      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12], scale: [1, 1.06, 1], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none filter blur-[120px] z-0"
        style={{ background: 'radial-gradient(circle, rgba(73,197,182,0.16) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.04, 1], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none filter blur-[100px] z-0"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }}
      />

      <Navbar />

      {/* ── Centered card ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          {/* Card Wrapper with glowing border */}
          <div className="relative rounded-[2.2rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] group border border-slate-200/50 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] backdrop-blur-2xl transition-all duration-500 hover:border-[#49c5b6]/30">
            {/* Top gradient edge */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#49c5b6]/80 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 px-8 sm:px-10 py-10">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
                  Create <span className="text-[#49c5b6] italic font-normal">account.</span>
                </h1>
                <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-slate-400 dark:text-white/25 mt-1.5">
                  New Identity Mapping
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ── Avatar Upload ── */}
                <div className="flex items-center gap-5 bg-slate-50/50 dark:bg-white/[0.01] p-4 rounded-2xl border border-slate-200/40 dark:border-white/[0.04]">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    onClick={() => fileInputRef.current.click()}
                    className="relative flex-shrink-0 w-16 h-16 rounded-xl cursor-pointer border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center overflow-hidden shadow transition-all hover:border-[#49c5b6]/40 group"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-white/35 group-hover:text-[#49c5b6] transition-colors">
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
                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-slate-500 dark:text-white/35 font-bold">
                      Profile Avatar
                    </p>
                    <p className="font-mono text-[7px] uppercase tracking-wider text-slate-400 dark:text-white/20 mt-1">
                      Required · JPG, PNG, WEBP
                    </p>
                  </div>
                </div>

                {/* ── Name + Handle (2-col) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/35 font-bold">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      required
                      icon={Type}
                      className="!py-3 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm focus:border-[#49c5b6]/50 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/35 font-bold">
                      Handle
                    </label>
                    <Input
                      type="text"
                      placeholder="jane_dev"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      icon={User}
                      className="!py-3 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm focus:border-[#49c5b6]/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* ── Email ── */}
                <div className="space-y-2">
                  <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/35 font-bold">
                    Email Identity
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    icon={Mail}
                    className="!py-3 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm focus:border-[#49c5b6]/50 transition-all duration-300"
                  />
                </div>

                {/* ── Password ── */}
                <div className="space-y-2">
                  <label className="font-mono text-[8px] pl-3 uppercase tracking-[0.25em] text-slate-400 dark:text-white/35 font-bold">
                    Password Code
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    icon={Lock}
                    className="!py-3 !pl-11 !rounded-xl border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] text-sm focus:border-[#49c5b6]/50 transition-all duration-300"
                  />
                </div>

                {/* ── Error ── */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-rose-500/5 border border-rose-500/15 text-rose-500 px-4 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="btn-apple h-12 w-full text-[10px] font-bold uppercase tracking-widest group rounded-xl bg-[#49c5b6] dark:bg-[#49c5b6] text-white hover:shadow-[#49c5b6]/20 transition-all duration-300"
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
              <div className="mt-6 text-center border-t border-slate-200 dark:border-white/[0.04] pt-6">
                <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/20 mb-3">
                  Already registered?
                </p>
                <Link to="/login">
                  <button className="btn-apple-secondary h-10 w-full text-[9px] font-bold tracking-widest uppercase rounded-xl hover:border-[#49c5b6]/40 transition-colors">
                    Sign In
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
