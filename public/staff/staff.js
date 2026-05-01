import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '../shared/firebase-client.js';
import {
  confirmGuestArrival,
  getMyStaffEventWorkspace,
  markGuestWillReturn,
  verifyEventGuestQr,
} from '../shared/api.js';
import QrScanner from '/vendor/qr-scanner.min.js';

QrScanner.WORKER_PATH = '/vendor/qr-scanner-worker.min.js';

const staffState = {
  authUser: null,
  staff: null,
  event: null,
  stats: null,
  recentArrivals: [],
  scannerMode: 'manual',
  autoConfirmArrival: false,
  lastQrPayload: '',
  lastScanResult: null,
  verifying: false,
  confirming: false,
  loadingWorkspace: false,
  message: '',
  arrivedGuestSearch: '',
  cameraScanner: null,
  cameraActive: false,
  cameraStarting: false,
  cameraError: '',
  lastCameraPayload: '',
  lastCameraPayloadAt: 0,
  scanCooldownUntil: 0,
};

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showStaffMessage(message, type = 'info') {
  const dashboardVisible = !qs('#staffDashboardView')?.classList.contains('hidden');
  const messageBox = dashboardVisible
    ? qs('#staffDashboardMessage') || qs('#staffMessage')
    : qs('#staffMessage') || qs('#staffDashboardMessage');
  if (!messageBox) return;

  if (!message) {
    messageBox.className = 'staff-message hidden';
    messageBox.textContent = '';
    return;
  }

  messageBox.className = `staff-message staff-message-${type}`;
  messageBox.textContent = message;
}

function getErrorMessage(error, fallback) {
  const details = error?.details || {};
  return details.reasonMessage || error?.originalMessage || error?.message || fallback;
}

function getAccessErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'This account is not assigned to active event staff access.';
  }
  return 'Unable to load staff workspace. Try again.';
}

function renderLoginView() {
  qs('#staffLoginView')?.classList.remove('hidden');
  qs('#staffDashboardView')?.classList.add('hidden');
}

function clearStaffData() {
  stopCameraScanner({ silent: true, render: false });
  staffState.staff = null;
  staffState.event = null;
  staffState.stats = null;
  staffState.recentArrivals = [];
  staffState.lastQrPayload = '';
  staffState.lastScanResult = null;
  staffState.verifying = false;
  staffState.confirming = false;
  staffState.loadingWorkspace = false;
  staffState.message = '';
  staffState.arrivedGuestSearch = '';
  staffState.cameraError = '';
  staffState.lastCameraPayload = '';
  staffState.lastCameraPayloadAt = 0;
  staffState.scanCooldownUntil = 0;
}

function getPositionLabel(staff) {
  if (!staff) return 'Staff';
  if (staff.position === 'other') return staff.customPosition || 'Other';
  const labels = {
    general_supervisor: 'General Supervisor',
    security_guard: 'Security Guard',
    entry_organizer: 'Entry Organizer',
  };
  return labels[staff.position] || staff.position || 'Staff';
}

async function setScannerMode(mode) {
  if (staffState.scannerMode === 'camera' && mode !== 'camera') {
    await stopCameraScanner({ silent: true, render: false });
  }
  staffState.scannerMode = mode === 'camera' ? 'camera' : 'manual';
  renderScannerWorkspace();
}

function renderCameraScannerPanel() {
  const status = staffState.cameraError
    || (staffState.cameraStarting
      ? 'Starting camera...'
      : staffState.cameraActive
        ? 'Point the camera at the guest QR code.'
        : 'Camera is off.');

  return `
    <section id="cameraScannerPanel" class="scanner-panel">
      <div class="staff-qr-video-frame ${staffState.cameraActive ? 'is-active' : ''}">
        <video id="staffQrVideo" class="staff-qr-video" playsinline muted></video>
        <div class="camera-frame-lines" aria-hidden="true"></div>
      </div>
      <p id="cameraScannerStatus" class="camera-scanner-status ${staffState.cameraError ? 'camera-error-note' : ''}">${escapeHtml(status)}</p>
      <p class="camera-helper-note">Camera scanning requires HTTPS and camera permission.</p>
      <div class="camera-scanner-controls">
        <button id="staffOpenScannerButton" class="staff-button" type="button" ${staffState.cameraActive || staffState.cameraStarting ? 'disabled' : ''}>
          ${staffState.cameraStarting ? 'Starting camera...' : 'Start camera'}
        </button>
        <button id="staffStopScannerButton" class="staff-secondary-button" type="button" ${!staffState.cameraActive && !staffState.cameraStarting ? 'disabled' : ''}>Stop camera</button>
      </div>
    </section>
  `;
}

