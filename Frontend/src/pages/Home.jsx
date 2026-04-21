import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Github, BarChart3, ShieldCheck, Zap, Cpu, Layout, ArrowRight, Terminal, FileText, Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Fade-up animation preset ── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
});

/* ════════════════════════════
   HERO
════════════════════════════ */
const Hero = () => (
  <section className="relative flex items-center justify-center overflow-hidden pt-24 pb-32 min-h-screen">

    {/* ── background layers ── */}
    <div className="absolute inset-0 bg-dot-grid opacity-[0.035] pointer-events-none" />

    {/* top amber glow */}
    <motion.div
      animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.05, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(ellipse, rgba(73,197,182,0.12) 0%, transparent 70%)' }}
    />
    {/* bottom-left green glow */}
    <div
      className="absolute bottom-[-5%] left-[-10%] w-[600px] h-[500px] rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)' }}
    />

    {/* ── content ── */}
    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">

      {/* badge */}
      <motion.div {...fadeUp(0)} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass mb-14 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 animate-pulse shadow-[0_0_6px_theme(colors.secondary.400)]" />
        <span className="font-mono text-[10px] text-slate-500 dark:text-white/40 tracking-[0.35em] uppercase">
          Verified Registry v1.4
        </span>
        <span className="font-mono text-[10px] text-slate-400 dark:text-white/20 tracking-[0.2em] uppercase border-l border-slate-300 dark:border-white/10 pl-3">
          Neural Engine Active
        </span>
      </motion.div>

      {/* headline */}
      <motion.h1
        {...fadeUp(0.1)}
        className="font-display font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.05]"
        style={{ fontSize: 'clamp(4rem, 10vw, 7.5rem)' }}
      >
        Verify technical{' '}
        <br className="hidden sm:block" />
        <span className="text-primary-500">
          expertise.
        </span>
      </motion.h1>

      {/* sub headline */}
      <motion.p
        {...fadeUp(0.2)}
        className="max-w-2xl text-lg md:text-xl text-slate-500 dark:text-white/40 mb-14 font-medium leading-[1.75]"
      >
        Bridging the gap between claimed skills and real‑world repository audit data through our
        proprietary high‑fidelity neural mapping engine.
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fadeUp(0.3)}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link to="/register">
          <button className="btn-apple h-14 px-10 text-[11px] font-bold uppercase tracking-widest">
            Get Started <ArrowRight className="inline ml-2 w-4 h-4" />
          </button>
        </Link>
        <Link to="/upload">
          <button className="btn-apple-secondary h-14 px-10 text-[11px] font-bold uppercase tracking-widest">
            See It In Action
          </button>
        </Link>
      </motion.div>

      {/* floating stat strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06] shadow-xl w-full"
      >
        {[
          { val: '99.2%', label: 'Accuracy Rate' },
          { val: '<30s', label: 'Avg Report Time' },
          { val: '10K+', label: 'Repos Audited' },
        ].map(({ val, label }) => (
          <div
            key={label}
            className="px-8 py-5 bg-white/70 dark:bg-white/[0.025] flex flex-col items-center gap-1 backdrop-blur-sm"
          >
            <span className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">{val}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

/* ════════════════════════════
   FEATURE CARD
════════════════════════════ */
const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="group h-full bg-white dark:bg-black border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-10 transition-all duration-700 hover:-translate-y-1 shadow-sm hover:shadow-2xl hover:border-primary-500/30">
      <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center justify-center mb-8 bg-slate-50 dark:bg-white/[0.02] group-hover:border-primary-500/50 group-hover:bg-primary-500/10 transition-all duration-500 group-hover:scale-110">
        <Icon className="w-5 h-5 text-slate-400 dark:text-white/25 group-hover:text-primary-500 transition-colors duration-500" />
      </div>
      <h3 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white/90 group-hover:text-slate-900 dark:group-hover:text-white transition-colors mb-3">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 dark:text-white/40 leading-[1.7] group-hover:text-slate-600 dark:group-hover:text-white/60 transition-colors">
        {desc}
      </p>
    </div>
  </motion.div>
);

