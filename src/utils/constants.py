"""
MindBridge - Student Wellness Insight Tool
Constants: feature metadata, risk tiers, resources, fairness groups
"""

# ---------------------------------------------------------------------------
# Feature configuration - 11 predictor columns used in the ML model
# ---------------------------------------------------------------------------

FEATURE_COLS = [
  "lone_lackcompanion",
  "lone_leftout",
  "lone_isolated",
  "aca_impa",
  "persist",
  "yr_sch",
  "phq9_1",
  "phq9_2",
  "phq9_3",
  "phq9_4",
  "phq9_6",
]

# Human-readable metadata for each feature
# Keys: label, description, min, max, step, default, icon, scale_labels, higher_is_better
FEATURE_META = {
  "lone_lackcompanion": {
    "label": "Lack of Companionship",
    "description": "How often do you feel you lack companionship? (UCLA Loneliness Scale)",
    "icon": "🤝",
    "min": 1,
    "max": 3,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Hardly ever", 2: "Sometimes", 3: "Often"},
    "higher_is_better": False,
  },
  "lone_leftout": {
    "label": "Feeling Left Out",
    "description": "How often do you feel left out? (UCLA Loneliness Scale)",
    "icon": "💔",
    "min": 1,
    "max": 3,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Hardly ever", 2: "Sometimes", 3: "Often"},
    "higher_is_better": False,
  },
  "lone_isolated": {
    "label": "Feeling Isolated",
    "description": "How often do you feel isolated from others? (UCLA Loneliness Scale)",
    "icon": "🏝️",
    "min": 1,
    "max": 3,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Hardly ever", 2: "Sometimes", 3: "Often"},
    "higher_is_better": False,
  },
  "aca_impa": {
    "label": "Academic Impact",
    "description": "In the past 4 weeks, how much have emotional or mental health issues affected your academic performance?",
    "icon": "📖",
    "min": 1,
    "max": 6,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Not at all", 2: "A little", 3: "Moderately", 4: "Quite a bit", 5: "Very much", 6: "Extremely"},
    "higher_is_better": False,
  },
  "persist": {
    "label": "Sense of Purpose & Direction",
    "description": "How strongly do you agree: 'I feel clear about what I want to do with my life and career.' (1=Strongly disagree, 5=Strongly agree)",
    "icon": "🎯",
    "min": 1,
    "max": 5,
    "step": 1,
    "default": 3,
    "unit": "",
    "scale_labels": {1: "Strongly disagree", 2: "Disagree", 3: "Neutral", 4: "Agree", 5: "Strongly agree"},
    "higher_is_better": True,
  },
  "yr_sch": {
    "label": "Year in School",
    "description": "What year are you in school?",
    "icon": "🎓",
    "min": 1,
    "max": 6,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "1st year", 2: "2nd year", 3: "3rd year", 4: "4th year", 5: "5th year", 6: "6th+ year"},
    "higher_is_better": None,
  },
  "phq9_1": {
    "label": "Energy & Motivation",
    "description": "In the past 2 weeks, how often have you had little interest or pleasure in doing things?",
    "icon": "⚡",
    "min": 1,
    "max": 4,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day"},
    "higher_is_better": False,
  },
  "phq9_2": {
    "label": "Mood & Outlook",
    "description": "In the past 2 weeks, how often have you felt down, depressed, or hopeless?",
    "icon": "🌤️",
    "min": 1,
    "max": 4,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day"},
    "higher_is_better": False,
  },
  "phq9_3": {
    "label": "Sleep Quality",
    "description": "In the past 2 weeks, how often have you had trouble falling or staying asleep, or slept too much?",
    "icon": "🌙",
    "min": 1,
    "max": 4,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day"},
    "higher_is_better": False,
  },
  "phq9_4": {
    "label": "Physical Energy",
    "description": "In the past 2 weeks, how often have you felt tired or had little energy?",
    "icon": "🔋",
    "min": 1,
    "max": 4,
    "step": 1,
    "default": 2,
    "unit": "",
    "scale_labels": {1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day"},
    "higher_is_better": False,
  },
  "phq9_6": {
    "label": "Self-Confidence",
    "description": "In the past 2 weeks, how often have you felt bad about yourself - or felt like a failure or that you've let yourself or your family down?",
    "icon": "💪",
    "min": 1,
    "max": 4,
    "step": 1,
    "default": 1,
    "unit": "",
    "scale_labels": {1: "Not at all", 2: "Several days", 3: "More than half the days", 4: "Nearly every day"},
    "higher_is_better": False,
  },
}

# ---------------------------------------------------------------------------
# Risk Tiers - mapping of GAD-7 score ranges
# ---------------------------------------------------------------------------

