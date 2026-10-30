/**
 * AI Marketing Campaign Optimization - Single Prediction Handlers
 * Used by revenue.html, conversion.html, and roi.html
 */

function updatePredSpend(val) {
  const el = document.getElementById('predSpendDisplay');
  if (el) el.textContent = formatINR(val);
}

function updatePredDur(val) {
  const el = document.getElementById('predDurDisplay');
  if (el) el.textContent = `${val} Days`;
}

async function handlePredictionSubmit(event, pageType) {
  event.preventDefault();

  const btn = document.getElementById('btnPredict');
  const payload = {
    campaign_name: document.getElementById('predName').value,
    platform: document.getElementById('predPlatform').value,
    campaign_objective: document.getElementById('predObjective').value,
    creative_format: document.getElementById('predFormat').value,
    ad_spend: Number(document.getElementById('predSpend').value),
    campaign_day: Number(document.getElementById('predDuration').value),
    has_call_to_action: 1,
    retargeting_flag: 1,
  };

  const devEl = document.getElementById('predDevice');
  if (devEl) payload.device_type = devEl.value;

  const indEl = document.getElementById('predIndustry');
  if (indEl) payload.industry_vertical = indEl.value;

  const ageEl = document.getElementById('predAge');
  if (ageEl) payload.target_audience_age = ageEl.value;

  setButtonLoading(btn, true, 'Running Model Prediction...');

  try {
    const res = await fetchApi('/api/predict', 'POST', payload);
    if (res.status === 'success' && res.prediction) {
      const p = res.prediction;

      const mainMetricEl = document.getElementById('predMainMetric');
      const sub1 = document.getElementById('predSubMetric1');
      const sub2 = document.getElementById('predSubMetric2');
      const sub3 = document.getElementById('predSubMetric3');

      if (pageType === 'revenue') {
        if (mainMetricEl) mainMetricEl.textContent = p.predicted_revenue_formatted;
        if (sub1) sub1.textContent = p.predicted_roi_formatted;
        if (sub2) sub2.textContent = p.predicted_conversions;
        if (sub3) sub3.textContent = p.success_probability_formatted;
      } else if (pageType === 'conversion') {
        if (mainMetricEl) mainMetricEl.textContent = `${p.predicted_conversions} Conversions`;
        if (sub1) sub1.textContent = p.predicted_conversion_rate_formatted;
        if (sub2) sub2.textContent = p.cpa_formatted;
        if (sub3) sub3.textContent = p.predicted_revenue_formatted;
      } else if (pageType === 'roi') {
        if (mainMetricEl) mainMetricEl.textContent = `${p.predicted_roi_formatted} ROI`;
        if (sub1) sub1.textContent = p.predicted_profit_formatted;
        if (sub2) sub2.textContent = p.roas_formatted;
        if (sub3) sub3.textContent = p.success_probability_formatted;
      }

      showToast('Model prediction calculated successfully!', 'success');
    }
  } catch (err) {
    console.error('Prediction failed:', err);
    showToast(`Prediction failed: ${err.message}`, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}
