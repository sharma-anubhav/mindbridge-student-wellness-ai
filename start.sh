#!/bin/bash
# MindBridge — start both services
# Usage: bash start.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "🌿 MindBridge — starting services..."
echo ""

# Resolve Python: prefer .venv, then fall back to system python3
if [ -d "$ROOT/.venv" ]; then
  PYTHON="$ROOT/.venv/bin/python3"
  UVICORN="$ROOT/.venv/bin/uvicorn"
else
  PYTHON="python3"
  UVICORN="uvicorn"
fi

# Validate critical deps
$PYTHON -c "import fastapi, openai, xgboost" 2>/dev/null || {
  echo "❌ Missing Python dependencies. Run:"
  echo "   pip install -r requirements.txt"
  exit 1
}

# Validate .env
if [ ! -f "$ROOT/.env" ]; then
  echo "❌ No .env file found. Create one with:"
  echo "   OPENAI_API_KEY=sk-..."
  exit 1
fi

# Validate models
if [ ! -f "$ROOT/models/xgb_regressor.pkl" ]; then
  echo "⚠️  No trained model found. Running training first..."
  $PYTHON scripts/train_model.py || {
    echo "❌ Training failed. Check your data files."
    exit 1
  }
fi

# Frontend deps
if [ ! -d "$ROOT/web/node_modules" ]; then
  echo "⚙️  Installing npm dependencies (first run)..."
  cd "$ROOT/web" && npm install --silent && cd "$ROOT"
fi

# Start backend
echo "▶ Backend  → http://localhost:8000"
PYTHONPATH="$ROOT" $UVICORN api.main:app --reload --port 8000 &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "▶ Frontend → http://localhost:3000"
cd "$ROOT/web"
npm run dev &
FRONTEND_PID=$!
cd "$ROOT"

echo ""
echo "✅ MindBridge running!"
echo "   App:      http://localhost:3000"
echo "   API:      http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
