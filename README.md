# AI-Based Marketing Campaign Optimization & Prediction

An AI and Machine Learning-based marketing campaign optimization system that analyzes digital advertising campaign data and builds predictive models for **ROI, Revenue, and Conversion prediction**.

The project aims to help understand campaign performance and provide a machine learning foundation for future campaign success prediction, explainability, optimization, and dashboard integration.

## 📌 Project Overview

Digital marketing campaigns generate large amounts of data such as impressions, clicks, conversions, ad spend, revenue, CTR, CPC, CPA, ROAS, and audience information.

This project uses Machine Learning and Data Analytics techniques to analyze this campaign data and build predictive models.

The current implementation includes:

* Data Exploration
* Exploratory Data Analysis
* Data Preprocessing
* Feature Engineering
* ROI Prediction
* Revenue Prediction
* Conversion Prediction
* Model Evaluation
* Model Saving
* Reusable Prediction Modules
* Prediction Testing

The project is being developed using a team-based Git branching workflow where each member works on a separate module.

## 🎯 Objectives

* Analyze digital advertising campaign data.
* Perform Exploratory Data Analysis (EDA).
* Clean and preprocess campaign data.
* Perform feature engineering.
* Predict campaign ROI.
* Predict campaign Revenue.
* Predict campaign Conversions.
* Compare different Machine Learning models.
* Perform hyperparameter tuning.
* Save trained Machine Learning models.
* Create reusable prediction modules.
* Provide a foundation for campaign success prediction.
* Provide a foundation for SHAP-based model explainability.
* Support future campaign optimization and dashboard integration.

## ✨ Features

* Exploratory Data Analysis.
* Data preprocessing pipeline.
* Numerical feature scaling.
* Categorical feature encoding.
* ROI prediction.
* Revenue prediction.
* Conversion prediction.
* Multiple Machine Learning model comparison.
* Hyperparameter tuning for ROI prediction.
* Model evaluation using MAE, RMSE, and R².
* Saved trained models.
* Saved preprocessing pipelines.
* Reusable Python prediction modules.
* Prediction testing modules.
* Team-based Git workflow.
* Modular project structure.

## 🧠 System Workflow

