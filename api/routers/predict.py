from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import Any

router = APIRouter()


class PredictRequest(BaseModel):
    lone_lackcompanion: float
    lone_leftout:       float
    lone_isolated:      float
    aca_impa:           float
    persist:            float
    yr_sch:             float
    phq9_1:             float
    phq9_2:             float
    phq9_3:             float
    phq9_4:             float
    phq9_6:             float


@router.post("/predict")
def predict_endpoint(body: PredictRequest) -> dict[str, Any]:
    try:
        from src.model.predict import predict
        result = predict(body.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
