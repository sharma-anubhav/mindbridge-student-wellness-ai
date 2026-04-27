# MindBridge: Technical Report

This document covers the core technical details of MindBridge: how the ML models work, how fairness metrics are computed, how data privacy is enforced, and how the LLM system is structured. For design rationale and HAII principles, see `HAII_PRINCIPLES.md`. For the academic narrative, see `REPORT.md`.

---

## 1. ML Pipeline

**Dataset:** Healthy Minds Study (HMS) 2024-2025 public microdata. A nationally distributed survey of U.S. university student mental health (n = 61,393 complete responses after cleaning). Cleaning steps include filtering incomplete responses, deduplication, numeric coercion, and dropping all free-text and identifying fields.

**Targets derived from the survey:**
- GAD-7 sum score (0-21) for the regression model
- Binary flag: score >= 10 (moderate or higher anxiety) for the classification model

**Feature set (11 behavioral features):** Three UCLA Loneliness Scale items, one academic impairment item, one sense of purpose item, year in school, and five PHQ-9 depression-adjacent items used as behavioral proxies due to their correlation with GAD-7 scores.

**Protected attributes (gender, race, sexual orientation, international status) are excluded from model inputs entirely.** They are used only in the offline fairness audit computed at training time.

**Models:**
- **Regressor (XGBoost):** Predicts continuous GAD-7 score. Trained with 80/20 stratified split. Test MAE: 2.94 points on the 0-21 scale.
- **Classifier (XGBoost):** Predicts probability of moderate+ anxiety. Class-balanced training. Test AUC-ROC: 0.871.

---

## 2. Confidence Intervals

Every prediction is shown with an 80% confidence interval derived from the regressor's residual distribution on the held-out test set (standard deviation of residuals = 3.84 points).

The interval half-width is 1.28 x 3.84 = 4.9 points, clipped to the valid [0, 21] range. The 80% level was chosen because a 95% interval would span roughly 15 points on a 21-point scale, which is too wide to be useful, while 80% conveys honest uncertainty without being uninformative.

---

## 3. SHAP Explainability

SHAP (SHapley Additive exPlanations) assigns each feature a value representing how much it pushed the predicted score up or down relative to the model's average prediction.

**Method:** TreeExplainer is used, which computes exact (not approximate) Shapley values for tree-based models by exploiting the tree structure directly.

**At inference:** The top 5 factors are selected by absolute SHAP magnitude (largest influence first, regardless of direction). Each factor includes a direction label (increases or decreases estimated score) and is translated into a plain-language sentence for the student via a pre-written lookup table in the frontend.

---

## 4. Fairness Metrics

Fairness metrics are computed once at training time on the held-out test set and stored as a static file (`models/fairness_report.json`). The live app reads this file; real user inputs cannot affect the reported metrics.

**Subgroups evaluated (18 total):**

| Axis | Subgroups |
|------|-----------|
| Gender (5) | Male, Female, Non-binary, Genderqueer, Transgender |
| Race/Ethnicity (6) | White, Black/African American, Asian, Hispanic/Latine, Am. Indian/Alaska Native, Middle Eastern/North African |
| International Status (2) | Domestic, International |
| Sexual Orientation (5) | Heterosexual, Lesbian, Gay, Bisexual, Queer |

Subgroups with fewer than 30 test-set respondents are excluded.

**Metrics computed per subgroup:**
- True prevalence (actual fraction at risk)
- Predicted positive rate (fraction flagged by model)
- True positive rate / recall (fraction of at-risk students correctly caught)
- False positive rate (fraction of non-at-risk students incorrectly flagged)
- Mean predicted probability and calibration error
- Mean actual vs. predicted GAD-7 score

**Key findings:**
- Transgender students have a false positive rate of 44%, compared to 19.5% for male students. Students who are not at risk are disproportionately flagged in marginalized groups.
- True positive rates are slightly higher for marginalized groups (87-90%) than for male students (83%), meaning at-risk individuals from those groups are caught at a similar or better rate.
- The predicted positive rates are substantially higher than true prevalence for non-binary (65% predicted vs. 53% actual), genderqueer, and transgender students.