function renderManualScannerPanel() {
  return `
    <section id="manualScannerPanel" class="scanner-panel">
      <label class="staff-field" for="manualQrPayloadInput">
        <span>Manual QR payload</span>
        <textarea id="manualQrPayloadInput" rows="5" placeholder="Paste QR payload here, for example: gaiah://invite-pass?t=...&g=...&p=...">${escapeHtml(staffState.lastQrPayload)}</textarea>
      </label>
      <button id="verifyManualQrButton" class="staff-button" type="button" ${staffState.verifying || staffState.confirming ? 'disabled' : ''}>
        ${staffState.verifying ? 'Checking QR...' : 'Check QR'}
      </button>
    </section>
  `;
}

function renderGuestSummary(result) {
  if (!result?.guest) return '';
  return `
    <dl class="scan-token-grid">
      <div>
        <dt>Guest</dt>
        <dd>${escapeHtml(result.guest.guestName || '-')}</dd>
      </div>
      <div>
        <dt>Attendance</dt>
        <dd>${escapeHtml(result.attendanceStatus || result.guest.attendanceStatus || '-')}</dd>
      </div>
      <div>
        <dt>WhatsApp</dt>
        <dd>${escapeHtml(result.guest.whatsappMasked || '-')}</dd>
      </div>
    </dl>
  `;
}

function renderScanActions(result) {
  if (result.status === 'allowed') {
    if (staffState.autoConfirmArrival) {
      return '<p class="scan-disabled-note">Auto-confirming arrival...</p>';
    }
    return `
      <div class="scan-action-row">
        <button id="confirmArrivalButton" class="staff-button" type="button" ${staffState.confirming ? 'disabled' : ''}>
          ${staffState.confirming ? 'Confirming...' : 'Confirm Arrival'}
        </button>
        <button id="tryAnotherQrButton" class="staff-secondary-button" type="button">Try Another Code</button>
      </div>
    `;
  }

  if (result.status === 'confirmed') {
    return `
      <div class="scan-action-row">
        <button id="markWillReturnButton" class="staff-secondary-button" type="button" ${staffState.confirming ? 'disabled' : ''}>
          ${staffState.confirming ? 'Saving...' : 'Mark Will Return'}
        </button>
        <button id="tryAnotherQrButton" class="staff-secondary-button" type="button">Try Another Code</button>
      </div>
    `;
  }

  if (result.status === 'will_return') {
    return `
      <div class="scan-action-row">
        <button id="confirmArrivalButton" class="staff-button" type="button" ${staffState.confirming ? 'disabled' : ''}>
          ${staffState.confirming ? 'Confirming...' : 'Confirm Arrival Again'}
        </button>
        <button id="tryAnotherQrButton" class="staff-secondary-button" type="button">Try Another Code</button>
      </div>
    `;
  }

  if (result.status === 'rejected') {
    return `
      <div class="scan-action-row">
        <button id="tryAnotherQrButton" class="staff-secondary-button" type="button">Try Another Code</button>
      </div>
    `;
  }

  return '';
}

