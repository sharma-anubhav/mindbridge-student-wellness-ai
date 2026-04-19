#!/usr/bin/env python3
"""
Load raw HMS CSV → subset columns → clean → write ML-ready CSV outputs only.

Place the official public file at:
  Data/HMS_2024-2025_PUBLIC_instchars.csv

Usage (from project root):
  python scripts/process_data.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "Data"
OUT_DIR = PROJECT_ROOT / "Data" / "processed"

sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
import clean_hms  # noqa: E402


def main() -> None:
    import pandas as pd

    raw_path = DATA_DIR / clean_hms.REFERENCE_RAW_NAME
    if not raw_path.is_file():
        raise FileNotFoundError(
            f"Missing raw file: {raw_path}\n"
            "Download the Healthy Minds Study public extract and save it at that path, "
            "then run this script again."
        )

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    header = pd.read_csv(raw_path, nrows=0, encoding="utf-8")
    use_cols, missing_explicit = clean_hms.get_ml_feature_columns(list(header.columns))
    if missing_explicit:
        print("Note: missing explicit columns (wave-specific):", missing_explicit)

    df = pd.read_csv(
        raw_path,
        usecols=lambda c: c in use_cols,
        encoding="utf-8",
        low_memory=False,
    )

    cleaned, stats = clean_hms.clean_dataframe(df, require_complete_gad7=False)
    strict, stats_strict = clean_hms.clean_dataframe(df, require_complete_gad7=True)

    out_main = OUT_DIR / "hms_ml_ready.csv"
    out_strict = OUT_DIR / "hms_ml_ready_complete_gad7.csv"
    out_json = OUT_DIR / "process_stats.json"

    cleaned.to_csv(out_main, index=False)
    strict.to_csv(out_strict, index=False)

    payload = {
        "reference_file": clean_hms.REFERENCE_RAW_NAME,
        "cleaning_stats_all_completed": stats,
        "cleaning_stats_complete_gad7": stats_strict,
        "output_files": {
            "primary_csv": str(out_main.relative_to(PROJECT_ROOT)),
            "complete_gad7_csv": str(out_strict.relative_to(PROJECT_ROOT)),
        },
    }
    out_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(json.dumps(payload, indent=2))
    print(f"wrote {out_main} rows={len(cleaned)}")
    print(f"wrote {out_strict} rows={len(strict)}")
    print(f"wrote {out_json}")


if __name__ == "__main__":
    main()
