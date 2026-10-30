"""
Conversion Prediction Module

Loads the trained conversion prediction model and preprocessing pipeline
to predict the expected number of conversions for a marketing campaign.
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = PROJECT_ROOT / "models"

MODEL_PATH = MODEL_DIR / "conversion_model.pkl"
PREPROCESSOR_PATH = MODEL_DIR / "conversion_preprocessor.pkl"


# ============================================================
# CHECK MODEL FILES
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Conversion model not found: {MODEL_PATH}"
    )

if not PREPROCESSOR_PATH.exists():
    raise FileNotFoundError(
        f"Conversion preprocessor not found: {PREPROCESSOR_PATH}"
    )


# ============================================================
# LOAD MODEL AND PREPROCESSOR
# ============================================================

model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_conversions(campaign_data):
    """
    Predict the expected number of conversions.

    Parameters
    ----------
    campaign_data : dict or pandas.DataFrame
        Campaign features required by the trained model.

    Returns
    -------
    float
        Predicted number of conversions.
    """

    # --------------------------------------------------------
    # Convert dictionary input to DataFrame
    # --------------------------------------------------------

    if isinstance(campaign_data, dict):
        campaign_data = pd.DataFrame([campaign_data])

    elif isinstance(campaign_data, pd.DataFrame):
        campaign_data = campaign_data.copy()

    else:
        raise TypeError(
            "campaign_data must be a dictionary or pandas DataFrame"
        )

    data = campaign_data.copy()

    # --------------------------------------------------------
    # Date Feature Engineering
    # --------------------------------------------------------

    if "start_date" in data.columns:

        data["start_date"] = pd.to_datetime(
            data["start_date"],
            errors="coerce"
        )

        data["start_year"] = data["start_date"].dt.year
        data["start_month"] = data["start_date"].dt.month
        data["start_day"] = data["start_date"].dt.day

        data.drop(
            columns=["start_date"],
            inplace=True
        )

    # --------------------------------------------------------
    # Convert Boolean Flags to Integers
    # --------------------------------------------------------

    for column in ["has_call_to_action", "retargeting_flag"]:

        if column in data.columns:

            if data[column].dtype == bool:
                data[column] = data[column].astype(int)

    # --------------------------------------------------------
    # Remove Target and Leakage Columns
    # --------------------------------------------------------

    columns_to_remove = [
        "campaign_id",
        "conversions",
        "revenue",
        "conversion_rate",
        "CPA",
        "ROAS",
        "profit"
    ]

    columns_present = [
        column
        for column in columns_to_remove
        if column in data.columns
    ]

    if columns_present:
        data.drop(
            columns=columns_present,
            inplace=True
        )

    # --------------------------------------------------------
    # Preprocessing
    # --------------------------------------------------------

    processed_data = preprocessor.transform(data)

    # --------------------------------------------------------
    # Model Prediction
    # --------------------------------------------------------

    prediction_log = model.predict(processed_data)

    # --------------------------------------------------------
    # Reverse log1p Transformation
    # --------------------------------------------------------

    prediction = np.expm1(prediction_log)

    # --------------------------------------------------------
    # Conversions Cannot Be Negative
    # --------------------------------------------------------

    prediction = np.clip(
        prediction,
        0,
        None
    )

    return float(prediction[0])


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    sample_campaign = {

        # Categorical features
        "campaign_objective": "Brand Awareness",
        "platform": "Facebook",
        "ad_placement": "Feed",
        "device_type": "Desktop",
        "operating_system": "Windows",
        "creative_format": "Image",
        "creative_size": "1080x1080",
        "ad_copy_length": "Medium",
        "creative_emotion": "Positive",

        # Campaign settings
        "has_call_to_action": 1,
        "creative_age_days": 10,
        "target_audience_age": "25-34",
        "target_audience_gender": "All",
        "audience_interest_category": "Technology",
        "income_bracket": "Medium",
        "purchase_intent_score": "High",
        "retargeting_flag": 1,

        # Date
        "start_date": "2025-06-15",

        # Time / campaign information
        "quarter": 2,
        "day_of_week": "Sunday",
        "hour_of_day": 14,
        "campaign_day": 15,

        # Quality / cost
        "quality_score": 8,
        "actual_cpc": 1.5,

        # Performance features
        "impressions": 50000,
        "clicks": 2500,
        "ad_spend": 3750,

        # Website metrics
        "bounce_rate": 0.35,
        "avg_session_duration_seconds": 180,
        "pages_per_session": 4.2,

        # Campaign classification
        "industry_vertical": "Technology",
        "budget_tier": "Medium",

        # Calculated campaign metrics
        "CTR": 0.05,
        "CPC": 1.5
    }

    print("=" * 60)
    print("CONVERSION PREDICTION TEST")
    print("=" * 60)

    try:

        predicted_conversions = predict_conversions(
            sample_campaign
        )

        print(
            f"Predicted Conversions: "
            f"{predicted_conversions:.2f}"
        )

        print("✅ Prediction successful!")

    except Exception as e:

        print("❌ Prediction failed!")
        print(f"Error: {e}")