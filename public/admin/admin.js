import {
  activatePlanSubscription,
  approvePlanSubscriptionRequest,
  getClientDetails,
  getSystemAdminOverview,
  listClients,
  listPlanSubscriptionRequests,
  rejectPlanSubscriptionRequest,
  updatePlanSubscriptionPaymentStatus,
} from '../shared/api.js';
import { loginClientAccount, logout, waitForAuthUser } from '../shared/auth.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  authUser: null,
  overview: null,
  clients: [],
  requests: [],
  openMenuRequestId: null,
  selectedClientUid: null,
  loaded: {
    home: false,
    clients: false,
    requests: false,
  },
};

const statusLabels = {
  request: {
    pending: 'قيد المراجعة',
    approved: 'موافق عليه',
    active: 'نشط',
    rejected: 'مرفوض',
    expired: 'منتهي',
    cancelled: 'ملغي',
  },
  payment: {
    not_paid: 'غير مدفوع',
    partially_paid: 'مدفوع جزئياً',
    fully_paid: 'مدفوع بالكامل',
  },
  account: {
    pending: 'قيد المراجعة',
    active: 'نشط',
    rejected: 'مرفوض',
    suspended: 'موقوف',
  },
};

const pageTitles = {
  home: 'الرئيسية',
  clients: 'العملاء',
  requests: 'الطلبات',
};

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getLabel(type, value) {
  return statusLabels[type][value] || 'غير معروف';
}

function getBadgeClass(value) {
  if (value === 'active' || value === 'approved' || value === 'fully_paid') return 'badge-active';
  if (value === 'rejected' || value === 'suspended') return 'badge-rejected';
  if (value === 'expired' || value === 'cancelled') return 'badge-expired';
  if (value === 'partially_paid') return 'badge-payment';
  return 'badge-pending';
}

function badge(type, value) {
  return `<span class="status-badge ${getBadgeClass(value)}">${getLabel(type, value)}</span>`;
}

function getPlanName(request) {
  return request.planSnapshot?.name || request.selectedPlanId || '-';
}

function getPrice(request) {
  const price = request.planSnapshot?.price;
  const currency = request.planSnapshot?.currency || '';
  return price === undefined || price === null ? '-' : `${price} ${currency}`;
}

function getGuestCount(request) {
  return request.planSnapshot?.guestCount || request.selectedGuestCount || '-';
}

function showToast(message, type = 'info') {
  const toast = qs('#adminToast');
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add('hidden'), 3200);
}

function setGlobalState({ title, message, actions = '' }) {
  hideAdminLogin();
  qs('#adminStateTitle').textContent = title;
  qs('#adminStateMessage').textContent = message;
  qs('#adminStateActions').innerHTML = actions;
  qs('#adminStateActions').classList.toggle('hidden', !actions);
  qs('#adminState').classList.remove('hidden');
  qsa('.admin-page').forEach((page) => page.classList.add('hidden'));
}

function clearGlobalState() {
  qs('#adminState').classList.add('hidden');
}

function hideAdminPages() {
  qsa('.admin-page').forEach((page) => page.classList.add('hidden'));
}

function showAdminLogin(message = '') {
  clearGlobalState();
  hideAdminPages();
  qs('#adminLoginPanel').classList.remove('hidden');
  qs('#adminLoginAlert').textContent = message;
  qs('#adminLoginAlert').classList.toggle('hidden', !message);
}

function hideAdminLogin() {
  qs('#adminLoginPanel').classList.add('hidden');
  qs('#adminLoginAlert').classList.add('hidden');
}

function resetAdminData() {
  state.authUser = null;
  state.overview = null;
  state.clients = [];
  state.requests = [];
  state.openMenuRequestId = null;
  state.selectedClientUid = null;
  state.loaded = {
    home: false,
    clients: false,
    requests: false,
  };
}

function setSectionLoading(target, message = 'جار تحميل البيانات...') {
  target.innerHTML = `<div class="section-loading">${message}</div>`;
}

