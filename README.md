# Antihistamine Resistance Classification — ML Web Application

> **Research / Educational Prototype** — Not for clinical use. See disclaimer below.

A full-stack machine-learning web application that predicts whether a patient is likely to develop **reduced therapeutic response (resistance)** to antihistamine medication, based on seven structured clinical features.

---

## Problem Statement

Antihistamine resistance — the progressive reduction in therapeutic effectiveness over time — is a clinically significant but under-studied phenomenon. Early identification of at-risk patients can guide clinicians toward alternative treatment strategies before complete therapy failure occurs. This application uses an ensemble machine-learning model to predict the likelihood of resistance from routine patient data.

---

## Features

- **3-section single-page application**: About Resistance, How Model Works, Clinical Predictor
- **Interactive predictor**: Fill in patient parameters or load verified sample cases
- **Live ML inference**: React → FastAPI → scikit-learn VotingClassifier ensemble
- **Pipeline visualizer**: Step-by-step animation of preprocessing → ensemble → result
- **Model performance dashboard**: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
- **Feature importance display**: RF, XGBoost, and Logistic Regression weights visualized
- **Deployable architecture**: Frontend and backend are independently deployable

---

## Dataset

| Property | Value |
|---|---|
| File | `data/antihistamine_resistance_dataset.csv` |
| Rows after cleaning/filtering | 285 (228 train, 57 test) |
| Numerical features | `Age` (years), `Duration_Allergy` (days) |
| Categorical features | `Gender`, `Allergy_Type`, `Antihistamine_Type`, `Co_morbidities`, `Previous_Use` |
| Target variable | `Response` (0 = Responsive, 1 = Resistant) |

---

## Machine Learning Approach

### Preprocessing
```
Numerical (Age, Duration_Allergy)  →  StandardScaler (zero mean, unit variance)
Categorical (5 features)           →  OneHotEncoder(handle_unknown='ignore')
                                   →  16-dimensional feature vector
```

### Ensemble Model
```
Input (7 features)
       │
ColumnTransformer (StandardScaler + OneHotEncoder)
       │
Soft Voting Classifier
  Logistic Regression  (20%)
  Random Forest        (40%)
  XGBoost              (40%)
  P_final = 0.20×P_LR + 0.40×P_RF + 0.40×P_XGB
       │
  Prediction + Probabilities
```

### Model Performance (Test Set N=57, stratified 20% holdout)

| Metric | Ensemble |
|---|---|
| Accuracy | 98.25% |
| Precision | 97.83% |
| Recall | 100.0% |
| F1-Score | 98.90% |
| ROC-AUC | 1.000 |

Confusion Matrix:
```
                   Predicted Responsive  Predicted Resistant
Actual Responsive          11                    1
Actual Resistant            0                   45
```
100% Recall on the Resistant class — zero missed resistance cases.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Python 3.13+ | ML model, backend runtime |
| Pandas + NumPy | Data manipulation |
| scikit-learn | Pipeline, preprocessing, LR, RF, VotingClassifier |
| XGBoost | Gradient boosting base estimator |
| Joblib | Pipeline serialization |
| FastAPI | REST API for model serving |
| Pydantic v2 | Input validation |
| Uvicorn | ASGI server |
| React 18 | Frontend SPA |
| Vite | Build tool + dev server |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Docker / Compose | Containerized deployment |

---

## Project Structure

