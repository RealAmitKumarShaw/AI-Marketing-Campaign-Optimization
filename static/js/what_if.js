/**
 * AI Marketing Campaign Optimization - What-If Scenario Script
 * Facet "Designed in Glass" Theme
 * Member 4: Optimization, Recommendation & Web Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sync sliders
  const curSpend = document.getElementById('curSpend');
  if (curSpend) updateCurSpendDisplay(curSpend.value);

  const curDur = document.getElementById('curDuration');
  if (curDur) updateCurDurDisplay(curDur.value);

  const propSpend = document.getElementById('propSpend');
  if (propSpend) updatePropSpendDisplay(propSpend.value);

  const propDur = document.getElementById('propDuration');
  if (propDur) updatePropDurDisplay(propDur.value);
});

let whatIfChartInstance = null;

function updateCurSpendDisplay(val) {
  const lbl = document.getElementById('curSpendDisplay');
  const badge = document.getElementById('curSpendBadge');
  if (lbl) lbl.textContent = formatINR(val);
  if (badge) badge.textContent = formatINR(val);
}

function updateCurDurDisplay(val) {
  const lbl = document.getElementById('curDurDisplay');
  const badge = document.getElementById('curDurBadge');
  if (lbl) lbl.textContent = `${val} Days`;
  if (badge) badge.textContent = `${val}d`;
}

function updatePropSpendDisplay(val) {
  const lbl = document.getElementById('propSpendDisplay');
  const badge = document.getElementById('propSpendBadge');
  if (lbl) lbl.textContent = formatINR(val);
  if (badge) badge.textContent = formatINR(val);
}

function updatePropDurDisplay(val) {
  const lbl = document.getElementById('propDurDisplay');
  const badge = document.getElementById('propDurBadge');
  if (lbl) lbl.textContent = `${val} Days`;
  if (badge) badge.textContent = `${val}d`;
}

function loadWhatIfPreset(preset) {
  const propSpend = document.getElementById('propSpend');
  const propDur = document.getElementById('propDuration');
  const propPlatform = document.getElementById('propPlatform');
  const propFormat = document.getElementById('propFormat');

  if (preset === 'scale') {
    if (propSpend) {
      propSpend.value = 15000;
      updatePropSpendDisplay(15000);
    }
    showToast('Loaded Scenario: Scaled Budget to ₹15,000.', 'info');
  } else if (preset === 'channel') {
    if (propPlatform) propPlatform.value = 'Google Ads';
    if (propFormat) propFormat.value = 'Video';
    showToast('Loaded Scenario: Shifted to Google Ads (Video).', 'info');
  } else if (preset === 'duration') {
    if (propDur) {
      propDur.value = 60;
      updatePropDurDisplay(60);
    }
    showToast('Loaded Scenario: Extended Flight to 60 Days.', 'info');
  }
}

function getScenarioConfig(prefix) {
  const isCur = prefix === 'cur';
  return {
    campaign_name: document.getElementById(isCur ? 'curName' : 'propName').value,
    platform: document.getElementById(isCur ? 'curPlatform' : 'propPlatform').value,
    campaign_objective: document.getElementById(isCur ? 'curObjective' : 'propObjective').value,
    creative_format: document.getElementById(isCur ? 'curFormat' : 'propFormat').value,
    device_type: document.getElementById(isCur ? 'curDevice' : 'propDevice').value,
    ad_spend: Number(document.getElementById(isCur ? 'curSpend' : 'propSpend').value),
    campaign_day: Number(document.getElementById(isCur ? 'curDuration' : 'propDuration').value),
    has_call_to_action: 1,
    retargeting_flag: 0,
    creative_size: '1080x1080',
    ad_copy_length: 'Short',
    creative_emotion: 'Trust',
    target_audience_age: '25-34',
    target_audience_gender: 'All',
    audience_interest_category: 'Technology',
    income_bracket: '$50K-$100K',
    purchase_intent_score: 'Medium',
    operating_system: 'Windows',
    industry_vertical: 'Technology',
    budget_tier: 'Medium',
  };
}

async function handleWhatIfSubmit(event) {
  event.preventDefault();

  const btn = document.getElementById('btnCalculateWhatIf');
  const resultsContainer = document.getElementById('whatIfResultsContainer');

  const currentConfig = getScenarioConfig('cur');
  const proposedConfig = getScenarioConfig('prop');

  setButtonLoading(btn, true, 'Running Dual-Scenario ML Predictions...');

  try {
    const response = await fetchApi('/api/what-if', 'POST', {
      current: currentConfig,
      proposed: proposedConfig,
    });

    if (response.status === 'success' && response.analysis) {
      renderWhatIfResults(response.analysis);
      if (resultsContainer) resultsContainer.classList.remove('d-none');
      showToast('What-If simulation completed with real model inferences!', 'success');
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    console.error('What-if failed:', err);
    showToast(`Simulation failed: ${err.message}`, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

function renderWhatIfResults(analysis) {
  const cur = analysis.current;
  const prop = analysis.proposed;
  const deltas = analysis.deltas;

  // Verdict Banner (Facet Smoked Glass)
  const verdictCard = document.getElementById('verdictCard');
  const verdictText = document.getElementById('verdictText');
  const verdictIcon = document.getElementById('verdictIcon');

  verdictText.textContent = analysis.verdict;
  if (analysis.verdict_badge === 'success') {
    verdictCard.style.borderColor = 'var(--emerald-primary)';
    verdictCard.style.background = 'rgba(54, 214, 126, 0.12)';
    verdictIcon.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i>`;
  } else if (analysis.verdict_badge === 'warning') {
    verdictCard.style.borderColor = 'var(--orange-primary)';
    verdictCard.style.background = 'rgba(251, 191, 36, 0.12)';
    verdictIcon.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning"></i>`;
  } else {
    verdictCard.style.borderColor = 'var(--rose-primary)';
    verdictCard.style.background = 'rgba(251, 113, 133, 0.12)';
    verdictIcon.innerHTML = `<i class="bi bi-x-circle-fill text-danger"></i>`;
  }

  // Delta Scorecards
  renderDeltaCard('deltaRoiVal', 'deltaRoiPill', deltas.roi.absolute_formatted, deltas.roi.percentage_formatted, deltas.roi.is_positive);
  renderDeltaCard('deltaRevVal', 'deltaRevPill', deltas.revenue.absolute_formatted, deltas.revenue.percentage_formatted, deltas.revenue.is_positive);
  renderDeltaCard('deltaCrVal', 'deltaCrPill', deltas.conversion_rate.absolute_formatted, deltas.conversion_rate.percentage_formatted, deltas.conversion_rate.is_positive);
  renderDeltaCard('deltaSpVal', 'deltaSpPill', deltas.success_probability.absolute_formatted, `${prop.success_probability_percent}%`, deltas.success_probability.is_positive);

  // Table Matrix
  const tbody = document.getElementById('whatIfTableBody');
  tbody.innerHTML = `
    <tr>
      <td class="text-white"><strong>Budget (Spend)</strong></td>
      <td class="font-mono">${cur.ad_spend_formatted}</td>
      <td class="fw-bold font-mono text-white">${prop.ad_spend_formatted}</td>
      <td><span class="badge-custom ${deltas.ad_spend.absolute >= 0 ? 'badge-navy' : 'badge-emerald'} font-mono">${deltas.ad_spend.absolute_formatted} (${deltas.ad_spend.percentage_formatted})</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Predicted Revenue</strong></td>
      <td class="font-mono">${cur.predicted_revenue_formatted}</td>
      <td class="fw-bold font-mono text-primary">${prop.predicted_revenue_formatted}</td>
      <td><span class="badge-custom ${deltas.revenue.is_positive ? 'badge-emerald' : 'badge-rose'} font-mono">${deltas.revenue.absolute_formatted} (${deltas.revenue.percentage_formatted})</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Predicted ROI</strong></td>
      <td class="font-mono">${cur.predicted_roi_formatted}</td>
      <td class="fw-bold font-mono text-success">${prop.predicted_roi_formatted}</td>
      <td><span class="badge-custom ${deltas.roi.is_positive ? 'badge-emerald' : 'badge-rose'} font-mono">${deltas.roi.absolute_formatted} (${deltas.roi.percentage_formatted})</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Predicted Conversions</strong></td>
      <td class="font-mono">${cur.predicted_conversions}</td>
      <td class="fw-bold font-mono text-white">${prop.predicted_conversions}</td>
      <td><span class="badge-custom ${deltas.conversions.is_positive ? 'badge-emerald' : 'badge-rose'} font-mono">${deltas.conversions.absolute > 0 ? '+' : ''}${deltas.conversions.absolute}</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Conversion Rate</strong></td>
      <td class="font-mono">${cur.predicted_conversion_rate_formatted}</td>
      <td class="fw-bold font-mono text-white">${prop.predicted_conversion_rate_formatted}</td>
      <td><span class="badge-custom ${deltas.conversion_rate.is_positive ? 'badge-emerald' : 'badge-rose'} font-mono">${deltas.conversion_rate.absolute_formatted}</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Success Probability</strong></td>
      <td class="font-mono">${cur.success_probability_formatted}</td>
      <td class="fw-bold font-mono text-white">${prop.success_probability_formatted}</td>
      <td><span class="badge-custom ${deltas.success_probability.is_positive ? 'badge-emerald' : 'badge-rose'} font-mono">${deltas.success_probability.absolute_formatted}</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Estimated CPA</strong></td>
      <td class="font-mono">${cur.cpa_formatted}</td>
      <td class="fw-bold font-mono text-white">${prop.cpa_formatted}</td>
      <td><span class="badge-custom badge-navy font-mono">${prop.cpa <= cur.cpa ? 'Improved Cost' : 'Higher Cost'}</span></td>
    </tr>
    <tr>
      <td class="text-white"><strong>Net Profit (Revenue - Spend)</strong></td>
      <td class="font-mono">${cur.predicted_profit_formatted}</td>
      <td class="fw-bold font-mono text-success">${prop.predicted_profit_formatted}</td>
      <td><span class="badge-custom ${deltas.profit.is_positive ? 'badge-emerald' : 'badge-rose'} font-mono">${deltas.profit.absolute_formatted}</span></td>
    </tr>
  `;

  // Comparative Chart
  renderWhatIfChart(cur, prop);
}

function renderDeltaCard(valId, pillId, absVal, pctVal, isPositive) {
  const elVal = document.getElementById(valId);
  const elPill = document.getElementById(pillId);

  elVal.textContent = absVal;
  elVal.className = `fs-4 fw-bold mt-1 font-mono ${isPositive ? 'text-success' : 'text-danger'}`;

  elPill.innerHTML = `
    <span class="badge-custom ${isPositive ? 'badge-emerald' : 'badge-rose'} font-mono">
      <i class="bi ${isPositive ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}"></i>
      ${pctVal} ${isPositive ? 'gain' : 'drop'}
    </span>
  `;
}

function renderWhatIfChart(cur, prop) {
  const canvas = document.getElementById('whatIfChart');
  if (!canvas) return;

  if (whatIfChartInstance) {
    whatIfChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  whatIfChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['ROI (%)', 'Revenue (₹/100)', 'Conv. Rate (%)', 'Success Prob (%)'],
      datasets: [
        {
          label: 'Current Scenario',
          data: [cur.predicted_roi, cur.predicted_revenue / 100, cur.predicted_conversion_rate, cur.success_probability_percent],
          backgroundColor: 'rgba(170, 136, 255, 0.45)', // Lavender
          borderColor: '#aa88ff',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Proposed Scenario',
          data: [prop.predicted_roi, prop.predicted_revenue / 100, prop.predicted_conversion_rate, prop.success_probability_percent],
          backgroundColor: 'rgba(54, 214, 126, 0.85)', // Emerald
          borderColor: '#36d67e',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#e2e8f0',
            font: { family: 'Inter', weight: '600' },
            boxWidth: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(13, 14, 22, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.14)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => {
              if (ctx.label === 'Revenue (₹/100)') {
                return ` ${ctx.dataset.label}: ${formatINR(ctx.raw * 100)}`;
              }
              return ` ${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Inter' } },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } },
        },
      },
    },
  });
}
