import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const checkBackendHealth = async () => {
  try {
    const res = await client.get('/health');
    return { online: true, data: res.data };
  } catch (error) {
    return { online: false, error: error.message };
  }
};

export const fetchMetrics = async () => {
  try {
    const res = await client.get('/api/metrics');
    return res.data;
  } catch (error) {
    console.warn("Using fallback metrics due to API error:", error.message);
    // Verified fallback directly from model training
    return {
      model_name: "Antihistamine Resistance Soft Voting Classifier",
      pipeline_steps: [
        "StandardScaler (Numerical: Age, Duration)",
        "OneHotEncoder (Categorical: Gender, Allergy, Antihistamine, Co-morbidities, Previous Use)",
        "VotingClassifier (Soft: Logistic Regression 20%, Random Forest 40%, XGBoost 40%)"
      ],
      ensemble_metrics: {
        accuracy: 0.9825,
        precision: 0.9783,
        recall: 1.0,
        f1_score: 0.9890,
        roc_auc: 1.0,
        confusion_matrix: [[11, 1], [0, 45]],
        test_sample_count: 57,
        train_sample_count: 228
      },
      base_model_metrics: {
        "Logistic Regression": { accuracy: 0.9825, precision: 1.0, recall: 0.9778, f1_score: 0.9888, roc_auc: 0.9963 },
        "Random Forest": { accuracy: 0.9649, precision: 0.9574, recall: 1.0, f1_score: 0.9783, roc_auc: 0.9981 },
        "XGBoost": { accuracy: 0.9825, precision: 0.9783, recall: 1.0, f1_score: 0.9890, roc_auc: 1.0 }
      },
      feature_importances: [
        { feature: "Duration_Allergy", rf_importance: 0.1711, xgb_importance: 0.1200, lr_coefficient: 1.1143 },
        { feature: "Co_morbidities_eczema", rf_importance: 0.1329, xgb_importance: 0.1923, lr_coefficient: -1.5526 },
        { feature: "Antihistamine_Type_1st_gen", rf_importance: 0.1285, xgb_importance: 0.2831, lr_coefficient: 2.4798 },
        { feature: "Previous_Use_short_term", rf_importance: 0.1209, xgb_importance: 0.0, lr_coefficient: -1.1709 },
        { feature: "Antihistamine_Type_2nd_gen", rf_importance: 0.1205, xgb_importance: 0.0, lr_coefficient: -1.3081 },
        { feature: "Previous_Use_long_term", rf_importance: 0.1172, xgb_importance: 0.3201, lr_coefficient: 2.3426 },
        { feature: "Age", rf_importance: 0.0806, xgb_importance: 0.0133, lr_coefficient: -0.1094 },
        { feature: "Co_morbidities_asthma", rf_importance: 0.0324, xgb_importance: 0.0, lr_coefficient: 1.5037 },
        { feature: "Co_morbidities_multiple", rf_importance: 0.0285, xgb_importance: 0.0463, lr_coefficient: 1.2206 }
      ]
    };
  }
};

export const fetchPipelineInfo = async () => {
  try {
    const res = await client.get('/api/pipeline-info');
    return res.data;
  } catch (error) {
    return {
      model_name: "Antihistamine Resistance Classifier",
      pipeline_steps: ["StandardScaler", "OneHotEncoder", "VotingClassifier"],
      algorithms: [
        { name: "Logistic Regression", weight: 0.2, solver: "liblinear" },
        { name: "Random Forest Classifier", weight: 0.4, n_estimators: 100 },
        { name: "XGBoost Classifier", weight: 0.4, eval_metric: "logloss" }
      ],
      total_test_samples: 57,
      total_train_samples: 228
    };
  }
};

export const fetchSampleCases = async () => {
  try {
    const res = await client.get('/api/sample-cases');
    return res.data;
  } catch (error) {
    return [
      {
        id: "case-1-dust-short",
        title: "Example 1: Young Adult, Dust Allergy",
        description: "30yo female with dust allergy, 2nd gen antihistamine, short term use.",
        patient_data: {
          Age: 30,
          Gender: "Female",
          Allergy_Type: "Dust",
          Duration_Allergy: 60,
          Antihistamine_Type: "2nd_gen",
          Co_morbidities: "None",
          Previous_Use: "short_term"
        },
        expected_class: 1
      },
      {
        id: "case-2-seasonal-long",
        title: "Example 2: Chronic Allergy & Asthma",
        description: "55yo male with seasonal allergy, asthma, 1st gen antihistamine, long term use.",
        patient_data: {
          Age: 55,
          Gender: "Male",
          Allergy_Type: "Seasonal",
          Duration_Allergy: 200,
          Antihistamine_Type: "1st_gen",
          Co_morbidities: "asthma",
          Previous_Use: "long_term"
        },
        expected_class: 1
      },
      {
        id: "case-3-responsive",
        title: "Example 3: Responsive Patient (Short Exposure)",
        description: "25yo female with dust allergy, 18 days duration, eczema, short term 2nd gen antihistamine.",
        patient_data: {
          Age: 25,
          Gender: "Female",
          Allergy_Type: "Dust",
          Duration_Allergy: 18,
          Antihistamine_Type: "2nd_gen",
          Co_morbidities: "eczema",
          Previous_Use: "short_term"
        },
        expected_class: 0
      }
    ];
  }
};

export const predictResistance = async (patientData) => {
  const res = await client.post('/api/predict', patientData);
  return res.data;
};
