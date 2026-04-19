# HAII Principles in MindBridge

This document maps every Human-AI Interaction principle applied in MindBridge to the specific design decision that implements it.

---

## 1. Microsoft Guidelines for Human-AI Interaction (Amershi et al., CHI 2019)

### Guidelines 1–2 — Make clear what the system can and cannot do, and how well

Every page of the app carries a persistent disclaimer strip at the bottom of the screen reading *"In crisis? Call or text 988 · Academic demo, not clinical advice."* The assessment page header, results page, and chat page all repeat non-diagnosis language explicitly. The results page shows an 80% confidence interval on every prediction rather than a single point estimate, directly communicating that the model's output has real uncertainty.

### Guideline 9 — Support efficient correction

The 3-step check-in wizard has a Back button at every step so users can revise answers before submitting. On the results page, users are directed back to the Check-In to recalculate with different inputs. This makes the model feel interactive rather than a black box that delivers a verdict.

### Guidelines 10–11 — Scope services when in doubt; make clear why

The AI Wellness Guide's system prompt explicitly instructs the model to refuse clinical assessment. Every AI response ends with a mandatory disclosure line: *"I'm an AI wellness guide, not a mental health professional."* On the results page, SHAP factor bars explain *why* the model generated the predicted score — not just what the score is. This implements guideline 11 (make clear why) at the model layer.

---

## 2. Designing for AI Failures (Lecture 5)

### Error cost asymmetry

The Results page Deep Dive tab includes an "Understanding prediction errors" section that explicitly names and explains false positives and false negatives in plain language. It frames the asymmetry: a false negative (missed anxiety) is more harmful than a false positive (unnecessary nudge toward support). The model is tuned to favor sensitivity for this reason.

### Graceful failure

If the OpenAI API key is missing or the backend is unreachable, the chat interface shows a clear error message with a fallback: links to campus counseling and the 988 crisis line. The system never fails silently.

### Partial correctness

The word "estimated" is used throughout the results page. The tier label (Minimal / Subthreshold / Moderate / Severe) is paired with explicit language about what each tier means in a *screening* context, not a diagnostic one.

---

## 3. Stakeholder-Centered Design / VSAD (Lecture 7)

Three stakeholder groups shaped the design:

**Students (primary).** The check-in is framed as a 2-minute "Check-In" rather than a "Screening" or "Assessment" to reduce clinical weight. The app is anonymous and session-only — nothing leaves the browser. The AI guide opens with a message grounded in the student's specific score and top contributing factor.

**Campus counseling services (secondary).** MindBridge positions itself as a pathway *to* counseling, not a replacement. Crisis resources (988, campus counseling, Crisis Text Line) appear in three places: the fixed footer strip, the AI guide's crisis protocol, and the resources tab on the results page.

**Marginalized student groups (affected).** Students from underserved groups — non-binary, transgender, LGBQ+, and Indigenous students — appear in the HMS data with significantly higher anxiety prevalence and are disproportionately harmed by false negatives. The Fairness Explorer makes these disparities visible.

---

## 4. Fairness in ML — Formal Criteria (Lectures 8–9)

The Fairness Explorer reports three criteria across four demographic axes (Gender, Race, International status, Sexual Orientation), all computed on the held-out test set:

**Demographic parity.** Are students predicted as anxious at the same rate across groups? The parity chart shows the gap between actual prevalence and predicted positive rate per subgroup and flags gaps above 15% in red.

**Equalized odds.** Do true positive rate and false positive rate match across groups? Unequal TPR means some at-risk groups are missed more — a higher-harm error.

**Calibration.** When the model predicts 30% probability for a group, does 30% of that group actually screen positive? The scatter plot with a perfect-calibration diagonal makes systematic over/under-prediction visible.

The explainer accordion on the Fairness page explains the incompatibility theorem (Chouldechova; Kleinberg et al.): with unequal base rates, these three criteria generally cannot all be satisfied simultaneously. The dashboard does not claim the model is "fair" — it presents the tradeoffs and names them as a values question.

---

## 5. Algorithm Auditing (Lecture 10)

The fairness report is generated at training time from held-out data and stored as a static JSON artifact (`models/fairness_report.json`). This separates the audit from the inference pipeline — fairness metrics cannot be influenced by live user inputs and are reproducible across runs.

A model card is accessible in the Fairness Explorer documenting: architecture, training data, train/test split, prediction targets, input features, which attributes are excluded from model inputs, explainability method, CI method, intended use, and explicitly out-of-scope uses.

---

## 6. Responsible AI in Practice (Lecture 11)

The AI Wellness Guide's system prompt encodes four RAI commitments:

- **Non-maleficence through scope limitation.** The guide cannot diagnose, prescribe, or clinically assess under any circumstances.
- **Crisis protocol.** Any expression of suicidal ideation, self-harm urges, or a mental health emergency triggers an immediate redirection to 988 and the Crisis Text Line *before* any other response content.
- **Transparency of AI nature.** Every response ends with the disclosure line. The chat header reads "AI assistant · not a therapist · academic demo."
- **Academic context acknowledgment.** The system prompt instructs the model to clarify the academic demo context if a user appears to be treating it as a clinical service.

---

## 7. Transparency and Interpretability (Lectures 12–13)

SHAP TreeExplainer provides **local** (per-prediction) explanations: each student sees which of their specific inputs drove their specific score up or down, not an average across all users. Factor bars show direction, magnitude, and a plain-language one-line interpretation ("Feeling more alone than you'd like is weighing on you").

The gauge chart needle uses spring physics (stiffness 75, damping 16) to visually communicate uncertainty through movement — the needle settles rather than snapping. The dashed confidence interval arc around the needle makes the 80% CI spatially visible.

The Deep Dive tab includes a SHAP waterfall chart showing the exact numerical contribution of each factor, with a plain-language explanation of what SHAP values are for non-technical users.

---

## 8. Privacy (Guest Lecture — Das & Lee)

- **Minimum necessary collection.** Assessment answers, predictions, and chat messages live only in a Zustand in-memory store in the browser. They are erased on page refresh.
- **No server-side storage.** The FastAPI backend does not persist any user inputs or chat history.
- **No accounts or tracking.** No login, no cookies, no analytics.
- **Protected attributes excluded from model inputs.** Gender, race, sexual orientation, and international status inform only the offline fairness audit — not the live prediction.
- **No exposure of identifiers.** The HMS `responseid` field is stripped at the data processing stage and never appears in any model artifact.
