from fastapi import APIRouter, HTTPException, status
from ..schemas import MetricsResponse
from ..model import model_manager

router = APIRouter(prefix="/api", tags=["Evaluation & Metrics"])

@router.get(
    "/metrics",
    response_model=MetricsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Model Performance Metrics",
    description="Returns genuine, reproducible evaluation metrics computed on the test set, including confusion matrix, classification report, and feature importances."
)
def get_metrics():
    metadata = model_manager.metadata
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metadata not found."
        )
    return MetricsResponse(
        model_name=metadata.get("model_name", "Voting Classifier"),
        pipeline_steps=metadata.get("pipeline_steps", []),
        ensemble_metrics=metadata.get("ensemble_metrics", {}),
        base_model_metrics=metadata.get("base_model_metrics", {}),
        feature_importances=metadata.get("feature_importances", [])
    )
