"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import GaugeChart from "@/components/results/GaugeChart";
import ShapBars from "@/components/results/ShapBars";
import { TIER_STYLES, TIER_DESC, getRecommendationKeys, RECOMMENDATIONS } from "@/lib/utils";
import { CRISIS_RESOURCES, GENERAL_RESOURCES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { useState, useEffect, useRef } from "react";
import type { TopFactor } from "@/types/prediction";

const TABS = ["💡 Suggestions", "📈 Deep Dive", "📞 Resources"] as const;

function useConfetti(score: number | undefined) {
 const fired = useRef(false);
 useEffect(() => {
  if (score == null || fired.current) return;
  if (score >= 10) return; // only Minimal / Subthreshold
  fired.current = true;
  import("canvas-confetti").then(({ default: confetti }) => {
   const isMinimal = score < 5;
   confetti({
    particleCount: isMinimal ? 120 : 70,
    spread: 70,
    origin: { x: 0.3, y: 0.55 },
    colors: ["#52906A", "#7EE8A2", "#B2E8C8", "#F4C842", "#fff"],
    scalar: 0.9,
   });
   setTimeout(() => {
    confetti({
     particleCount: isMinimal ? 120 : 70,
     spread: 70,
     origin: { x: 0.7, y: 0.55 },
     colors: ["#52906A", "#7EE8A2", "#B2E8C8", "#F4C842", "#fff"],
     scalar: 0.9,
    });
   }, 180);
  });
 }, [score]);
}

export default function ResultsPage() {
 const { prediction } = useStore();
 const [tab, setTab] = useState<(typeof TABS)[number]>("💡 Suggestions");
 useConfetti(prediction?.gad7_score);

 if (!prediction) {
  return (
   <div className="max-w-lg mx-auto pt-20 text-center">
    <div className="text-5xl mb-4">📋</div>
    <h2 className="text-xl font-bold text-fg mb-2">Complete the check-in first</h2>
    <p className="text-sm text-fg3 mb-6">Fill out the 3-step assessment to see your personalized insight.</p>
    <Link href="/assessment"
     className="inline-flex items-center gap-2 bg-gradient-to-br from-brand-dark to-brand text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition-all">
     Go to Check-In →
    </Link>
   </div>
  );
 }

 const P = prediction;
 const tier = TIER_STYLES[P.risk_tier];
 const desc = TIER_DESC[P.risk_tier];
 const recKeys = getRecommendationKeys(P.top_factors, P.feature_values);

 return (
  <div className="pt-8">
   {/* Section label */}
   <div className="text-xs text-fg3 font-semibold uppercase tracking-widest mb-4">
    Your Wellness Insight
   </div>

   {/* Hero row */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {/* Gauge */}
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
     <Card className="p-4">
      <GaugeChart
       score={P.gad7_score}
       ciLow={P.confidence_low}
       ciHigh={P.confidence_high}
       tier={P.risk_tier}
      />
     </Card>
    </motion.div>

    {/* Score details */}
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
     <Card className="p-5 h-full flex flex-col justify-center">
      {/* Big score */}
      <div className="flex items-baseline gap-1 mb-3">
       <span className="text-6xl font-black leading-none" style={{ color: tier.color }}>
        {Math.round(P.gad7_score)}
       </span>
       <span className="text-xl text-fg3 font-medium">/21</span>
      </div>

      {/* Tier badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold mb-3"
         style={{ background: tier.bg, color: tier.color, border: `1.5px solid ${tier.border}` }}>
       {tier.label}
      </div>

      {/* CI */}
      <p className="text-xs text-fg3 mb-1">
       80% likely between <strong className="text-fg">{P.confidence_low.toFixed(1)}-{P.confidence_high.toFixed(1)}</strong>
      </p>
      <p className="text-xs text-fg3">
       P(moderate+): <strong className="text-fg2">{(P.risk_prob * 100).toFixed(0)}%</strong>
      </p>
     </Card>
    </motion.div>

    {/* Meaning */}
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
     <Card className="p-5 h-full flex flex-col gap-3">
      <p className="text-sm font-bold" style={{ color: tier.color }}>What this means</p>
      <div className="flex-1 text-sm text-fg2 leading-relaxed rounded-xl p-3"
         style={{ background: tier.bg, borderLeft: `3px solid ${tier.color}` }}>
       {desc}
      </div>
      <p className="text-xs text-fg3 bg-bg3 rounded-lg p-2.5">
       <strong className="text-fg">Not a diagnosis.</strong> Scores shift with circumstances.
       A clinician interprets real mental health concerns.
      </p>
     </Card>
    </motion.div>
   </div>

   {/* SHAP section */}
   <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
    <Card className="p-5 mb-8">
     <h2 className="text-base font-bold text-fg mb-0.5">🔍 What shaped your score</h2>
     <p className="text-xs text-fg3 mb-4">SHAP values - each factor's contribution toward your prediction</p>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ShapBars factors={P.top_factors.slice(0, 3)} />
      <ShapBars factors={P.top_factors.slice(3, 6)} />
     </div>
     <p className="mt-3 text-xs text-fg3">▲ Red = pushes score higher &nbsp;·&nbsp; ▼ Green = pushes score lower</p>
    </Card>
   </motion.div>

   {/* Tabs */}
   <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
    {/* Tab bar */}
    <div className="flex gap-1 border-b border-border mb-6 relative">
     {TABS.map((t) => (
      <button key={t} onClick={() => setTab(t)}
       className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === t ? "text-brand font-semibold" : "text-fg3 hover:text-fg"}`}>
       {t}
       {tab === t && (
        <motion.div layoutId="tab-line"
         className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full"
         transition={{ type: "spring", stiffness: 300, damping: 30 }} />
       )}
      </button>
     ))}
    </div>

    {/* Suggestions tab */}
    {tab === "💡 Suggestions" && (
     <motion.div key="sug" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className={`grid gap-4 ${recKeys.length === 1 ? "grid-cols-1 max-w-sm" : recKeys.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"} mb-6`}>
       {recKeys.map((rk, i) => {
        const R = RECOMMENDATIONS[rk];
        return (
         <motion.div key={rk} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
          <Card className="overflow-hidden h-full flex flex-col">
           <div className="px-4 py-3 border-b border-border-subtle" style={{ borderLeft: `3px solid ${R.color}` }}>
            <p className="font-bold text-sm text-fg">{R.icon} {R.title}</p>
           </div>
           <div className="px-4 py-3 flex-1 space-y-1.5">
            {R.tips.slice(0, 4).map((tip) => (
             <div key={tip} className="flex gap-2 text-xs text-fg2">
              <span className="text-brand font-bold flex-shrink-0">→</span>
              <span>{tip}</span>
             </div>
            ))}
           </div>
          </Card>
         </motion.div>
        );
       })}
      </div>
      <div className="text-center">
       <Link href="/chat"
        className="inline-flex items-center gap-2 bg-gradient-to-br from-brand-dark to-brand text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition-all text-sm">
        Talk to the AI Wellness Guide →
       </Link>
      </div>
     </motion.div>
    )}

    {/* Deep Dive tab */}
    {tab === "📈 Deep Dive" && (
     <motion.div key="deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-4">
      <Card className="p-5">
       <h3 className="font-bold text-fg mb-1">SHAP Waterfall</h3>
       <p className="text-xs text-fg3 mb-4">Detailed breakdown of each factor's exact contribution</p>
       <WaterfallChart factors={P.top_factors} baseScore={P.gad7_score} />
      </Card>
      <Details summary="What is SHAP?">
       <p className="text-sm text-fg2 leading-relaxed">
        <strong className="text-fg">SHAP (SHapley Additive exPlanations)</strong> uses game theory to explain individual ML predictions.
        Each feature gets a value showing how much it shifted your predicted score above or below the model's average.
        Positive = pushed higher (more anxiety). Negative = pushed lower (less anxiety).
       </p>
      </Details>
      <Details summary="Understanding prediction errors">
       <div className="text-sm text-fg2 space-y-2">
        <p><strong className="text-fg">False positive</strong> (flagged when not at risk) → may cause unnecessary concern, but connecting with support rarely causes harm.</p>
        <p><strong className="text-fg">False negative</strong> (missed when at risk) → higher harm - someone who could benefit doesn't receive the nudge.</p>
        <p>The model is tuned to favor sensitivity (catching true positives). The 80% CI is shown explicitly so you can see that predictions have real uncertainty.</p>
       </div>
      </Details>
     </motion.div>
    )}

    {/* Resources tab */}
    {tab === "📞 Resources" && (
     <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div>
        <h3 className="font-bold text-fg mb-1">🆘 Crisis Resources</h3>
        <p className="text-xs text-fg3 mb-3">Please use these if you need them - they're here for a reason.</p>
        <div className="space-y-2">
         {CRISIS_RESOURCES.map((r) => (
          <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-3 bg-bg2 border border-rose/20 border-l-4 border-l-rose rounded-xl px-3 py-3 hover:bg-rose/5 transition-colors">
           <span className="text-xl flex-shrink-0">{r.icon}</span>
           <div>
            <p className="text-sm font-semibold text-fg">{r.name}</p>
            <p className="text-sm font-bold text-rose">{r.contact}</p>
            <p className="text-xs text-fg3">{r.description}</p>
           </div>
          </a>
         ))}
        </div>
       </div>
       <div>
        <h3 className="font-bold text-fg mb-1">💚 Helpful Resources</h3>
        <p className="text-xs text-fg3 mb-3">For students looking for additional wellbeing support.</p>
        <div className="space-y-2">
         {GENERAL_RESOURCES.map((r) => (
          <div key={r.name}
             className="flex items-start gap-3 bg-bg2 border border-brand/15 border-l-4 border-l-brand rounded-xl px-3 py-3">
           <span className="text-xl flex-shrink-0">{r.icon}</span>
           <div>
            <p className="text-sm font-semibold text-fg">
             {r.name}
             {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand text-xs font-semibold hover:underline">Visit →</a>}
            </p>
            <p className="text-xs text-fg3">{r.description}</p>
           </div>
          </div>
         ))}
        </div>
       </div>
      </div>
     </motion.div>
    )}
   </motion.div>

   <p className="text-center text-xs text-fg3 mt-10">
    MindBridge · Academic demonstration · Recalculate anytime from Check-In
   </p>
  </div>
 );
}

// ── Mini waterfall chart ───────────────────────────────
function WaterfallChart({ factors, baseScore }: { factors: TopFactor[]; baseScore: number }) {
 const top = factors.slice(0, 5);
 const base = Math.max(0, baseScore - top.reduce((s, f) => s + f.shap, 0));
 const maxAbs = Math.max(...top.map((f) => Math.abs(f.shap)), 0.01);

 return (
  <div className="space-y-2">
   {/* Base */}
   <div className="flex items-center gap-3 text-xs">
    <span className="w-36 text-fg3">Model baseline</span>
    <div className="flex-1 h-5 bg-bg3 rounded relative overflow-hidden">
     <div className="h-full rounded bg-sky/40" style={{ width: `${(base / 21) * 100}%` }} />
     <span className="absolute inset-0 flex items-center pl-2 text-fg3 font-mono">{base.toFixed(1)}</span>
    </div>
   </div>
   {top.map((f, i) => (
    <motion.div key={f.col} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
     className="flex items-center gap-3 text-xs">
     <span className="w-36 text-fg truncate">{f.icon} {f.label}</span>
     <div className="flex-1 h-5 bg-bg3 rounded relative overflow-hidden">
      <motion.div
       className={`h-full rounded ${f.shap > 0 ? "bg-rose/60" : "bg-brand/60"}`}
       initial={{ width: 0 }}
       animate={{ width: `${(Math.abs(f.shap) / maxAbs) * 60}%` }}
       transition={{ duration: 0.5, delay: i * 0.08 }}
       style={{ marginLeft: f.shap > 0 ? 0 : "auto" }}
      />
      <span className={`absolute inset-0 flex items-center px-2 font-mono font-bold ${f.shap > 0 ? "text-rose" : "text-brand"}`}>
       {f.shap > 0 ? "+" : ""}{f.shap.toFixed(2)}
      </span>
     </div>
    </motion.div>
   ))}
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
