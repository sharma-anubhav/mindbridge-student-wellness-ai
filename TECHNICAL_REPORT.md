# MindBridge: Technical Report

This document covers the exact implementation details of MindBridge: how the ML models work, how fairness metrics are computed, how data privacy is enforced at every layer, and how the LLM system is structured. For design rationale and HAII principles, see `HAII_PRINCIPLES.md`. For the academic narrative, see `REPORT.md`.

---

## 1. ML Pipeline

### Dataset

**Source:** Healthy Minds Study (HMS) 2024-2025 public microdata: a nationally distributed survey of U.S. university student mental health, administered by the Healthy Minds Network.

**Cleaning steps (`scripts/clean_hms.py`):**
- Filter to complete survey responses only (`Finished == 1`)
- Deduplicate on `responseid`
- Coerce numeric types; replace out-of-range values with `NaN`
- Derive `gad7_sum_0_21` by summing the 7 GAD-7 items (each 0-3), yielding the regression target
- Derive `gad7_moderate_plus` binary flag: `gad7_sum_0_21 >= 10`
- Strip `responseid` and all free-text fields from the working dataset

**Final dataset:** `n = 61,393` rows × 11 model features + targets + demographic columns used only for fairness auditing.

### Feature Set

| Feature | Source Scale | Description |
|---------|-------------|-------------|
| `lone_lackcompanion` | UCLA Loneliness Scale (1-3) | Frequency of feeling lack of companionship |
| `lone_leftout` | UCLA Loneliness Scale (1-3) | Frequency of feeling left out |
| `lone_isolated` | UCLA Loneliness Scale (1-3) | Frequency of feeling isolated from others |
| `aca_impa` | HMS item (1-6) | Degree to which mental health affected academic performance |
| `persist` | HMS item (1-5) | Sense of purpose / clarity about life direction |
| `yr_sch` | Ordinal (1-6) | Year in school (1st through 6th+) |
| `phq9_1` | PHQ-9 item (1-4) | Little interest or pleasure in doing things |
| `phq9_2` | PHQ-9 item (1-4) | Feeling down, depressed, or hopeless |
| `phq9_3` | PHQ-9 item (1-4) | Trouble sleeping or sleeping too much |
| `phq9_4` | PHQ-9 item (1-4) | Feeling tired or having little energy |
| `phq9_6` | PHQ-9 item (1-4) | Feeling bad about yourself or like a failure |

**Protected attributes excluded from model inputs:** Gender identity, race/ethnicity, sexual orientation, and international status are held out of `FEATURE_COLS` entirely. They appear only in the offline fairness audit computed at training time.

### Model Architecture

**Regressor** (`xgb_regressor.pkl`): predicts continuous GAD-7 score (0-21):
```
XGBoostRegressor(
  n_estimators    = 400,
  max_depth       = 6,
  learning_rate: = 0.05,
  subsample       = 0.8,
  colsample_bytree= 0.8,
  objective       = "reg:squarederror"
)
```

**Classifier** (`xgb_classifier.pkl`): predicts P(moderate+ anxiety), binary target `gad7_moderate_plus`:
```
XGBoostClassifier(
  n_estimators     = 400,
  max_depth        = 5,
  learning_rate    = 0.05,
  subsample        = 0.8,
  colsample_bytree = 0.8,
  scale_pos_weight = n_negatives / n_positives # class-balanced
)
```

**Train/test split:** 80/20, stratified on the binary target to preserve class balance in both splits.

### Performance (held-out test set, n ≈ 12,279)

| Metric | Value |
|--------|-------|
| Regressor MAE | **2.94** points (0-21 scale) |
| Regressor RMSE | ~4.1 points |
| Classifier AUC-ROC | **0.871** |
| Classifier threshold | 0.5 (default, not optimized) |

---

## 2. Confidence Intervals

Every prediction displays an 80% confidence interval computed from the regressor's empirical residual distribution on the held-out test set.

**Formula:**

```
σ_residual = std(y_test − ŷ_test): →: 3.8444 (stored in fairness_report.json)
ci_half    = 1.28 × σ_residual       →: 1.28 is the z-score for 80% two-tailed CI
CI         = [clip(score − ci_half, 0, 21),
              clip(score + ci_half, 0, 21)]
```

**Why 1.28 (80%)?** A 95% CI (z = 1.96) would produce a ±7.5-point band on a 21-point scale: so wide it conveys almost nothing. An 80% CI (z = 1.28) produces a ±4.9-point band: honest about uncertainty without being uninformative. The choice is disclosed on the results page.

**Example:** Predicted score = 11.0 → CI = [6.1, 15.9]. This means the model is 80% confident the true score falls in that range.

---

## 3. SHAP Explainability

### Method

