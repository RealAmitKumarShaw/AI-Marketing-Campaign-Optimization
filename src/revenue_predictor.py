"""
Revenue Prediction Module
AI Marketing Campaign Optimization

Loads the trained revenue model and preprocessor
and provides a reusable prediction function.

IMPORTANT:
The feature types MUST match the training notebook.
"""

from pathlib import Path
import joblib
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_ROOT / "models" / "revenue_model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "revenue_preprocessor.pkl"


# ============================================================
# LOAD MODEL AND PREPROCESSOR
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Revenue model not found:\n{MODEL_PATH}"
    )

if not PREPROCESSOR_PATH.exists():
    raise FileNotFoundError(
        f"Revenue preprocessor not found:\n{PREPROCESSOR_PATH}"
    )


model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)


# ============================================================
# EXACT FEATURE ORDER
# ============================================================

EXPECTED_FEATURES = [
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
    "clicks",
    "conversions",
    "ad_spend",
    "bounce_rate",
    "avg_session_duration_seconds",
    "pages_per_session",
    "industry_vertical",
    "budget_tier",
    "CTR",
    "CPC",
    "conversion_rate",
    "CPA",
    "start_year",
    "start_month",
    "start_day"
]


# ============================================================
# CATEGORICAL FEATURES
# EXACTLY AS TRAINING NOTEBOOK
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
    "budget_tier"
]


# ============================================================
# NUMERICAL FEATURES
# EXACTLY AS TRAINING NOTEBOOK
# ============================================================

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
    "start_day"
]


# ============================================================
# REQUIRED INPUT FEATURES
# ============================================================

REQUIRED_INPUT_FEATURES = [
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
    "start_date",
    "quarter",
    "day_of_week",
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
    "industry_vertical",
    "budget_tier",
    "CTR",
    "CPC",
    "conversion_rate",
    "CPA"
]


# ============================================================
# QUARTER CONVERSION
# ============================================================

def convert_quarter(value):
    """
    Convert Q1/Q2/Q3/Q4 into numeric values.

    Q1 -> 1
    Q2 -> 2
    Q3 -> 3
    Q4 -> 4
    """

    if isinstance(value, str):

        value = value.strip().upper()

        quarter_mapping = {
            "Q1": 1,
            "Q2": 2,
            "Q3": 3,
            "Q4": 4
        }

        if value in quarter_mapping:
            return quarter_mapping[value]

        try:
            return float(value)
        except ValueError:

            raise ValueError(
                f"Invalid quarter: {value}. "
                f"Use Q1, Q2, Q3 or Q4."
            )

    return float(value)


# ============================================================
# VALIDATE INPUT
# ============================================================

def validate_input(campaign_data):
    """
    Validate campaign input.
    """

    if not isinstance(campaign_data, dict):

        raise TypeError(
            "campaign_data must be a dictionary."
        )

    missing = [
        feature
        for feature in REQUIRED_INPUT_FEATURES
        if feature not in campaign_data
    ]

    if missing:

        raise ValueError(
            "Missing required features:\n"
            + "\n".join(
                f" - {feature}"
                for feature in missing
            )
        )


# ============================================================
# PREPARE INPUT
# ============================================================

