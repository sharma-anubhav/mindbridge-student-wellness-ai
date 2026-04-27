"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
 BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getFairness, getMeta } from "@/lib/api";
import type { FairnessResponse, MetaResponse, SubgroupMetrics } from "@/types/fairness";
import { COL_DISPLAY_LABELS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";

type GroupKey = "Gender" | "Race" | "International" | "Sexual Orientation";

const GROUP_LABELS: Record<string, string> = {
 "Gender":      "⚧ Gender Identity",
 "Race":       "🌍 Race / Ethnicity",
 "International":   "🌐 International Status",
 "Sexual Orientation":"🏳️‍🌈 Sexual Orientation",
};

const CHART_COLORS = { actual: "#52906A", predicted: "#7BA7C7", tpr: "#4CAF7D", fpr: "#D96B6B" };

function prepData(gd: Record<string, SubgroupMetrics>) {
 return Object.entries(gd).map(([key, v]) => ({
  name: COL_DISPLAY_LABELS[key] ?? key,
  actualPrev:  +(v.true_prevalence * 100).toFixed(1),
  predictedRate: +(v.predicted_positive_rate * 100).toFixed(1),
  tpr:      +(v.tpr * 100).toFixed(1),
  fpr:      +(v.fpr * 100).toFixed(1),
  meanTrue:   +v.mean_true_score.toFixed(2),
  meanPred:   +v.mean_predicted_score.toFixed(2),
  calibError:  +v.calibration_error.toFixed(4),
  n:       v.n,
  actualMod:   +(v.mean_pred_prob * 100).toFixed(1),
 }));
}

const tooltipStyle = {
 backgroundColor: "rgb(18,26,21)",
 border: "1px solid rgb(40,56,47)",
 borderRadius: 10,
 fontSize: 12,
 color: "#E4EEE8",
};

export default function FairnessPage() {
 const [fairness, setFairness] = useState<FairnessResponse | null>(null);
 const [meta, setMeta] = useState<MetaResponse | null>(null);
 const [group, setGroup] = useState<GroupKey>("Gender");
 const [loading, setLoading] = useState(true);
 const [err, setErr] = useState<string | null>(null);

 useEffect(() => {
  Promise.all([getFairness(), getMeta()])
   .then(([f, m]) => { setFairness(f); setMeta(m); })
   .catch((e) => setErr(e.message))
   .finally(() => setLoading(false));
 }, []);

 if (loading) return <div className="pt-20 text-center text-fg3 text-sm animate-pulse">Loading fairness data…</div>;
 if (err)   return <div className="pt-20 text-center text-sm" style={{color:"#e05252"}}>⚠️ {err} - make sure the backend is running at localhost:8000.</div>;
 if (!fairness || !meta) return <div className="pt-20 text-center text-fg3 text-sm">No data returned from backend.</div>;

 const FR = fairness.fairness_report;
 const avail = Object.keys(FR).filter((g) => Object.keys(FR[g]).length > 0) as GroupKey[];
 const gd = FR[group] ?? {};
 const data = prepData(gd);

 const rates = data.map((d) => d.predictedRate / 100);
 const gap = rates.length > 1 ? Math.max(...rates) - Math.min(...rates) : 0;

 return (
  <div className="pt-8">
   {/* Header */}
   <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
    <div className="inline-flex items-center bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
     Model Transparency
    </div>
    <h1 className="text-2xl font-black text-fg tracking-tight">⚖️ Fairness Explorer</h1>
    <p className="text-sm text-fg3 mt-1">How does MindBridge perform across different student groups?</p>
   </motion.div>


   {/* Group selector */}
   <div className="flex flex-wrap gap-2 mb-6">
    {avail.map((g) => (
     <button key={g} onClick={() => setGroup(g)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${group === g ? "bg-brand text-white shadow-lg shadow-brand/25" : "bg-bg2 border border-border text-fg3 hover:text-fg hover:border-brand/30"}`}>
      {GROUP_LABELS[g] ?? g}
     </button>
    ))}
   </div>

   <p className="text-xs text-fg3 mb-6">
    {data.length} subgroups · minimum 30 respondents per group · metrics computed on held-out test data
   </p>

   {/* Chart 1 - Demographic Parity */}
   <ChartSection
    title="📊 Demographic Parity"
    caption="How often does the model flag each group as at-risk? Green = actual anxiety rates, Blue = model's prediction rate."
    interpretation={parityInterpretation(data, gap)}
   >
    <div className={`text-xs mb-3 px-3 py-2 rounded-lg inline-block ${gap > 0.15 ? "bg-rose/10 text-rose border border-rose/20" : gap > 0.08 ? "bg-amber/10 text-amber border border-amber/20" : "bg-brand/10 text-brand border border-brand/20"}`}>
     Predicted positive rates span <strong>{(gap * 100).toFixed(0)} percentage points</strong> across groups
    </div>
    <ResponsiveContainer width="100%" height={240}>
     <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#648270" }} />
      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#648270" }} />
      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`]} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="actualPrev"  name="Actual Prevalence"    fill={CHART_COLORS.actual}  radius={[4,4,0,0]} />
      <Bar dataKey="predictedRate" name="Predicted Positive Rate" fill={CHART_COLORS.predicted} radius={[4,4,0,0]} />
     </BarChart>
    </ResponsiveContainer>
   </ChartSection>

   {/* Chart 2 - Equalized Odds */}
   <ChartSection
    title="⚖️ Who gets caught vs. who gets missed"
    caption="Green = % of truly anxious students the model correctly catches. Red = % of non-anxious students the model incorrectly flags."
    interpretation={oddsInterpretation(data)}
   >
    <ResponsiveContainer width="100%" height={240}>
     <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#648270" }} />
      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#648270" }} />
      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`]} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="tpr" name="Correctly caught (True Positive Rate)" fill={CHART_COLORS.tpr} radius={[4,4,0,0]} />
      <Bar dataKey="fpr" name="Incorrectly flagged (False Positive Rate)" fill={CHART_COLORS.fpr} radius={[4,4,0,0]} />
     </BarChart>
    </ResponsiveContainer>
   </ChartSection>

   {/* Chart 3 - Mean Score */}
   <ChartSection
    title="📈 Average Anxiety Score by Group"
    caption="How close is the model's predicted average anxiety score to the real average? Bars close together = accurate for that group."
    interpretation={meanScoreInterpretation(data)}
   >
    <ResponsiveContainer width="100%" height={240}>
     <BarChart data={[...data].sort((a, b) => a.meanTrue - b.meanTrue)} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
      <XAxis type="number" domain={[0, 14]} tick={{ fontSize: 11, fill: "#648270" }} />
      <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#648270" }} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="meanTrue" name="Actual Avg Score"  fill={CHART_COLORS.actual}  radius={[0,4,4,0]} />
      <Bar dataKey="meanPred" name="Predicted Avg Score" fill={CHART_COLORS.predicted} radius={[0,4,4,0]} />
     </BarChart>
    </ResponsiveContainer>
   </ChartSection>

   {/* Raw numbers */}
   <details className="group rounded-xl border border-border bg-bg2 mb-4">
    <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-semibold text-fg2 hover:text-fg transition-colors list-none">
     📋 Raw numbers
     <span className="transition-transform group-open:rotate-180 text-fg3">▼</span>
    </summary>
    <div className="px-4 pb-4 overflow-x-auto">
     <table className="w-full text-xs text-fg2 min-w-[560px]">
      <thead>
       <tr className="border-b border-border text-fg3 uppercase tracking-wide">
        {["Subgroup","N","True Prev.","Pred. Rate","Caught (TPR)","False alarm (FPR)","Avg True Score","Avg Pred. Score"].map((h) => (
         <th key={h} className="text-left py-2 pr-4 font-semibold">{h}</th>
        ))}
       </tr>
      </thead>
      <tbody>
       {data.map((d) => (
        <tr key={d.name} className="border-b border-border-subtle last:border-0 hover:bg-bg3 transition-colors">
         <td className="py-2 pr-4 font-medium text-fg">{d.name}</td>
         <td className="py-2 pr-4">{d.n.toLocaleString()}</td>
         <td className="py-2 pr-4">{d.actualPrev}%</td>
         <td className="py-2 pr-4">{d.predictedRate}%</td>
         <td className="py-2 pr-4">{d.tpr}%</td>
         <td className="py-2 pr-4">{d.fpr}%</td>
         <td className="py-2 pr-4">{d.meanTrue}</td>
         <td className="py-2 pr-4">{d.meanPred}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </details>

   {/* Explainer */}
   <details className="group rounded-xl border border-border bg-bg2 mb-4">
    <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-semibold text-fg2 hover:text-fg transition-colors list-none">
     💡 What do these metrics actually mean?
     <span className="transition-transform group-open:rotate-180 text-fg3">▼</span>
    </summary>
    <div className="px-4 pb-4 text-sm text-fg2 space-y-3">
     <p><strong className="text-fg">Demographic Parity</strong> - asks: is the model flagging students as anxious at the same rate, regardless of their background? A big gap doesn't always mean the model is wrong - some groups genuinely experience higher anxiety rates. But a gap does mean the tool's outputs aren't evenly distributed.</p>
     <p><strong className="text-fg">True Positive Rate (TPR)</strong> - out of all students who really do have significant anxiety, what fraction does the model correctly catch? A low TPR for a group means those students are being missed more often - the higher-harm error.</p>
     <p><strong className="text-fg">False Positive Rate (FPR)</strong> - out of students who don't have significant anxiety, what fraction does the model incorrectly flag? A high FPR means some students are being unnecessarily alarmed.</p>
     <p><strong className="text-fg">Mean Score Gap</strong> - is the model's predicted average close to the real average for each group? A consistent gap means the model is systematically over- or under-estimating anxiety for that group.</p>
     <p className="text-fg3 border-t border-border pt-3">These metrics often pull in different directions - fixing one can worsen another. Which trade-off matters most depends on your values and the stakes involved.</p>
    </div>
   </details>

   {/* Model card */}
   <details className="group rounded-xl border border-border bg-bg2 mb-8">
    <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-semibold text-fg2 hover:text-fg transition-colors list-none">
     📋 Model card
     <span className="transition-transform group-open:rotate-180 text-fg3">▼</span>
    </summary>
    <div className="px-4 pb-4">
     <table className="w-full text-xs text-fg2">
      <tbody>
       {[["Architecture","XGBoost Regressor + Binary Classifier"],["Training data","Healthy Minds Study 2024-2025"],["Training / test split",`${meta.train_rows.toLocaleString()} / ${meta.test_rows.toLocaleString()}`],["Prediction targets","GAD-7 score (0-21) · Moderate+ binary"],["Input features","11 (loneliness, academic impact, purpose, PHQ-9 items)"],["Protected attributes","Not used as model inputs"],["Explainability","SHAP TreeExplainer"],["CI method","±1.28σ residuals → 80% CI"],["Intended use","Academic demonstration only"],["Out-of-scope","Clinical diagnosis · Medical decisions"]].map(([k,v]) => (
        <tr key={k} className="border-b border-border-subtle last:border-0"><td className="py-2 pr-4 font-semibold text-fg">{k}</td><td className="py-2 text-fg2">{v}</td></tr>
       ))}
      </tbody>
     </table>
    </div>
   </details>

   <p className="text-center text-xs text-fg3 mt-2 mb-8">
    MindBridge · Fairness metrics on held-out test data · HMS 2024-2025 · Academic use only
   </p>
  </div>
 );
}

function parityInterpretation(data: ReturnType<typeof prepData>, gap: number): string {
 if (data.length < 2) return "";
 const sorted = [...data].sort((a, b) => b.predictedRate - a.predictedRate);
 const high = sorted[0], low = sorted[sorted.length - 1];
 if (gap > 0.15)
  return `The model flags ${high.name} students as at-risk ${high.predictedRate}% of the time, versus only ${low.predictedRate}% for ${low.name} students - a ${(gap * 100).toFixed(0)}-point gap. This partly reflects real differences in anxiety rates across groups, but it also means the tool's outputs are not evenly distributed.`;
 if (gap > 0.08)
  return `There is a moderate spread: ${high.name} students are flagged most often (${high.predictedRate}%) and ${low.name} students least often (${low.predictedRate}%). Some of this reflects genuine differences in anxiety prevalence.`;
 return `Predicted anxiety rates are fairly consistent across groups (within ${(gap * 100).toFixed(0)} percentage points), suggesting the model isn't systematically over- or under-flagging any particular group.`;
}

function oddsInterpretation(data: ReturnType<typeof prepData>): string {
 if (data.length < 2) return "";
 const byTPR = [...data].sort((a, b) => a.tpr - b.tpr);
 const lowestTPR = byTPR[0], highestTPR = byTPR[byTPR.length - 1];
 const highestFPR = [...data].sort((a, b) => b.fpr - a.fpr)[0];
 return `When a student genuinely has significant anxiety, the model correctly identifies them ${highestTPR.tpr}% of the time for ${highestTPR.name} students - but only ${lowestTPR.tpr}% of the time for ${lowestTPR.name} students. This means ${lowestTPR.name} students who need support are more likely to be missed. Meanwhile, ${highestFPR.name} students have the highest false-alarm rate (${highestFPR.fpr}%), meaning they're more likely to be flagged when they don't actually have high anxiety.`;
}

function meanScoreInterpretation(data: ReturnType<typeof prepData>): string {
 if (data.length < 2) return "";
 const worst = data.reduce((prev, curr) =>
  Math.abs(curr.meanTrue - curr.meanPred) > Math.abs(prev.meanTrue - prev.meanPred) ? curr : prev
 );
 const gap = Math.abs(worst.meanTrue - worst.meanPred);
 const dir = worst.meanPred > worst.meanTrue ? "over-predicts" : "under-predicts";
 if (gap < 0.5) return "The model's predicted average anxiety scores track the actual averages closely across all groups - no group is being systematically over- or under-estimated.";
 return `The biggest gap is for ${worst.name} students, where the model ${dir} by about ${gap.toFixed(1)} points on average (predicts ${worst.meanPred} vs actual ${worst.meanTrue}). This suggests the model is systematically off for this group.`;
}

function ChartSection({ title, caption, interpretation, children }: {
 title: string; caption: string; interpretation?: string; children: React.ReactNode;
}) {
 return (
  <Card className="p-5 mb-4">
   <h3 className="font-bold text-fg text-sm mb-1">{title}</h3>
   <p className="text-xs text-fg3 mb-4">{caption}</p>
   {children}
   {interpretation && (
    <div className="mt-4 bg-bg3 border-l-2 border-brand rounded-r-xl px-4 py-3 text-sm text-fg2 leading-relaxed">
     {interpretation}
    </div>
   )}
  </Card>
 );
}
