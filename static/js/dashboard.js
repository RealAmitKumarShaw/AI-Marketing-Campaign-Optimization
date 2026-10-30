/**
 * AI Marketing Campaign Optimization - Dashboard Overview Script
 * Facet "Designed in Glass" Theme
 * Member 4: Optimization, Recommendation & Web Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

let channelChartInstance = null;
let objectiveChartInstance = null;
let durationChartInstance = null;

async function loadDashboardData() {
  try {
    const res = await fetchApi('/api/dashboard-overview');
    if (res.status === 'success' && res.data) {
      updateKpis(res.data.kpis);
      renderChannelChart(res.data.channel_performance);
      renderObjectiveChart(res.data.objective_performance);
      renderDurationChart(res.data.duration_performance);
      renderRecentCampaigns(res.data.recent_campaigns);
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    showToast('Failed to load live dashboard statistics. Using cached benchmarks.', 'warning');
  }
}

function updateKpis(kpis) {
  if (!kpis) return;

  const elRoi = document.getElementById('kpiRoi');
  if (elRoi) elRoi.textContent = formatPercent(kpis.avg_roi, true);

  const elRev = document.getElementById('kpiRevenue');
  if (elRev) elRev.textContent = formatINR(kpis.avg_revenue);

  const elCr = document.getElementById('kpiConversionRate');
  if (elCr) elCr.textContent = formatPercent(kpis.avg_conversion_rate);

  const elSr = document.getElementById('kpiSuccessRate');
  if (elSr) elSr.textContent = formatPercent(kpis.success_rate);

  const elTotRev = document.getElementById('kpiTotalRevenue');
  if (elTotRev) elTotRev.textContent = formatINR(kpis.total_revenue);

  const elCpa = document.getElementById('kpiAvgCpa');
  if (elCpa) elCpa.textContent = formatINR(kpis.avg_cpa);

  const elCtr = document.getElementById('kpiAvgCtr');
  if (elCtr) elCtr.textContent = formatPercent(kpis.avg_ctr);

  const elCpc = document.getElementById('kpiAvgCpc');
  if (elCpc) elCpc.textContent = formatINR(kpis.avg_cpc);
}

function renderChannelChart(channels) {
  const canvas = document.getElementById('channelChart');
  if (!canvas || !channels || !channels.length) return;

  const labels = channels.map(c => c.platform);
  const rois = channels.map(c => c.avg_roi);
  const revenues = channels.map(c => c.avg_revenue);

  if (channelChartInstance) {
    channelChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  channelChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Avg ROI (%)',
          data: rois,
          backgroundColor: 'rgba(54, 214, 126, 0.82)', // Emerald
          borderColor: '#36d67e',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'yRoi',
        },
        {
          label: 'Avg Revenue (₹)',
          data: revenues,
          backgroundColor: 'rgba(170, 136, 255, 0.82)', // Lavender
          borderColor: '#aa88ff',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'yRevenue',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#e2e8f0',
            font: { family: 'Inter', weight: '600', size: 12 },
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(13, 14, 22, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.14)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              if (context.dataset.yAxisID === 'yRoi') {
                return ` Avg ROI: +${context.raw.toFixed(1)}%`;
              }
              return ` Avg Revenue: ${formatINR(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter', weight: '500', size: 11 },
          },
        },
        yRoi: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'ROI (%)', color: '#36d67e', font: { family: 'JetBrains Mono', weight: 'bold', size: 11 } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 },
          },
        },
        yRevenue: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Revenue (₹)', color: '#aa88ff', font: { family: 'JetBrains Mono', weight: 'bold', size: 11 } },
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: function(value) {
              return '₹' + (value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value);
            }
          }
        },
      },
    },
  });
}

function renderObjectiveChart(objectives) {
  const canvas = document.getElementById('objectiveChart');
  if (!canvas || !objectives || !objectives.length) return;

  const labels = objectives.map(o => o.objective);
  const data = objectives.map(o => o.campaigns);

  if (objectiveChartInstance) {
    objectiveChartInstance.destroy();
  }

  // Smoked Glass Curated Color Palette
  const colors = [
    '#aa88ff', // Lavender
    '#36d67e', // Emerald
    '#38bdf8', // Cyan
    '#fbbf24', // Amber
    '#fb7185', // Rose
  ];

  const ctx = canvas.getContext('2d');
  objectiveChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#0d0e16',
          hoverOffset: 6,
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
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 10, family: 'Inter', weight: '500' },
            padding: 12,
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
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((context.raw / total) * 100).toFixed(1);
              return ` ${context.label}: ${context.raw} campaigns (${pct}%)`;
            }
          }
        }
      },
      cutout: '68%',
    },
  });
}

function renderDurationChart(durations) {
  const canvas = document.getElementById('durationChart');
  if (!canvas || !durations || !durations.length) return;

  const labels = durations.map(d => d.duration_range);
  const rois = durations.map(d => d.avg_roi);
  const revenues = durations.map(d => d.avg_revenue);

  if (durationChartInstance) {
    durationChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  durationChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Avg ROI (%)',
          data: rois,
          borderColor: '#36d67e',
          backgroundColor: 'rgba(54, 214, 126, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#36d67e',
          yAxisID: 'y',
        },
        {
          label: 'Avg Revenue (₹)',
          data: revenues,
          borderColor: '#aa88ff',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#aa88ff',
          yAxisID: 'y1',
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
            font: { family: 'Inter', weight: '600', size: 11 },
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
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } },
        },
        y: {
          title: { display: true, text: 'Average ROI (%)', color: '#36d67e', font: { family: 'JetBrains Mono', size: 10 } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
        },
        y1: {
          position: 'right',
          title: { display: true, text: 'Average Revenue (₹)', color: '#aa88ff', font: { family: 'JetBrains Mono', size: 10 } },
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: value => '₹' + (value / 1000).toFixed(0) + 'k',
          },
        },
      },
    },
  });
}

function renderRecentCampaigns(campaigns) {
  const tbody = document.getElementById('recentCampaignsTableBody');
  if (!tbody) return;

  if (!campaigns || !campaigns.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No recent campaign records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = campaigns.map(c => {
    const statusBadge = c.is_successful
      ? `<span class="badge-custom badge-emerald"><i class="bi bi-check-circle-fill"></i> Profitable</span>`
      : `<span class="badge-custom badge-rose"><i class="bi bi-x-circle-fill"></i> Underperformed</span>`;

    const roiClass = c.actual_roi >= 0 ? 'text-success fw-bold font-mono' : 'text-danger fw-bold font-mono';

    return `
      <tr>
        <td class="font-mono fw-bold text-white">${c.campaign_id}</td>
        <td><span class="badge-custom badge-navy font-mono">${c.objective}</span></td>
        <td><i class="bi bi-globe me-1 text-primary"></i>${c.platform}</td>
        <td>${c.industry}</td>
        <td class="font-mono">${formatINR(c.ad_spend)}</td>
        <td class="fw-bold font-mono text-white">${formatINR(c.actual_revenue)}</td>
        <td class="${roiClass}">${c.actual_roi >= 0 ? '+' : ''}${c.actual_roi.toFixed(1)}%</td>
        <td class="font-mono">${c.conversion_rate.toFixed(2)}%</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

// Global quick preloader
window.preloadSample = function(type) {
  window.location.href = `/optimizer?sample=${type}`;
};
