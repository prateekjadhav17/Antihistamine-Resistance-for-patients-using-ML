from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

class PatientInput(BaseModel):
    Age: int = Field(..., ge=18, le=100, description="Patient age in years (18-100)", examples=[30])
    Gender: str = Field(..., description="Gender ('Male' or 'Female')", examples=["Female"])
    Allergy_Type: str = Field(..., description="Type of allergy ('Drug', 'Dust', 'Food', 'Seasonal', 'Other')", examples=["Dust"])
    Duration_Allergy: int = Field(..., ge=1, le=250, description="Duration of allergy in days (1-250)", examples=[60])
    Antihistamine_Type: str = Field(..., description="Antihistamine class ('1st_gen' or '2nd_gen')", examples=["2nd_gen"])
    Co_morbidities: str = Field(default="None", description="Co-morbidities ('asthma', 'eczema', 'multiple', or 'None')", examples=["None"])
    Previous_Use: str = Field(..., description="History of antihistamine usage ('short_term' or 'long_term')", examples=["short_term"])

    @field_validator("Gender")
    @classmethod
    def normalize_gender(cls, v: str) -> str:
        s = v.strip().title()
        if s in ['M', 'Male']:
            return 'Male'
        if s in ['F', 'Female']:
            return 'Female'
        return s

    @field_validator("Allergy_Type")
    @classmethod
    def normalize_allergy(cls, v: str) -> str:
        s = v.strip().title()
        valid = ['Drug', 'Dust', 'Food', 'Other', 'Seasonal']
        if s not in valid:
            # gracefully allow custom allergies or fallback to Other
            return s
        return s

    @field_validator("Antihistamine_Type")
    @classmethod
    def normalize_antihistamine(cls, v: str) -> str:
        s = v.strip().lower()
        if '1' in s or 'first' in s:
            return '1st_gen'
        if '2' in s or 'second' in s:
            return '2nd_gen'
        return s

    @field_validator("Co_morbidities")
    @classmethod
    def normalize_comorbidities(cls, v: str) -> str:
        s = v.strip().lower()
        if s in ['none', 'nan', 'null', 'no', '']:
            return 'None'
        if 'asthma' in s:
            return 'asthma'
        if 'eczema' in s:
            return 'eczema'
        if 'multi' in s:
            return 'multiple'
        return s

    @field_validator("Previous_Use")
    @classmethod
    def normalize_previous_use(cls, v: str) -> str:
        s = v.strip().lower()
        if 'long' in s:
            return 'long_term'
        return 'short_term'

class ModelVote(BaseModel):
    model_name: str
    weight: float
    prediction: int
    prediction_label: str
    probability_resistant: float
    probability_responsive: float

class PredictionResponse(BaseModel):
    prediction: int
    prediction_label: str
    probability_resistant: float
    probability_responsive: float
    confidence_score: float
    risk_level: str
    patient_input: Dict[str, Any]
    base_model_votes: List[ModelVote]
    key_contributing_factors: List[str]
    clinical_disclaimer: str

class MetricsResponse(BaseModel):
    model_name: str
    pipeline_steps: List[str]
    ensemble_metrics: Dict[str, Any]
    base_model_metrics: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]

class SampleCase(BaseModel):
    id: str
    title: str
    description: str
    patient_data: Dict[str, Any]
    expected_class: int
