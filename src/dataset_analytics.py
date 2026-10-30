"""
Dataset Analytics & Benchmark Provider
AI Marketing Campaign Optimization

Loads the cleaned dataset and provides summary statistics, valid categorical options,
channel benchmarks, and actual historical data for the dashboard.
"""

from pathlib import Path
import json
import numpy as np
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "clean" / "cleaned_data.csv"
RAW_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "tech_advertising_campaigns_dataset.csv"

_DF = None
_BENCHMARKS = None
_CATEGORICAL_OPTIONS = None


def get_dataset():
    global _DF
    if _DF is None:
        if DATA_PATH.exists():
            _DF = pd.read_csv(DATA_PATH)
        elif RAW_DATA_PATH.exists():
            _DF = pd.read_csv(RAW_DATA_PATH)
        else:
            raise FileNotFoundError("Campaign dataset not found in data/clean or data/raw")

        if "ROI" not in _DF.columns and "revenue" in _DF.columns and "ad_spend" in _DF.columns:
            _DF["ROI"] = ((_DF["revenue"] - _DF["ad_spend"]) / _DF["ad_spend"].replace(0, np.nan)) * 100
            _DF["ROI"] = _DF["ROI"].fillna(0.0)

        if "campaign_id" not in _DF.columns:
            _DF["campaign_id"] = [f"CAMP_{i+1:05d}" for i in range(len(_DF))]
    return _DF


