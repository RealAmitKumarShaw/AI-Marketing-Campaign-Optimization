"""
Campaign Comparison and What-If Analysis Engine
Member 4: Optimization, Recommendation & Web Dashboard
AI Marketing Campaign Optimization

Provides side-by-side comparison logic, delta calculations,
and what-if parameter sensitivity analysis using real ML models.
"""

from copy import deepcopy
from src.predictor_engine import predict_campaign, format_currency_inr


def calculate_safe_diff(val_new, val_old):
    """
    Computes absolute and percentage difference safely handling zero denominators.
    """
    diff_abs = round(float(val_new) - float(val_old), 2)
    if val_old != 0:
        pct_change = round((diff_abs / abs(val_old)) * 100.0, 1)
    else:
        pct_change = 100.0 if diff_abs > 0 else ( -100.0 if diff_abs < 0 else 0.0)

    return diff_abs, pct_change


def compute_what_if_analysis(current_campaign, proposed_campaign):
    """
    Runs real ML predictions for current and proposed campaigns,
    calculates exact absolute and percentage deltas, and returns comparison payload.
    """
    pred_current = predict_campaign(current_campaign)
    pred_current["scenario_name"] = "Current Baseline"

    pred_proposed = predict_campaign(proposed_campaign)
    pred_proposed["scenario_name"] = "Proposed Scenario"

    # Deltas
    roi_abs, roi_pct = calculate_safe_diff(pred_proposed["predicted_roi"], pred_current["predicted_roi"])
    rev_abs, rev_pct = calculate_safe_diff(pred_proposed["predicted_revenue"], pred_current["predicted_revenue"])
    cr_abs, cr_pct = calculate_safe_diff(pred_proposed["predicted_conversion_rate"], pred_current["predicted_conversion_rate"])
    sp_abs, sp_pct = calculate_safe_diff(pred_proposed["success_probability_percent"], pred_current["success_probability_percent"])
    spend_abs, spend_pct = calculate_safe_diff(pred_proposed["ad_spend"], pred_current["ad_spend"])
    conv_abs, conv_pct = calculate_safe_diff(pred_proposed["predicted_conversions"], pred_current["predicted_conversions"])
    profit_abs, profit_pct = calculate_safe_diff(pred_proposed["predicted_profit"], pred_current["predicted_profit"])

    # Determine overall assessment
    improvements = 0
    if roi_abs > 0: improvements += 1
    if rev_abs > 0: improvements += 1
    if cr_abs > 0: improvements += 1
    if sp_abs >= 0: improvements += 1
    if profit_abs > 0: improvements += 1

    if improvements >= 4:
        verdict = "Strongly Favorable — Proposed changes significantly boost performance and profitability."
        verdict_badge = "success"
    elif improvements >= 2:
        verdict = "Mixed Trade-off — Gains in certain metrics accompany trade-offs in spend or efficiency."
        verdict_badge = "warning"
    else:
        verdict = "Unfavorable — Proposed changes decrease expected returns or raise risk."
        verdict_badge = "danger"

    return {
        "current": pred_current,
        "proposed": pred_proposed,
        "deltas": {
            "roi": {
                "absolute": roi_abs,
                "absolute_formatted": f"{roi_abs:+.2f}%",
                "percentage": roi_pct,
                "percentage_formatted": f"{roi_pct:+.1f}%",
                "is_positive": bool(roi_abs > 0),
            },
            "revenue": {
                "absolute": rev_abs,
                "absolute_formatted": format_currency_inr(rev_abs),
                "percentage": rev_pct,
                "percentage_formatted": f"{rev_pct:+.1f}%",
                "is_positive": bool(rev_abs > 0),
            },
            "conversion_rate": {
                "absolute": cr_abs,
                "absolute_formatted": f"{cr_abs:+.2f}%",
                "percentage": cr_pct,
                "percentage_formatted": f"{cr_pct:+.1f}%",
                "is_positive": bool(cr_abs > 0),
            },
            "success_probability": {
                "absolute": sp_abs,
                "absolute_formatted": f"{sp_abs:+.1f}%",
                "percentage": sp_pct,
                "percentage_formatted": f"{sp_pct:+.1f}%",
                "is_positive": bool(sp_abs >= 0),
            },
            "ad_spend": {
                "absolute": spend_abs,
                "absolute_formatted": format_currency_inr(spend_abs),
                "percentage": spend_pct,
                "percentage_formatted": f"{spend_pct:+.1f}%",
            },
            "conversions": {
                "absolute": conv_abs,
                "percentage": conv_pct,
                "is_positive": bool(conv_abs > 0),
            },
            "profit": {
                "absolute": profit_abs,
                "absolute_formatted": format_currency_inr(profit_abs),
                "percentage": profit_pct,
                "is_positive": bool(profit_abs > 0),
            },
        },
        "verdict": verdict,
        "verdict_badge": verdict_badge,
    }


def compare_campaign_list(campaigns):
    """
    Compares 2 to 6 campaign configurations side-by-side using real ML models,
    scores each option, highlights the recommended configuration, and prepares
    visualization datasets for Chart.js.
    """
    if not campaigns:
        return {"campaigns": [], "recommended_index": -1}

    results = []
    for idx, c in enumerate(campaigns):
        name = c.get("campaign_name", f"Campaign {chr(65 + idx)}")
        c_copy = deepcopy(c)
        c_copy["campaign_name"] = name
        pred = predict_campaign(c_copy)
        pred["index"] = idx
        results.append(pred)

    # Compute comparative composite score to identify recommended option
    rois = [x["predicted_roi"] for x in results]
    revs = [x["predicted_revenue"] for x in results]
    sps = [x["success_probability"] for x in results]
    crs = [x["predicted_conversion_rate"] for x in results]

    min_roi, max_roi = min(rois), max(rois)
    min_rev, max_rev = min(revs), max(revs)
    min_sp, max_sp = min(sps), max(sps)
    min_cr, max_cr = min(crs), max(crs)

    for item in results:
        n_roi = (item["predicted_roi"] - min_roi) / (max_roi - min_roi) if max_roi > min_roi else 1.0
        n_rev = (item["predicted_revenue"] - min_rev) / (max_rev - min_rev) if max_rev > min_rev else 1.0
        n_sp = (item["success_probability"] - min_sp) / (max_sp - min_sp) if max_sp > min_sp else 1.0
        n_cr = (item["predicted_conversion_rate"] - min_cr) / (max_cr - min_cr) if max_cr > min_cr else 1.0

        item["score"] = round((0.35 * n_sp + 0.30 * n_roi + 0.20 * n_rev + 0.15 * n_cr) * 100.0, 1)

    # Winner has highest score
    best_item = max(results, key=lambda x: x["score"])
    best_index = best_item["index"]

    for item in results:
        item["is_recommended"] = bool(item["index"] == best_index)

    # Prepare chart-ready series
    chart_data = {
        "labels": [x["campaign_name"] for x in results],
        "roi_series": [x["predicted_roi"] for x in results],
        "revenue_series": [x["predicted_revenue"] for x in results],
        "conversion_rate_series": [x["predicted_conversion_rate"] for x in results],
        "success_prob_series": [x["success_probability_percent"] for x in results],
        "conversions_series": [x["predicted_conversions"] for x in results],
        "spend_series": [x["ad_spend"] for x in results],
    }

    return {
        "campaigns": results,
        "recommended_index": best_index,
        "recommended_name": best_item["campaign_name"],
        "chart_data": chart_data,
    }