def prepare_input(campaign_data):
    """
    Prepare input to EXACTLY match the training pipeline.
    """

    validate_input(campaign_data)

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    input_df = pd.DataFrame([campaign_data])

    # --------------------------------------------------------
    # DATE FEATURE ENGINEERING
    # --------------------------------------------------------

    input_df["start_date"] = pd.to_datetime(
        input_df["start_date"],
        errors="coerce"
    )

    if input_df["start_date"].isna().any():

        raise ValueError(
            "Invalid start_date.\n"
            "Expected format: YYYY-MM-DD\n"
            "Example: 2026-01-15"
        )

    input_df["start_year"] = (
        input_df["start_date"].dt.year
    )

    input_df["start_month"] = (
        input_df["start_date"].dt.month
    )

    input_df["start_day"] = (
        input_df["start_date"].dt.day
    )

    # Remove original date
    input_df.drop(
        columns=["start_date"],
        inplace=True
    )

    # --------------------------------------------------------
    # BOOLEAN FEATURES
    # --------------------------------------------------------

    input_df["has_call_to_action"] = (
        input_df["has_call_to_action"]
        .astype(int)
    )

    input_df["retargeting_flag"] = (
        input_df["retargeting_flag"]
        .astype(int)
    )

    # --------------------------------------------------------
    # QUARTER
    # --------------------------------------------------------

    input_df["quarter"] = (
        input_df["quarter"]
        .apply(convert_quarter)
    )

    # --------------------------------------------------------
    # NUMERICAL FEATURES
    # --------------------------------------------------------

    for column in NUMERICAL_FEATURES:

        input_df[column] = pd.to_numeric(
            input_df[column],
            errors="coerce"
        )

    # --------------------------------------------------------
    # CATEGORICAL FEATURES
    #
    # IMPORTANT:
    # Keep these as strings.
    #
    # purchase_intent_score is categorical according
    # to the training notebook.
    # --------------------------------------------------------

    for column in CATEGORICAL_FEATURES:

        input_df[column] = (
            input_df[column]
            .astype(str)
            .str.strip()
        )

    # --------------------------------------------------------
    # CHECK NUMERICAL VALUES
    # --------------------------------------------------------

    invalid_numeric = []

    for column in NUMERICAL_FEATURES:

        if input_df[column].isna().any():

            invalid_numeric.append(column)

    if invalid_numeric:

        raise ValueError(
            "Invalid numerical values found:\n"
            + "\n".join(
                f" - {column}"
                for column in invalid_numeric
            )
        )

    # --------------------------------------------------------
    # CHECK CATEGORICAL VALUES
    # --------------------------------------------------------

    invalid_categorical = []

    for column in CATEGORICAL_FEATURES:

        if input_df[column].isna().any():

            invalid_categorical.append(column)

    if invalid_categorical:

        raise ValueError(
            "Invalid categorical values found:\n"
            + "\n".join(
                f" - {column}"
                for column in invalid_categorical
            )
        )

    # --------------------------------------------------------
    # CHECK FEATURE COUNT
    # --------------------------------------------------------

    if len(input_df.columns) != len(EXPECTED_FEATURES):

        raise ValueError(
            f"Incorrect number of features.\n"
            f"Expected: {len(EXPECTED_FEATURES)}\n"
            f"Received: {len(input_df.columns)}"
        )

    # --------------------------------------------------------
    # EXACT TRAINING FEATURE ORDER
    # --------------------------------------------------------

    input_df = input_df[
        EXPECTED_FEATURES
    ].copy()

    return input_df


# ============================================================
# PREDICT REVENUE
# ============================================================

def predict_revenue(campaign_data):
    """
    Predict campaign revenue.

    Parameters
    ----------
    campaign_data : dict
        Campaign input features.

    Returns
    -------
    float
        Predicted revenue.
    """

    # Prepare input
    input_df = prepare_input(
        campaign_data
    )

    # --------------------------------------------------------
    # PREPROCESS
    # --------------------------------------------------------

    try:

        processed_input = (
            preprocessor.transform(
                input_df
            )
        )

    except Exception as error:

        print("\n" + "=" * 70)
        print("REVENUE PREPROCESSING ERROR")
        print("=" * 70)

        print(
            "\nInput shape:",
            input_df.shape
        )

        print(
            "\nInput columns:"
        )

        for column in input_df.columns:

            print(
                f" - {column}: "
                f"{input_df[column].iloc[0]!r} "
                f"({input_df[column].dtype})"
            )

        print(
            "\nNumerical features:",
            len(NUMERICAL_FEATURES)
        )

        print(
            "Categorical features:",
            len(CATEGORICAL_FEATURES)
        )

        print(
            "\nOriginal error:"
        )

        print(error)

        print("=" * 70)

        raise

    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    prediction = model.predict(
        processed_input
    )[0]

    # Revenue cannot be negative
    prediction = max(
        0.0,
        float(prediction)
    )

    return prediction


# ============================================================
# MODEL INFORMATION
# ============================================================

def get_model_info():

    return {
        "model": type(model).__name__,
        "preprocessor": type(preprocessor).__name__,
        "model_path": str(MODEL_PATH),
        "preprocessor_path": str(PREPROCESSOR_PATH),
        "total_features": len(EXPECTED_FEATURES),
        "numerical_features": len(NUMERICAL_FEATURES),
        "categorical_features": len(CATEGORICAL_FEATURES)
    }


# ============================================================
# MODULE TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("REVENUE PREDICTION MODULE")
    print("=" * 70)

    print(
        f"\nModel: {type(model).__name__}"
    )

    print(
        f"Preprocessor: {type(preprocessor).__name__}"
    )

    print(
        f"Total features: {len(EXPECTED_FEATURES)}"
    )

    print(
        f"Numerical features: {len(NUMERICAL_FEATURES)}"
    )

    print(
        f"Categorical features: {len(CATEGORICAL_FEATURES)}"
    )

    print(
        "\n✅ Revenue prediction module loaded successfully."
    )