```
antihistamine-resistance-ml/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── model.py             # MLModelManager — load + inference
│   │   ├── schemas.py           # Pydantic models
│   │   ├── config.py            # Path constants
│   │   └── api/
│   │       ├── routes_predict.py    # POST /api/predict
│   │       ├── routes_metrics.py    # GET  /api/metrics
│   │       └── routes_info.py       # GET  /api/pipeline-info, /api/sample-cases
│   ├── artifacts/
│   │   ├── antihistamine_pipeline.joblib
│   │   └── model_metadata.json
│   ├── train_model.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component, tab state, API orchestration
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Centered 3-tab navigation
│   │   │   ├── DisclaimerBanner.jsx # Medical disclaimer strip
│   │   │   ├── SectionAbout.jsx     # About antihistamine resistance
│   │   │   ├── SectionPipeline.jsx  # ML pipeline, metrics, FAQ
│   │   │   └── SectionPredictor.jsx # Interactive prediction form
│   │   └── services/
│   │       └── api.js           # Axios API client
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── data/
│   └── antihistamine_resistance_dataset.csv
├── notebooks/
│   └── Antihistamine_Resistance_Classification.ipynb
├── docker-compose.yml
├── run_app.sh                   # One-command full-stack launcher
└── README.md
```

---

## API Endpoints

| Method | URL | Purpose |
|---|---|---|
| GET | `/health` | Health check + model_loaded status |
| GET | `/api/metrics` | Performance metrics + feature importances |
| GET | `/api/pipeline-info` | Pipeline description |
| GET | `/api/sample-cases` | 3 pre-defined patient examples |
| POST | `/api/predict` | Run prediction on patient input |

### POST /api/predict — Request
```json
{
  "Age": 30,
  "Gender": "Female",
  "Allergy_Type": "Dust",
  "Duration_Allergy": 60,
  "Antihistamine_Type": "2nd_gen",
  "Co_morbidities": "None",
  "Previous_Use": "short_term"
}
```

### POST /api/predict — Response
```json
{
  "prediction": 1,
  "prediction_label": "Resistant (Reduced Response)",
  "probability_resistant": 0.8234,
  "probability_responsive": 0.1766,
  "confidence_score": 0.8234,
  "risk_level": "High Risk of Resistance",
  "base_model_votes": [...],
  "key_contributing_factors": [...],
  "clinical_disclaimer": "..."
}
```

---

## How to Run Locally

### Requirements
- Python 3.11+, Node.js 18+, npm, Git

### Option A — One command
```bash
git clone <repo-url>
cd "antihistamine-resistance-ml"
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
chmod +x run_app.sh && ./run_app.sh
```
Open **http://localhost:3000**

### Option B — Manual

```bash
# Backend
python3 -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
python backend/train_model.py
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

---

## Environment Variables

### Frontend (`frontend/.env.example`)
```env
# Empty for local dev (Vite proxy handles /api → localhost:8000)
VITE_API_URL=
# Production:
# VITE_API_URL=https://your-backend.onrender.com
```

### Backend
No required env vars for local development. Paths are resolved automatically from the project root.

---

## Deployment

### Backend → Render
- Root directory: `backend`
- Build: `pip install -r requirements.txt && python train_model.py`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel
- Root directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env var: `VITE_API_URL=https://your-backend.onrender.com`

> **CORS:** In production, replace `allow_origins=["*"]` in `main.py` with your deployed frontend URL.

---

## Startup Issues (Previously Fixed)

### Path-with-spaces error
**Cause:** Project path contains `Resume Projs` with a space. Unquoted shell variables broke path resolution.
**Fix:** All variables in `run_app.sh` are double-quoted throughout.

### ECONNREFUSED from frontend
**Cause:** Vite launched before FastAPI was ready on port 8000.
**Fix:** `run_app.sh` polls `GET /health` every 0.5 s for up to 15 s before launching Vite.

---

## Limitations

- Dataset is small (285 records); high accuracy may partly reflect dataset characteristics.
- Cannot assess genetic polymorphisms (CYP2D6 metabolizer status).
- Cannot replace clinical allergy testing.
- Co-morbidity categories are simplified.

---

## Medical & Research Disclaimer

> ⚠️ This application is an **educational and research prototype**.
> - Predictions are not clinically validated.
> - Do not use this tool to make or influence treatment decisions.
> - Always consult a qualified healthcare professional.