**TreeExplainer** (`shap_explainer.pkl`) computes exact Shapley values: not SHAP's faster approximate kernel method. TreeExplainer is exact for tree-based models (XGBoost, LightGBM, etc.) because it exploits the tree structure directly. This means each value is a provably correct attribution, not an approximation.

**What a SHAP value means:** The value for feature `f` in a given prediction is the amount that feature moved the predicted score away from the model's expected output across all training samples. A positive value means the feature pushed the score up (toward higher anxiety); negative means it pushed the score down.

### Computation at Inference

```python
# Loaded once with lru_cache, reused across all predictions
explainer = load_shap_explainer()      # returns TreeExplainer

x_df = pd.DataFrame([feature_values], columns=FEATURE_COLS): # shape (1, 11)
shap_vals = explainer.shap_values(x_df)[0]                    # shape (11,)
```

**Top-5 factor selection:** factors are ranked by `|shap_val|` (absolute magnitude) so the most influential factors appear first regardless of direction. Each factor returned to the frontend includes:

```json
{
  "col":       "lone_isolated",
  "label":     "Feeling Isolated",
  "icon":      "🏝️",
  "value":     3.0,
  "shap":      1.42,
  "direction": "increases risk",
  "higher_is_better": false
}
```

### Plain-Language Interpretation (Frontend)

`web/src/components/results/ShapBars.tsx` maps each `col` to a pair of pre-written plain-language sentences (one for positive SHAP, one for negative SHAP) via an `INSIGHTS` lookup table. This means a student reads "Isolation is a real stressor for you right now" rather than "SHAP value: +1.42".

---

## 4. Fairness Metrics: Exact Computation

Fairness metrics are computed **at training time** on the held-out test set and stored as a static JSON artifact (`models/fairness_report.json`). The live app serves this file directly: fairness metrics cannot be influenced by real user inputs.

### Subgroups (18 total)

| Axis | Subgroups |
|------|-----------|
| **Gender** (5) | Male, Female, Non-binary, Genderqueer, Transgender |
| **Race/Ethnicity** (6) | White, Black/African American, Asian/Asian American, Hispanic/Latine, Am. Indian/Alaska Native, Middle Eastern/North African |
| **International Status** (2) | Domestic, International |
| **Sexual Orientation** (5) | Heterosexual, Lesbian, Gay, Bisexual, Queer |

Minimum group size enforced: subgroups with fewer than 30 test-set respondents are excluded from the report.

### Metric Formulas

For each subgroup defined by boolean mask `m` over the test set:

```python
n                    = sum(m)
true_prevalence      = mean(y_true_clf[m])
predicted_pos_rate: = mean(y_pred_clf[m])            # y_pred_clf: threshold 0.5 binary
tpr                  = mean(y_pred_clf[m & (y_true_clf == 1)]): # recall within subgroup
fpr                  = mean(y_pred_clf[m & (y_true_clf == 0)]): # false alarm within subgroup
mean_pred_prob       = mean(y_pred_proba[m])           # continuous probability
calibration_error    = abs(mean_pred_prob - true_prevalence)
mean_true_score      = mean(y_true_reg[m])             # actual GAD-7 average
mean_predicted_score = mean(y_pred_reg[m])             # predicted GAD-7 average
```

### Key Findings (actual data from fairness_report.json)

**Gender subgroups:**

| Group | n | True Prev. | Pred. Rate | TPR | FPR |
|-------|---|-----------|-----------|-----|-----|
| Male | 16,973 | 23.6% | 34.6% | 83.3% | 19.5% |
| Female | 41,252 | 35.2% | 41.7% | 79.3% | 21.2% |
| Non-binary | 2,274 | 52.5% | 65.3% | 87.4% | 40.9% |
| Genderqueer | 2,097 | 52.4% | 66.0% | 88.5% | 41.2% |
| Transgender | 1,667 | 54.1% | 68.7% | 89.7% | **44.0%** |

**Sexual orientation subgroups:**

| Group | n | True Prev. | Pred. Rate | TPR | FPR |
|-------|---|-----------|-----------|-----|-----|
| Heterosexual | 40,561 | 27.5% | 34.5% | 78.2% | 18.0% |
| Lesbian | 2,269 | 46.4% | 54.9% | 83.5% | 30.2% |
| Gay | 1,676 | 37.1% | 47.9% | 83.8% | 26.8% |
| Bisexual | 9,081 | 45.6% | 55.8% | 84.0% | 32.2% |
| Queer | 3,762 | 48.5% | 60.6% | 85.5% | 37.1% |

