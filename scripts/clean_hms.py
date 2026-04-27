"""
Clean Healthy Minds Study (HMS) public extract rows for ML use.

Expects a dataframe already subset to the columns from get_ml_feature_columns().
See process_data.py for loading raw CSV and writing outputs.
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

# Reference wave: only file with matching schema in this project (see header_comparison.json)
REFERENCE_RAW_NAME = "HMS_2024-2025_PUBLIC_instchars.csv"

GAD7_ITEMS = [f"gad7_{i}" for i in range(1, 8)]
PHQ9_ITEMS = [f"phq9_{i}" for i in range(1, 10)]

# Likert 1-4 → 0-3 for sum scales (matches public `anx_score` / `deprawsc` derivations)
NUMERIC_CORE = (
  GAD7_ITEMS
  + ["gad7_impa"]
  + PHQ9_ITEMS
  + ["dep_impa", "deprawsc"]
  + ["lone_lackcompanion", "lone_leftout", "lone_isolated"]
  + ["aca_impa", "sp_time", "yr_sch", "persist"]
  + ["stress1", "stress2", "stress3", "stress4"]
  + ["sleep_wknight", "sleep_wkend", "time_manage"]
  + ["age", "sex_birth", "international", "age_US"]
  + [
    "gender_male",
    "gender_female",
    "gender_queer",
    "gender_nonbin",
    "gender_trans",
    "gender_prefnoresp",
    "gender_selfID",
    "sexual_h",
    "sexual_l",
    "sexual_g",
    "sexual_bi",
    "sexual_queer",
    "sexual_quest",
    "sexual_asexual",
    "sexual_pan",
    "sexual_prefnoresp",
    "sexual_selfID",
    "race_black",
    "race_ainaan",
    "race_asian",
    "race_his",
    "race_pi",
    "race_mides",
    "race_white",
    "race_other",
  ]
  + ["nrweight", "schoolnum", "Random", "Finished"]
  + [
    "inst_size",
    "inst_type",
    "inst_public",
    "inst_geo",
    "inst_specart",
    "inst_speccc",
    "inst_gradrate",
  ]
)


def get_ml_feature_columns(all_columns: list[str]) -> tuple[list[str], list[str]]:
  """Return (columns_to_keep, missing_from_file) for the reference wave."""
  explicit = [
    "StartDate",
    "Finished",
    "RecordedDate",
    "responseid",
    "schoolnum",
    "nrweight",
    "Random",
    "inst_survey",
    "inst_hmsyear",
    "inst_size",
    "inst_type",
    "inst_public",
    "inst_geo",
    "inst_specart",
    "inst_speccc",
    "inst_gradrate",
    "gad7_1",
    "gad7_2",
    "gad7_3",
    "gad7_4",
    "gad7_5",
    "gad7_6",
    "gad7_7",
    "gad7_impa",
    "anx_score",
    "phq9_1",
    "phq9_2",
    "phq9_3",
    "phq9_4",
    "phq9_5",
    "phq9_6",
    "phq9_7",
    "phq9_8",
    "phq9_9",
    "dep_impa",
    "deprawsc",
    "lone_lackcompanion",
    "lone_leftout",
    "lone_isolated",
    "aca_impa",
    "sp_time",
    "yr_sch",
    "persist",
    "stress1",
    "stress2",
    "stress3",
    "stress4",
    "sleep_wknight",
    "sleep_wkend",
    "time_manage",
    "age",
    "sex_birth",
    "gender_male",
    "gender_female",
    "gender_queer",
    "gender_nonbin",
    "gender_trans",
    "gender_prefnoresp",
    "gender_selfID",
    "sexual_h",
    "sexual_l",
    "sexual_g",
    "sexual_bi",
    "sexual_queer",
    "sexual_quest",
    "sexual_asexual",
    "sexual_pan",
    "sexual_prefnoresp",
    "sexual_selfID",
    "race_black",
    "race_ainaan",
    "race_asian",
    "race_his",
    "race_pi",
    "race_mides",
    "race_white",
    "race_other",
    "international",
    "age_US",
  ]
  all_set = set(all_columns)
  chosen = [c for c in explicit if c in all_set]
  missing = [c for c in explicit if c not in all_set]
  for c in sorted(all_columns):
    if c.startswith("inst_") and c not in chosen and "text" not in c.lower():
      chosen.append(c)
  seen: set[str] = set()
  ordered: list[str] = []
  for c in chosen:
    if c not in seen:
      seen.add(c)
      ordered.append(c)
  return ordered, missing


def _coerce_numeric(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
  out = df.copy()
  for c in cols:
    if c not in out.columns:
      continue
    out[c] = pd.to_numeric(out[c], errors="coerce")
  return out


def clean_dataframe(
  df: pd.DataFrame,
  *,
  require_complete_gad7: bool = False,
) -> tuple[pd.DataFrame, dict[str, Any]]:
  """
  Clean HMS subset for modeling.

  - Keeps only completed surveys (Finished == 1).
  - Drops duplicate responseid (first row kept).
  - Coerces numeric columns used in scales and demographics.
  - Adds gad7_sum_0_21, phq9_sum_0_27 (from 1-4 Likert items), binary screening labels.
  - If require_complete_gad7, drops rows where any GAD-7 item is missing.
  """
  stats: dict[str, Any] = {"input_rows": len(df)}
  out = df.copy()

  if "Finished" in out.columns:
    out["Finished"] = pd.to_numeric(out["Finished"], errors="coerce")
    before = len(out)
    out = out[out["Finished"] == 1].copy()
    stats["rows_after_finished_filter"] = len(out)
    stats["dropped_incomplete_survey"] = before - len(out)

  if "responseid" in out.columns:
    dup = out["responseid"].duplicated(keep="first")
    stats["duplicate_response_ids_dropped"] = int(dup.sum())
    out = out[~dup].copy()

  # Coerce numerics
  present_numeric = [c for c in NUMERIC_CORE if c in out.columns]
  out = _coerce_numeric(out, present_numeric + ["anx_score"])

  # Derived anxiety (0-21): matches public anx_score when all items present
  g7 = out[GAD7_ITEMS].apply(pd.to_numeric, errors="coerce")
  out["gad7_sum_0_21"] = (g7 - 1).sum(axis=1, min_count=7)
  if "anx_score" in out.columns:
    both = out["gad7_sum_0_21"].notna() & out["anx_score"].notna()
    out.loc[both, "_check"] = (
      out.loc[both, "gad7_sum_0_21"] - out.loc[both, "anx_score"]
    ).abs()
    stats["max_abs_diff_gad7_sum_vs_anx_score"] = (
      float(out["_check"].max()) if "_check" in out.columns else None
    )
    out.drop(columns=["_check"], inplace=True, errors="ignore")

  # Standard GAD-7 cutoffs on 0-21 sum (NaN where sum undefined)
  gs = out["gad7_sum_0_21"]
  out["gad7_subthreshold_plus"] = np.where(gs.notna(), (gs >= 5).astype(float), np.nan)
  out["gad7_moderate_plus"] = np.where(gs.notna(), (gs >= 10).astype(float), np.nan)
  out["gad7_severe"] = np.where(gs.notna(), (gs >= 15).astype(float), np.nan)

  # PHQ-9 sum 0-27
  p9 = out[PHQ9_ITEMS].apply(pd.to_numeric, errors="coerce")
  out["phq9_sum_0_27"] = (p9 - 1).sum(axis=1, min_count=9)
  ps = out["phq9_sum_0_27"]
  out["phq9_moderate_plus"] = np.where(ps.notna(), (ps >= 10).astype(float), np.nan)
  out["phq9_severe_plus"] = np.where(ps.notna(), (ps >= 15).astype(float), np.nan)

  if require_complete_gad7:
    before = len(out)
    mask = out[GAD7_ITEMS].notna().all(axis=1)
    out = out[mask].copy()
    stats["rows_after_complete_gad7"] = len(out)
    stats["dropped_incomplete_gad7"] = before - len(out)

  stats["final_rows"] = len(out)
  return out, stats