```text
Marketing Campaign Dataset
            ↓
     Data Exploration
            ↓
     Data Preprocessing
            ↓
      Feature Engineering
            ↓
    ┌───────┼────────┐
    ↓       ↓        ↓
   ROI    Revenue  Conversion
Prediction Prediction Prediction
    ↓       ↓        ↓
    └───────┼────────┘
            ↓
      Model Evaluation
            ↓
       Saved Models
            ↓
   Reusable Prediction
        Modules
            ↓
   Future Optimization
            ↓
       Dashboard / API
```
# Project Architecture
```text


                         Marketing Dataset
                                ↓
                     ┌─────────────────────┐
                     │   Data Exploration  │
                     │      Member 1       │
                     └──────────┬──────────┘
                                ↓
                     ┌─────────────────────┐
                     │ Data Preprocessing  │
                     │      Member 1       │
                     └──────────┬──────────┘
                                ↓
              ┌─────────────────┼─────────────────┐
              ↓                 ↓                 ↓
        ROI Prediction    Revenue Prediction   Conversion
          Member 1            Member 2         Prediction
                                                  Member 2
              ↓                 ↓                 ↓
              └─────────────────┼─────────────────┘
                                ↓
                         Model Evaluation
                                ↓
                        Saved ML Models
                                ↓
                     Future Project Modules
                                ↓
                ┌───────────────┴───────────────┐
                ↓                               ↓
        Success Prediction              SHAP Explainability
            Member 3                         Member 3
                ↓                               ↓
                └───────────────┬───────────────┘
                                ↓
                       Campaign Optimization
                              Member 4
                                ↓
                         Dashboard / API
                                ↓
                           Deployment

---

## 🚀 Member 4: Optimization, Recommendation & Web Dashboard

**Member 4** completes the integration layer, multi-objective optimization algorithms, and enterprise web dashboard connecting all machine learning models into a unified decision platform.

### ✨ Implemented Features

1. **Enterprise Dashboard (/)**:
   - Executive KPI cards for Predicted/Avg ROI (%), Revenue (₹), Conversion Rate (%), and Success Probability (%).
   - Interactive Chart.js visualizations for Channel Performance Comparison, Objective Breakdown, and Duration vs ROI.
   - Benchmark dataset records table with real historical performance.
   - Model validation metrics matrix displaying R², MAE, RMSE, and Classification Accuracy across all team models.

2. **AI Campaign Optimizer (/optimizer)**:
   - Interactive campaign configuration form matching all dataset features.
   - Evaluates candidate variations across platforms, creative formats, placements, devices, and audience tiers.
   - **Multi-Objective Composite Scoring Strategy**:
     \text{Score} = w_{\text{success}} \times \text{Norm}(\text{Success}) + w_{\text{roi}} \times \text{Norm}(\text{ROI}) + w_{\text{rev}} \times \text{Norm}(\text{Revenue}) + w_{\text{conv}} \times \text{Norm}(\text{Conv Rate})
   - Selectable optimization priorities: *Balanced*, *Max ROI*, *Max Revenue*, or *Low Risk*.
   - Dynamic recommendation hero card with score dial and quantitative uplift deltas (Δ ROI, Δ Revenue, Δ Conv Rate).
   - Side-by-side comparison of user baseline vs recommended configuration.
   - **SHAP-Grounded Explainability**: Clear explanations of why the winning strategy ranks highest based on Member 3's SHAP feature importance analysis.
   - Alternative strategic options (Max ROI, Max Revenue, Safe Budget) with 1-click configuration apply.

3. **What-If Scenario Simulator (/what-if)**:
   - Side-by-side simulation comparing Current vs Proposed campaign settings.
   - Real-time sliders for budget (₹500 to ₹1,00,000) and flight duration (1 to 90 days).
   - Instant calculation of absolute and percentage changes across all metrics.
   - Scenario verdict card with automated impact assessment.
   - Comparative Chart.js bar chart.

4. **Multi-Campaign Comparison (/comparison)**:
   - Head-to-head comparison of multiple campaigns (e.g., SaaS vs E-Commerce vs B2B).
   - Comparative cards highlighting the winning campaign with a golden ribbon badge.
   - Side-by-side metric matrix table and Chart.js bar/radar charts.

5. **Dedicated Predictive Modules**:
   - Revenue Prediction (/revenue)
   - Conversion Prediction (/conversion)
   - ROI Analysis (/roi)
   - Executive Audit & Validation Reports (/reports)

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12, Flask 3.0.3, Pandas, NumPy, Scikit-learn 1.6.1, Joblib
- **Frontend**: HTML5, Vanilla CSS3 (Custom SaaS Design System), JavaScript (ES6+ Fetch API)
- **Styling**: Bootstrap 5.3.3 & Bootstrap Icons
- **Charts**: Chart.js 4.4.2
- **Currency**: Indian Rupee (INR ₹) formatting

---

## ⚡ How to Run the Application

### 1. Install Dependencies
`ash
pip install -r requirements.txt
`

### 2. Run Automated Verification Tests
`ash
python -X utf8 -m unittest test_app.py
`

### 3. Launch the Web Application
`ash
python -X utf8 app.py
`
Open your browser and navigate to: **http://127.0.0.1:5000**

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | System health check and status of all 4 ML models |
| GET | /api/campaign-options | Valid categorical dropdown values from dataset |
| GET | /api/benchmarks | Empirical benchmarks by marketing channel |
| GET | /api/dashboard-overview | Aggregated dataset KPIs and chart series |
| GET | /api/sample-campaigns | Pre-filled demo campaigns (SaaS, E-Commerce, B2B) |
| POST | /api/predict | Predicts ROI, Revenue, Conversions & Success for single campaign |
| POST | /api/optimize | Generates candidate variations, ranks, and returns AI recommendations |
| POST | /api/what-if | Computes exact deltas between current and proposed campaigns |
| POST | /api/compare | Compares multiple campaigns and highlights the winning option |