**Why fairness criteria conflict:** Male students have 23.6% true anxiety prevalence; transgender students have 54.1%. When base rates differ this much across groups, it is mathematically impossible to simultaneously satisfy demographic parity (equal prediction rates), equalized odds (equal TPR and FPR), and calibration (predicted probability matches true rate). This is a fundamental result in algorithmic fairness, not a fixable implementation bug. Resolving it requires a values decision about which error type is more harmful for which group.

---

## 5. Data Privacy

**No server-side storage:** The FastAPI backend is stateless. Assessment answers and chat messages are processed in memory and returned immediately. Nothing is written to a database, log file, or disk.

**Session-only frontend state:** All user data (answers, predictions, chat history) lives in an in-memory Zustand store with no persistence layer. It is destroyed when the user refreshes the page or closes the tab.

**Protected attributes excluded from inference:** Demographic fields are never sent to the prediction endpoint, never stored in the app state, and never part of any inference call.

**No PII in model files:** The student identifier from the HMS dataset is dropped before any modeling step. Model artifacts contain only learned parameters, not individual-level data.

**No tracking or authentication:** No user accounts, cookies, analytics scripts, or fingerprinting. The only item written to browser storage is a dark/light theme preference.

**CORS policy:** The backend accepts requests only from localhost origins, preventing cross-origin access from external sites.

**Dataset not redistributed:** The raw HMS data is excluded from the repository via `.gitignore`. Only trained model artifacts and the derived fairness report are committed.

---

## 6. LLM System

**Model:** OpenAI GPT-4o-mini, configurable via environment variable.

**Personalized context:** The system prompt is rebuilt for each conversation, injecting the student's specific score, risk tier, probability, top 3 SHAP factors, and self-reported sleep hours. This means the AI guide already has context about the student's responses before the conversation starts.

**Safety rules encoded in system prompt:**

| Rule | Description |
|------|-------------|
| 1 | Not a therapist, counselor, or medical professional |
| 2 | Never diagnose or prescribe treatment |
| 3 | Crisis protocol: Any suicidal ideation, self-harm, or emergency triggers an immediate 988 referral before any other response |
| 4 | Clarify academic demo context if student treats output as clinical guidance |
| 5 | Frame all suggestions as evidence-based (not prescriptions) |
| 6 | Be warm, empathetic, and concise; match the student's emotional tone |
| 7 | Mandatory AI disclosure footer on every response |

**Streaming:** Responses are streamed token by token from OpenAI through FastAPI to the frontend using Server-Sent Events (SSE), so students see text appear progressively rather than waiting for the full response.

---

## 7. API Summary

| Endpoint | Purpose |
|----------|---------|
| `POST /api/predict` | Accepts 11 feature values, returns score, tier, confidence interval, SHAP factors |
| `POST /api/chat/stream` | Accepts message history and prediction context, streams LLM response |
| `GET /api/fairness` | Returns the static fairness report JSON |
| `GET /api/meta` | Returns model metadata (row counts, evaluation metrics, feature list) |

The Next.js frontend proxies all `/api/*` requests to the backend, so the browser only communicates with port 3000. The backend port is not exposed directly to the client.

---

## 8. Limitations

| Limitation | Detail |
|-----------|--------|
| Single HMS wave | Trained on 2024-25 data only; may not generalise to other years or non-HMS populations |
| PHQ-9 as anxiety proxy | PHQ-9 items measure depression; used here as behavioral proxies because they correlate with GAD-7 scores, but the constructs differ |
| No survey weighting | HMS provides sampling weights for national representativeness; these are not applied, so results reflect the HMS sample |
| FPR disparity | Transgender and LGBQ+ students face elevated false positive rates; no post-hoc threshold adjustment has been applied |
| LLM not red-teamed | System prompt guardrails have not been systematically tested against adversarial inputs |
| No IRB approval | This is an academic demonstration; real deployment would require IRB review and clinical oversight |
| Default classifier threshold | The 0.5 decision threshold is not optimized; adjusting it per group could improve fairness metrics |
