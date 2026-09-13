#!/usr/bin/env python3
"""
Antihistamine Resistance ML Pipeline Training Script
Replicates the EXACT machine-learning approach from Antihistamine_Resistance_Classification.ipynb.
Saves the trained scikit-learn Pipeline and comprehensive evaluation metadata.
"""

import json
import os
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

def load_and_preprocess_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    # 1. Handle Missing Values
    # Impute numerical columns with median
    for col in ['Age', 'Duration_Allergy', 'Response']:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())

    # Impute categorical columns with mode
    for col in ['Gender', 'Co_morbidities']:
        if col in df.columns and df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0])

    # 2. Clean Inconsistent Formatting
    categorical_cols = ['Gender', 'Allergy_Type', 'Antihistamine_Type', 'Co_morbidities', 'Previous_Use']
    for col in categorical_cols:
        df[col] = df[col].astype(str).str.strip()
        if col in ['Gender', 'Allergy_Type']:
            df[col] = df[col].str.title()
        else:
            df[col] = df[col].str.lower()

    # Standardize values for Gender
    df['Gender'] = df['Gender'].replace({
        'M': 'Male', 'F': 'Female', 'M ': 'Male', 'F ': 'Female',
        'FEMALE': 'Female', 'male': 'Male'
    })

    # 3. Handling outliers
    df['Age'] = np.where(df['Age'] < 0, 0, df['Age'])
    df['Age'] = np.where(df['Age'] > 100, 100, df['Age'])

    df['Duration_Allergy'] = np.where(df['Duration_Allergy'] < 0, 0, df['Duration_Allergy'])
    df['Duration_Allergy'] = np.where(df['Duration_Allergy'] > 365, 365, df['Duration_Allergy'])

    # Response: Ensure values are 0 or 1
    df['Response'] = df['Response'].apply(lambda x: 1 if x in [1.0, 10.0] else 0)

    # Filtering per notebook Cell 19
    df = df[(df['Age'] >= 18) & (df['Duration_Allergy'] <= 250)]

    # Convert numerical columns to integer type
    df['Age'] = df['Age'].astype(int)
    df['Duration_Allergy'] = df['Duration_Allergy'].astype(int)
    df['Response'] = df['Response'].astype(int)

    # 4. Remove duplicate rows
    df_cleaned = df.drop_duplicates().copy()
    return df_cleaned

def build_pipeline():
    numerical_features = ['Age', 'Duration_Allergy']
    categorical_features = ['Gender', 'Allergy_Type', 'Antihistamine_Type', 'Co_morbidities', 'Previous_Use']

    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough'
    )

    clf1 = LogisticRegression(solver='liblinear', random_state=42)
    clf2 = RandomForestClassifier(n_estimators=100, random_state=42)
    clf3 = XGBClassifier(eval_metric='logloss', random_state=42)

    eclf1 = VotingClassifier(
        estimators=[('lr', clf1), ('rf', clf2), ('xgb', clf3)],
        voting='soft',
        weights=[0.2, 0.4, 0.4]
    )

    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', eclf1)
    ])
    return model, numerical_features, categorical_features

