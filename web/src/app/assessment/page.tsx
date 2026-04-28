"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import { predict } from "@/lib/api";
import { FEATURE_META, type FeatureKey } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// ── Wizard config ─────────────────────────────────────
const STEPS = [
 { id: 1, icon: "🤝", label: "Social Life", keys: ["lone_lackcompanion","lone_leftout","lone_isolated"] as FeatureKey[] },
 { id: 2, icon: "📖", label: "Academic",   keys: ["aca_impa","persist","yr_sch"] as FeatureKey[] },
 { id: 3, icon: "💭", label: "Feelings",   keys: ["phq9_1","phq9_2","phq9_3","phq9_4","phq9_6"] as FeatureKey[] },
];

// ── Step indicator ────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
 return (
  <div className="flex items-center mb-8">
   {STEPS.map((s, i) => (
    <div key={s.id} className="flex items-center flex-1 last:flex-none">
     <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
       ${current > s.id ? "bg-brand text-white" : current === s.id ? "bg-brand-dark text-white ring-4 ring-brand/25" : "bg-bg3 text-fg3 border border-border"}`}>
       {current > s.id ? "✓" : s.id}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors
       ${current === s.id ? "text-brand" : current > s.id ? "text-brand/70" : "text-fg3"}`}>
       {s.icon} {s.label}
      </span>
     </div>
     {i < STEPS.length - 1 && (
      <div className="flex-1 mx-2 mt-[-14px]">
       <div className="h-0.5 rounded-full bg-border overflow-hidden">
        <motion.div
         className="h-full bg-brand rounded-full"
         initial={{ width: 0 }}
         animate={{ width: current > s.id ? "100%" : "0%" }}
         transition={{ duration: 0.4 }}
        />
       </div>
      </div>
     )}
    </div>
   ))}
  </div>
 );
}

// ── MCQ question card ─────────────────────────────────
function QuestionMCQ({ featureKey }: { featureKey: FeatureKey }) {
 const m = FEATURE_META[featureKey];
 const { answers, setAnswer } = useStore();
 const value = answers[featureKey];
 const options = Object.entries(m.scaleLabels).map(([k, v]) => ({ key: Number(k), label: v }));

 const gridCols = "grid-cols-1";

 return (
  <div className="p-4">
   <div className="flex items-start gap-2 mb-4">
    <span className="text-xl leading-none mt-0.5">{m.icon}</span>
    <div>
     <div className="font-semibold text-sm text-fg leading-tight">{m.label}</div>
     <div className="text-xs text-fg3 mt-0.5 leading-relaxed">{m.description}</div>
    </div>
   </div>

   <div className={`grid ${gridCols} gap-2`}>
    {options.map(({ key, label }) => {
     const selected = value === key;
     return (
      <button
       key={key}
       onClick={() => setAnswer(featureKey, key)}
       className={`relative rounded-xl px-3 py-2.5 text-xs font-semibold text-center transition-all duration-200 border
        ${selected
         ? "bg-brand text-white border-brand shadow-md shadow-brand/25 scale-[1.02]"
         : "bg-bg3 text-fg2 border-border hover:border-brand/50 hover:bg-brand/5 hover:text-fg"
        }`}
      >
       {selected && (
        <motion.span
         layoutId={`check-${featureKey}`}
         className="absolute top-1 right-1.5 text-[10px]"
        >
         ✓
        </motion.span>
       )}
       {label}
      </button>
     );
    })}
   </div>
  </div>
 );
}

// ── Frozen step content (prevents AnimatePresence from re-rendering exiting div) ──
function StepQuestions({ stepData, step }: { stepData: (typeof STEPS)[number]; step: number }) {
 const [frozen] = useState(() => ({ stepData, step }));
 return (
  <div className={`grid gap-4 ${frozen.step === 3 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"} mb-6`}>
   {frozen.stepData.keys.map((key) => (
    <Card key={key} hover>
     <QuestionMCQ featureKey={key} />
    </Card>
   ))}
  </div>
 );
}