RISK_TIERS = {
  "Minimal": {
    "score_range": (0, 4),
    "color": "#4CAF7D",
    "bg_color": "#E8F5EE",
    "border_color": "#4CAF7D",
    "description": "Your responses suggest minimal anxiety symptoms. This is great news - keep nurturing the habits that support your wellbeing.",
    "icon": "✅",
    "gauge_color": "#4CAF7D",
  },
  "Subthreshold": {
    "score_range": (5, 9),
    "color": "#F4C842",
    "bg_color": "#FEF9E7",
    "border_color": "#F4C842",
    "description": "Your responses suggest mild anxiety symptoms. Many students experience this - small changes in sleep, stress management, or social connection can make a meaningful difference.",
    "icon": "💛",
    "gauge_color": "#F4C842",
  },
  "Moderate": {
    "score_range": (10, 14),
    "color": "#E8834A",
    "bg_color": "#FEF3EB",
    "border_color": "#E8834A",
    "description": "Your responses suggest moderate anxiety symptoms. Consider reaching out to your campus counseling center - support is available and effective.",
    "icon": "🟠",
    "gauge_color": "#E8834A",
  },
  "Severe": {
    "score_range": (15, 21),
    "color": "#D96B6B",
    "bg_color": "#FDEEEE",
    "border_color": "#D96B6B",
    "description": "Your responses suggest severe anxiety symptoms. Please reach out to a mental health professional. If you are in crisis, contact the 988 Lifeline immediately.",
    "icon": "🔴",
    "gauge_color": "#D96B6B",
  },
}

def score_to_tier(score: float) -> str:
  """Convert a GAD-7 score (0-21) to a risk tier name."""
  if score < 5:
    return "Minimal"
  elif score < 10:
    return "Subthreshold"
  elif score < 15:
    return "Moderate"
  else:
    return "Severe"


# ---------------------------------------------------------------------------
# Personalized Recommendations - keyed by feature + direction
# ---------------------------------------------------------------------------

RECOMMENDATIONS = {
  "sleep_poor": {
    "title": "Improve Sleep Quality",
    "icon": "🌙",
    "tips": [
      "Aim for 7-9 hours per night - sleep disturbance is one of the strongest anxiety predictors",
      "Set a consistent bedtime and wake time, even on weekends",
      "Avoid screens 30-60 minutes before bed (blue light suppresses melatonin)",
      "Try a 4-7-8 breathing exercise to wind down: inhale 4s, hold 7s, exhale 8s",
      "If sleep problems persist, consider speaking with a health professional",
    ],
    "color": "#7BA7C7",
  },
  "loneliness_high": {
    "title": "Strengthen Social Connection",
    "icon": "🤝",
    "tips": [
      "Even small social interactions matter - say hi to a classmate, join a club meeting",
      "Loneliness is extremely common among college students - you are not alone in feeling this",
      "Try to schedule one social activity per week, even if brief",
      "Consider peer support groups or student organizations aligned with your interests",
      "Reach out to a friend or family member you haven't talked to recently",
    ],
    "color": "#9B7BC7",
  },
  "stress_high": {
    "title": "Manage Stress Actively",
    "icon": "🧘",
    "tips": [
      "Try 5-10 minutes of mindfulness meditation daily - apps like Headspace or Calm can help",
      "Physical activity is one of the most effective stress reducers - even a 20-min walk helps",
      "Break large tasks into smaller, manageable steps using a to-do list",
      "Practice 'worry time': set aside 15 mins/day to write down worries, then close the notebook",
      "Talk to someone you trust - sharing burdens reduces their weight",
    ],
    "color": "#E8834A",
  },
  "academic_high": {
    "title": "Address Academic Stress",
    "icon": "📖",
    "tips": [
      "Visit your campus student success or academic support center",
      "Talk to your professors - they often have more flexibility than students expect",
      "Explore academic accommodations if mental health is affecting your performance",
      "Break studying into 25-minute focused sessions (Pomodoro technique)",
      "Prioritize tasks by impact, not urgency - not everything needs to be done right now",
    ],
    "color": "#6B9E78",
  },
  "time_manage_low": {
    "title": "Build Time Management Skills",
    "icon": "⏰",
    "tips": [
      "Use a weekly planner to block out study time, rest, and social time",
      "The 2-minute rule: if a task takes under 2 minutes, do it now",
      "Batch similar tasks together to reduce context-switching overhead",
      "Schedule buffer time between commitments - perfectionism feeds anxiety",
      "Say no to non-essential commitments when your plate is full",
    ],
    "color": "#7BA7C7",
  },
  "mood_low": {
    "title": "Support Your Mood",
    "icon": "🌤️",
    "tips": [
      "Physical activity is one of the most evidence-backed mood boosters - even a 20-min walk helps",
      "Spend time in natural light, especially in the morning - it regulates your circadian rhythm",
      "Try gratitude journaling: write 3 specific things you're grateful for each day",
      "Reach out to someone you trust when you're feeling down - connection matters",
      "If low mood persists for 2+ weeks, please talk to a counselor or doctor",
    ],
    "color": "#9B85C0",
  },
  "purpose_low": {
    "title": "Reconnect with Purpose",
    "icon": "🎯",
    "tips": [
      "Uncertainty about the future is normal - try breaking big goals into small, weekly actions",
      "Talk to a career advisor or mentor - clarity often comes from conversation",
      "Explore what activities make you lose track of time - these point toward what energizes you",
      "Volunteering or community involvement can provide a strong sense of meaning and direction",
      "It's okay not to have everything figured out - many successful people found their path late",
    ],
    "color": "#6B9E78",
  },
}


