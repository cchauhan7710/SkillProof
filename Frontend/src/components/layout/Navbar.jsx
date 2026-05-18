import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Layout, 
  Upload as UploadIcon, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Menu,
  X,
  Bell,
  Cpu,
  Target,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Layout },
    { name: 'Analyze', path: '/upload', icon: UploadIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      isScrolled ? 'py-3' : 'py-4.5'
    }`}>
      <div className="w-full md:max-w-4xl ml-auto mr-0 md:mr-10 px-4 md:px-0">
        <div className={`relative flex items-center justify-between px-5 py-2 rounded-full transition-all duration-700 ${
          isScrolled
            ? 'bg-white border border-slate-200 dark:bg-slate-950 dark:border-[#49c5b6]/40 shadow-[0_8px_30px_rgba(73,197,182,0.3)]'
            : 'bg-white border border-slate-100 dark:bg-gradient-to-r dark:from-[#0d1e1c] dark:to-[#081312] dark:border-[#49c5b6]/35 shadow-[0_4px_25px_rgba(73,197,182,0.18)]'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="SkillProof Logo"
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-2 mr-4 pr-4 border-r border-slate-200 dark:border-white/15">
              {user && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-display font-extrabold uppercase tracking-wider transition-all duration-500 ${
                    isActive(link.path) 
                      ? 'bg-[#49c5b6] text-white shadow-lg shadow-[#49c5b6]/20' 
                      : 'text-slate-700 dark:text-slate-200 hover:text-[#49c5b6] dark:hover:text-[#49c5b6]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleTheme}
                  className="p-2 text-slate-500 dark:text-slate-300 hover:text-[#49c5b6] dark:hover:text-[#49c5b6] transition-colors"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link to="/profile" className="flex items-center space-x-3 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full border border-slate-300 dark:border-white/10 p-0.5 overflow-hidden group-hover:border-slate-400 dark:group-hover:border-white/20 transition-colors">
                     {user.avatar ? (
                        <img src={user.avatar?.replace('http://', 'https://')} alt="avatar" className="w-full h-full object-cover rounded-full" />
                     ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20"><User size={14} /></div>
                     )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 dark:text-white/20 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </Link>
                
                <button 
                  onClick={logout}
                  className="p-2 text-slate-500 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleTheme}
                  className="p-2 text-slate-500 dark:text-slate-300 hover:text-[#49c5b6] dark:hover:text-[#49c5b6] transition-colors"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link to="/login" className="text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-[#49c5b6] dark:hover:text-[#49c5b6] transition-colors uppercase tracking-wider px-4">Log In</Link>
                <Link to="/register">
                  <button className="btn-apple bg-slate-900 dark:bg-white text-white dark:text-black !py-2 !px-6 !text-xs !font-extrabold shadow-none !tracking-wider">Sign Up</button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-400 dark:text-white/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-20 left-6 right-6 p-8 rounded-3xl border border-slate-200/30 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">Theme</span>
                <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-800 dark:text-white/80">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-display font-bold text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                {user ? (
                   <button onClick={logout} className="text-red-500 dark:text-red-400 font-bold uppercase tracking-widest text-[9px]">Log Out</button>
                ) : (
                  <Link to="/login" className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[9px]">Log In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
