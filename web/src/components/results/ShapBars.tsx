"use client";
import { motion } from "framer-motion";
import type { TopFactor } from "@/types/prediction";

interface Props {
  factors: TopFactor[];
}

const INSIGHTS: Record<string, [string, string]> = {
  lone_lackcompanion: ["Feeling more alone than you'd like is weighing on you",        "Your social connections are acting as a helpful buffer"],
  lone_leftout:       ["Feeling excluded is adding to your stress",                     "Not feeling left out is protecting your wellbeing"],
  lone_isolated:      ["Isolation is a real stressor for you right now",               "Feeling connected is keeping your anxiety in check"],
  aca_impa:           ["Academic struggles are adding to your mental load",             "School isn't weighing heavily on your mental health"],
  persist:            ["Uncertainty about your direction is adding to your anxiety",    "Having a clear sense of purpose is genuinely protecting you"],
  yr_sch:             ["Your stage in school plays a small role here",                  "Your year in school isn't a major anxiety driver"],
  phq9_1:             ["Low interest or motivation is a key signal here",               "Staying engaged and interested is helping you"],
  phq9_2:             ["Low mood or hopelessness is pulling your score up",             "Your overall mood is working in your favor right now"],
  phq9_3:             ["Sleep difficulties are significantly affecting your score",      "Good sleep is meaningfully reducing your anxiety"],
  phq9_4:             ["Fatigue is a noticeable contributor to your score",             "Your energy levels are a bright spot in your picture"],
  phq9_6:             ["Harsh self-judgment is adding real weight to your anxiety",     "A healthier self-image is helping protect you"],
};

function getInsight(f: TopFactor): string {
  const [posMsg, negMsg] = INSIGHTS[f.col] ?? [
    `Your ${f.label.toLowerCase()} is adding to your anxiety`,
    `Your ${f.label.toLowerCase()} is helping reduce your anxiety`,
  ];
  return f.shap > 0 ? posMsg : negMsg;
}

export default function ShapBars({ factors }: Props) {
  const maxAbs = Math.max(...factors.slice(0, 6).map((f) => Math.abs(f.shap)), 0.01);

  return (
    <div className="space-y-0">
      {factors.slice(0, 6).map((f, i) => {
        const pct = (Math.abs(f.shap) / maxAbs) * 100;
        const isPos = f.shap > 0;
        return (
          <motion.div
            key={f.col}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-0"
          >
            {/* Label + insight */}
            <div className="w-[42%] min-w-0">
              <div className="text-sm font-medium text-fg truncate">{f.icon} {f.label}</div>
              <div className="text-[10px] text-fg3 leading-snug mt-0.5 line-clamp-2">{getInsight(f)}</div>
            </div>

            {/* Track */}
            <div className="flex-1 h-[5px] rounded-full bg-bg3 overflow-hidden min-w-[40px]">
              <motion.div
                className={`h-full rounded-full ${isPos ? "bg-gradient-to-r from-rose/60 to-rose" : "bg-gradient-to-r from-brand/40 to-brand"}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.07 + 0.1, ease: "easeOut" }}
              />
            </div>

            {/* Value */}
            <div
              className="text-xs font-bold w-12 text-right flex-shrink-0"
              style={{ color: isPos ? "#C85A5A" : "#52906A" }}
            >
              {isPos ? "▲" : "▼"} {Math.abs(f.shap).toFixed(2)}
            </div>
          </motion.div>
        );
      })}

    </div>
  );
}
