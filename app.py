"""
AI Marketing Campaign Optimization & Prediction Platform
Flask Web Application & API Server
Member 4: Optimization, Recommendation & Web Dashboard
"""

import os
from pathlib import Path
from flask import Flask, render_template, send_from_directory, jsonify

from api.routes import api_bp
from src.dataset_analytics import get_categorical_options, get_sample_campaign, get_dashboard_overview_data
from src.predictor_engine import get_all_models_status

BASE_DIR = Path(__file__).resolve().parent

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static"),
)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "marketing-ai-optimizer-secret-key-2026")
app.config["JSON_SORT_KEYS"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.jinja_env.auto_reload = True


# Register API Blueprint
app.register_blueprint(api_bp)


# ============================================================
# TEMPLATE VIEW ROUTES
# ============================================================

@app.route("/")
def dashboard_overview():
    """Main Dashboard Overview with KPIs, performance charts, and summary."""
    options = get_categorical_options()
    sample = get_sample_campaign("standard")
    return render_template(
        "dashboard.html",
        active_page="overview",
        options=options,
        sample=sample,
    )


@app.route("/optimizer")
def campaign_optimizer():
    """Interactive Campaign Optimizer & Recommendation Engine."""
    options = get_categorical_options()
    sample = get_sample_campaign("standard")
    return render_template(
        "optimizer.html",
        active_page="optimizer",
        options=options,
        sample=sample,
    )


@app.route("/revenue")
def revenue_prediction():
    """Dedicated Revenue Prediction Module."""
    options = get_categorical_options()
    sample = get_sample_campaign("standard")
    return render_template(
        "revenue.html",
        active_page="revenue",
        options=options,
        sample=sample,
    )


@app.route("/conversion")
def conversion_prediction():
    """Dedicated Conversion Prediction Module."""
    options = get_categorical_options()
    sample = get_sample_campaign("standard")
    return render_template(
        "conversion.html",
        active_page="conversion",
        options=options,
        sample=sample,
    )


@app.route("/roi")
def roi_analysis():
    """Dedicated ROI Analysis & Return Simulator."""
    options = get_categorical_options()
    sample = get_sample_campaign("standard")
    return render_template(
        "roi.html",
        active_page="roi",
        options=options,
        sample=sample,
    )


@app.route("/comparison")
def campaign_comparison():
    """Side-by-side Campaign Comparison."""
    options = get_categorical_options()
    sample_a = get_sample_campaign("standard")
    sample_b = get_sample_campaign("ecommerce")
    sample_c = get_sample_campaign("b2b")
    return render_template(
        "comparison.html",
        active_page="comparison",
        options=options,
        sample_a=sample_a,
        sample_b=sample_b,
        sample_c=sample_c,
    )


@app.route("/what-if")
def what_if_analysis():
    """Interactive What-If Scenario Analysis."""
    options = get_categorical_options()
    sample = get_sample_campaign("standard")
    return render_template(
        "what_if.html",
        active_page="what_if",
        options=options,
        sample=sample,
    )


@app.route("/reports")
def campaign_reports():
    """Executive Campaign Performance & Model Validation Reports."""
    overview = get_dashboard_overview_data()
    models_info = get_all_models_status()
    return render_template(
        "reports.html",
        active_page="reports",
        overview=overview,
        models=models_info,
    )


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html"), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template("500.html"), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 60)
    print("AI Marketing Campaign Optimization Platform")
    print(f"Starting server on http://127.0.0.1:{port}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False)
