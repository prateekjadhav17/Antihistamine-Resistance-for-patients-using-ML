import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path(os.getenv("ARTIFACTS_DIR", str(BASE_DIR / "artifacts")))
MODEL_PATH = ARTIFACTS_DIR / "antihistamine_pipeline.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"

APP_NAME = "Antihistamine Resistance Prediction API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = (
    "Production-grade REST API for Antihistamine Resistance Classification. "
    "Predicts whether an allergy patient exhibits resistance (reduced therapeutic response) "
    "using an ensemble of Logistic Regression, Random Forest, and XGBoost."
)