function renderScanResultPanel() {
  const container = qs('#scanResultPanel');
  if (!container) return;

  if (staffState.verifying) {
    container.innerHTML = `
      <section class="scan-result-card scan-result-recognized">
        <span class="scan-status-badge scan-status-pending">Checking</span>
        <h3>Checking QR...</h3>
        <p>Please wait while the backend verifies this pass.</p>
      </section>
    `;
    return;
  }

  const result = staffState.lastScanResult || { status: 'empty' };

  if (result.status === 'allowed') {
    container.innerHTML = `
      <section class="scan-result-card scan-result-allowed">
        <span class="scan-status-badge scan-status-allowed">Valid</span>
        <h3>QR valid</h3>
        <p>${escapeHtml(result.reasonMessage || 'QR is valid for arrival.')}</p>
        ${renderGuestSummary(result)}
        ${renderScanActions(result)}
      </section>
    `;
    return;
  }

  if (result.status === 'confirmed') {
    container.innerHTML = `
      <section class="scan-result-card scan-result-confirmed">
        <span class="scan-status-badge scan-status-confirmed">Confirmed</span>
        <h3>Arrival confirmed</h3>
        <p>Guest arrival has been recorded.</p>
        ${renderGuestSummary(result)}
        ${renderScanActions(result)}
      </section>
    `;
    return;
  }

  if (result.status === 'will_return') {
    container.innerHTML = `
      <section class="scan-result-card scan-result-recognized">
        <span class="scan-status-badge scan-status-pending">Will return</span>
        <h3>Guest marked as will return</h3>
        <p>This QR can be used again for re-entry.</p>
        ${renderGuestSummary(result)}
        ${renderScanActions(result)}
      </section>
    `;
    return;
  }

  if (result.status === 'rejected') {
    container.innerHTML = `
      <section class="scan-result-card scan-result-invalid">
        <span class="scan-status-badge scan-status-invalid">Rejected</span>
        <h3>QR rejected</h3>
        <p>${escapeHtml(result.reasonMessage || 'Unable to verify QR. Try again.')}</p>
        ${result.reasonCode ? `<p class="scan-disabled-note">Reason code: ${escapeHtml(result.reasonCode)}</p>` : ''}
        ${renderGuestSummary(result)}
        ${renderScanActions(result)}
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <section class="scan-result-card scan-result-empty">
      <h3>No QR checked yet.</h3>
      <p>Paste a QR payload and check it against the assigned event.</p>
    </section>
  `;
}

function renderScannerWorkspace() {
  document.querySelectorAll('[data-scanner-mode]').forEach((button) => {
    const isActive = button.dataset.scannerMode === staffState.scannerMode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const panelContainer = qs('#scannerPanels');
  if (panelContainer) {
    panelContainer.innerHTML =
      staffState.scannerMode === 'manual'
        ? renderManualScannerPanel()
        : renderCameraScannerPanel();
  }

  renderScanResultPanel();
}

function getCameraErrorMessage(error) {
  const name = error?.name || '';
  const message = error?.message || '';

  if (name === 'NotAllowedError' || /permission/i.test(message)) {
    return 'Camera permission was denied.';
  }

  if (name === 'NotFoundError' || (/camera/i.test(message) && /not found/i.test(message))) {
    return 'No camera was found on this device.';
  }

  return 'Unable to start camera scanner.';
}

async function checkCameraSupport() {
  if (typeof QrScanner.hasCamera !== 'function') {
    return true;
  }

  try {
    return await QrScanner.hasCamera();
  } catch (error) {
    return false;
  }
}

async function startCameraScanner() {
  if (staffState.cameraActive || staffState.cameraStarting) return;

  staffState.cameraStarting = true;
  staffState.cameraError = '';
  renderScannerWorkspace();

  try {
    const hasCamera = await checkCameraSupport();
    if (!hasCamera) {
      throw new DOMException('No camera was found on this device.', 'NotFoundError');
    }

    const video = qs('#staffQrVideo');
    if (!video) {
      throw new Error('Camera preview is not available.');
    }

    const scanner = new QrScanner(video, handleCameraScanResult, {
      preferredCamera: 'environment',
      highlightScanRegion: true,
      highlightCodeOutline: true,
      returnDetailedScanResult: true,
    });

    staffState.cameraScanner = scanner;
    await scanner.start();
    staffState.cameraActive = true;
    staffState.cameraStarting = false;
    const status = qs('#cameraScannerStatus');
    if (status) {
      status.classList.remove('camera-error-note');
      status.textContent = 'Point the camera at the guest QR code.';
    }
    qs('#staffOpenScannerButton')?.setAttribute('disabled', 'disabled');
    qs('#staffStopScannerButton')?.removeAttribute('disabled');
    showStaffMessage('Camera scanner started.', 'info');
  } catch (error) {
    if (staffState.cameraScanner) {
      try {
        staffState.cameraScanner.stop();
        staffState.cameraScanner.destroy?.();
      } catch (cleanupError) {
        console.error('[staff] camera scanner cleanup failed', cleanupError);
      }
    }
    staffState.cameraScanner = null;
    staffState.cameraActive = false;
    staffState.cameraStarting = false;
    staffState.cameraError = getCameraErrorMessage(error);
    renderScannerWorkspace();
  }
}

async function stopCameraScanner({ silent = false, render = true } = {}) {
  const scanner = staffState.cameraScanner;
  staffState.cameraScanner = null;
  staffState.cameraActive = false;
  staffState.cameraStarting = false;

  if (scanner) {
    try {
      scanner.stop();
      scanner.destroy?.();
    } catch (error) {
      console.error('[staff] camera scanner stop failed', error);
    }
  }

  if (render) {
    renderScannerWorkspace();
  }

  if (!silent) {
    showStaffMessage('Camera scanner stopped.', 'info');
  }
}

async function handleCameraScanResult(result) {
  const payload = (typeof result === 'string' ? result : result?.data || '').trim();
  if (!payload) return;

  const now = Date.now();
  if (now < staffState.scanCooldownUntil) return;

  staffState.scanCooldownUntil = now + 2500;
  if (payload === staffState.lastCameraPayload && now - staffState.lastCameraPayloadAt < 5000) return;

  staffState.lastCameraPayload = payload;
  staffState.lastCameraPayloadAt = now;
  staffState.lastQrPayload = payload;
  await stopCameraScanner({ silent: true, render: true });
  await verifyQrPayload(payload);
}

function renderArrivedGuestsList() {
  const container = qs('#arrivedGuestsList');
  if (!container) return;

  const searchTerm = staffState.arrivedGuestSearch.trim().toLowerCase();
  const rows = searchTerm
    ? staffState.recentArrivals.filter((arrival) =>
        String(arrival.guestName || '').toLowerCase().includes(searchTerm),
      )
    : staffState.recentArrivals;

  if (!rows.length) {
    container.innerHTML = '<p class="staff-empty-state">No arrivals recorded yet.</p>';
    return;
  }

  container.innerHTML = `
    <div class="staff-arrivals-table">
      <div class="staff-arrivals-row staff-arrivals-row-head">
        <span>Name</span>
        <span>Arrival time</span>
        <span>Staff</span>
      </div>
      ${rows
        .map(
          (arrival) => `
            <div class="staff-arrivals-row">
              <span>${escapeHtml(arrival.guestName || '-')}</span>
              <span>${escapeHtml(arrival.createdAt || '-')}</span>
              <span>${escapeHtml(arrival.staffSnapshot?.fullName || '-')}</span>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderRejectionReasons() {
  const list = qs('#rejectionReasonsList');
  if (!list) return;

  const reasons = [
    'QR does not belong to this event',
    'Invitation was revoked',
    'Guest declined the invitation',
    'Guest has not accepted the invitation',
    'Guest already arrived',
    'QR pass is inactive',
    'Invalid QR format',
  ];

  list.innerHTML = reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('');
}

function renderDashboardView() {
  qs('#staffLoginView')?.classList.add('hidden');
  qs('#staffDashboardView')?.classList.remove('hidden');

  const event = staffState.event || {};
  const staff = staffState.staff || {};
  const stats = staffState.stats || {};
  const mappings = {
    '#staffNameLabel': staff.fullName || 'Staff Member',
    '#staffRoleLabel': getPositionLabel(staff),
    '#staffEventName': event.eventName || 'Event name',
    '#staffEventDate': event.eventDate || 'Event date',
    '#staffEventTime': event.eventTime || 'Event time',
    '#staffEventLocation': event.eventLocation || 'Event location',
    '#staffTotalGuests': stats.totalAcceptedGuests || 0,
    '#staffArrivedCount': stats.arrived || 0,
    '#staffNotArrivedCount': stats.notArrived || 0,
    '#staffReEntryPendingCount': stats.willReturn || 0,
  };

  Object.entries(mappings).forEach(([selector, value]) => {
    const element = qs(selector);
    if (element) element.textContent = value;
  });

  const autoConfirmToggle = qs('#autoConfirmToggle');
  if (autoConfirmToggle) autoConfirmToggle.checked = staffState.autoConfirmArrival;

  renderScannerWorkspace();
  renderArrivedGuestsList();
  renderRejectionReasons();
}

async function loadStaffWorkspace() {
  staffState.loadingWorkspace = true;
  showStaffMessage('Loading staff workspace...', 'info');

  try {
    const result = await getMyStaffEventWorkspace();
    staffState.staff = result.staff || null;
    staffState.event = result.event || null;
    staffState.stats = result.stats || null;
    staffState.recentArrivals = result.recentArrivals || [];
    staffState.loadingWorkspace = false;
    renderDashboardView();
    showStaffMessage('');
  } catch (error) {
    staffState.loadingWorkspace = false;
    clearStaffData();
    renderLoginView();
    showStaffMessage(getAccessErrorMessage(error), 'error');
  }
}

async function handleStaffLogin() {
  const emailInput = qs('#staffEmailInput');
  const passwordInput = qs('#staffPasswordInput');
  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';

  if (!email || !password) {
    showStaffMessage('Enter email and password to continue.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStaffMessage('Enter a valid email address.', 'error');
    return;
  }

  try {
    showStaffMessage('Signing in...', 'info');
    const credential = await signInWithEmailAndPassword(auth, email, password);
    staffState.authUser = credential.user;
    if (passwordInput) passwordInput.value = '';
    await loadStaffWorkspace();
  } catch (error) {
    showStaffMessage('Unable to sign in. Check your email and password.', 'error');
  }
}

async function handleSignOut() {
  try {
    await stopCameraScanner({ silent: true, render: false });
    await signOut(auth);
  } finally {
    staffState.authUser = null;
    clearStaffData();
    qs('#staffLoginForm')?.reset();
    renderLoginView();
  }
}

function normalizeVerifyResult(result) {
  if (result?.allowed) {
    return {
      status: 'allowed',
      ...result,
    };
  }

  return {
    status: 'rejected',
    ...result,
    reasonMessage: result?.reasonMessage || 'QR rejected.',
  };
}

async function confirmArrivalForCurrentQr() {
  if (!staffState.lastQrPayload) {
    showStaffMessage('Paste a QR payload first.', 'error');
    return;
  }

  staffState.confirming = true;
  renderScanResultPanel();

  try {
    const result = await confirmGuestArrival({ qrPayload: staffState.lastQrPayload });
    staffState.lastScanResult = result.confirmed
      ? {
          status: 'confirmed',
          ...result,
          reasonMessage: 'Guest arrival has been recorded.',
        }
      : {
          status: 'rejected',
          ...result,
          reasonMessage: result.reasonMessage || 'Unable to confirm arrival.',
        };
    await loadStaffWorkspace();
    renderScanResultPanel();
  } catch (error) {
    staffState.lastScanResult = {
      status: 'rejected',
      reasonMessage: getErrorMessage(error, 'Unable to confirm arrival. Try again.'),
      reasonCode: error?.details?.reasonCode || error?.code || '',
    };
  } finally {
    staffState.confirming = false;
    renderScanResultPanel();
  }
}

async function markWillReturnForCurrentQr() {
  if (!staffState.lastQrPayload) {
    showStaffMessage('Paste a QR payload first.', 'error');
    return;
  }

  staffState.confirming = true;
  renderScanResultPanel();

  try {
    const result = await markGuestWillReturn({ qrPayload: staffState.lastQrPayload });
    staffState.lastScanResult = result.marked
      ? {
          status: 'will_return',
          ...result,
          reasonMessage: 'This QR can be used again for re-entry.',
        }
      : {
          status: 'rejected',
          ...result,
          reasonMessage: result.reasonMessage || 'Unable to mark will return.',
        };
    await loadStaffWorkspace();
    renderScanResultPanel();
  } catch (error) {
    staffState.lastScanResult = {
      status: 'rejected',
      reasonMessage: getErrorMessage(error, 'Unable to mark will return. Try again.'),
      reasonCode: error?.details?.reasonCode || error?.code || '',
    };
  } finally {
    staffState.confirming = false;
    renderScanResultPanel();
  }
}

async function verifyQrPayload(payload) {
  const normalizedPayload = String(payload || '').trim();
  if (!normalizedPayload) {
    staffState.lastScanResult = {
      status: 'rejected',
      reasonCode: 'invalid_qr_format',
      reasonMessage: 'Paste a QR payload first.',
    };
    renderScanResultPanel();
    return;
  }

  staffState.lastQrPayload = normalizedPayload;
  staffState.verifying = true;
  staffState.lastScanResult = null;
  renderScannerWorkspace();

  try {
    const result = await verifyEventGuestQr({ qrPayload: normalizedPayload });
    staffState.lastScanResult = normalizeVerifyResult(result);
    staffState.verifying = false;
    renderScannerWorkspace();

    if (result.allowed && staffState.autoConfirmArrival) {
      await confirmArrivalForCurrentQr();
    }
  } catch (error) {
    staffState.lastScanResult = {
      status: 'rejected',
      reasonMessage: getErrorMessage(error, 'Unable to verify QR. Try again.'),
      reasonCode: error?.details?.reasonCode || error?.code || '',
    };
    staffState.verifying = false;
    renderScannerWorkspace();
  }
}

async function handleManualQrCheck() {
  await verifyQrPayload(qs('#manualQrPayloadInput')?.value || '');
}

function clearCurrentQr() {
  staffState.lastQrPayload = '';
  staffState.lastScanResult = null;
  const input = qs('#manualQrPayloadInput');
  if (input) input.value = '';
  renderScannerWorkspace();
}

function toggleAutoConfirmArrival(isEnabled) {
  staffState.autoConfirmArrival = Boolean(isEnabled);
  const message = staffState.autoConfirmArrival
    ? 'Auto-confirm is enabled.'
    : 'Auto-confirm is disabled.';
  showStaffMessage(message, 'info');
}

function bindStaffEvents() {
  qs('#staffLoginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    handleStaffLogin();
  });

  qs('#staffSignOutButton')?.addEventListener('click', handleSignOut);
  qs('#staffDashboardView')?.addEventListener('click', (event) => {
    const scannerModeButton = event.target.closest('[data-scanner-mode]');
    if (scannerModeButton) {
      setScannerMode(scannerModeButton.dataset.scannerMode);
      return;
    }

    if (event.target.closest('#staffOpenScannerButton')) {
      startCameraScanner();
      return;
    }

    if (event.target.closest('#staffStopScannerButton')) {
      stopCameraScanner();
      return;
    }

    if (event.target.closest('#verifyManualQrButton')) {
      handleManualQrCheck();
      return;
    }

    if (event.target.closest('#confirmArrivalButton')) {
      confirmArrivalForCurrentQr();
      return;
    }

    if (event.target.closest('#markWillReturnButton')) {
      markWillReturnForCurrentQr();
      return;
    }

    if (event.target.closest('#tryAnotherQrButton')) {
      clearCurrentQr();
    }
  });

  qs('#staffDashboardView')?.addEventListener('change', (event) => {
    if (event.target.matches('#autoConfirmToggle')) {
      toggleAutoConfirmArrival(event.target.checked);
    }
  });

  qs('#staffDashboardView')?.addEventListener('input', (event) => {
    if (event.target.matches('#arrivedGuestSearchInput')) {
      staffState.arrivedGuestSearch = event.target.value;
      renderArrivedGuestsList();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindStaffEvents();
  renderLoginView();
  showStaffMessage('Checking session...', 'info');

  onAuthStateChanged(auth, async (user) => {
    staffState.authUser = user;
    if (!user) {
      await stopCameraScanner({ silent: true, render: false });
      clearStaffData();
      renderLoginView();
      showStaffMessage('');
      return;
    }

    await loadStaffWorkspace();
  });
});

window.addEventListener('beforeunload', () => {
  if (staffState.cameraScanner) {
    staffState.cameraScanner.stop();
    staffState.cameraScanner.destroy?.();
  }
});
