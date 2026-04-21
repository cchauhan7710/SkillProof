import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, glow = false, ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center font-display font-bold tracking-wider transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 text-white shadow-xl shadow-primary-900/20 hover:scale-[1.02] hover:shadow-primary-500/30",
    secondary: "glass border-white/10 text-white hover:bg-white/10 hover:scale-[1.02] hover:border-white/20",
    outline: "border-2 border-primary-500/50 text-white hover:bg-primary-500/10 hover:border-primary-500",
    ghost: "text-white/60 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs uppercase",
    md: "px-8 py-4 text-sm uppercase",
    lg: "px-10 py-5 text-lg uppercase",
  };

  return (
    <button
      className={twMerge(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        glow && "shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {/* Glossy Overlay */}
      <span className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      
      {isLoading ? (
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const Input = ({ label, error, className, icon: Icon, ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-2">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={twMerge(
            "w-full bg-white/[0.02] border border-white/5 text-slate-900 dark:text-white rounded-2xl outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-white/30 caret-slate-900 dark:caret-white focus:bg-white/[0.05] focus:border-primary-500/50 focus:shadow-[0_0_25px_-12px_rgba(139,92,246,0.6)]",
            Icon ? "pl-14 pr-6 py-4" : "px-6 py-4",
            error && "border-red-500/30 focus:border-red-500/50 focus:shadow-none",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-xs text-red-400/80 ml-2 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const Card = ({ children, className, hover = true, padding = true }) => {
  return (
    <motion.div 
      whileHover={hover ? { y: -8, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={twMerge(
        "glass border border-white/10 rounded-[2.5rem] relative overflow-hidden transition-all duration-500",
        hover && "hover:bg-white/[0.06] hover:border-white/20",
        padding && "p-8",
        className
      )}
    >
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      
      {/* Corner Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};