**Key interpretations:**
- The false positive rate for transgender students (44.0%) is more than twice that of male students (19.5%): transgender students who do not have significant anxiety are disproportionately flagged.
- Non-binary, genderqueer, and transgender students have genuinely higher anxiety prevalence (~52-54%), so higher predicted positive rates partly reflect reality. But the gap between prevalence and predicted rate is also larger for these groups.
- TPR is actually *higher* for marginalized groups, meaning at-risk individuals from those groups are caught at a slightly higher rate. The primary concern is over-flagging (FPR), not under-catching.

### Why Fairness Criteria Conflict Here

Male students have 23.6% true prevalence; transgender students have 54.1%. With this gap in base rates:
- **Demographic parity** (equal predicted rates) would require the model to predict lower rates for trans students than their actual risk: deliberately mis-predicting.
- **Equalized odds** (equal TPR and FPR) would require different decision thresholds per group: feasible but introduces group-specific treatment.
- **Calibration** (predicted probability ≈ true rate) is approximately satisfied but conflicts with equalized FPR because base rates differ.

This is not a solvable bug: it is a mathematical consequence of unequal base rates, proven formally by Chouldechova (2017) and Kleinberg et al. (2016). Resolving it requires a values decision: which error type is more harmful for which group?

---

## 5. Data Privacy: Layer by Layer

### Layer 1: No Server-Side Storage

The FastAPI backend (`api/routers/predict.py`, `api/routers/chat.py`) is entirely stateless:
- No database connection
- No file writes of user inputs
- No server-side logging of assessment answers or chat messages
- Each request is handled in memory and the result is immediately returned

### Layer 2: In-Memory Frontend State Only

`web/src/hooks/useStore.ts` uses Zustand with no persistence middleware:
```typescript
const useStore = create<StoreState>()((set, get) => ({ ... }));
// No persist(), no localStorage(), no sessionStorage()
```
All assessment answers, predictions, and chat messages exist only as a JavaScript object in RAM. They are destroyed on page refresh, tab close, or browser exit. There is no mechanism to recover them.

### Layer 3: Protected Attributes Never Touch the Model

The 11 features in `FEATURE_COLS` (`src/utils/constants.py`) are all behavioral: none are demographic. Gender, race, sexual orientation, and international status are:
- Never sent to the prediction endpoint
- Never stored in the Zustand store
- Never part of inference
- Only used during offline training to compute the fairness report

### Layer 4: No PII in Model Artifacts

During data cleaning (`scripts/clean_hms.py`), `responseid` (the HMS pseudo-identifier) is dropped before any modeling step. The `.pkl` model files contain only learned XGBoost parameters: no training rows, no individual-level data.

### Layer 5: No Authentication, No Tracking

- No user accounts, no session tokens, no cookies
- No analytics scripts (no Google Analytics, Segment, Mixpanel, etc.)
- No fingerprinting
- The only `localStorage` item written by the app is `mb-theme` (dark/light UI preference): no user data

### Layer 6: CORS Policy

`api/main.py` configures CORS to allow only:
```python
allow_origins = ["http://localhost:3000", "http://localhost:8000"]
```
Requests from any other origin are rejected by the browser before they reach the backend.

### Layer 7: Dataset Not Redistributed

The raw HMS dataset is not committed to the repository. The `.gitignore` excludes `Data/HMS_*.csv`. The processed ML-ready CSVs (`Data/processed/`) are also excluded. Only trained model artifacts and the derived fairness report are present.

---

## 6. LLM System: Prompt and Safety

### Dynamic Prompt Construction

The system prompt is rebuilt for every conversation, injecting the student's specific prediction context:

```python
f"""You are MindBridge: a compassionate, evidence-informed wellness guide.

This student just completed a wellbeing check-in:
- Estimated anxiety score: {score}/21 ({tier} range)
- Probability of moderate anxiety: {prob:.0%}
- Key contributing factors: {top_3_factors}
- Self-reported weeknight sleep: {sleep} hours

[SAFETY RULES FOLLOW...]"""
```

This grounding means the AI guide already knows which factors were most significant for this specific student before the conversation starts, enabling personalised responses without the student needing to re-explain their situation.

### Safety Rules (Encoded in System Prompt)

Seven explicit rules are enforced via the system prompt:

| Rule | Content |
|------|---------|
| 1 | Not a therapist, counselor, psychiatrist, or medical professional |
| 2 | Never diagnose, clinically assess, or prescribe treatment |
| 3 | **Crisis protocol:** Any expression of suicidal ideation, self-harm, plans to hurt self/others, or current emergency → immediately lead with 988 referral and Crisis Text Line *before* any other response |
| 4 | Academic demonstration context: clarify if student treats output as clinical guidance |
| 5 | Evidence-based framing only: "research suggests…" not prescriptions |
| 6 | Warm, empathetic, non-judgmental, culturally sensitive; match emotional tone; max 3-5 sentences |
| 7 | Mandatory footer on every response: "🤖 *I'm an AI wellness guide, not a mental health professional. For real concerns, please speak with a counselor.*" |

