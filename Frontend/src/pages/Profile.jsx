import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Shield,
  Github
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { user, updateProfile, updateAvatar, updatePassword } = useAuth();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(profileData);
      setMessage({ type: 'success', text: 'Account details updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully. Please logout and login again for security.' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateAvatar(formData);
      setMessage({ type: 'success', text: 'Avatar updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload avatar.' });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <Link to="/dashboard" className="flex items-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
            </Link>
            <h1 className="text-4xl font-display font-medium tracking-tight text-slate-900 dark:text-white">Profile <span className="text-slate-400 dark:text-white/20 italic">Settings.</span></h1>
          </div>
          <div className="hidden sm:flex items-center space-x-3 px-4 py-1.5 rounded-full glass border-slate-200 dark:border-white/5 text-slate-500 dark:text-white/30">
            <Shield size={14} />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Secure Identity Port</span>
          </div>
        </motion.div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-4 rounded-2xl flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-secondary-500/10 border border-secondary-500/20 text-secondary-600 dark:text-secondary-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full border-2 border-slate-200 dark:border-white/10 p-1 overflow-hidden transition-colors group-hover:border-primary-500/50">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full cursor-pointer shadow-xl hover:scale-110 transition-transform">
                  {avatarLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </label>
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  aria-label="Upload avatar image"
                  onClick={(e) => { e.target.value = null; }}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg, image/webp"
                  disabled={avatarLoading}
                />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{user?.fullname}</h3>
              <p className="text-xs font-mono text-slate-400 dark:text-white/20 uppercase tracking-widest mb-4">@{user?.username}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/20"
              >
                <Camera size={14} />
                Change Avatar
              </button>
              
              <div className="w-full pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold">
                  <span className="text-slate-400 dark:text-white/20">Member Since</span>
                  <span className="text-slate-600 dark:text-white/60">{new Date(user?.createdAt).getFullYear()}</span>
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold">
                  <span className="text-slate-400 dark:text-white/20">Status</span>
                  <span className="text-secondary-500 italic">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="md:col-span-2 space-y-8">
            {/* Account Details */}
            <div className="glass-card p-10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-[0.3em] flex items-center">
                <User size={16} className="mr-3 text-slate-400 dark:text-white/20" />
                Account Details
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20" />
                    <input
                      type="text"
                      value={profileData.fullname}
                      onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl h-14 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/50 transition-all"
                      placeholder="Your Full Name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl h-14 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/50 transition-all"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-apple w-full h-14 shadow-none"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="glass-card p-10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-[0.3em] flex items-center">
                <Lock size={16} className="mr-3 text-slate-400 dark:text-white/20" />
                Security Hub
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20" />
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl h-14 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/50 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20" />
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl h-14 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/50 transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">Confirm New</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20" />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl h-14 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/50 transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-apple-secondary w-full h-14 shadow-none"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Security Credentials'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
