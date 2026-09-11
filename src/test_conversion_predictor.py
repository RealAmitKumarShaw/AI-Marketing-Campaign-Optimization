from src.conversion_predictor import predict_conversions


sample_campaign = {
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
    "clicks": 2500,
    "ad_spend": 3750,
    "bounce_rate": 0.35,
    "avg_session_duration_seconds": 180,
    "pages_per_session": 4.2,
    "industry_vertical": "Technology",
    "budget_tier": "Medium",
    "CTR": 0.05,
    "CPC": 1.5
}


print("=" * 60)
print("CONVERSION MODEL TEST")
print("=" * 60)

prediction = predict_conversions(sample_campaign)

print(f"Predicted Conversions: {prediction:.2f}")

if prediction >= 0:
    print("✅ Prediction successful!")
else:
    print("❌ Invalid prediction!")