"""
Flask API Blueprint
AI Marketing Campaign Optimization
Member 4: Optimization, Recommendation & Web Dashboard
"""

from flask import Blueprint, jsonify, request
from src.predictor_engine import predict_campaign, get_all_models_status
from src.campaign_optimizer import optimize_campaign
from src.campaign_comparison import compute_what_if_analysis, compare_campaign_list
from src.dataset_analytics import (
    get_categorical_options,
    get_platform_benchmarks,
    get_dashboard_overview_data,
    get_sample_campaign,
)

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/health", methods=["GET"])
def health_check():
    """System health check and loaded model status."""
    try:
        models_status = get_all_models_status()
        return jsonify({
            "status": "healthy",
            "message": "AI Marketing Campaign Optimization API is online and operational.",
            "models": models_status,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Health check failed: {str(e)}",
        }), 500


@api_bp.route("/campaign-options", methods=["GET"])
def get_options():
    """Returns valid categorical dropdown options from dataset."""
    try:
        options = get_categorical_options()
        return jsonify({
            "status": "success",
            "options": options,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve campaign options: {str(e)}",
        }), 500


@api_bp.route("/benchmarks", methods=["GET"])
def get_benchmarks():
    """Returns platform and channel benchmarks."""
    try:
        benchmarks = get_platform_benchmarks()
        return jsonify({
            "status": "success",
            "benchmarks": benchmarks,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve benchmarks: {str(e)}",
        }), 500


@api_bp.route("/dashboard-overview", methods=["GET"])
def get_dashboard_data():
    """Returns aggregated KPIs and historical metrics for the dashboard."""
    try:
        data = get_dashboard_overview_data()
        return jsonify({
            "status": "success",
            "data": data,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve dashboard overview data: {str(e)}",
        }), 500


@api_bp.route("/sample-campaigns", methods=["GET"])
def get_samples():
    """Returns realistic pre-filled campaign examples."""
    try:
        samples = {
            "standard": get_sample_campaign("standard"),
            "ecommerce": get_sample_campaign("ecommerce"),
            "b2b": get_sample_campaign("b2b"),
        }
        return jsonify({
            "status": "success",
            "samples": samples,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve sample campaigns: {str(e)}",
        }), 500


@api_bp.route("/predict", methods=["POST"])
def run_prediction():
    """
    Predicts ROI, Revenue, Conversions, and Success Probability for a single campaign.
    """
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({
            "status": "error",
            "message": "Invalid JSON payload in request body.",
        }), 400

    try:
        results = predict_campaign(payload)
        return jsonify({
            "status": "success",
            "prediction": results,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Campaign prediction failed: {str(e)}",
        }), 500


@api_bp.route("/optimize", methods=["POST"])
def run_optimization():
    """
    Evaluates candidate variations and provides AI recommendations and explainability.
    """
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({
            "status": "error",
            "message": "Invalid JSON payload in request body.",
        }), 400

    priority = payload.get("priority", "balanced")
    campaign_config = payload.get("campaign", payload)

    try:
        results = optimize_campaign(campaign_config, priority=priority)
        return jsonify({
            "status": "success",
            "optimization": results,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Campaign optimization failed: {str(e)}",
        }), 500


@api_bp.route("/what-if", methods=["POST"])
def run_what_if():
    """
    Calculates differences and sensitivity between current and proposed campaigns.
    """
    payload = request.get_json(silent=True)
    if not payload or "current" not in payload or "proposed" not in payload:
        return jsonify({
            "status": "error",
            "message": "Request must contain 'current' and 'proposed' campaign objects.",
        }), 400

    try:
        results = compute_what_if_analysis(payload["current"], payload["proposed"])
        return jsonify({
            "status": "success",
            "analysis": results,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"What-if analysis failed: {str(e)}",
        }), 500


@api_bp.route("/compare", methods=["POST"])
def run_compare():
    """
    Compares 2 or more campaigns side-by-side.
    """
    payload = request.get_json(silent=True)
    if not payload or not isinstance(payload.get("campaigns"), list):
        return jsonify({
            "status": "error",
            "message": "Request must contain a 'campaigns' list with at least 2 campaign objects.",
        }), 400

    campaigns = payload["campaigns"]
    if len(campaigns) < 2:
        return jsonify({
            "status": "error",
            "message": "Comparison requires at least 2 campaign configurations.",
        }), 400

    try:
        results = compare_campaign_list(campaigns)
        return jsonify({
            "status": "success",
            "comparison": results,
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Campaign comparison failed: {str(e)}",
        }), 500
