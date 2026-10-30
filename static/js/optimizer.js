/**
 * AI Marketing Campaign Optimization - Optimizer Page Script
 * Facet "Designed in Glass" Theme
 * Member 4: Optimization, Recommendation & Web Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check URL query for sample preload
  const urlParams = new URLSearchParams(window.location.search);
  const sampleType = urlParams.get('sample');
  if (sampleType) {
    loadSampleToForm(sampleType);
  } else {
    // Initial display sync
    const spendInput = document.getElementById('adSpend');
    if (spendInput) updateSpendDisplay(spendInput.value);
  }
});

function updateSpendDisplay(val) {
  const el = document.getElementById('adSpendDisplay');
  if (el) el.textContent = formatINR(val);
}

function setBudget(val) {
  const input = document.getElementById('adSpend');
  if (input) {
    input.value = val;
    updateSpendDisplay(val);
  }
}

function updateDurationDisplay(val) {
  const lbl = document.getElementById('durationDisplay');
  const badge = document.getElementById('durationValueBadge');
  if (lbl) lbl.textContent = `${val} Days`;
  if (badge) badge.textContent = `${val}d`;
}

// Load Benchmark Sample into Form
async function loadSampleToForm(type) {
  try {
    const res = await fetchApi('/api/sample-campaigns');
    if (res.status === 'success' && res.samples && res.samples[type]) {
      const s = res.samples[type];

      setFormValue('campaignName', s.campaign_name);
      setFormValue('campaignObjective', s.campaign_objective);
      setFormValue('industryVertical', s.industry_vertical);
      setFormValue('platform', s.platform);
      setFormValue('adPlacement', s.ad_placement);
      setFormValue('creativeFormat', s.creative_format);
      setFormValue('creativeEmotion', s.creative_emotion);
      setFormValue('targetAge', s.target_audience_age);
      setFormValue('targetGender', s.target_audience_gender);
      setFormValue('interestCat', s.audience_interest_category);
      setFormValue('incomeBracket', s.income_bracket);
      setFormValue('deviceType', s.device_type);
      setFormValue('purchaseIntent', s.purchase_intent_score);

      const spendInput = document.getElementById('adSpend');
      if (spendInput) {
        spendInput.value = s.ad_spend;
        updateSpendDisplay(s.ad_spend);
      }

      const durInput = document.getElementById('campaignDay');
      if (durInput) {
        durInput.value = s.campaign_day;
        updateDurationDisplay(s.campaign_day);
      }

      const ctaCheck = document.getElementById('hasCta');
      if (ctaCheck) ctaCheck.checked = Boolean(s.has_call_to_action);

      const retargetCheck = document.getElementById('retargetingFlag');
      if (retargetCheck) retargetCheck.checked = Boolean(s.retargeting_flag);

      showToast(`Preloaded ${type.toUpperCase()} campaign benchmark into form.`, 'info');
    }
  } catch (err) {
    console.error('Failed to preload sample:', err);
  }
}

function setFormValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) {
    el.value = value;
  }
}

// Extract form data into object
function getFormData() {
  const form = document.getElementById('optimizerForm');
  const fd = new FormData(form);
  const data = {};

  fd.forEach((value, key) => {
    data[key] = value;
  });

  // Explicit checkboxes
  data.has_call_to_action = document.getElementById('hasCta') && document.getElementById('hasCta').checked ? 1 : 0;
  data.retargeting_flag = document.getElementById('retargetingFlag') && document.getElementById('retargetingFlag').checked ? 1 : 0;
  data.ad_spend = Number(data.ad_spend);
  data.campaign_day = Number(data.campaign_day);

  return data;
}

// Button loading state helper
function setButtonLoading(btn, isLoading, text = 'Processing...') {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${text}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
    }
  }
}

// Handle Optimize Submit
async function handleOptimizeSubmit(event) {
  event.preventDefault();

  const btn = document.getElementById('btnOptimize');
  const emptyState = document.getElementById('optimizerEmptyState');
  const loadingState = document.getElementById('optimizerLoadingState');
  const resultsContainer = document.getElementById('optimizerResults');

  const campaignData = getFormData();
  const priority = document.getElementById('optPriority').value;

  // Validation
  if (campaignData.ad_spend < 500) {
    showToast('Please provide a campaign budget of at least ₹500.', 'warning');
    return;
  }

  // Switch to loading state
  if (emptyState) emptyState.classList.add('d-none');
  if (resultsContainer) resultsContainer.classList.add('d-none');
  if (loadingState) loadingState.classList.remove('d-none');
  setButtonLoading(btn, true, 'Evaluating Candidate Variations...');

  try {
    const response = await fetchApi('/api/optimize', 'POST', {
      campaign: campaignData,
      priority: priority,
    });

    if (response.status === 'success' && response.optimization) {
      renderOptimizationResults(response.optimization);
      if (loadingState) loadingState.classList.add('d-none');
      if (resultsContainer) resultsContainer.classList.remove('d-none');
      showToast('Campaign optimization completed successfully!', 'success');

      // Smooth scroll to results
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    console.error('Optimization error:', err);
    showToast(`Optimization failed: ${err.message}`, 'error');
    if (loadingState) loadingState.classList.add('d-none');
    if (emptyState) emptyState.classList.remove('d-none');
  } finally {
    setButtonLoading(btn, false);
  }
}

// Render Results
function renderOptimizationResults(opt) {
  const rec = opt.recommended;
  const base = opt.baseline;
  const deltas = opt.deltas;

  // Winner Hero Banner
  const elStratName = document.getElementById('recStrategyName');
  if (elStratName) elStratName.textContent = rec.campaign_name;

  const elPriNote = document.getElementById('recPriorityNote');
  if (elPriNote) elPriNote.textContent = `${opt.priority_details.name} • ${opt.priority_details.description}`;

  const elCompScore = document.getElementById('recCompositeScore');
  if (elCompScore) elCompScore.textContent = Math.round(rec.composite_score);

  const scoreDial = document.getElementById('recScoreDial');
  if (scoreDial) {
    scoreDial.style.setProperty('--score-pct', Math.round(rec.composite_score));
  }

  // Deltas
  const elDeltaRoi = document.getElementById('deltaRoi');
  if (elDeltaRoi) {
    elDeltaRoi.textContent = deltas.roi_diff_formatted;
    elDeltaRoi.className = deltas.roi_diff >= 0 ? 'fs-5 fw-bold text-success font-mono' : 'fs-5 fw-bold text-danger font-mono';
  }

  const elDeltaRev = document.getElementById('deltaRevenue');
  if (elDeltaRev) {
    elDeltaRev.textContent = deltas.revenue_diff_formatted;
    elDeltaRev.className = deltas.revenue_diff >= 0 ? 'fs-5 fw-bold text-info font-mono' : 'fs-5 fw-bold text-danger font-mono';
  }

  const elDeltaCr = document.getElementById('deltaConvRate');
  if (elDeltaCr) {
    elDeltaCr.textContent = deltas.conversion_rate_diff_formatted;
    elDeltaCr.className = deltas.conversion_rate_diff >= 0 ? 'fs-5 fw-bold text-warning font-mono' : 'fs-5 fw-bold text-danger font-mono';
  }

  const elDeltaSp = document.getElementById('deltaSuccessProb');
  if (elDeltaSp) elDeltaSp.textContent = rec.success_probability_formatted;

  // Baseline Box
  const elBaseScore = document.getElementById('baseScore');
  if (elBaseScore) elBaseScore.textContent = base.composite_score || 0;

  const elBaseRoi = document.getElementById('baseRoi');
  if (elBaseRoi) elBaseRoi.textContent = base.predicted_roi_formatted;

  const elBaseRev = document.getElementById('baseRevenue');
  if (elBaseRev) elBaseRev.textContent = base.predicted_revenue_formatted;

  const elBaseConv = document.getElementById('baseConversions');
  if (elBaseConv) elBaseConv.textContent = base.predicted_conversions;

  const elBaseCr = document.getElementById('baseConvRate');
  if (elBaseCr) elBaseCr.textContent = base.predicted_conversion_rate_formatted;

  const elBaseCpa = document.getElementById('baseCpa');
  if (elBaseCpa) elBaseCpa.textContent = base.cpa_formatted;

  const elBaseSum = document.getElementById('baseSummary');
  if (elBaseSum) elBaseSum.textContent = `${base.config.platform} • ${base.config.creative_format} • ${base.config.device_type}`;

  // Recommended Box
  const elRecScore = document.getElementById('recScore');
  if (elRecScore) elRecScore.textContent = rec.composite_score;

  const elRecRoi = document.getElementById('recRoi');
  if (elRecRoi) elRecRoi.textContent = rec.predicted_roi_formatted;

  const elRecRev = document.getElementById('recRevenue');
  if (elRecRev) elRecRev.textContent = rec.predicted_revenue_formatted;

  const elRecConv = document.getElementById('recConversions');
  if (elRecConv) elRecConv.textContent = rec.predicted_conversions;

  const elRecCr = document.getElementById('recConvRate');
  if (elRecCr) elRecCr.textContent = rec.predicted_conversion_rate_formatted;

  const elRecCpa = document.getElementById('recCpa');
  if (elRecCpa) elRecCpa.textContent = rec.cpa_formatted;

  const elRecSum = document.getElementById('recSummary');
  if (elRecSum) elRecSum.textContent = `${rec.config.platform} • ${rec.config.creative_format} • ${rec.config.device_type}`;

  // Explainability Breakdown (SHAP-Grounded)
  const explainContainer = document.getElementById('explainabilityContainer');
  if (explainContainer) {
    if (opt.explainability && opt.explainability.length) {
      explainContainer.innerHTML = opt.explainability.map(item => `
        <div class="shap-card">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="fw-bold text-white"><i class="bi bi-cpu text-primary me-2"></i>${item.feature}</span>
            <span class="badge-custom badge-blue font-mono" style="font-size: 0.7rem;">${item.shap_rank}</span>
          </div>
          <p class="mb-0 text-secondary" style="font-size: 0.8125rem;">${item.explanation}</p>
        </div>
      `).join('');
    } else {
      explainContainer.innerHTML = `<p class="text-muted">No specific factor overrides necessary.</p>`;
    }
  }

  // Strategic Alternatives
  const altContainer = document.getElementById('alternativeStrategiesContainer');
  if (altContainer && opt.alternative_strategies) {
    altContainer.innerHTML = opt.alternative_strategies.map((alt) => `
      <div class="col-12 col-md-4">
        <div class="p-3 rounded-3 h-100 d-flex flex-column justify-content-between" style="background: rgba(14, 15, 24, 0.75); border: 1px solid var(--glass-border);">
          <div>
            <span class="badge-custom badge-navy mb-2 font-mono">${alt.strategy_tag}</span>
            <div class="fw-bold text-white mb-1" style="font-size: 0.9rem;">${alt.campaign_name}</div>
            <div class="fs-5 fw-bold text-primary mb-2 font-mono">${alt.predicted_roi_formatted} ROI</div>
            <div class="text-secondary font-mono" style="font-size: 0.75rem; line-height: 1.6;">
              <div>Revenue: <strong class="text-white">${alt.predicted_revenue_formatted}</strong></div>
              <div>Conv Rate: <strong class="text-white">${alt.predicted_conversion_rate_formatted}</strong></div>
              <div>Success: <strong class="text-white">${alt.success_probability_formatted}</strong></div>
              <div>Channel: <strong class="text-white">${alt.config.platform}</strong> (${alt.config.creative_format})</div>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline-custom w-100 mt-3" onclick='applyStrategyConfiguration(${JSON.stringify(alt.config)})'>
            <i class="bi bi-check2"></i> Apply Strategy
          </button>
        </div>
      </div>
    `).join('');
  }

  // Ranked Candidates Table
  const tableBody = document.getElementById('rankedCandidatesTableBody');
  if (tableBody && opt.all_ranked_candidates) {
    tableBody.innerHTML = opt.all_ranked_candidates.map((cand, idx) => {
      const isWinner = idx === 0;
      return `
        <tr class="${isWinner ? 'table-success bg-opacity-25' : ''}">
          <td class="fw-bold text-white">
            ${isWinner ? '<i class="bi bi-trophy-fill text-warning me-1"></i>' : ''}
            #${idx + 1} ${cand.campaign_name}
          </td>
          <td>${cand.config.platform}</td>
          <td>${cand.config.creative_format}</td>
          <td class="fw-bold font-mono ${cand.predicted_roi >= 0 ? 'text-success' : 'text-danger'}">${cand.predicted_roi_formatted}</td>
          <td class="fw-bold font-mono text-white">${cand.predicted_revenue_formatted}</td>
          <td class="font-mono">${cand.success_probability_formatted}</td>
          <td><span class="badge-custom ${isWinner ? 'badge-emerald' : 'badge-navy'} font-mono">${cand.composite_score}</span></td>
        </tr>
      `;
    }).join('');
  }
}

// Apply selected alternative configuration to form
window.applyStrategyConfiguration = function(config) {
  if (!config) return;
  setFormValue('platform', config.platform);
  setFormValue('adPlacement', config.ad_placement);
  setFormValue('creativeFormat', config.creative_format);
  setFormValue('creativeEmotion', config.creative_emotion);
  setFormValue('deviceType', config.device_type);
  setFormValue('targetAge', config.target_audience_age);
  setFormValue('interestCat', config.audience_interest_category);

  if (config.has_call_to_action !== undefined) {
    const cta = document.getElementById('hasCta');
    if (cta) cta.checked = Boolean(config.has_call_to_action);
  }
  if (config.retargeting_flag !== undefined) {
    const rf = document.getElementById('retargetingFlag');
    if (rf) rf.checked = Boolean(config.retargeting_flag);
  }

  showToast(`Applied ${config.platform} (${config.creative_format}) configuration to form. Click Optimize to evaluate!`, 'info');
  const form = document.getElementById('optimizerForm');
  if (form) form.scrollIntoView({ behavior: 'smooth' });
};
