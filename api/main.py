"""MindBridge — FastAPI backend"""
import sys
from pathlib import Path

# Ensure project root in sys.path so `src/` imports resolve
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Load .env from project root if present
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import predict, chat, fairness

app = FastAPI(title="MindBridge API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
app.include_router(chat.router,    prefix="/api")
app.include_router(fairness.router, prefix="/api")


@app.get("/api/health")
def health():
    from src.model.predict import models_exist
    return {"status": "ok", "models_loaded": models_exist()}