// ── Page ─────────────────────────────────────────────
export default function AssessmentPage() {
 const router = useRouter();
 const { step, setStep, answers, setPrediction, setLoading, isLoading } = useStore();
 const [error, setError] = useState<string | null>(null);

 const currentStep = STEPS[step - 1];

 const handleNext = async () => {
  if (step < 3) {
   setStep((step + 1) as 1 | 2 | 3);
  } else {
   setLoading(true);
   setError(null);
   try {
    const result = await predict(answers as Record<string, number>);
    setPrediction(result);
    router.push("/results");
   } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Prediction failed");
   } finally {
    setLoading(false);
   }
  }
 };

 // Inline feedback
 const feedbackMsg = (() => {
  if (step === 1) {
   const avg = (answers.lone_lackcompanion + answers.lone_leftout + answers.lone_isolated) / 3;
   if (avg >= 2.6) return { text: "💬 Loneliness is one of the most common experiences among college students - you're not alone in this.", type: "info" as const };
   if (avg <= 1.3) return { text: "✅ Strong social connection is one of the best protective factors for mental health.", type: "success" as const };
  }
  if (step === 2) {
   if (answers.aca_impa >= 4) return { text: "📚 When mental health affects academics, both academic and counseling support centers can help.", type: "info" as const };
   if (answers.persist >= 4) return { text: "✅ A strong sense of purpose is a genuine protective factor against anxiety and burnout.", type: "success" as const };
  }
  return null;
 })();

 return (
  <div className="max-w-3xl mx-auto pt-8">
   {/* Header */}
   <div className="mb-8">
    <div className="inline-flex items-center bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
     Wellbeing Check-In
    </div>
    <h1 className="text-2xl font-black text-fg tracking-tight">
     {currentStep.icon}{" "}
     {currentStep.id === 1 ? "How connected do you feel?" : currentStep.id === 2 ? "How's academic life going?" : "How have you been feeling?"}
    </h1>
    <p className="text-sm text-fg3 mt-1">
     {currentStep.id === 1 && "Three items from the UCLA Loneliness Scale - a validated social wellbeing measure."}
     {currentStep.id === 2 && "Your studies, sense of direction, and where you are in your academic journey."}
     {currentStep.id === 3 && "In the past 2 weeks. Items from the PHQ-9, a validated research instrument."}
    </p>
   </div>

   <StepIndicator current={step} />

   {/* Question cards - enter-only animation avoids AnimatePresence timing bugs */}
   <motion.div
    key={step}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
   >
    <StepQuestions stepData={currentStep} step={step} />
   </motion.div>

   {/* Inline feedback */}
   {feedbackMsg && (
    <motion.div
     initial={{ opacity: 0, y: -8 }}
     animate={{ opacity: 1, y: 0 }}
     className={`rounded-xl px-4 py-3 text-sm mb-6 ${feedbackMsg.type === "success" ? "bg-brand/10 text-brand border border-brand/25" : "bg-sky/10 text-sky border border-sky/25"}`}
    >
     {feedbackMsg.text}
    </motion.div>
   )}

   {/* Privacy note (step 3) */}
   {step === 3 && (
    <div className="bg-bg3 rounded-xl px-4 py-3 text-xs text-fg3 mb-6 border border-border">
     🔒 Your answers stay in your browser session only - nothing is stored or transmitted.
    </div>
   )}

   {/* Error */}
   {error && (
    <div className="bg-rose/10 border border-rose/30 rounded-xl px-4 py-3 text-sm text-rose mb-4">
     ⚠️ {error}
    </div>
   )}

   {/* Navigation */}
   <div className="flex items-center justify-between">
    <div>
     {step > 1 && (
      <Button variant="secondary" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
       ← Back
      </Button>
     )}
    </div>
    <Button variant="primary" size="lg" loading={isLoading} onClick={handleNext}>
     {step < 3 ? "Next →" : isLoading ? "Calculating…" : "🔍 Get My Insight"}
    </Button>
   </div>
  </div>
 );
}
