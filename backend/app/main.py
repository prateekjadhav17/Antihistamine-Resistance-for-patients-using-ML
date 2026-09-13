from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import APP_NAME, APP_VERSION, APP_DESCRIPTION
from .model import model_manager
from .api.routes_predict import router as predict_router, predict_resistance
from .api.routes_metrics import router as metrics_router, get_metrics
from .api.routes_info import router as info_router, get_pipeline_info, get_sample_cases
from .schemas import PatientInput, PredictionResponse, MetricsResponse, SampleCase
from typing import List, Dict, Any

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("antihistamine_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Antihistamine Resistance ML backend...")
    # Verify model is ready
    if model_manager.model is None:
        model_manager.load()
    logger.info(f"Loaded model successfully: {type(model_manager.model)}")
    yield
    logger.info("Shutting down backend...")

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Unable to generate a prediction. Please check the entered values and try again."}
    )

# Enable CORS for decoupled React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api prefix
app.include_router(predict_router)
app.include_router(metrics_router)
app.include_router(info_router)

# Direct Route Aliases (supporting calls without /api prefix)
@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_alias(patient: PatientInput):
    return predict_resistance(patient)

@app.get("/metrics", response_model=MetricsResponse, tags=["Evaluation & Metrics"])
def metrics_alias():
    return get_metrics()

@app.get("/pipeline-info", tags=["Pipeline & Samples"])
def pipeline_info_alias() -> Dict[str, Any]:
    return get_pipeline_info()

@app.get("/sample-cases", response_model=List[SampleCase], tags=["Pipeline & Samples"])
def sample_cases_alias():
    return get_sample_cases()

@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": APP_NAME,
        "version": APP_VERSION,
        "model_loaded": model_manager.model is not None
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Antihistamine Resistance Prediction API is online.",
        "documentation": "/docs",
        "health": "/health"
    }