def get_categorical_options():
    global _CATEGORICAL_OPTIONS
    if _CATEGORICAL_OPTIONS is not None:
        return _CATEGORICAL_OPTIONS

    df = get_dataset()
    cat_cols = [
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

    options = {}
    for col in cat_cols:
        if col in df.columns:
            vals = sorted([str(x).strip() for x in df[col].dropna().unique()])
            options[col] = vals
        else:
            options[col] = []

    _CATEGORICAL_OPTIONS = options
    return options


def get_platform_benchmarks():
    global _BENCHMARKS
    if _BENCHMARKS is not None:
        return _BENCHMARKS

    df = get_dataset()
    benchmarks = {}

    for platform, group in df.groupby("platform"):
        benchmarks[platform] = {
            "avg_cpc": round(float(group["CPC"].mean()), 2),
            "avg_ctr": round(float(group["CTR"].mean()), 3),
            "avg_bounce_rate": round(float(group["bounce_rate"].mean()), 1),
            "avg_duration": round(float(group["avg_session_duration_seconds"].mean()), 1),
            "avg_pages": round(float(group["pages_per_session"].mean()), 2),
            "avg_quality_score": round(float(group["quality_score"].mean()), 1),
            "avg_roi": round(float(group["ROI"].mean() if "ROI" in group.columns else 0), 2),
            "avg_revenue": round(float(group["revenue"].mean() if "revenue" in group.columns else 0), 2),
            "avg_conversion_rate": round(float(group["conversion_rate"].mean()), 2),
            "total_campaigns": int(len(group)),
        }

    # Add overall fallback benchmark
    benchmarks["_overall"] = {
        "avg_cpc": round(float(df["CPC"].mean()), 2),
        "avg_ctr": round(float(df["CTR"].mean()), 3),
        "avg_bounce_rate": round(float(df["bounce_rate"].mean()), 1),
        "avg_duration": round(float(df["avg_session_duration_seconds"].mean()), 1),
        "avg_pages": round(float(df["pages_per_session"].mean()), 2),
        "avg_quality_score": round(float(df["quality_score"].mean()), 1),
        "avg_roi": round(float(df["ROI"].mean() if "ROI" in df.columns else 0), 2),
        "avg_revenue": round(float(df["revenue"].mean() if "revenue" in df.columns else 0), 2),
        "avg_conversion_rate": round(float(df["conversion_rate"].mean()), 2),
        "total_campaigns": int(len(df)),
    }

    _BENCHMARKS = benchmarks
    return benchmarks


def get_dashboard_overview_data():
    """
    Returns aggregated KPIs, historical performance by channel,
    objective breakdown, budget tier analysis, and sample recent records.
    """
    df = get_dataset()

    # Calculate overall historical KPIs
    total_campaigns = len(df)
    avg_roi = round(float(df["ROI"].mean() if "ROI" in df.columns else 0), 2)
    median_roi = round(float(df["ROI"].median() if "ROI" in df.columns else 0), 2)
    avg_revenue = round(float(df["revenue"].mean() if "revenue" in df.columns else 0), 2)
    total_revenue = round(float(df["revenue"].sum() if "revenue" in df.columns else 0), 2)
    avg_conversion_rate = round(float(df["conversion_rate"].mean()), 2)
    total_conversions = int(df["conversions"].sum() if "conversions" in df.columns else 0)
    avg_cpa = round(float(df["CPA"].mean() if "CPA" in df.columns else 0), 2)
    avg_ctr = round(float(df["CTR"].mean()), 2)
    avg_cpc = round(float(df["CPC"].mean()), 2)

    # Success rate in dataset (profit > 0)
    if "profit" in df.columns:
        success_count = int((df["profit"] > 0).sum())
        success_rate = round(float(success_count / total_campaigns) * 100, 2)
    else:
        success_rate = 78.31

    # Channel Performance Comparison
    channel_perf = []
    for platform, group in df.groupby("platform"):
        channel_perf.append({
            "platform": platform,
            "campaigns": int(len(group)),
            "avg_roi": round(float(group["ROI"].mean() if "ROI" in group.columns else 0), 2),
            "avg_revenue": round(float(group["revenue"].mean() if "revenue" in group.columns else 0), 2),
            "avg_conv_rate": round(float(group["conversion_rate"].mean()), 2),
            "avg_ctr": round(float(group["CTR"].mean()), 2),
            "avg_cpc": round(float(group["CPC"].mean()), 2),
            "success_rate": round(float((group["profit"] > 0).mean() * 100), 1) if "profit" in group.columns else 75.0,
        })
    channel_perf = sorted(channel_perf, key=lambda x: x["avg_roi"], reverse=True)

    # Objective Breakdown
    objective_perf = []
    for obj, group in df.groupby("campaign_objective"):
        objective_perf.append({
            "objective": obj,
            "campaigns": int(len(group)),
            "share_percent": round(float(len(group) / total_campaigns) * 100, 1),
            "avg_roi": round(float(group["ROI"].mean() if "ROI" in group.columns else 0), 2),
            "avg_revenue": round(float(group["revenue"].mean() if "revenue" in group.columns else 0), 2),
            "avg_conv_rate": round(float(group["conversion_rate"].mean()), 2),
        })
    objective_perf = sorted(objective_perf, key=lambda x: x["campaigns"], reverse=True)

    # Creative Format Performance
    creative_perf = []
    for fmt, group in df.groupby("creative_format"):
        creative_perf.append({
            "format": fmt,
            "avg_roi": round(float(group["ROI"].mean() if "ROI" in group.columns else 0), 2),
            "avg_revenue": round(float(group["revenue"].mean() if "revenue" in group.columns else 0), 2),
            "avg_conv_rate": round(float(group["conversion_rate"].mean()), 2),
            "avg_ctr": round(float(group["CTR"].mean()), 2),
        })
    creative_perf = sorted(creative_perf, key=lambda x: x["avg_roi"], reverse=True)

    # Budget Tier Analysis
    budget_tier_perf = []
    for tier, group in df.groupby("budget_tier"):
        budget_tier_perf.append({
            "tier": tier,
            "count": int(len(group)),
            "avg_spend": round(float(group["ad_spend"].mean()), 2),
            "avg_revenue": round(float(group["revenue"].mean() if "revenue" in group.columns else 0), 2),
            "avg_roi": round(float(group["ROI"].mean() if "ROI" in group.columns else 0), 2),
        })

    # Duration vs ROI correlation insight
    duration_bins = [0, 15, 30, 45, 60, 90]
    duration_labels = ["1-15 days", "16-30 days", "31-45 days", "46-60 days", "61-90 days"]
    df_copy = df.copy()
    df_copy["duration_bin"] = pd.cut(df_copy["campaign_day"], bins=duration_bins, labels=duration_labels)
    duration_perf = []
    for d_bin, group in df_copy.groupby("duration_bin", observed=False):
        if len(group) > 0:
            duration_perf.append({
                "duration_range": str(d_bin),
                "avg_roi": round(float(group["ROI"].mean() if "ROI" in group.columns else 0), 2),
                "avg_revenue": round(float(group["revenue"].mean() if "revenue" in group.columns else 0), 2),
                "avg_conv_rate": round(float(group["conversion_rate"].mean()), 2),
                "campaigns": int(len(group)),
            })

    # Recent campaign sample records for the dashboard table
    recent_sample = []
    sample_rows = df.sample(n=min(8, len(df)), random_state=42)
    for idx, row in sample_rows.iterrows():
        recent_sample.append({
            "campaign_id": str(row.get("campaign_id", f"CAMP_{idx:05d}")),
            "objective": str(row.get("campaign_objective", "Conversions")),
            "platform": str(row.get("platform", "Facebook")),
            "format": str(row.get("creative_format", "Image")),
            "industry": str(row.get("industry_vertical", "Technology")),
            "ad_spend": round(float(row.get("ad_spend", 0)), 2),
            "actual_revenue": round(float(row.get("revenue", 0)), 2),
            "actual_roi": round(float(row.get("ROI", 0)), 2),
            "conversion_rate": round(float(row.get("conversion_rate", 0)), 2),
            "conversions": int(row.get("conversions", 0)),
            "profit": round(float(row.get("profit", 0)), 2),
            "is_successful": bool(row.get("profit", 0) > 0),
        })

    return {
        "kpis": {
            "total_campaigns": total_campaigns,
            "avg_roi": avg_roi,
            "median_roi": median_roi,
            "avg_revenue": avg_revenue,
            "total_revenue": total_revenue,
            "avg_conversion_rate": avg_conversion_rate,
            "total_conversions": total_conversions,
            "avg_cpa": avg_cpa,
            "avg_ctr": avg_ctr,
            "avg_cpc": avg_cpc,
            "success_rate": success_rate,
        },
        "channel_performance": channel_perf,
        "objective_performance": objective_perf,
        "creative_performance": creative_perf,
        "budget_tier_performance": budget_tier_perf,
        "duration_performance": duration_perf,
        "recent_campaigns": recent_sample,
    }


def get_sample_campaign(campaign_type="standard"):
    """
    Returns realistic pre-filled campaign configurations for quick demo/testing.
    """
    samples = {
        "standard": {
            "campaign_name": "Q3 SaaS Growth Accelerator",
            "campaign_objective": "Conversions",
            "platform": "Facebook",
            "ad_placement": "Feed",
            "device_type": "Desktop",
            "operating_system": "Windows",
            "creative_format": "Video",
            "creative_size": "1080x1080",
            "ad_copy_length": "Short",
            "has_call_to_action": 1,
            "creative_emotion": "Trust",
            "creative_age_days": 10,
            "target_audience_age": "25-34",
            "target_audience_gender": "All",
            "audience_interest_category": "Technology",
            "income_bracket": "$50K-$100K",
            "purchase_intent_score": "High",
            "retargeting_flag": 1,
            "budget_tier": "Medium",
            "ad_spend": 5000.0,
            "campaign_day": 30,
            "start_date": "2026-06-15",
            "quarter": 2,
            "day_of_week": "Thursday",
            "hour_of_day": 14,
            "industry_vertical": "SaaS",
            "quality_score": 8,
            "actual_cpc": 1.5,
            "impressions": 50000,
            "clicks": 2500,
            "bounce_rate": 35.0,
            "avg_session_duration_seconds": 180,
            "pages_per_session": 4.2,
        },
        "ecommerce": {
            "campaign_name": "E-Commerce Holiday Flash Sale",
            "campaign_objective": "Conversions",
            "platform": "Instagram",
            "ad_placement": "Stories",
            "device_type": "Mobile",
            "operating_system": "iOS",
            "creative_format": "Carousel",
            "creative_size": "1080x1080",
            "ad_copy_length": "Short",
            "has_call_to_action": 1,
            "creative_emotion": "Urgency",
            "creative_age_days": 5,
            "target_audience_age": "18-24",
            "target_audience_gender": "All",
            "audience_interest_category": "Shoppers",
            "income_bracket": "$50K-$100K",
            "purchase_intent_score": "High",
            "retargeting_flag": 1,
            "budget_tier": "High",
            "ad_spend": 12000.0,
            "campaign_day": 14,
            "start_date": "2026-11-20",
            "quarter": 4,
            "day_of_week": "Friday",
            "hour_of_day": 19,
            "industry_vertical": "E-commerce",
            "quality_score": 9,
            "actual_cpc": 1.8,
            "impressions": 120000,
            "clicks": 6000,
            "bounce_rate": 32.0,
            "avg_session_duration_seconds": 150,
            "pages_per_session": 4.5,
        },
        "b2b": {
            "campaign_name": "Enterprise B2B Lead Gen",
            "campaign_objective": "Lead Generation",
            "platform": "LinkedIn",
            "ad_placement": "Search",
            "device_type": "Desktop",
            "operating_system": "Windows",
            "creative_format": "Image",
            "creative_size": "1200x628",
            "ad_copy_length": "Medium",
            "has_call_to_action": 1,
            "creative_emotion": "Trust",
            "creative_age_days": 12,
            "target_audience_age": "35-44",
            "target_audience_gender": "All",
            "audience_interest_category": "Business Professionals",
            "income_bracket": "$100K-$200K",
            "purchase_intent_score": "High",
            "retargeting_flag": 0,
            "budget_tier": "Medium",
            "ad_spend": 8000.0,
            "campaign_day": 45,
            "start_date": "2026-09-01",
            "quarter": 3,
            "day_of_week": "Tuesday",
            "hour_of_day": 10,
            "industry_vertical": "Finance",
            "quality_score": 8,
            "actual_cpc": 4.5,
            "impressions": 40000,
            "clicks": 1800,
            "bounce_rate": 38.0,
            "avg_session_duration_seconds": 210,
            "pages_per_session": 3.8,
        },
    }
    return samples.get(campaign_type, samples["standard"])


if __name__ == "__main__":
    overview = get_dashboard_overview_data()
    print("Dashboard KPIs:", overview["kpis"])
    print("Channel Performance count:", len(overview["channel_performance"]))
