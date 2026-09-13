import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd

from .config import MODEL_PATH, METADATA_PATH
from .schemas import PatientInput, PredictionResponse, ModelVote

logger = logging.getLogger(__name__)

DISCLAIMER_TEXT = (
    "This application is an educational/research prototype and is not intended for "
    "medical diagnosis, treatment decisions, or clinical advice. "
    "Model predictions should not be interpreted as medical recommendations."
)

EXPECTED_COLUMNS = [
    'Age', 'Gender', 'Allergy_Type', 'Duration_Allergy',
    'Antihistamine_Type', 'Co_morbidities', 'Previous_Use'
]

class MLModelManager:
    _instance = None

    def __init__(self):
        self.model = None
        self.metadata = {}
        self.load()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLModelManager()
        return cls._instance

    def load(self):
        logger.info(f"Loading model pipeline from {MODEL_PATH}")
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}. Please run train_model.py first.")

        self.model = joblib.load(MODEL_PATH)

        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)
        else:
            logger.warning("Metadata JSON file not found; using empty metadata.")
            self.metadata = {}

        logger.info("Pipeline and metadata loaded successfully.")

    def predict(self, input_data: PatientInput) -> PredictionResponse:
        data_dict = input_data.model_dump()
        new_df = pd.DataFrame([data_dict])

        # Reorder and format columns exactly as trained
        for col in EXPECTED_COLUMNS:
            if col not in new_df.columns:
                new_df[col] = None
        new_df = new_df[EXPECTED_COLUMNS]

        # 1. Transform features via ColumnTransformer
        preprocessor = self.model.named_steps['preprocessor']
        X_trans = preprocessor.transform(new_df)

        # 2. Get overall ensemble prediction and probabilities
        pred_class = int(self.model.predict(new_df)[0])
        probabilities = self.model.predict_proba(new_df)[0]
        prob_responsive = float(probabilities[0])
        prob_resistant = float(probabilities[1])

        # 3. Base model individual breakdown
        classifier = self.model.named_steps['classifier']
        weights = classifier.weights or [0.2, 0.4, 0.4]
        model_names = ['Logistic Regression', 'Random Forest', 'XGBoost']

        base_votes: List[ModelVote] = []
        for idx, (name, est) in enumerate(zip(model_names, classifier.estimators_)):
            est_prob = est.predict_proba(X_trans)[0]
            est_pred = int(np.argmax(est_prob))
            base_votes.append(ModelVote(
                model_name=name,
                weight=weights[idx],
                prediction=est_pred,
                prediction_label="Resistant" if est_pred == 1 else "Responsive",
                probability_resistant=round(float(est_prob[1]), 4),
                probability_responsive=round(float(est_prob[0]), 4)
            ))

        # 4. Risk tier & confidence
        if prob_resistant >= 0.70:
            risk_level = "High Risk of Resistance"
        elif prob_resistant >= 0.40:
            risk_level = "Moderate Risk of Resistance"
        else:
            risk_level = "Low Risk of Resistance (Likely Responsive)"

        confidence_score = max(prob_resistant, prob_responsive)

        # 5. Factor explanations
        factors = []
        if data_dict.get('Antihistamine_Type') == '1st_gen':
            factors.append("First-generation antihistamine prescribed (higher statistical correlation with tachyphylaxis/reduced response).")
        elif data_dict.get('Antihistamine_Type') == '2nd_gen':
            factors.append("Second-generation antihistamine prescribed (generally exhibits greater H1 receptor selectivity).")

        if data_dict.get('Previous_Use') == 'long_term':
            factors.append("Long-term prior antihistamine use recorded (extended exposure contributes to tolerance).")
        else:
            factors.append("Short-term prior use recorded (lower likelihood of accumulated receptor desensitization).")

        if data_dict.get('Duration_Allergy', 0) > 120:
            factors.append(f"Extended allergy duration ({data_dict.get('Duration_Allergy')} days) represents chronic inflammatory state.")

        if data_dict.get('Co_morbidities') in ['asthma', 'multiple']:
            factors.append(f"Presence of co-morbidity ({data_dict.get('Co_morbidities')}) associated with systemic allergic burden.")

        return PredictionResponse(
            prediction=pred_class,
            prediction_label="Resistant (Reduced Response)" if pred_class == 1 else "Responsive (Likely Effective)",
            probability_resistant=round(prob_resistant, 4),
            probability_responsive=round(prob_responsive, 4),
            confidence_score=round(confidence_score, 4),
            risk_level=risk_level,
            patient_input=data_dict,
            base_model_votes=base_votes,
            key_contributing_factors=factors,
            clinical_disclaimer=DISCLAIMER_TEXT
        )

model_manager = MLModelManager.get_instance()