function getCallableErrorMessage(error) {
  const message = error?.message || '';
  if (message.includes('permission') || message.includes('صلاحية')) {
    return 'هذا الحساب لا يملك صلاحية مدير النظام.';
  }
  return message || 'تعذر تنفيذ الطلب حالياً.';
}

async function guardAdminAccess() {
  setGlobalState({
    title: 'جار تحميل لوحة الإدارة...',
    message: 'يتم التحقق من حالة تسجيل الدخول وصلاحية مدير النظام.',
  });

  const authUser = await waitForAuthUser();
  state.authUser = authUser;

  if (!authUser) {
    showAdminLogin();
    return false;
  }

  try {
    state.overview = await getSystemAdminOverview();
    state.loaded.home = true;
    qs('.admin-identity span').textContent = authUser.displayName || authUser.email || 'مدير النظام';
    hideAdminLogin();
    clearGlobalState();
    renderHome();
    return true;
  } catch (error) {
    setGlobalState({
      title: getCallableErrorMessage(error),
      message: 'صلاحية مدير النظام يتم التحقق منها من الخادم.',
      actions: '<button id="switchAdminAccountButton" class="btn btn-secondary" type="button">تسجيل الخروج وتبديل الحساب</button><a class="btn btn-secondary" href="/">العودة للصفحة الرئيسية</a>',
    });
    qs('#switchAdminAccountButton').addEventListener('click', async () => {
      await logout();
      resetAdminData();
      showAdminLogin('هذا الحساب لا يملك صلاحية مدير النظام.');
    });
    return false;
  }
}

async function refreshOverview() {
  setSectionLoading(qs('#overviewStats'));
  qs('#recentRequests').innerHTML = '';
  qs('#notificationsPanel').innerHTML = '';
  state.overview = await getSystemAdminOverview();
  state.loaded.home = true;
  renderHome();
}