def train_and_evaluate(data_path: str, output_dir: str):
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"Loading data from {data_path}...")
    df_cleaned = load_and_preprocess_data(data_path)
    print(f"Cleaned dataset shape: {df_cleaned.shape}")

    X = df_cleaned.drop('Response', axis=1)
    y = df_cleaned['Response']

    model, numerical_features, categorical_features = build_pipeline()

    # Split exact as in notebook Cell 42
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")

    print("Training soft voting ensemble model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    ens_acc = float(accuracy_score(y_test, y_pred))
    ens_prec = float(precision_score(y_test, y_pred, zero_division=0))
    ens_rec = float(recall_score(y_test, y_pred, zero_division=0))
    ens_f1 = float(f1_score(y_test, y_pred, zero_division=0))
    ens_roc_auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()
    clf_report = classification_report(y_test, y_pred, output_dict=True)

    print("\n--- Ensemble Evaluation Results ---")
    print(f"Accuracy:  {ens_acc:.4f}")
    print(f"Precision: {ens_prec:.4f}")
    print(f"Recall:    {ens_rec:.4f}")
    print(f"F1-Score:  {ens_f1:.4f}")
    print(f"ROC-AUC:   {ens_roc_auc:.4f}")
    print(f"Confusion Matrix: {cm}")

    # Evaluate individual base models
    preprocessor = model.named_steps['preprocessor']
    base_models = {
        'Logistic Regression': LogisticRegression(solver='liblinear', random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(eval_metric='logloss', random_state=42)
    }

    base_metrics = {}
    for name, clf in base_models.items():
        pipe = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', clf)])
        pipe.fit(X_train, y_train)
        p_pred = pipe.predict(X_test)
        p_prob = pipe.predict_proba(X_test)[:, 1]
        base_metrics[name] = {
            'accuracy': round(float(accuracy_score(y_test, p_pred)), 4),
            'precision': round(float(precision_score(y_test, p_pred, zero_division=0)), 4),
            'recall': round(float(recall_score(y_test, p_pred, zero_division=0)), 4),
            'f1_score': round(float(f1_score(y_test, p_pred, zero_division=0)), 4),
            'roc_auc': round(float(roc_auc_score(y_test, p_prob)), 4)
        }

    # Extract feature importances and coefficients
    feature_names = preprocessor.get_feature_names_out().tolist()
    rf_estimator = model.named_steps['classifier'].estimators_[1]
    xgb_estimator = model.named_steps['classifier'].estimators_[2]
    lr_estimator = model.named_steps['classifier'].estimators_[0]

    feature_importances = []
    for idx, fname in enumerate(feature_names):
        clean_name = fname.replace('num__', '').replace('cat__', '')
        feature_importances.append({
            'feature': clean_name,
            'raw_name': fname,
            'rf_importance': round(float(rf_estimator.feature_importances_[idx]), 4),
            'xgb_importance': round(float(xgb_estimator.feature_importances_[idx]), 4),
            'lr_coefficient': round(float(lr_estimator.coef_[0][idx]), 4)
        })
    feature_importances.sort(key=lambda x: x['rf_importance'], reverse=True)

    # Define verified sample cases from the clinical dataset
    sample_cases = [
        {
            'id': 'case-1-dust-short',
            'title': 'Example 1: Young Adult, Dust Allergy',
            'description': '30yo female with dust allergy, 2nd gen antihistamine, short term use.',
            'patient_data': {
                'Age': 30,
                'Gender': 'Female',
                'Allergy_Type': 'Dust',
                'Duration_Allergy': 60,
                'Antihistamine_Type': '2nd_gen',
                'Co_morbidities': 'None',
                'Previous_Use': 'short_term'
            },
            'expected_class': 1
        },
        {
            'id': 'case-2-seasonal-long',
            'title': 'Example 2: Chronic Allergy & Asthma',
            'description': '55yo male with seasonal allergy, asthma, 1st gen antihistamine, long term use.',
            'patient_data': {
                'Age': 55,
                'Gender': 'Male',
                'Allergy_Type': 'Seasonal',
                'Duration_Allergy': 200,
                'Antihistamine_Type': '1st_gen',
                'Co_morbidities': 'asthma',
                'Previous_Use': 'long_term'
            },
            'expected_class': 1
        },
        {
            'id': 'case-3-responsive',
            'title': 'Example 3: Responsive Patient (Short Exposure)',
            'description': '25yo female with mild dust allergy, 18-day duration, eczema, short term 2nd gen antihistamine.',
            'patient_data': {
                'Age': 25,
                'Gender': 'Female',
                'Allergy_Type': 'Dust',
                'Duration_Allergy': 18,
                'Antihistamine_Type': '2nd_gen',
                'Co_morbidities': 'eczema',
                'Previous_Use': 'short_term'
            },
            'expected_class': 0
        }
    ]

    metadata = {
        'model_name': 'Antihistamine Resistance Soft Voting Classifier',
        'pipeline_steps': ['StandardScaler (Numerical)', 'OneHotEncoder (Categorical)', 'VotingClassifier (Soft)'],
        'algorithms': [
            {'name': 'Logistic Regression', 'weight': 0.2, 'solver': 'liblinear'},
            {'name': 'Random Forest Classifier', 'weight': 0.4, 'n_estimators': 100},
            {'name': 'XGBoost Classifier', 'weight': 0.4, 'eval_metric': 'logloss'}
        ],
        'ensemble_metrics': {
            'accuracy': round(ens_acc, 4),
            'precision': round(ens_prec, 4),
            'recall': round(ens_rec, 4),
            'f1_score': round(ens_f1, 4),
            'roc_auc': round(ens_roc_auc, 4),
            'confusion_matrix': cm,
            'classification_report': clf_report,
            'test_sample_count': len(y_test),
            'train_sample_count': len(y_train)
        },
        'base_model_metrics': base_metrics,
        'feature_importances': feature_importances,
        'feature_schema': {
            'numerical': {
                'Age': {'min': int(df_cleaned['Age'].min()), 'max': int(df_cleaned['Age'].max()), 'default': 30},
                'Duration_Allergy': {'min': int(df_cleaned['Duration_Allergy'].min()), 'max': int(df_cleaned['Duration_Allergy'].max()), 'default': 60}
            },
            'categorical': {
                'Gender': sorted(df_cleaned['Gender'].unique().tolist()),
                'Allergy_Type': sorted(df_cleaned['Allergy_Type'].unique().tolist()),
                'Antihistamine_Type': sorted(df_cleaned['Antihistamine_Type'].unique().tolist()),
                'Co_morbidities': sorted(df_cleaned['Co_morbidities'].unique().tolist()) + ['None'],
                'Previous_Use': sorted(df_cleaned['Previous_Use'].unique().tolist())
            }
        },
        'sample_cases': sample_cases
    }

    # Save pipeline joblib
    pipeline_file = output_path / 'antihistamine_pipeline.joblib'
    joblib.dump(model, pipeline_file)
    print(f"Saved pipeline to {pipeline_file}")

    # Save metadata JSON
    metadata_file = output_path / 'model_metadata.json'
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {metadata_file}")

    return pipeline_file, metadata_file

if __name__ == '__main__':
    project_root = Path(__file__).resolve().parent.parent
    data_file = project_root / 'data' / 'antihistamine_resistance_dataset.csv'
    artifacts_dir = project_root / 'backend' / 'artifacts'
    train_and_evaluate(str(data_file), str(artifacts_dir))
