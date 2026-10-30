/**
 * AI Marketing Campaign Optimization - Campaign Comparison Script
 * Facet "Designed in Glass" Theme
 * Member 4: Optimization, Recommendation & Web Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Run initial comparison on page load
  runComparison();
});

let cmpBarChartInstance = null;
let cmpDonutChartInstance = null;

function getCampaignConfigFromInput(idx) {
  return {
    campaign_name: document.getElementById(`cmpName${idx}`).value,
    platform: document.getElementById(`cmpPlatform${idx}`).value,
    campaign_objective: document.getElementById(`cmpObjective${idx}`).value,
    creative_format: document.getElementById(`cmpFormat${idx}`).value,
    device_type: document.getElementById(`cmpDevice${idx}`).value,
    ad_spend: Number(document.getElementById(`cmpSpend${idx}`).value),
    campaign_day: Number(document.getElementById(`cmpDuration${idx}`).value),
    has_call_to_action: 1,
    retargeting_flag: idx === 1 ? 1 : 0,
    creative_size: '1080x1080',
    ad_copy_length: 'Short',
    creative_emotion: idx === 0 ? 'Trust' : idx === 1 ? 'Urgency' : 'Excitement',
    target_audience_age: idx === 1 ? '18-24' : '25-34',
    target_audience_gender: 'All',
    audience_interest_category: idx === 1 ? 'Shoppers' : 'Technology',
    income_bracket: '$50K-$100K',
    purchase_intent_score: idx === 1 ? 'High' : 'Medium',
    operating_system: idx === 1 ? 'iOS' : 'Windows',
    industry_vertical: idx === 1 ? 'E-commerce' : 'Technology',
    budget_tier: idx === 1 ? 'High' : 'Medium',
  };
}

async function runComparison() {
  const campaigns = [
    getCampaignConfigFromInput(0),
    getCampaignConfigFromInput(1),
    getCampaignConfigFromInput(2),
  ];

  try {
    const response = await fetchApi('/api/compare', 'POST', { campaigns });
    if (response.status === 'success' && response.comparison) {
      renderComparisonView(response.comparison);
      const container = document.getElementById('comparisonResultsContainer');
      if (container) container.classList.remove('d-none');
    }
  } catch (err) {
    console.error('Comparison error:', err);
    showToast(`Comparison failed: ${err.message}`, 'error');
  }
}

function renderComparisonView(comp) {
  const campaigns = comp.campaigns;

  // 1. Comparison Cards
  const cardsRow = document.getElementById('comparisonCardsRow');
  if (cardsRow) {
    cardsRow.innerHTML = campaigns.map((c) => {
      const isWinner = c.is_recommended;
      const borderClass = isWinner ? 'is-recommended' : '';

      return `
        <div class="col-12 col-lg-4">
          <div class="comparison-box ${borderClass}">
            ${isWinner ? '<div class="recommended-ribbon"><i class="bi bi-trophy-fill me-1"></i> AI Recommended Winner</div>' : ''}
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="badge-custom ${isWinner ? 'badge-emerald' : 'badge-navy'} font-mono">${c.campaign_name}</span>
              <span class="font-mono fw-bold text-white" style="font-size: 0.8rem;">Score: ${c.score}</span>
            </div>

            <div class="my-3">
              <div class="text-muted font-mono" style="font-size: 0.7rem;">PREDICTED ROI</div>
              <div class="fs-4 fw-bold font-mono ${c.predicted_roi >= 0 ? 'text-success' : 'text-danger'}">
                ${c.predicted_roi_formatted}
              </div>
            </div>

            <div class="d-flex flex-column gap-2 text-secondary font-mono" style="font-size: 0.8rem;">
              <div class="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                <span>Predicted Revenue:</span>
                <strong class="text-white">${c.predicted_revenue_formatted}</strong>
              </div>
              <div class="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                <span>Budget (Spend):</span>
                <strong class="text-white">${c.ad_spend_formatted}</strong>
              </div>
              <div class="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                <span>Conversions:</span>
                <strong class="text-white">${c.predicted_conversions}</strong>
              </div>
              <div class="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                <span>Conversion Rate:</span>
                <strong class="text-white">${c.predicted_conversion_rate_formatted}</strong>
              </div>
              <div class="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                <span>Success Probability:</span>
                <strong class="text-white">${c.success_probability_formatted}</strong>
              </div>
              <div class="d-flex justify-content-between pt-1 font-sans">
                <span>Channel & Format:</span>
                <span class="badge-custom badge-blue">${c.config.platform} (${c.config.creative_format})</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Performance Matrix Table
  const headerRow = document.getElementById('matrixHeaderRow');
  if (headerRow) {
    headerRow.innerHTML = `
      <th>Metric</th>
      ${campaigns.map(c => `
        <th class="${c.is_recommended ? 'text-success fw-bold' : ''}" style="${c.is_recommended ? 'border-bottom: 2px solid var(--emerald-primary);' : ''}">
          ${c.is_recommended ? '<i class="bi bi-check-circle-fill me-1"></i>' : ''}${c.campaign_name}
        </th>
      `).join('')}
    `;
  }

  const rows = [
    { label: 'Marketing Channel', getter: c => c.config.platform },
    { label: 'Campaign Objective', getter: c => c.config.campaign_objective },
    { label: 'Creative Format', getter: c => c.config.creative_format },
    { label: 'Target Device', getter: c => c.config.device_type },
    { label: 'Campaign Spend (Budget)', getter: c => c.ad_spend_formatted },
    { label: 'Flight Duration', getter: c => `${c.campaign_duration} Days` },
    { label: 'Predicted ROI', getter: c => `<strong class="${c.predicted_roi >= 0 ? 'text-success' : 'text-danger'} font-mono">${c.predicted_roi_formatted}</strong>` },
    { label: 'Predicted Revenue', getter: c => `<strong class="text-primary font-mono">${c.predicted_revenue_formatted}</strong>` },
    { label: 'Predicted Conversions', getter: c => `<span class="font-mono">${c.predicted_conversions}</span>` },
    { label: 'Conversion Rate', getter: c => `<span class="font-mono">${c.predicted_conversion_rate_formatted}</span>` },
    { label: 'Success Probability (Profit > 0)', getter: c => `<span class="badge-custom ${c.success_probability >= 0.7 ? 'badge-emerald' : 'badge-orange'} font-mono">${c.success_probability_formatted}</span>` },
    { label: 'Cost Per Acquisition (CPA)', getter: c => `<span class="font-mono">${c.cpa_formatted}</span>` },
    { label: 'Net Profit Estimate', getter: c => `<strong class="text-success font-mono">${c.predicted_profit_formatted}</strong>` },
    { label: 'Multi-Objective Score', getter: c => `<span class="badge-custom ${c.is_recommended ? 'badge-emerald' : 'badge-navy'} font-mono">${c.score}</span>` },
  ];

  const tbody = document.getElementById('matrixTableBody');
  if (tbody) {
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="fw-bold text-white font-sans">${r.label}</td>
        ${campaigns.map(c => `
          <td class="${c.is_recommended ? 'bg-success bg-opacity-10 text-white' : ''}">${r.getter(c)}</td>
        `).join('')}
      </tr>
    `).join('');
  }

  // 3. Render Visual Charts
  renderComparisonCharts(comp);
}

function renderComparisonCharts(comp) {
  const cd = comp.chart_data;

  // Bar Chart: ROI and Revenue Comparison
  const canvasBar = document.getElementById('cmpBarChart');
  if (canvasBar) {
    if (cmpBarChartInstance) cmpBarChartInstance.destroy();

    const ctx = canvasBar.getContext('2d');
    cmpBarChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cd.labels,
        datasets: [
          {
            label: 'Predicted ROI (%)',
            data: cd.roi_series,
            backgroundColor: 'rgba(54, 214, 126, 0.82)', // Emerald
            borderColor: '#36d67e',
            borderRadius: 6,
            yAxisID: 'yRoi',
          },
          {
            label: 'Predicted Revenue (₹)',
            data: cd.revenue_series,
            backgroundColor: 'rgba(170, 136, 255, 0.82)', // Lavender
            borderColor: '#aa88ff',
            borderRadius: 6,
            yAxisID: 'yRevenue',
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
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Inter' } },
          },
          yRoi: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'ROI (%)', color: '#36d67e', font: { family: 'JetBrains Mono', weight: 'bold' } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } },
          },
          yRevenue: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Revenue (₹)', color: '#aa88ff', font: { family: 'JetBrains Mono', weight: 'bold' } },
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#94a3b8',
              font: { family: 'JetBrains Mono' },
              callback: v => '₹' + (v / 1000).toFixed(0) + 'k',
            },
          },
        },
      },
    });
  }

  // Donut / Polar Chart: Success Probability
  const canvasDonut = document.getElementById('cmpDonutChart');
  if (canvasDonut) {
    if (cmpDonutChartInstance) cmpDonutChartInstance.destroy();

    const ctx = canvasDonut.getContext('2d');
    cmpDonutChartInstance = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: cd.labels,
        datasets: [
          {
            data: cd.success_prob_series,
            backgroundColor: [
              'rgba(170, 136, 255, 0.75)', // Lavender
              'rgba(54, 214, 126, 0.75)',  // Emerald
              'rgba(56, 189, 248, 0.75)',  // Cyan
            ],
            borderColor: '#0d0e16',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#cbd5e1',
              font: { family: 'Inter', size: 10 },
              boxWidth: 10,
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
          }
        },
        scales: {
          r: {
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        },
      },
    });
  }
}

function reloadDefaultCampaigns() {
  document.getElementById('cmpName0').value = 'Campaign A (SaaS Growth)';
  document.getElementById('cmpPlatform0').value = 'Facebook';
  document.getElementById('cmpSpend0').value = 5000;

  document.getElementById('cmpName1').value = 'Campaign B (E-Commerce Sale)';
  document.getElementById('cmpPlatform1').value = 'Instagram';
  document.getElementById('cmpSpend1').value = 12000;

  document.getElementById('cmpName2').value = 'Campaign C (Enterprise B2B)';
  document.getElementById('cmpPlatform2').value = 'LinkedIn';
  document.getElementById('cmpSpend2').value = 8000;

  runComparison();
}
