import React from 'react';
import { motion } from 'framer-motion';

export const Footer = () => (
  <footer className="py-20 border-t border-slate-200 dark:border-white/[0.04] bg-slate-100/50 dark:bg-black/80 backdrop-blur-md relative z-10">
    <div className="absolute inset-0 bg-dot-grid opacity-[0.015] pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
      <div className="md:col-span-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-6">
            <img src="/logo.png" alt="SkillProof" className="h-9 w-auto object-contain" />
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25 leading-relaxed">
            Unified Registry Platform. <br />Neural Intelligence Engine.
          </p>
        </div>
      </div>

      <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-12">
        {[
          { title: 'Protocol', links: ['Extraction', 'Verification', 'Identity'] },
          { title: 'Network',  links: ['About', 'Engineers', 'Security'] },
          { title: 'Support',  links: ['Docs', 'API', 'Status'] },
        ].map((col, i) => (
          <div key={i} className="space-y-5">
            <h4 className="font-mono text-[8px] uppercase tracking-[0.45em] text-slate-400 dark:text-white/20">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((link, j) => (
                <li key={j}>
                  <motion.a
                    whileHover={{ x: 2, color: '#49c5b6' }}
                    href="#"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 inline-block"
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-center text-[9px] font-mono uppercase tracking-[0.35em] text-slate-400 dark:text-white/15 relative z-10">
      <span>© 2026 Neural Registry</span>
      <span>Build v1.4.0</span>
    </div>
  </footer>
);
