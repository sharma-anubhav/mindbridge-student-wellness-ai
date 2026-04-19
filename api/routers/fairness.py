from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/fairness")
def get_fairness():
    try:
        from src.model.predict import get_fairness_report
        return {"fairness_report": get_fairness_report()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meta")
def get_meta():
    try:
        from src.model.predict import get_model_meta
        meta = get_model_meta()
        return {
            "train_rows":   meta.get("train_rows", 0),
            "test_rows":    meta.get("test_rows", 0),
            "eval_metrics": meta.get("eval_metrics", {}),
            "residual_std": meta.get("residual_std", 2.5),
            "feature_cols": meta.get("feature_cols", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
