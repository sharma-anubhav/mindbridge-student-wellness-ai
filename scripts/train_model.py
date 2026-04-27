"""
MindBridge - Model Training Script
Run this once from the project root to generate all model artifacts.

Usage:
  python scripts/train_model.py
"""

import sys
from pathlib import Path

# Add project root to sys.path so src.* imports work
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.model.train import train_and_save

if __name__ == "__main__":
  print("=" * 60)
  print(" MindBridge - Model Training")
  print("=" * 60)
  meta = train_and_save()
  print("\n" + "=" * 60)
  print(" Training complete! Start the app with:")
  print(" streamlit run app.py")
  print("=" * 60)
