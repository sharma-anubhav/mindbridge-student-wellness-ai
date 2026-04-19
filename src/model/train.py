"""
MindBridge — ML Training Pipeline
Trains XGBoost models for GAD-7 score prediction and saves all artifacts.

Usage:
    python scripts/train_model.py
"""

import json
import os
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.metrics import (
    mean_absolute_error,
    roc_auc_score,
    classification_report,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier, XGBRegressor

warnings.filterwarnings("ignore")

# Paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "Data" / "processed" / "hms_ml_ready_complete_gad7.csv"
MODELS_DIR = PROJECT_ROOT / "models"

# Feature columns (must match constants.py FEATURE_COLS)
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

TARGET_REG = "gad7_sum_0_21"
TARGET_CLF = "gad7_moderate_plus"

# Fairness demographic columns
FAIRNESS_DEMO_COLS = {
    "Gender": ["gender_male", "gender_female", "gender_nonbin", "gender_queer", "gender_trans"],
    "Race": ["race_white", "race_black", "race_asian", "race_his", "race_ainaan", "race_mides"],
    "International": ["international"],
    "Sexual Orientation": ["sexual_h", "sexual_l", "sexual_g", "sexual_bi", "sexual_queer"],
}


def load_and_prepare_data() -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Load processed HMS data and return train/test splits."""
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH, low_memory=False)
    print(f"  Loaded {len(df):,} rows, {df.shape[1]} columns")

    # Verify required columns exist
    missing = [c for c in FEATURE_COLS + [TARGET_REG, TARGET_CLF] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in data: {missing}")

    # Drop rows with NaN in features or targets
    cols_needed = FEATURE_COLS + [TARGET_REG, TARGET_CLF]
    df_clean = df.dropna(subset=cols_needed).copy()
    print(f"  After dropping NaN rows: {len(df_clean):,} rows")

    X = df_clean[FEATURE_COLS].astype(float)
    y_reg = df_clean[TARGET_REG].astype(float)
    y_clf = df_clean[TARGET_CLF].astype(int)

    print(f"  Moderate+ prevalence: {y_clf.mean():.1%}")
    print(f"  GAD-7 score mean: {y_reg.mean():.2f} ± {y_reg.std():.2f}")

    return df_clean, X, y_reg, y_clf


def train_models(X_train, y_reg_train, y_clf_train):
    """Train XGBoost regressor and classifier."""
    print("\nTraining XGBoost Regressor (GAD-7 score 0-21)...")
    reg = XGBRegressor(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
    )
    reg.fit(X_train, y_reg_train)
    print("  Regressor trained.")

    print("Training XGBoost Classifier (moderate+ binary)...")
    clf = XGBClassifier(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        scale_pos_weight=(y_clf_train == 0).sum() / (y_clf_train == 1).sum(),
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        verbosity=0,
        eval_metric="logloss",
    )
    clf.fit(X_train, y_clf_train)
    print("  Classifier trained.")

    return reg, clf


def evaluate_models(reg, clf, X_test, y_reg_test, y_clf_test):
    """Print model performance metrics."""
    print("\n--- Model Evaluation (Test Set) ---")

    # Regression metrics
    y_reg_pred = np.clip(reg.predict(X_test), 0, 21)
    mae = mean_absolute_error(y_reg_test, y_reg_pred)
    print(f"  Regressor MAE: {mae:.3f} (on 0-21 scale)")

    # Classifier metrics
    y_clf_pred = clf.predict(X_test)
    y_clf_prob = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_clf_test, y_clf_prob)
    print(f"  Classifier AUC-ROC: {auc:.4f}")
    print("\n  Classification Report:")
    print(classification_report(y_clf_test, y_clf_pred, target_names=["Below Moderate", "Moderate+"]))

    return {
        "regressor_mae": round(float(mae), 4),
        "classifier_auc": round(float(auc), 4),
    }


def compute_fairness_report(df_full, reg, clf, X_full, y_reg_full, y_clf_full):
    """
    Compute fairness metrics across demographic subgroups.
    For each group: demographic parity, calibration, TPR/FPR (equalized odds).
    Returns a dict suitable for JSON serialization.
    """
    print("\n--- Computing Fairness Report ---")

    y_reg_pred = np.clip(reg.predict(X_full), 0, 21)
    y_clf_pred_prob = clf.predict_proba(X_full)[:, 1]
    y_clf_pred = (y_clf_pred_prob >= 0.5).astype(int)

    report = {}

    for group_name, demo_cols in FAIRNESS_DEMO_COLS.items():
        report[group_name] = {}
        print(f"  Computing {group_name}...")

        if group_name == "International":
            col = "international"
            if col not in df_full.columns:
                continue
            subgroups = {
                "Domestic": df_full[col] == 0,
                "International": df_full[col] == 1,
            }
            for sg_name, mask in subgroups.items():
                mask = mask & ~X_full.isna().any(axis=1)
                n = mask.sum()
                if n < 30:
                    continue
                _add_group_metrics(
                    report[group_name], sg_name, n,
                    y_reg_full[mask], y_reg_pred[mask],
                    y_clf_full[mask], y_clf_pred[mask], y_clf_pred_prob[mask],
                )
        else:
            for col in demo_cols:
                if col not in df_full.columns:
                    continue
                mask = (df_full[col] == 1).values & ~X_full.isna().any(axis=1).values
                n = int(mask.sum())
                if n < 30:
                    continue
                sg_name = col
                _add_group_metrics(
                    report[group_name], sg_name, n,
                    y_reg_full[mask], y_reg_pred[mask],
                    y_clf_full[mask], y_clf_pred[mask], y_clf_pred_prob[mask],
                )

    return report


def _add_group_metrics(group_dict, name, n, y_true_reg, y_pred_reg,
                        y_true_clf, y_pred_clf, y_pred_prob):
    """Add fairness metrics for a single subgroup."""
    prevalence = float(y_true_clf.mean()) if len(y_true_clf) > 0 else 0.0
    pred_positive_rate = float(y_pred_clf.mean()) if len(y_pred_clf) > 0 else 0.0
    mean_pred_score = float(y_pred_reg.mean()) if len(y_pred_reg) > 0 else 0.0
    mean_true_score = float(y_true_reg.mean()) if len(y_true_reg) > 0 else 0.0

    # TPR and FPR
    positives = y_true_clf == 1
    negatives = y_true_clf == 0
    tpr = float(y_pred_clf[positives].mean()) if positives.sum() > 0 else 0.0
    fpr = float(y_pred_clf[negatives].mean()) if negatives.sum() > 0 else 0.0

    # Calibration: mean predicted prob vs true prevalence
    mean_pred_prob = float(y_pred_prob.mean()) if len(y_pred_prob) > 0 else 0.0
    calibration_error = float(abs(mean_pred_prob - prevalence))

    group_dict[name] = {
        "n": int(n),
        "true_prevalence": round(prevalence, 4),
        "predicted_positive_rate": round(pred_positive_rate, 4),
        "mean_true_score": round(mean_true_score, 3),
        "mean_predicted_score": round(mean_pred_score, 3),
        "tpr": round(tpr, 4),
        "fpr": round(fpr, 4),
        "mean_pred_prob": round(mean_pred_prob, 4),
        "calibration_error": round(calibration_error, 4),
    }


def build_shap_explainer(reg, X_sample):
    """Build and return SHAP TreeExplainer, compute base values."""
    print("\nBuilding SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(reg)
    # Compute on a small sample to verify
    sample = X_sample.head(100)
    sv = explainer.shap_values(sample)
    print(f"  SHAP values shape: {sv.shape}")
    return explainer


def train_and_save(data_path: str = None):
    """Full training pipeline: load → train → evaluate → fairness → SHAP → save."""
    MODELS_DIR.mkdir(exist_ok=True)

    # Load data
    df_full, X, y_reg, y_clf = load_and_prepare_data()

    # Train/test split
    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )
    print(f"\nTrain: {len(X_train):,} rows | Test: {len(X_test):,} rows")

    # Train
    reg, clf = train_models(X_train, y_reg_train, y_clf_train)

    # Evaluate
    eval_metrics = evaluate_models(reg, clf, X_test, y_reg_test, y_clf_test)

    # Fairness report on full dataset
    fairness_report = compute_fairness_report(
        df_full.dropna(subset=FEATURE_COLS + [TARGET_REG, TARGET_CLF]).reset_index(drop=True),
        reg, clf,
        X.reset_index(drop=True),
        y_reg.reset_index(drop=True),
        y_clf.reset_index(drop=True),
    )

    # SHAP explainer
    explainer = build_shap_explainer(reg, X_train)

    # Compute residual std for confidence intervals
    y_pred_test = np.clip(reg.predict(X_test), 0, 21)
    residuals = y_reg_test.values - y_pred_test
    residual_std = float(np.std(residuals))

    # Save artifacts
    print("\n--- Saving Artifacts ---")
    joblib.dump(reg, MODELS_DIR / "xgb_regressor.pkl")
    print("  Saved xgb_regressor.pkl")

    joblib.dump(clf, MODELS_DIR / "xgb_classifier.pkl")
    print("  Saved xgb_classifier.pkl")

    joblib.dump(explainer, MODELS_DIR / "shap_explainer.pkl")
    print("  Saved shap_explainer.pkl")

    meta = {
        "feature_cols": FEATURE_COLS,
        "target_reg": TARGET_REG,
        "target_clf": TARGET_CLF,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "eval_metrics": eval_metrics,
        "residual_std": round(residual_std, 4),
        "fairness_report": fairness_report,
    }
    class NumpyEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, (np.integer,)):
                return int(obj)
            if isinstance(obj, (np.floating,)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super().default(obj)

    with open(MODELS_DIR / "fairness_report.json", "w") as f:
        json.dump(meta, f, indent=2, cls=NumpyEncoder)
    print("  Saved fairness_report.json")

    print("\n✓ Training complete! All artifacts saved to models/")
    print(f"  Regressor MAE: {eval_metrics['regressor_mae']:.3f}")
    print(f"  Classifier AUC: {eval_metrics['classifier_auc']:.4f}")
    return meta


if __name__ == "__main__":
    train_and_save()
