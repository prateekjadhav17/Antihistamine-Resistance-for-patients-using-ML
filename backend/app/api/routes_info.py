from fastapi import APIRouter
from typing import List, Dict, Any
from ..schemas import SampleCase
from ..model import model_manager

router = APIRouter(prefix="/api", tags=["Pipeline & Samples"])

@router.get(
    "/pipeline-info",
    summary="Get Pipeline Architecture",
    description="Returns preprocessor steps, feature definitions, algorithm weights, and hyper-parameters."
)
def get_pipeline_info() -> Dict[str, Any]:
    metadata = model_manager.metadata
    return {
        "model_name": metadata.get("model_name", "Antihistamine Resistance Classifier"),
        "pipeline_steps": metadata.get("pipeline_steps", []),
        "algorithms": metadata.get("algorithms", []),
        "feature_schema": metadata.get("feature_schema", {}),
        "total_test_samples": metadata.get("ensemble_metrics", {}).get("test_sample_count", 57),
        "total_train_samples": metadata.get("ensemble_metrics", {}).get("train_sample_count", 228)
    }

@router.get(
    "/sample-cases",
    response_model=List[SampleCase],
    summary="Get Verified Sample Patient Cases",
    description="Returns curated test cases from the notebook and dataset for one-click testing."
)
def get_sample_cases():
    cases = model_manager.metadata.get("sample_cases", [])
    return cases
