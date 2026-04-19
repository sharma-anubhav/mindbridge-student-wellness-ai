export type FeatureKey =
  | "lone_lackcompanion" | "lone_leftout" | "lone_isolated"
  | "aca_impa" | "persist" | "yr_sch"
  | "phq9_1" | "phq9_2" | "phq9_3" | "phq9_4" | "phq9_6";

export interface FeatureMeta {
  label: string;
  description: string;
  icon: string;
  min: number;
  max: number;
  step: number;
  default: number;
  scaleLabels: Record<number, string>;
  higherIsBetter: boolean | null;
}

export const FEATURE_COLS: FeatureKey[] = [
  "lone_lackcompanion", "lone_leftout", "lone_isolated",
  "aca_impa", "persist", "yr_sch",
  "phq9_1", "phq9_2", "phq9_3", "phq9_4", "phq9_6",
];

export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  lone_lackcompanion: {
    label: "Lack of Companionship",
    description: "How often do you feel you lack companionship? (UCLA Loneliness Scale)",
    icon: "🤝", min: 1, max: 3, step: 1, default: 2,
    scaleLabels: { 1: "Hardly ever", 2: "Sometimes", 3: "Often" },
    higherIsBetter: false,
  },
  lone_leftout: {
    label: "Feeling Left Out",
    description: "How often do you feel left out?",
    icon: "💔", min: 1, max: 3, step: 1, default: 2,
    scaleLabels: { 1: "Hardly ever", 2: "Sometimes", 3: "Often" },
    higherIsBetter: false,
  },
  lone_isolated: {
    label: "Feeling Isolated",
    description: "How often do you feel isolated from others?",
    icon: "🏝️", min: 1, max: 3, step: 1, default: 2,
    scaleLabels: { 1: "Hardly ever", 2: "Sometimes", 3: "Often" },
    higherIsBetter: false,
  },
  aca_impa: {
    label: "Academic Impact",
    description: "How much have emotional or mental health issues affected your academic performance?",
    icon: "📖", min: 1, max: 6, step: 1, default: 2,
    scaleLabels: { 1: "Not at all", 2: "A little", 3: "Moderately", 4: "Quite a bit", 5: "Very much", 6: "Extremely" },
    higherIsBetter: false,
  },
  persist: {
    label: "Sense of Purpose",
    description: "I feel clear about what I want to do with my life and career. (1=Strongly disagree, 5=Strongly agree)",
    icon: "🎯", min: 1, max: 5, step: 1, default: 3,
    scaleLabels: { 1: "Strongly disagree", 2: "Disagree", 3: "Neutral", 4: "Agree", 5: "Strongly agree" },
    higherIsBetter: true,
  },
  yr_sch: {
    label: "Year in School",
    description: "What year are you in school?",
    icon: "🎓", min: 1, max: 6, step: 1, default: 2,
    scaleLabels: { 1: "1st year", 2: "2nd year", 3: "3rd year", 4: "4th year", 5: "5th year", 6: "6th+ year" },
    higherIsBetter: null,
  },
  phq9_1: {
    label: "Energy & Motivation",
    description: "In the past 2 weeks, how often have you had little interest or pleasure in doing things?",
    icon: "⚡", min: 1, max: 4, step: 1, default: 2,
    scaleLabels: { 1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day" },
    higherIsBetter: false,
  },
  phq9_2: {
    label: "Mood & Outlook",
    description: "In the past 2 weeks, how often have you felt down, depressed, or hopeless?",
    icon: "🌤️", min: 1, max: 4, step: 1, default: 2,
    scaleLabels: { 1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day" },
    higherIsBetter: false,
  },
  phq9_3: {
    label: "Sleep Quality",
    description: "In the past 2 weeks, how often have you had trouble sleeping or slept too much?",
    icon: "🌙", min: 1, max: 4, step: 1, default: 2,
    scaleLabels: { 1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day" },
    higherIsBetter: false,
  },
  phq9_4: {
    label: "Physical Energy",
    description: "In the past 2 weeks, how often have you felt tired or had little energy?",
    icon: "🔋", min: 1, max: 4, step: 1, default: 2,
    scaleLabels: { 1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day" },
    higherIsBetter: false,
  },
  phq9_6: {
    label: "Self-Confidence",
    description: "In the past 2 weeks, how often have you felt bad about yourself or like a failure?",
    icon: "💪", min: 1, max: 4, step: 1, default: 1,
    scaleLabels: { 1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day" },
    higherIsBetter: false,
  },
};

export const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988",      description: "Free, confidential support 24/7",          icon: "📞", url: "https://988lifeline.org" },
  { name: "Crisis Text Line",              contact: "Text HOME to 741741",   description: "Free crisis counseling via text, 24/7",    icon: "💬", url: "https://www.crisistextline.org" },
  { name: "NAMI Helpline",                 contact: "1-800-950-NAMI (6264)", description: "Mental health information and referrals",   icon: "🏥", url: "https://nami.org" },
];

export const GENERAL_RESOURCES = [
  { name: "Campus Counseling Center", description: "Free short-term counseling for enrolled students",     icon: "🏫", url: null },
  { name: "Student Health Services",  description: "Physical and mental health services on campus",        icon: "🩺", url: null },
  { name: "ULifeline",                description: "Online mental health resource for college students",   icon: "💻", url: "https://www.ulifeline.org" },
  { name: "Headspace for Students",   description: "Free or discounted meditation app for college students", icon: "🧘", url: "https://www.headspace.com/students" },
];

export const COL_DISPLAY_LABELS: Record<string, string> = {
  gender_male: "Men", gender_female: "Women", gender_nonbin: "Non-binary",
  gender_queer: "Genderqueer", gender_trans: "Transgender",
  race_white: "White", race_black: "Black / African American",
  race_asian: "Asian / Asian American", race_his: "Hispanic / Latine",
  race_ainaan: "Am. Indian / Alaska Native", race_mides: "Middle Eastern / N. African",
  race_other: "Other / Multiracial",
  international_0: "Domestic", international_1: "International",
  sexual_h: "Heterosexual", sexual_l: "Lesbian", sexual_g: "Gay",
  sexual_bi: "Bisexual", sexual_queer: "Queer", sexual_asexual: "Asexual",
};
