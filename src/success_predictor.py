"""
Campaign Success Prediction Module
AI Marketing Campaign Optimization

Loads the trained success classification model (Gradient Boosting Classifier)
and preprocessor to predict the campaign success probability (profit > 0).
"""

from pathlib import Path
import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "success_model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "success_preprocessor.pkl"
INFO_PATH = PROJECT_ROOT / "models" / "success_model_info.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Success model not found: {MODEL_PATH}")

if not PREPROCESSOR_PATH.exists():
    raise FileNotFoundError(f"Success preprocessor not found: {PREPROCESSOR_PATH}")


# ============================================================
# LOAD MODEL AND PREPROCESSOR
# ============================================================

model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)
model_info = joblib.load(INFO_PATH) if INFO_PATH.exists() else {}

SUCCESS_THRESHOLD = model_info.get("classification_threshold", 0.60)

EXPECTED_FEATURES = model_info.get("features", [
    "campaign_objective",
    "platform",
    "ad_placement",
    "device_type",
    "operating_system",
    "creative_format",
    "creative_size",
    "ad_copy_length",
    "has_call_to_action",
    "creative_emotion",
    "creative_age_days",
    "target_audience_age",
    "target_audience_gender",
    "audience_interest_category",
    "income_bracket",
    "purchase_intent_score",
    "retargeting_flag",
    "quarter",
    "day_of_week",
    "hour_of_day",
    "campaign_day",
    "quality_score",
    "actual_cpc",
    "impressions",
    "bounce_rate",
    "avg_session_duration_seconds",
    "pages_per_session",
    "industry_vertical",
    "budget_tier",
    "start_year",
    "start_month",
    "start_day",
])


# ============================================================
# PREPARATION & PREDICTION
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
            return 2.0
    return float(value) if value is not None else 2.0


def prepare_success_input(campaign_data):
    if isinstance(campaign_data, dict):
        df = pd.DataFrame([campaign_data])
    elif isinstance(campaign_data, pd.DataFrame):
        df = campaign_data.copy()
    else:
        raise TypeError("campaign_data must be dict or DataFrame")

    data = df.copy()

    # Date handling
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

    if "quarter" in data.columns:
        data["quarter"] = data["quarter"].apply(convert_quarter)
    else:
        data["quarter"] = 2.0

    # Ensure all required features are present
    for feature in EXPECTED_FEATURES:
        if feature not in data.columns:
            data[feature] = 0

    data = data[EXPECTED_FEATURES].copy()
    return data


def predict_success(campaign_data, threshold=None):
    """
    Predict campaign success probability and classification (profit > 0).

    Parameters
    ----------
    campaign_data : dict or pd.DataFrame
    threshold : float, optional
        Custom decision threshold (default = 0.60 as tuned by Member 3).

    Returns
    -------
    dict
        {
            "success_probability": float (0-1),
            "success_probability_percent": float (0-100),
            "is_successful": bool,
            "threshold": float,
            "definition": "profit > 0"
        }
    """
    th = threshold if threshold is not None else SUCCESS_THRESHOLD
    input_df = prepare_success_input(campaign_data)
    processed = preprocessor.transform(input_df)

    prob = model.predict_proba(processed)[0][1]
    is_success = bool(prob >= th)

    return {
        "success_probability": round(float(prob), 4),
        "success_probability_percent": round(float(prob) * 100, 2),
        "is_successful": is_success,
        "threshold": th,
        "definition": "profit > 0",
    }


def get_success_model_info():
    return {
        "model_name": model_info.get("model_name", "Gradient Boosting Classifier"),
        "success_definition": model_info.get("success_definition", "profit > 0"),
        "classification_threshold": SUCCESS_THRESHOLD,
        "accuracy_at_0.5": model_info.get("accuracy_at_0.5", 0.8965),
        "accuracy_at_0.6": model_info.get("accuracy_at_0.6", 0.8925),
        "total_features": len(EXPECTED_FEATURES),
    }


if __name__ == "__main__":
    sample = {
        "campaign_objective": "Brand Awareness",
        "platform": "Facebook",
        "ad_placement": "Feed",
        "device_type": "Desktop",
        "operating_system": "Windows",
        "creative_format": "Image",
        "creative_size": "1080x1080",
        "ad_copy_length": "Medium",
        "has_call_to_action": 1,
        "creative_emotion": "Positive",
        "creative_age_days": 10,
        "target_audience_age": "25-34",
        "target_audience_gender": "All",
        "audience_interest_category": "Technology",
        "income_bracket": "Medium",
        "purchase_intent_score": "High",
        "retargeting_flag": 1,
        "start_date": "2025-06-15",
        "quarter": 2,
        "day_of_week": "Sunday",
        "hour_of_day": 14,
        "campaign_day": 15,
        "quality_score": 8,
        "actual_cpc": 1.5,
        "impressions": 50000,
        "bounce_rate": 0.35,
        "avg_session_duration_seconds": 180,
        "pages_per_session": 4.2,
        "industry_vertical": "Technology",
        "budget_tier": "Medium",
    }
    res = predict_success(sample)
    print(f"Success Probability: {res['success_probability_percent']}% | Is Successful: {res['is_successful']}")
