"""
MindBridge — LLM Chat Utilities
OpenAI API wrapper with mental health safety guardrails.
"""

import os
from typing import Generator

import openai

MODEL_ID = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
MAX_TOKENS = 512
TEMPERATURE = 0.7


def build_system_prompt(prediction: dict) -> str:
    """
    Build a context-rich, safety-first system prompt grounded in the user's results.
    """
    score = prediction.get("gad7_score", "N/A")
    tier  = prediction.get("risk_tier", "Unknown")
    prob  = prediction.get("risk_prob", 0)

    top_factors = prediction.get("top_factors", [])
    top_3 = [f"{f['icon']} {f['label']}" for f in top_factors[:3]] if top_factors else []
    top_factors_str = ", ".join(top_3) if top_3 else "not available"

    sleep = prediction.get("feature_values", {}).get("sleep_wknight", "?")

    return f"""You are MindBridge — a compassionate, evidence-informed wellness guide for university students.

This student just completed a wellbeing check-in with the following results (from a validated screening tool, the GAD-7):
- Estimated anxiety score: {score}/21 ({tier} range)
- Probability of moderate anxiety: {prob:.0%}
- Key contributing factors: {top_factors_str}
- Self-reported weeknight sleep: {sleep} hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL SAFETY RULES — follow strictly:

1. You are NOT a therapist, counselor, psychiatrist, or any medical professional.
2. NEVER diagnose, clinically assess, or prescribe treatment for any condition.
3. CRISIS PROTOCOL — If the student expresses ANY of the following:
   • Suicidal thoughts or self-harm urges
   • Feeling like others would be better off without them
   • Plans to hurt themselves or someone else
   • A current mental health emergency
   → Immediately and warmly lead with: "Please reach out to the 988 Suicide & Crisis Lifeline
     right now by calling or texting 988. They have trained counselors available 24/7."
   → Also mention: Campus counseling center, Crisis Text Line (text HOME to 741741)
   → BEFORE giving any other response.

4. This is an ACADEMIC DEMONSTRATION PROJECT for a Human-AI Interaction course.
   If the student seems to be treating your advice as clinical guidance, gently clarify.

5. Keep all suggestions evidence-based: sleep hygiene, exercise, mindfulness, social connection,
   stress management, help-seeking. Frame as "research suggests..." not as prescriptions.

6. Be warm, empathetic, non-judgmental, culturally sensitive, and concise (3–5 sentences max).
   Match the student's emotional tone — don't be relentlessly positive if they're distressed.

7. End EVERY response with exactly this line:
   "🤖 *I'm an AI wellness guide, not a mental health professional. For real concerns, please speak with a counselor.*"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Conversation style:
- Validate feelings first ("That sounds really hard...")
- Ask one follow-up question if helpful
- Suggest 1-2 concrete, actionable evidence-based strategies
- Keep responses under 150 words"""


def get_client() -> openai.OpenAI | None:
    """Return OpenAI client or None if API key missing."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    return openai.OpenAI(api_key=api_key)


def stream_response(
    messages: list[dict],
    prediction: dict,
) -> Generator[str, None, None]:
    """
    Stream a response from OpenAI given the conversation history and user's prediction context.

    Parameters
    ----------
    messages    : list of {"role": "user"|"assistant", "content": str}
    prediction  : dict from predict() — used to build system prompt

    Yields
    ------
    str chunks of the response
    """
    client = get_client()
    if client is None:
        yield "⚠️ **API key not configured.** Please set the `OPENAI_API_KEY` environment variable to use the AI Wellness Guide.\n\n*This is an academic demonstration — in a production system, the API key would be securely managed.*"
        return

    system_prompt = build_system_prompt(prediction)

    try:
        stream = client.chat.completions.create(
            model=MODEL_ID,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            stream=True,
            messages=[{"role": "system", "content": system_prompt}] + messages,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except openai.AuthenticationError:
        yield "⚠️ **Invalid API key.** Please check your `OPENAI_API_KEY` environment variable."
    except openai.RateLimitError:
        yield "⚠️ **Rate limit reached.** Please wait a moment and try again."
    except Exception as e:
        yield f"⚠️ **Connection error:** {str(e)}\n\nIf you need support right now, please contact your campus counseling center or call/text 988."


def get_welcome_message(prediction: dict) -> str:
    """Generate a personalized opening message based on the user's assessment results."""
    tier = prediction.get("risk_tier", "Unknown")
    score = prediction.get("gad7_score", 0)

    top_factors = prediction.get("top_factors", [])
    if top_factors:
        top_factor_label = top_factors[0]["label"]
    else:
        top_factor_label = "your wellbeing"

    tier_messages = {
        "Minimal": f"Your score of {score:.0f}/21 suggests you're doing well overall. That's genuinely good to hear! I'm here if you'd like to explore any aspect of your wellbeing or talk through strategies to maintain what's working.",
        "Subthreshold": f"Your score of {score:.0f}/21 shows some mild stress or anxiety symptoms — which is very common among students, especially during busy periods. Your top contributing factor appears to be **{top_factor_label}**. Want to explore some strategies around that?",
        "Moderate": f"Your score of {score:.0f}/21 suggests you may be experiencing moderate anxiety symptoms. I want you to know that support is available and effective — many students benefit from talking with a counselor. In the meantime, I'm here to explore what might help. Your **{top_factor_label}** stands out as a key factor — would you like to talk about that?",
        "Severe": f"Your score of {score:.0f}/21 suggests significant anxiety symptoms. I'd gently encourage you to reach out to your campus counseling center or call/text **988** if you're in distress. I'm here to support you in any way I can. What's weighing on you most right now?",
    }

    base = tier_messages.get(tier, f"Hi! Your wellbeing score is {score:.0f}/21. I'm here to chat about what that means and how you're feeling. What's on your mind?")
    footer = "\n\n🤖 *I'm an AI wellness guide, not a mental health professional. For real concerns, please speak with a counselor.*"
    return base + footer
