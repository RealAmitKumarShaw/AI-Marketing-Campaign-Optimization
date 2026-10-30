/**
 * AI Marketing Campaign Optimization - Global Scripts
 * Facet "Designed in Glass" Theme
 * Member 4: Optimization, Recommendation & Web Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initTooltips();
  initNavScroll();
  checkApiHealth();
});

// Floating Navbar Scroll Blur/Shadow Enhancement
function initNavScroll() {
  const nav = document.getElementById('mainGlassNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }
}

// Sidebar Toggle (Desktop Collapse & Mobile Off-Canvas Drawer)
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('show');
    if (backdrop) backdrop.classList.add('show');
    document.body.classList.add('sidebar-open');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    document.body.classList.remove('sidebar-open');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth > 992) {
        document.body.classList.toggle('sidebar-collapsed');
      } else {
        if (sidebar && sidebar.classList.contains('show')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  // Handle window resize cleanly
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      closeMobileSidebar();
    }
  });
}

// Bootstrap Tooltips
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map((tooltipTriggerEl) => {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Format numbers into Indian Rupee (₹) format
function formatINR(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0.00';
  }
  const val = Number(value);
  const sign = val < 0 ? '-' : '';
  const absVal = Math.abs(val);

  const parts = absVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);
    let res = '';
    while (otherNumbers.length > 2) {
      res = ',' + otherNumbers.substring(otherNumbers.length - 2) + res;
      otherNumbers = otherNumbers.substring(0, otherNumbers.length - 2);
    }
    integerPart = otherNumbers + res + ',' + lastThree;
  }

  return `${sign}₹${integerPart}.${decimalPart}`;
}

// Format percentage with sign
function formatPercent(value, showPlus = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  const val = Number(value);
  const plus = showPlus && val > 0 ? '+' : '';
  return `${plus}${val.toFixed(2)}%`;
}

// API Call Wrapper
async function fetchApi(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `API error ${response.status}: ${response.statusText}`);
    }
    return json;
  } catch (err) {
    console.error(`API Call failed to ${endpoint}:`, err);
    throw err;
  }
}

// Toast Notification (Smoked Glass Styled)
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const borderCol = type === 'success' ? 'var(--emerald-primary)' :
                    type === 'danger' || type === 'error' ? 'var(--rose-primary)' :
                    type === 'warning' ? 'var(--orange-primary)' : 'var(--lavender-primary)';

  const icon = type === 'success' ? 'bi-check-circle-fill text-success' :
               type === 'danger' || type === 'error' ? 'bi-exclamation-triangle-fill text-danger' :
               type === 'warning' ? 'bi-exclamation-circle-fill text-warning' : 'bi-info-circle-fill text-primary';

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center border-0 shadow-lg mb-2';
  toastEl.style.cssText = `background: rgba(14, 15, 24, 0.95); backdrop-filter: blur(20px); border: 1px solid ${borderCol} !important; border-radius: 12px; color: #ffffff;`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${icon} fs-5"></i>
        <span style="font-size: 0.85rem;">${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4200 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

// Button loading state
function setButtonLoading(btn, isLoading, loadingText = 'Processing...') {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${loadingText}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
    }
  }
}

// Check API Health on load
async function checkApiHealth() {
  const statusEl = document.getElementById('modelHealthPill');
  if (!statusEl) return;

  try {
    const res = await fetchApi('/api/health');
    if (res.status === 'healthy') {
      statusEl.innerHTML = `<span class="status-dot-emerald"></span><span>4 ML Models</span>`;
    }
  } catch (err) {
    statusEl.innerHTML = `<span class="badge-custom badge-rose">Model Sync Error</span>`;
  }
}
