"""
ROI Prediction Module
AI Marketing Campaign Optimization

Loads the trained ROI model (Random Forest Regressor) and preprocessor
and provides a reusable prediction function.
"""

from pathlib import Path
import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "best_roi_model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor.pkl"
INFO_PATH = PROJECT_ROOT / "models" / "roi_model_info.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"ROI model not found: {MODEL_PATH}")

if not PREPROCESSOR_PATH.exists():
    raise FileNotFoundError(f"ROI preprocessor not found: {PREPROCESSOR_PATH}")


# ============================================================
# LOAD MODEL AND PREPROCESSOR
# ============================================================

model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)
model_info = joblib.load(INFO_PATH) if INFO_PATH.exists() else {}


# ============================================================
# FEATURE DEFINITIONS
# ============================================================

CATEGORICAL_FEATURES = [
    "campaign_objective",
    "platform",
    "ad_placement",
    "device_type",
    "operating_system",
    "creative_format",
    "creative_size",
    "ad_copy_length",
    "creative_emotion",
    "target_audience_age",
    "target_audience_gender",
    "audience_interest_category",
    "income_bracket",
    "purchase_intent_score",
    "day_of_week",
    "industry_vertical",
    "budget_tier",
]

NUMERICAL_FEATURES = [
    "has_call_to_action",
    "creative_age_days",
    "retargeting_flag",
    "quarter",
    "hour_of_day",
    "campaign_day",
    "quality_score",
    "actual_cpc",
    "impressions",
    "clicks",
    "conversions",
    "ad_spend",
    "bounce_rate",
    "avg_session_duration_seconds",
    "pages_per_session",
    "CTR",
    "CPC",
    "conversion_rate",
    "CPA",
    "start_year",
    "start_month",
    "start_day",
]

EXPECTED_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def convert_quarter(value):
    if isinstance(value, str):
        v = value.strip().upper()
        mapping = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4}
        if v in mapping:
            return mapping[v]
        try:
            return float(v)
        except ValueError:
            return 1.0
    return float(value) if value is not None else 1.0


def prepare_roi_input(campaign_data):
    """
    Transform input dictionary or DataFrame into preprocessed features for ROI prediction.
    """
    if isinstance(campaign_data, dict):
        df = pd.DataFrame([campaign_data])
    elif isinstance(campaign_data, pd.DataFrame):
        df = campaign_data.copy()
    else:
        raise TypeError("campaign_data must be dict or DataFrame")

    data = df.copy()

    # Date parsing
    if "start_date" in data.columns and (
        "start_year" not in data.columns
        or "start_month" not in data.columns
        or "start_day" not in data.columns
    ):
        data["start_date"] = pd.to_datetime(data["start_date"], errors="coerce")
        data["start_year"] = data["start_date"].dt.year.fillna(2025).astype(int)
        data["start_month"] = data["start_date"].dt.month.fillna(6).astype(int)
        data["start_day"] = data["start_date"].dt.day.fillna(15).astype(int)

    if "start_date" in data.columns:
        data = data.drop(columns=["start_date"])

    # Boolean flags
    for col in ["has_call_to_action", "retargeting_flag"]:
        if col in data.columns:
            data[col] = data[col].astype(int)
        else:
            data[col] = 0

    # Quarter
    if "quarter" in data.columns:
        data["quarter"] = data["quarter"].apply(convert_quarter)
    else:
        data["quarter"] = 2.0

    # Clean numerical columns
    for col in NUMERICAL_FEATURES:
        if col in data.columns:
            data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0.0)
        else:
            data[col] = 0.0

    # Clean categorical columns
    for col in CATEGORICAL_FEATURES:
        if col in data.columns:
            data[col] = data[col].astype(str).str.strip()
        else:
            data[col] = "Unknown"

    # Drop leakage or identifier columns
    leakage = ["campaign_id", "ROI", "revenue", "profit", "ROAS", "Unnamed: 0"]
    present = [c for c in leakage if c in data.columns]
    if present:
        data = data.drop(columns=present)

    return data


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_roi(campaign_data):
    """
    Predict campaign ROI (%) using the trained Random Forest model.

    Parameters
    ----------
    campaign_data : dict or pd.DataFrame

    Returns
    -------
    float
        Predicted ROI percentage.
    """
    input_df = prepare_roi_input(campaign_data)
    processed = preprocessor.transform(input_df)
    pred = model.predict(processed)[0]
    return float(pred)


def get_roi_model_info():
    return {
        "model_name": "Tuned Random Forest Regressor",
        "target": "ROI",
        "metrics": model_info,
        "features": len(EXPECTED_FEATURES),
    }


if __name__ == "__main__":
    sample = {
        "campaign_objective": "Conversions",
        "platform": "Facebook",
        "ad_placement": "Feed",
        "device_type": "Mobile",
        "operating_system": "Android",
        "creative_format": "Image",
        "creative_size": "1080x1080",
        "ad_copy_length": "Short",
        "has_call_to_action": 1,
        "creative_emotion": "Trust",
        "creative_age_days": 10,
        "target_audience_age": "18-24",
        "target_audience_gender": "All",
        "audience_interest_category": "Technology",
        "income_bracket": "$50K-$100K",
        "purchase_intent_score": "High",
        "retargeting_flag": 0,
        "start_date": "2026-01-15",
        "quarter": 1,
        "day_of_week": "Thursday",
        "hour_of_day": 14,
        "campaign_day": 1,
        "quality_score": 8,
        "actual_cpc": 1.5,
        "impressions": 50000,
        "clicks": 2500,
        "conversions": 100,
        "ad_spend": 3750,
        "bounce_rate": 0.4,
        "avg_session_duration_seconds": 120,
        "pages_per_session": 3,
        "industry_vertical": "Technology",
        "budget_tier": "Medium",
        "CTR": 0.05,
        "CPC": 1.5,
        "conversion_rate": 0.04,
        "CPA": 37.5,
    }
    roi = predict_roi(sample)
    print(f"Predicted ROI: {roi:.2f}%")
