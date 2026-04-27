"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const item = {
 hidden: { opacity: 0, y: 20 },
 show:  { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const FEATURES = [
 { icon: "📋", title: "2-Minute Check-In",   desc: "Answer 11 questions about your social life, academics, and recent feelings. Fully private - nothing leaves your browser.", href: "/assessment" },
 { icon: "📊", title: "Your Wellness Insight", desc: "Get a predicted anxiety score with an explainable AI breakdown - see exactly which factors drive it.", href: "/results" },
 { icon: "💬", title: "Talk It Through",     desc: "Chat with an AI wellness guide grounded in your results. Always points to real help when it matters.", href: "/chat" },
 { icon: "⚖️", title: "Fairness Explorer",    desc: "See how the model performs across student demographics - a live demo of responsible AI in practice.", href: "/fairness" },
];

export default function HomePage() {
 return (
  <div className="pt-8 sm:pt-12">
   {/* Hero */}
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="hero-bg rounded-3xl overflow-hidden relative mb-8"
   >
    {/* Glow */}
    <div className="absolute inset-0 opacity-40"
       style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(82,144,106,0.35) 0%, transparent 70%)" }} />

    <div className="relative z-10 text-center py-16 px-6 sm:py-20">
     <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="text-5xl mb-5"
     >
      🌿
     </motion.div>

     <motion.h1
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="text-5xl sm:text-6xl font-black tracking-tight mb-4"
     >
      <span className="gradient-text">MindBridge</span>
     </motion.h1>

     <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="text-lg text-fg2 max-w-xl mx-auto mb-8"
     >
      A smarter way to check in with yourself - powered by AI, grounded in research
     </motion.p>

     <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.45 }}
     >
      <Link
       href="/assessment"
       className="inline-flex items-center gap-2 bg-gradient-to-br from-brand-dark to-brand text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-xl shadow-brand/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/40 transition-all duration-200"
      >
       Start Your Check-In →
      </Link>
     </motion.div>
    </div>
   </motion.div>

   {/* Disclaimer */}
   <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="flex gap-3 items-start bg-amber/8 border border-amber/25 border-l-4 border-l-amber rounded-xl px-4 py-3.5 mb-10 text-sm text-fg2"
   >
    <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
    <span>
     <strong className="text-fg">Academic project only.</strong> MindBridge is not a clinical tool or medical service.
     It cannot diagnose you - only a licensed professional can do that.
     In a crisis? Call or text <strong className="text-rose">988</strong> · Text HOME to <strong className="text-rose">741741</strong>.
    </span>
   </motion.div>

   {/* Feature cards */}
   <motion.div
    variants={stagger}
    initial="hidden"
    animate="show"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
   >
    {FEATURES.map(({ icon, title, desc, href }) => (
     <motion.div key={title} variants={item}>
      <Link href={href} className="block h-full group">
       <div className="h-full rounded-2xl border border-border bg-bg2 p-5 text-center
               transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/30
               group-hover:border-brand/30 relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand to-sky scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <div className="font-bold text-fg text-sm mb-2">{title}</div>
        <p className="text-xs text-fg3 leading-relaxed">{desc}</p>
       </div>
      </Link>
     </motion.div>
    ))}
   </motion.div>

   {/* How it works */}
   <div className="mb-6">
    <Details summary="⚙️ How it works">
     <ol className="space-y-2 text-sm text-fg2">
      {[
       "Answer 11 questions about social life, academics, and how you've been feeling",
       "XGBoost model (trained on 61,393 student surveys) predicts your GAD-7 anxiety score",
       "SHAP explains exactly which factors pushed your score up or down",
       "Personalized suggestions based on your top contributing factors",
       "AI Wellness Guide (GPT-4o-mini) for a supportive conversation grounded in your results",
      ].map((step, i) => (
       <li key={i} className="flex gap-2">
        <span className="text-brand font-bold flex-shrink-0">{i + 1}.</span>
        <span>{step}</span>
       </li>
      ))}
     </ol>
    </Details>
   </div>

   <Details summary="📁 Dataset & limitations">
    <div className="text-sm text-fg2 space-y-3">
     <p><strong className="text-fg">Healthy Minds Study 2024-2025</strong> - nationally distributed survey of U.S. college student mental health.</p>
     <table className="w-full text-xs">
      <tbody>
       {[["Training rows","61,393 (after cleaning)"],["Target","GAD-7 anxiety scale (0-21)"],["Features","11: loneliness, academic impact, purpose, PHQ-9 items"],["AUC-ROC","0.871 (binary moderate+ classifier)"],["MAE","2.94 (regression, 0-21 scale)"]].map(([k,v]) => (
        <tr key={k} className="border-b border-border-subtle last:border-0">
         <td className="py-1.5 pr-4 font-semibold text-fg">{k}</td>
         <td className="py-1.5">{v}</td>
        </tr>
       ))}
      </tbody>
     </table>
     <p className="text-fg3">Screening tool only · May not generalize outside HMS sample · PHQ-9 items used as anxiety proxies · Fairness gaps exist - see Fairness Explorer.</p>
    </div>
   </Details>

   <p className="text-center text-xs text-fg3 mt-10">
    MindBridge · Data: Healthy Minds Study 2024-2025 · Not a clinical service
   </p>
  </div>
 );
}

function Details({ summary, children }: { summary: string; children: React.ReactNode }) {
 return (
  <details className="group rounded-xl border border-border bg-bg2">
   <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-semibold text-fg2 hover:text-fg transition-colors list-none">
    {summary}
    <span className="transition-transform group-open:rotate-180 text-fg3">▼</span>
   </summary>
   <div className="px-4 pb-4 pt-1">{children}</div>
  </details>
 );
}
