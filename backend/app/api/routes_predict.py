from fastapi import APIRouter, HTTPException, status
from ..schemas import PatientInput, PredictionResponse
from ..model import model_manager

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Antihistamine Resistance",
    description="Accepts patient demographic and clinical characteristics and returns soft-voting resistance prediction with model breakdown."
)
def predict_resistance(patient: PatientInput):
    try:
        return model_manager.predict(patient)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )
