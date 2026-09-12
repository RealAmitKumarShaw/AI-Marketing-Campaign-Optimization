from src.revenue_predictor import predict_revenue

# Sample campaign data
campaign = {
    "campaign_objective": "Conversions",
    "platform": "Facebook",
    "ad_placement": "Feed",
    "device_type": "Mobile",
    "operating_system": "Android",
    "creative_format": "Image",
    "creative_size": "1080x1080",
    "ad_copy_length": "Short",
    "has_call_to_action": True,
    "creative_emotion": "Trust",
    "creative_age_days": 10,
    "target_audience_age": "18-24",
    "target_audience_gender": "All",
    "audience_interest_category": "Technology",
    "income_bracket": "$50K-$100K",
    "purchase_intent_score": 0.7,
    "retargeting_flag": False,
    "start_date": "2026-01-15",
    "quarter": "Q1",
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
    "CPA": 37.5
}

prediction = predict_revenue(campaign)

print("=" * 50)
print("REVENUE MODEL TEST")
print("=" * 50)
print(f"Predicted Revenue: ${prediction:,.2f}")
print("✅ Prediction successful!")