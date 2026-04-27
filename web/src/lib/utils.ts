import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export type RiskTier = "Minimal" | "Subthreshold" | "Moderate" | "Severe";

export function scoreToTier(score: number): RiskTier {
 if (score < 5) return "Minimal";
 if (score < 10) return "Subthreshold";
 if (score < 15) return "Moderate";
 return "Severe";
}

export const TIER_STYLES: Record<RiskTier, { color: string; bg: string; border: string; label: string }> = {
 Minimal:   { color: "#4CAF7D", bg: "rgba(76,175,125,0.12)", border: "#4CAF7D", label: "✅ Minimal" },
 Subthreshold: { color: "#F4C842", bg: "rgba(244,200,66,0.12)", border: "#F4C842", label: "💛 Subthreshold" },
 Moderate:   { color: "#E8834A", bg: "rgba(232,131,74,0.12)", border: "#E8834A", label: "🟠 Moderate" },
 Severe:    { color: "#D96B6B", bg: "rgba(217,107,107,0.12)", border: "#D96B6B", label: "🔴 Severe" },
};

export const TIER_DESC: Record<RiskTier, string> = {
 Minimal:
  "Your responses suggest minimal anxiety symptoms. This is great news - keep nurturing the habits that support your wellbeing.",
 Subthreshold:
  "Your responses suggest mild anxiety symptoms. Many students experience this - small changes in sleep, stress management, or social connection can make a meaningful difference.",
 Moderate:
  "Your responses suggest moderate anxiety symptoms. Consider reaching out to your campus counseling center - support is available and effective.",
 Severe:
  "Your responses suggest severe anxiety symptoms. Please reach out to a mental health professional. If you are in crisis, contact the 988 Lifeline immediately.",
};

/** Map recommendation key → content */
export const RECOMMENDATIONS: Record<string, { title: string; icon: string; tips: string[]; color: string }> = {
 sleep_poor: {
  title: "Improve Sleep Quality", icon: "🌙",
  tips: [
   "Aim for 7-9 hours per night - sleep disturbance is one of the strongest anxiety predictors",
   "Set a consistent bedtime and wake time, even on weekends",
   "Avoid screens 30-60 min before bed (blue light suppresses melatonin)",
   "Try 4-7-8 breathing to wind down: inhale 4s, hold 7s, exhale 8s",
  ],
  color: "#7BA7C7",
 },
 loneliness_high: {
  title: "Strengthen Social Connection", icon: "🤝",
  tips: [
   "Even small interactions matter - say hi to a classmate, join a club meeting",
   "Loneliness is extremely common among college students - you are not alone",
   "Try to schedule one social activity per week, even if brief",
   "Consider peer support groups aligned with your interests",
  ],
  color: "#9B7BC7",
 },
 stress_high: {
  title: "Manage Stress Actively", icon: "🧘",
  tips: [
   "5-10 minutes of mindfulness meditation daily can reduce cortisol measurably",
   "Physical activity is one of the most effective stress reducers - even a 20-min walk",
   "Break large tasks into smaller steps using a to-do list",
   "Practice 'worry time': 15 mins/day to journal worries, then close the notebook",
  ],
  color: "#E8834A",
 },
 academic_high: {
  title: "Address Academic Stress", icon: "📖",
  tips: [
   "Visit your campus student success or academic support center",
   "Talk to your professors - they often have more flexibility than students expect",
   "Explore academic accommodations if mental health affects your performance",
   "Break studying into 25-minute focused sessions (Pomodoro technique)",
  ],
  color: "#52906A",
 },
 mood_low: {
  title: "Support Your Mood", icon: "🌤️",
  tips: [
   "Physical activity is one of the most evidence-backed mood boosters",
   "Spend time in natural light, especially in the morning",
   "Try gratitude journaling: 3 specific things you're grateful for each day",
   "Reach out to someone you trust when you're feeling down",
  ],
  color: "#9B85C0",
 },
 purpose_low: {
  title: "Reconnect with Purpose", icon: "🎯",
  tips: [
   "Uncertainty about the future is normal - break big goals into small weekly actions",
   "Talk to a career advisor or mentor - clarity often comes from conversation",
   "Explore what activities make you lose track of time",
   "Volunteering or community involvement provides a strong sense of meaning",
  ],
  color: "#52906A",
 },
};

export function getRecommendationKeys(
 topFactors: Array<{ col: string; shap: number; value: number }>,
 _featureValues: Record<string, number>
): string[] {
 const MAP: Array<[string[], string, (v: number) => boolean]> = [
  [["lone_lackcompanion", "lone_leftout", "lone_isolated"], "loneliness_high", (v) => v >= 2],
  [["aca_impa"],                      "academic_high",  (v) => v >= 3],
  [["phq9_3"],                       "sleep_poor",   (v) => v >= 2],
  [["phq9_1", "phq9_4"],                  "stress_high",   (v) => v >= 2],
  [["phq9_2", "phq9_6"],                  "mood_low",    (v) => v >= 2],
  [["persist"],                      "purpose_low",   (v) => v <= 2],
 ];
 const recs: string[] = [];
 const seen = new Set<string>();
 for (const f of topFactors.slice(0, 5)) {
  if (f.shap <= 0) continue;
  for (const [cols, key, check] of MAP) {
   if (cols.includes(f.col) && check(f.value) && !seen.has(key)) {
    seen.add(key); recs.push(key);
   }
  }
 }
 return recs.slice(0, 3).length > 0 ? recs.slice(0, 3) : ["stress_high"];
}