# ---------------------------------------------------------------------------
# Crisis + Campus Resources
# ---------------------------------------------------------------------------

CRISIS_RESOURCES = [
  {
    "name": "988 Suicide & Crisis Lifeline",
    "contact": "Call or text 988",
    "description": "Free, confidential support 24/7",
    "url": "https://988lifeline.org",
    "icon": "📞",
  },
  {
    "name": "Crisis Text Line",
    "contact": "Text HOME to 741741",
    "description": "Free crisis counseling via text, 24/7",
    "url": "https://www.crisistextline.org",
    "icon": "💬",
  },
  {
    "name": "NAMI Helpline",
    "contact": "1-800-950-NAMI (6264)",
    "description": "Mental health information and referrals",
    "url": "https://nami.org",
    "icon": "🏥",
  },
]

GENERAL_RESOURCES = [
  {
    "name": "Campus Counseling Center",
    "description": "Free short-term counseling for enrolled students - check your school's website",
    "icon": "🏫",
  },
  {
    "name": "Student Health Services",
    "description": "Physical and mental health services on campus",
    "icon": "🩺",
  },
  {
    "name": "ULifeline",
    "description": "Online mental health resource for college students",
    "url": "https://www.ulifeline.org",
    "icon": "💻",
  },
  {
    "name": "Headspace for Students",
    "description": "Free or discounted meditation and mindfulness app for college students",
    "url": "https://www.headspace.com/students",
    "icon": "🧘",
  },
]


# ---------------------------------------------------------------------------
# Fairness demographics configuration
# ---------------------------------------------------------------------------

FAIRNESS_GROUPS = {
  "Gender": {
    "columns": ["gender_male", "gender_female", "gender_nonbin", "gender_queer", "gender_trans"],
    "labels": {
      "gender_male": "Men",
      "gender_female": "Women",
      "gender_nonbin": "Non-binary",
      "gender_queer": "Genderqueer",
      "gender_trans": "Transgender",
    },
  },
  "Race / Ethnicity": {
    "columns": ["race_white", "race_black", "race_asian", "race_his", "race_ainaan", "race_mides", "race_other"],
    "labels": {
      "race_white": "White",
      "race_black": "Black / African American",
      "race_asian": "Asian / Asian American",
      "race_his": "Hispanic / Latine",
      "race_ainaan": "Am. Indian / Alaska Native",
      "race_mides": "Middle Eastern / N. African",
      "race_other": "Other / Multiracial",
    },
  },
  "International Status": {
    "columns": ["international"],
    "labels": {
      "international_0": "Domestic Student",
      "international_1": "International Student",
    },
    "is_binary": True,
    "col": "international",
  },
  "Sexual Orientation": {
    "columns": ["sexual_h", "sexual_l", "sexual_g", "sexual_bi", "sexual_queer", "sexual_asexual"],
    "labels": {
      "sexual_h": "Heterosexual",
      "sexual_l": "Lesbian",
      "sexual_g": "Gay",
      "sexual_bi": "Bisexual",
      "sexual_queer": "Queer",
      "sexual_asexual": "Asexual",
    },
  },
}

# ---------------------------------------------------------------------------
# App metadata
# ---------------------------------------------------------------------------

APP_NAME = "MindBridge"
APP_TAGLINE = "Understand your wellbeing - with clarity, compassion, and context"
APP_VERSION = "1.0.0"

DISCLAIMER = """
**⚠️ Important Disclaimer**

MindBridge is an **academic demonstration project** built for a Human-AI Interaction course.
It is **NOT** a clinical tool, medical device, or mental health service.

- This tool does **not** diagnose anxiety disorders or any other condition
- Results are based on a population-level model and may not reflect your individual situation
- **Do not** make healthcare decisions based on this tool alone
- If you are experiencing mental health difficulties, please speak with a qualified professional

**In crisis?** Call or text **988** (Suicide & Crisis Lifeline) · Text HOME to **741741** (Crisis Text Line)
"""