function renderHome() {
  const overview = state.overview || {};
  const stats = overview.stats || {};
  const statItems = [
    ['إجمالي العملاء', stats.totalClients || 0],
    ['العملاء النشطون', stats.activeClients || 0],
    ['طلبات قيد المراجعة', stats.pendingRequests || 0],
    ['المدفوعات غير المكتملة', (stats.unpaidRequests || 0) + (stats.partiallyPaidRequests || 0)],
  ];

  qs('#overviewStats').innerHTML = statItems.map(([label, value]) => `
    <article class="card stat-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join('');

  const requests = Array.isArray(overview.recentRequests) ? overview.recentRequests : [];
  qs('#recentRequests').innerHTML = requests.length ? requests.map((request) => `
    <button class="compact-row" type="button" data-page="requests" data-request-id="${request.id}">
      <span>
        <strong>${request.fullName || request.email || '-'}</strong>
        <small>${getPlanName(request)} - ${request.hallName || '-'}</small>
      </span>
      ${badge('request', request.requestStatus)}
    </button>
  `).join('') : '<div class="empty-panel">لا توجد طلبات حديثة.</div>';

  const notifications = Array.isArray(overview.notifications) ? overview.notifications : [];
  qs('#notificationsPanel').innerHTML = notifications.length ? notifications.map((item) => `
    <article class="notification-item ${item.severity || 'neutral'}">
      <strong>${item.title || '-'}</strong>
      <p>${item.message || '-'}</p>
    </article>
  `).join('') : '<div class="empty-panel">لا توجد تنبيهات حالياً.</div>';
}

function getClientFilters() {
  return {
    search: qs('#clientSearch').value.trim(),
    status: qs('#clientStatusFilter').value,
  };
}

async function loadClients() {
  qs('#clientsTable').innerHTML = '<tr><td colspan="8" class="empty-cell">جار تحميل العملاء...</td></tr>';
  const result = await listClients(getClientFilters());
  state.clients = Array.isArray(result.clients) ? result.clients : [];
  state.loaded.clients = true;
  renderClients();
}

function renderClients() {
  const table = qs('#clientsTable');
  table.innerHTML = state.clients.map((client) => `
    <tr>
      <td>${client.fullName || '-'}</td>
      <td>${client.hallName || '-'}</td>
      <td>${client.email || '-'}</td>
      <td>${client.whatsapp || '-'}</td>
      <td>${badge('account', client.accountStatus)}</td>
      <td>${client.totalRequestCount || 0}</td>
      <td>${formatDate(client.latestRequest?.createdAt)}</td>
      <td>
        <button class="table-action" type="button" data-client-uid="${client.uid}">عرض التفاصيل</button>
      </td>
    </tr>
  `).join('');

  if (!state.clients.length) {
    table.innerHTML = '<tr><td colspan="8" class="empty-cell">لا توجد نتائج مطابقة.</td></tr>';
  }
}

async function selectClient(uid) {
  state.selectedClientUid = uid;
  const panel = qs('#clientDetailsPanel');
  panel.innerHTML = '<div class="section-loading">جار تحميل تفاصيل العميل...</div>';

  try {
    const result = await getClientDetails(uid);
    renderClientDetails(result.user, result.subscriptions || []);
  } catch (error) {
    panel.innerHTML = `<h2>تعذر تحميل تفاصيل العميل</h2><p>${getCallableErrorMessage(error)}</p>`;
  }
}

function renderClientDetails(user, subscriptions) {
  qs('#clientDetailsPanel').innerHTML = `
    <h2>${user.fullName || user.email || '-'}</h2>
    <dl class="details-list">
      <div><dt>القاعة</dt><dd>${user.hallName || '-'}</dd></div>
      <div><dt>البريد</dt><dd>${user.email || '-'}</dd></div>
      <div><dt>الواتساب</dt><dd>${user.whatsapp || '-'}</dd></div>
      <div><dt>الحالة</dt><dd>${badge('account', user.accountStatus)}</dd></div>
      <div><dt>عدد الطلبات</dt><dd>${subscriptions.length}</dd></div>
    </dl>
    <div class="mini-list">
      ${subscriptions.length ? subscriptions.slice(0, 6).map((item) => `
        <div>
          <strong>${getPlanName(item)}</strong>
          <span>${badge('request', item.requestStatus)} ${badge('payment', item.paymentStatus)}</span>
        </div>
      `).join('') : '<p>لا توجد طلبات لهذا العميل.</p>'}
    </div>
  `;
}

function getRequestFilters() {
  return {
    search: qs('#requestSearch').value.trim(),
    requestStatus: qs('#requestStatusFilter').value,
    paymentStatus: qs('#paymentStatusFilter').value,
  };
}

async function loadRequests() {
  qs('#requestsTable').innerHTML = '<tr><td colspan="9" class="empty-cell">جار تحميل الطلبات...</td></tr>';
  const result = await listPlanSubscriptionRequests(getRequestFilters());
  state.requests = Array.isArray(result.requests) ? result.requests : [];
  state.openMenuRequestId = null;
  state.loaded.requests = true;
  renderRequests();
}

function canApprove(request) {
  return request.requestStatus === 'pending' || request.requestStatus === 'rejected';
}

function canReject(request) {
  return request.requestStatus === 'pending' || request.requestStatus === 'approved';
}

function canUpdatePayment(request) {
  return request.requestStatus !== 'rejected';
}

function canActivate(request) {
  const statusOk = request.requestStatus === 'approved' || request.requestStatus === 'active';
  const paymentOk = request.paymentStatus === 'fully_paid' || request.paymentStatus === 'partially_paid';
  return statusOk && paymentOk;
}

function actionButton(label, action, request, enabled) {
  return `<button class="table-action ${enabled ? '' : 'disabled-action'}" type="button" data-action="${action}" data-request-id="${request.id}" ${enabled ? '' : 'disabled'}>${label}</button>`;
}

function menuItem(label, action, request, enabled) {
  return `<button class="action-menu-item ${enabled ? '' : 'disabled-action'}" type="button" data-action="${action}" data-request-id="${request.id}" ${enabled ? '' : 'disabled'}>${label}</button>`;
}

function renderRequestActionsMenu(request) {
  const isOpen = state.openMenuRequestId === request.id;

  return `
    <div class="row-action-menu ${isOpen ? 'open' : ''}">
      <button class="table-action action-menu-toggle" type="button" data-menu-request-id="${request.id}" aria-expanded="${isOpen ? 'true' : 'false'}">
        إجراءات
      </button>
      <div class="action-menu-panel ${isOpen ? '' : 'hidden'}">
        ${menuItem('قبول الطلب', 'approve', request, canApprove(request))}
        ${menuItem('رفض الطلب', 'reject', request, canReject(request))}
        ${menuItem('تحديث الدفع', 'payment', request, canUpdatePayment(request))}
        ${menuItem('تفعيل الاشتراك', 'activate', request, canActivate(request))}
      </div>
    </div>
  `;
}

function renderRequests() {
  const table = qs('#requestsTable');
  table.innerHTML = state.requests.map((request) => `
    <tr>
      <td>${request.fullName || request.email || '-'}</td>
      <td>${request.hallName || '-'}</td>
      <td>${getPlanName(request)}</td>
      <td>${getGuestCount(request)}</td>
      <td>${getPrice(request)}</td>
      <td>${badge('request', request.requestStatus)}</td>
      <td>${badge('payment', request.paymentStatus)}</td>
      <td>${formatDate(request.createdAt)}</td>
      <td class="actions-cell">
        ${renderRequestActionsMenu(request)}
      </td>
    </tr>
  `).join('');

  if (!state.requests.length) {
    table.innerHTML = '<tr><td colspan="9" class="empty-cell">لا توجد نتائج مطابقة.</td></tr>';
  }
}

async function reloadAfterAction() {
  await Promise.all([
    refreshOverview().catch(() => null),
    state.loaded.requests ? loadRequests().catch(() => null) : Promise.resolve(),
    state.loaded.clients ? loadClients().catch(() => null) : Promise.resolve(),
  ]);
}

async function handleRequestAction(action, requestId) {
  const request = state.requests.find((item) => item.id === requestId) || { id: requestId };

  try {
    if (action === 'approve') {
      if (!window.confirm('هل تريد قبول هذا الطلب؟')) return;
      const adminNotes = window.prompt('ملاحظات إدارية اختيارية') || '';
      await approvePlanSubscriptionRequest({ requestId, adminNotes });
      showToast('تم قبول الطلب بنجاح.', 'success');
    }

    if (action === 'reject') {
      if (!window.confirm('هل تريد رفض هذا الطلب؟')) return;
      const adminNotes = window.prompt('سبب الرفض أو ملاحظات إدارية') || '';
      await rejectPlanSubscriptionRequest({ requestId, adminNotes });
      showToast('تم رفض الطلب.', 'success');
    }

    if (action === 'payment') {
      const totalAmount = Number(request.planSnapshot?.price);
      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        showToast('لا يمكن تحديث الدفع لأن قيمة الطلب غير معروفة.', 'error');
        return;
      }

      const paidAmountInput = window.prompt('أدخل المبلغ المدفوع') || '';
      if (paidAmountInput === '') return;
      const paidAmount = Number(paidAmountInput);
      if (!Number.isFinite(paidAmount) || paidAmount < 0) {
        showToast('يرجى إدخال مبلغ صحيح.', 'error');
        return;
      }

      let paymentStatus = 'not_paid';
      if (paidAmount > 0 && paidAmount < totalAmount) {
        paymentStatus = 'partially_paid';
      }
      if (paidAmount >= totalAmount) {
        paymentStatus = 'fully_paid';
      }

      const paymentNotes = window.prompt('ملاحظات الدفع اختيارية') || '';
      await updatePlanSubscriptionPaymentStatus({
        requestId,
        paymentStatus,
        paidAmount,
        paymentNotes,
      });
      showToast(`تم تحديث حالة الدفع: ${getLabel('payment', paymentStatus)}.`, 'success');
    }

    if (action === 'activate') {
      if (!window.confirm('هل تريد تفعيل هذا الاشتراك؟')) return;
      const adminNotes = window.prompt('ملاحظات إدارية اختيارية') || '';
      await activatePlanSubscription({ requestId, adminNotes });
      showToast('تم تفعيل الاشتراك.', 'success');
    }

    await reloadAfterAction();
  } catch (error) {
    showToast(getCallableErrorMessage(error), 'error');
  }
}

async function switchPage(page) {
  const activePage = pageTitles[page] ? page : 'home';
  clearGlobalState();
  qsa('.admin-page').forEach((section) => section.classList.add('hidden'));
  qs(`#${activePage}Page`).classList.remove('hidden');
  qsa('#adminNav a').forEach((link) => link.classList.toggle('active', link.dataset.page === activePage));
  qs('#pageTitle').textContent = pageTitles[activePage];

  try {
    if (activePage === 'home' && !state.loaded.home) await refreshOverview();
    if (activePage === 'clients' && !state.loaded.clients) await loadClients();
    if (activePage === 'requests' && !state.loaded.requests) await loadRequests();
  } catch (error) {
    showToast(getCallableErrorMessage(error), 'error');
  }
}

function bindEvents() {
  qsa('#adminNav a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.hash = link.dataset.page;
      switchPage(link.dataset.page);
    });
  });

  ['clientSearch', 'clientStatusFilter'].forEach((id) => {
    qs(`#${id}`).addEventListener('input', () => loadClients().catch((error) => showToast(getCallableErrorMessage(error), 'error')));
  });

  ['requestSearch', 'requestStatusFilter', 'paymentStatusFilter'].forEach((id) => {
    qs(`#${id}`).addEventListener('input', () => loadRequests().catch((error) => showToast(getCallableErrorMessage(error), 'error')));
  });

  document.addEventListener('click', (event) => {
    const menuButton = event.target.closest('[data-menu-request-id]');
    if (menuButton) {
      const requestId = menuButton.dataset.menuRequestId;
      state.openMenuRequestId = state.openMenuRequestId === requestId ? null : requestId;
      renderRequests();
      return;
    }

    const clientButton = event.target.closest('[data-client-uid]');
    if (clientButton) {
      state.openMenuRequestId = null;
      selectClient(clientButton.dataset.clientUid);
      return;
    }

    const actionButtonEl = event.target.closest('[data-action]');
    if (actionButtonEl) {
      state.openMenuRequestId = null;
      handleRequestAction(actionButtonEl.dataset.action, actionButtonEl.dataset.requestId);
      return;
    }

    const pageButton = event.target.closest('[data-page]');
    if (pageButton) {
      state.openMenuRequestId = null;
      window.location.hash = pageButton.dataset.page;
      switchPage(pageButton.dataset.page);
      return;
    }

    if (!event.target.closest('.row-action-menu')) {
      if (state.openMenuRequestId) {
        state.openMenuRequestId = null;
        renderRequests();
      }
    }
  });

  qs('#logoutButton').addEventListener('click', async () => {
    try {
      await logout();
      resetAdminData();
      showAdminLogin();
    } catch (error) {
      showToast('تعذر تسجيل الخروج. حاول مرة أخرى.', 'error');
    }
  });

  qs('#adminLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = qs('button[type="submit"]', form);
    const email = qs('#adminLoginEmail').value.trim();
    const password = qs('#adminLoginPassword').value;
    qs('#adminLoginAlert').classList.add('hidden');
    submitButton.disabled = true;

    try {
      await loginClientAccount({ email, password });
      hideAdminLogin();
      resetAdminData();
      const allowed = await guardAdminAccess();
      if (allowed) {
        await switchPage((window.location.hash || '#home').replace('#', ''));
      }
    } catch (error) {
      qs('#adminLoginAlert').textContent = error.message || 'تعذر تسجيل الدخول. حاول مرة أخرى.';
      qs('#adminLoginAlert').classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
    }
  });
}

async function init() {
  bindEvents();
  const allowed = await guardAdminAccess();
  if (!allowed) return;

  await switchPage((window.location.hash || '#home').replace('#', ''));
  window.addEventListener('hashchange', () => {
    switchPage((window.location.hash || '#home').replace('#', ''));
  });
}

init();