/* ════════════════════════════
   FEATURES SECTION
════════════════════════════ */
const Features = () => {
  const features = [
    { icon: Cpu,        title: 'Neural Graph',  desc: 'Deconstruct complex skill relationships using our proprietary transformer models.' },
    { icon: Github,     title: 'Repo Audit',    desc: 'High-fidelity mapping of code ownership, commit quality, and project depth.' },
    { icon: ShieldCheck,title: 'Entropy Link',  desc: 'Cross-reference claimed history with real-world complexity vectors.' },
    { icon: BarChart3,  title: 'Velocity',      desc: 'Analyze technical development curves over multi-year trajectories with precision.' },
    { icon: Zap,        title: 'Latency',       desc: 'Get exhaustive technical intelligence reports in under 30 seconds.' },
    { icon: Layout,     title: 'Synthesis',     desc: 'Compare entire engineering groups within a single high-fidelity dashboard.' },
  ];

  return (
    <section className="py-40 relative">
      {/* section glow */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(73,197,182,0.06) 0%, transparent 70%)' }}
      />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-amber-500/70 mb-6"
          >
            <Terminal size={11} /> Core Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Engineered for{' '}
            <span className="text-slate-400 dark:text-white/20 italic font-light">absolute precision.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-white/30 font-medium leading-relaxed"
          >
            Establishing the new standard for technical verification through architectural lineage audit.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════
   HOW IT WORKS (WORKFLOW)
════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Initialize Port',
      desc: 'Upload a Resume (PDF/DOCX) or connect a GitHub Username to start the trace.',
      icon: FileText
    },
    {
      step: '02',
      title: 'Neural Sync',
      desc: 'Our engine extracts claimed skills and correlates them against GitHub commit histories and project LOC.',
      icon: Activity
    },
    {
      step: '03',
      title: 'Audit Protocol',
      desc: 'An AI-synthesized verification report is generated, scoring each skill as Proven, Plausible, or Overstated.',
      icon: CheckCircle2
    }
  ];

  return (
    <section className="py-32 relative border-t border-slate-200/50 dark:border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
           <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#49c5b6] mb-6"
          >
            <Terminal size={11} /> Trace Protocol
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            The Verification <span className="text-slate-400 dark:text-white/20 italic font-light">Workflow.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
          
          {steps.map((s, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.15, duration: 0.8 }}
               className="relative flex flex-col items-center text-center group"
             >
               <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-black border border-slate-200 dark:border-white/[0.05] shadow-xl flex items-center justify-center mb-8 relative z-10 group-hover:border-[#49c5b6]/40 group-hover:-translate-y-2 transition-all duration-500">
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[9px] text-slate-500 dark:text-white/50">{s.step}</span>
                  <s.icon className="w-8 h-8 text-slate-400 dark:text-white/30 group-hover:text-[#49c5b6] transition-colors" />
               </div>
               <h3 className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white mb-4 uppercase">{s.title}</h3>
               <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed max-w-xs">{s.desc}</p>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════
   CTA BANNER
════════════════════════════ */
const CTA = () => (
  <section className="py-16 md:py-24">
    <div className="max-w-3xl mx-auto px-6">
      <div className="relative rounded-[2rem] overflow-hidden text-center p-6 sm:p-8 md:p-12 border border-slate-200 dark:border-white/[0.07] shadow-xl">
        {/* card fill */}
        <div className="absolute inset-0 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl" />
        {/* dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-[0.025] pointer-events-none" />
        {/* glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(73,197,182,0.12) 0%, transparent 65%)' }}
        />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.3em] text-amber-500/60 mb-5">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            Initialize Now
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 tracking-tight text-slate-900 dark:text-white leading-tight">
            Initialize the next <br />
            <span className="text-slate-400 dark:text-white/20 italic font-light">industry standard.</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-white/30 mb-6 max-w-sm mx-auto">
            Join the engineers already using SkillProof to verify skills with unprecedented precision.
          </p>
          <Link to="/register">
            <button className="btn-apple h-12 px-8 text-[10px] font-bold uppercase tracking-widest leading-none rounded-xl">
              Sign Up — It&apos;s Free
              <ArrowRight className="inline ml-1.5 w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/* ════════════════════════════
   FOOTER
════════════════════════════ */
const Footer = () => (
  <footer className="py-24 border-t border-slate-200 dark:border-white/[0.04] bg-slate-100/50 dark:bg-[#050505]">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
      <div className="md:col-span-1">
        <div className="flex items-center mb-6">
          <img src="/logo.png" alt="SkillProof" className="h-10 w-auto object-contain" />
        </div>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-white/25 leading-relaxed">
          Unified Registry Platform. <br />Neural Intelligence Engine.
        </p>
      </div>

      <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-12">
        {[
          { title: 'Protocol', links: ['Extraction', 'Verification', 'Identity'] },
          { title: 'Network',  links: ['About', 'Engineers', 'Security'] },
          { title: 'Support',  links: ['Docs', 'API', 'Status'] },
        ].map((col, i) => (
          <div key={i} className="space-y-6">
            <h4 className="font-mono text-[8px] uppercase tracking-[0.45em] text-slate-400 dark:text-white/20">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link, j) => (
                <li key={j}>
                  <a
                    href="#"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-center text-[9px] font-mono uppercase tracking-[0.35em] text-slate-400 dark:text-white/15">
      <span>© 2026 Neural Registry</span>
      <span>Build v1.4.0</span>
    </div>
  </footer>
);

/* ════════════════════════════
   PAGE EXPORT
════════════════════════════ */
export const Home = () => (
  <div className="relative min-h-full bg-slate-50 dark:bg-black transition-colors duration-500">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <CTA />
    <Footer />
  </div>
);