### Streaming Architecture

```
Student message
    → POST /api/chat/stream (FastAPI)
    → OpenAI chat.completions.create(..., stream=True)
    → FastAPI StreamingResponse (text/event-stream)
    → data: {"chunk": "..."}\n\n (per token)
    → Next.js SSE reader (lib/api.ts: streamChat())
    → appendToMessage(id, chunk) → Zustand store
    → React re-render (streaming cursor ▌)
    → finalizeMessage(id) on done event
```

### Error Handling

| Error | User-facing message |
|-------|-------------------|
| `OPENAI_API_KEY` missing | "API key not configured" + 988 reference |
| `AuthenticationError` | "Invalid API key. Check your environment variable." |
| `RateLimitError` | "Rate limit reached. Please wait a moment." |
| Any other exception | "Connection error: {detail}" + campus counseling reference |

---

## 7. API Architecture

### Endpoints

| Method | Path | Input | Output |
|--------|------|-------|--------|
| `POST` | `/api/predict` | 11 feature floats | Prediction payload |
| `POST` | `/api/chat/stream` | `{messages, prediction}` | SSE stream |
| `GET` | `/api/fairness` |: | Static fairness_report.json |
| `GET` | `/api/meta` |: | Model metadata (rows, metrics, features) |

### Prediction Payload (full)

```json
{
  "gad7_score":      11.3,
  "risk_tier":       "Moderate",
  "risk_prob":       0.6821,
  "confidence_low": 6.4,
  "confidence_high": 16.2,
  "shap_values":     [-0.12, 0.83, 1.42, ...],
  "top_factors": [
    { "col": "lone_isolated", "label": "Feeling Isolated",
      "icon": "🏝️", "value": 3.0, "shap": 1.42,
      "direction": "increases risk", "higher_is_better": false }
  ],
  "feature_values": { "lone_lackcompanion": 2, "lone_leftout": 3, ... }
}
```

### Next.js Proxy

`web/next.config.mjs` rewrites all `/api/*` requests to `http://localhost:8000/api/*`. The frontend never directly references port 8000 in any component: all API calls go through the Next.js server at port 3000. This means:
- No CORS issues for the browser
- Backend port is not exposed to the browser's network tab as a separate origin
- Swapping the backend URL in production requires only one config change

---

## 8. Frontend State Architecture

### Zustand Store Structure

```typescript
// Assessment state
answers:    Record<FeatureKey, number>: // 11 feature values (defaults from FEATURE_META)
step:       1 | 2 | 3                   // current wizard step
prediction: PredictionResponse | null: // last API result
isLoading: boolean
error:      string | null

// Chat state
chatMessages: ChatMessage[]             // { id, role, content, streaming? }
isStreaming: boolean
```

### Streaming Message Protocol

```typescript
// When AI response begins:
const id = addMessage({ role: "assistant", content: "", streaming: true });

// As SSE chunks arrive:
appendToMessage(id, chunk);: // content += chunk

// When SSE done event fires:
finalizeMessage(id);          // streaming = false
setStreaming(false);
```

The `id` is a UUID generated by `addMessage`, allowing `appendToMessage` to target the correct in-flight message even if multiple messages exist.

### Theme Storage (Only localStorage Item)

`ThemeInit` (`web/src/components/layout/ThemeInit.tsx`) reads and writes a single key:
```typescript
localStorage.getItem("mb-theme"): // "dark" | "light"
localStorage.setItem("mb-theme", next)
```
This is UI preference only: no user data, no session identifier, no cross-device sync.

---

## 9. Limitations and Known Gaps

| Limitation | Detail |
|-----------|--------|
| **Single HMS wave** | Trained on 2024-25 data only; may not generalise to other years, institutions, or non-HMS populations |
| **PHQ-9 as anxiety proxy** | PHQ-9 items measure depression, not anxiety: used as behavioural proxies because they correlate with GAD-7 in the dataset, but this conflates constructs |
| **No survey weighting** | HMS provides a `nrweight` variable for national representativeness; not applied here: results reflect the HMS sample, not U.S. students at large |
| **FPR disparity** | Transgender and LGBQ+ students face elevated false positive rates (44% vs 19.5% for men): no post-hoc threshold adjustment applied |
| **LLM not red-teamed** | System prompt guardrails are carefully written but have not been systematically tested against adversarial inputs designed to elicit harmful outputs |
| **No IRB approval** | This is an academic demonstration; real deployment would require IRB review, clinical oversight, and institutional partnership |
| **Threshold not optimised** | Classifier uses 0.5 default; optimising the threshold per group or for a specific cost function could improve fairness metrics |
| **Dataset access** | HMS microdata requires researcher access approval: raw data is not redistributable; model artifacts are the only artefacts in this repo |
