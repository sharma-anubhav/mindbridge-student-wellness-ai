"""
MindBridge - Prediction Utilities
Load trained models and run inference for a single user input.
"""

import json
from pathlib import Path
from functools import lru_cache
from typing import Any

import joblib
import numpy as np
import pandas as pd

from src.utils.constants import FEATURE_COLS, score_to_tier

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = PROJECT_ROOT / "models"


@lru_cache(maxsize=1)
def _load_models():
  """Load all model artifacts once (cached)."""
  reg = joblib.load(MODELS_DIR / "xgb_regressor.pkl")
  clf = joblib.load(MODELS_DIR / "xgb_classifier.pkl")
  explainer = joblib.load(MODELS_DIR / "shap_explainer.pkl")
  with open(MODELS_DIR / "fairness_report.json") as f:
    meta = json.load(f)
  return reg, clf, explainer, meta


def models_exist() -> bool:
  """Return True if all required model artifacts are present."""
  required = ["xgb_regressor.pkl", "xgb_classifier.pkl", "shap_explainer.pkl", "fairness_report.json"]
  return all((MODELS_DIR / f).exists() for f in required)


def predict(user_input: dict[str, float]) -> dict[str, Any]:
  """
  Run full inference for a user's slider inputs.

  Parameters
  ----------
  user_input : dict mapping feature column name → float value

  Returns
  -------
  dict with keys:
    gad7_score   : float (0-21) - predicted anxiety score
    risk_tier    : str - "Minimal" / "Subthreshold" / "Moderate" / "Severe"
    risk_prob    : float - P(gad7_moderate_plus)
    confidence_low : float - lower bound of 80% CI
    confidence_high : float - upper bound of 80% CI
    shap_values   : list of float - per-feature SHAP values
    top_factors   : list of dicts - top 5 factors with name, value, shap, direction
    feature_values : dict - the input values used
  """
  reg, clf, explainer, meta = _load_models()
  residual_std = meta.get("residual_std", 2.5)

  # Build feature array in correct order
  x = np.array([[user_input.get(c, 0.0) for c in FEATURE_COLS]], dtype=float)
  x_df = pd.DataFrame(x, columns=FEATURE_COLS)

  # Predict score
  raw_score = float(reg.predict(x_df)[0])
  gad7_score = float(np.clip(raw_score, 0, 21))

  # 80% confidence interval (±1.28σ)
  ci_half = 1.28 * residual_std
  confidence_low = float(np.clip(gad7_score - ci_half, 0, 21))
  confidence_high = float(np.clip(gad7_score + ci_half, 0, 21))

  # Classify moderate+
  risk_prob = float(clf.predict_proba(x_df)[0][1])

  # Risk tier from predicted score
  risk_tier = score_to_tier(gad7_score)

  # SHAP values
  shap_vals = explainer.shap_values(x_df)[0] # shape: (n_features,)

  # Top factors - sorted by absolute SHAP value
  from src.utils.constants import FEATURE_META
  factor_list = []
  for i, col in enumerate(FEATURE_COLS):
    sv = float(shap_vals[i])
    meta_info = FEATURE_META.get(col, {})
    factor_list.append({
      "col": col,
      "label": meta_info.get("label", col),
      "icon": meta_info.get("icon", ""),
      "value": user_input.get(col, 0.0),
      "shap": sv,
      "direction": "increases risk" if sv > 0 else "decreases risk",
      "higher_is_better": meta_info.get("higher_is_better", None),
    })
  factor_list.sort(key=lambda f: abs(f["shap"]), reverse=True)
  top_factors = factor_list[:5]

  return {
    "gad7_score": round(gad7_score, 2),
    "risk_tier": risk_tier,
    "risk_prob": round(risk_prob, 4),
    "confidence_low": round(confidence_low, 2),
    "confidence_high": round(confidence_high, 2),
    "shap_values": shap_vals.tolist(),
    "top_factors": top_factors,
    "feature_values": {c: user_input.get(c, 0.0) for c in FEATURE_COLS},
  }


def get_fairness_report() -> dict:
  """Return the precomputed fairness report from training."""
  _, _, _, meta = _load_models()
  return meta.get("fairness_report", {})


def get_model_meta() -> dict:
  """Return training metadata."""
  _, _, _, meta = _load_models()
  return meta
