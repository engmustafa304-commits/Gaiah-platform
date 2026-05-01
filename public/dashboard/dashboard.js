import {
  createClientEvent,
  getMyDashboard,
  getMyInvitationBalances,
  getMySubscriptionDetails,
  getMySubscriptionsOverview,
  listMyEvents,
} from '../shared/api.js';
import { logout, waitForAuthUser } from '../shared/auth.js';

const qs = (selector, root = document) => root.querySelector(selector);

const dashboardState = qs('#dashboardState');
const stateTitle = qs('#stateTitle');
const stateMessage = qs('#stateMessage');
const stateActions = qs('#stateActions');
const welcomeSection = qs('#welcomeSection');
const dashboardGrid = qs('#dashboardGrid');
const subscriptionsSection = qs('#subscriptionsSection');
const profileNotice = qs('#profileNotice');
const logoutButton = qs('#logoutButton');
const pageTitle = qs('#pageTitle');
const navLinks = [...document.querySelectorAll('.client-nav-link')];
const clientPages = [...document.querySelectorAll('.client-page[data-page]')];
const latestSubscriptions = qs('#latestSubscriptions');
const pageTitles = {
  home: 'الرئيسية',
  events: 'المناسبات',
  subscriptions: 'الاشتراكات',
  statistics: 'الإحصائيات',
};

const eventTypeLabels = {
  wedding: 'زواج',
  engagement: 'خطوبة',
  celebration: 'احتفال',
  meeting: 'اجتماع',
  other: 'أخرى',
};

let dashboardSubscriptions = [];
let eventBalances = [];
let clientEvents = [];
let eventsLoaded = false;
let eventsLoading = false;
let eventsError = '';
let subscriptionsOverview = null;
let subscriptionsOverviewLoaded = false;
let subscriptionsOverviewLoading = false;
let selectedSubscriptionDetails = null;

const requestStatusLabels = {
  pending: 'قيد المراجعة',
  active: 'نشط',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
  expired: 'منتهي',
  cancelled: 'ملغي',
};

const paymentStatusLabels = {
  not_paid: 'غير مدفوع',
  partially_paid: 'مدفوع جزئياً',
  fully_paid: 'مدفوع بالكامل',
};

const accountStatusLabels = {
  unknown: 'غير مكتمل',
  pending: 'قيد المراجعة',
  active: 'نشط',
  rejected: 'مرفوض',
  suspended: 'موقوف',
};

function show(element) {
  element.classList.remove('hidden');
}

function hide(element) {
  element.classList.add('hidden');
}

function setState({ title, message, actions = '' }) {
  stateTitle.textContent = title;
  stateMessage.textContent = message;
  stateActions.innerHTML = actions;
  stateActions.classList.toggle('hidden', !actions);
  show(dashboardState);
  clientPages.forEach(hide);
  hide(latestSubscriptions);
  hide(subscriptionsSection);
  hide(profileNotice);
}

function showDashboard() {
  hide(dashboardState);
  switchPage(getCurrentPageFromHash(), { updateHash: false });
}

function textOrDash(value) {
  return value || '-';
}

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getRequestStatusLabel(status) {
  return requestStatusLabels[status] || 'غير معروف';
}

function getPaymentStatusLabel(status) {
  return paymentStatusLabels[status] || 'غير معروف';
}

function getAccountStatusLabel(status) {
  return accountStatusLabels[status] || 'غير مكتمل';
}

function getRequestBadgeClass(status) {
  if (status === 'active' || status === 'approved') return 'badge-active';
  if (status === 'rejected') return 'badge-rejected';
  if (status === 'expired' || status === 'cancelled') return 'badge-expired';
  return 'badge-pending';
}

function getCurrentPageFromHash() {
  const page = window.location.hash.replace('#', '').trim();
  return pageTitles[page] ? page : 'home';
}

function setActiveNav(page) {
  navLinks.forEach((link) => {
    const isActive = link.dataset.page === page;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function switchPage(page, options = {}) {
  const nextPage = pageTitles[page] ? page : 'home';
  pageTitle.textContent = pageTitles[nextPage];
  setActiveNav(nextPage);
  clientPages.forEach((section) => {
    section.classList.toggle('hidden', section.dataset.page !== nextPage);
  });

  if (nextPage === 'events') {
    if (!eventsLoaded && !eventsLoading) {
      loadEventsData();
    } else {
      renderEventsPage();
    }
  }

  if (nextPage === 'subscriptions') {
    loadSubscriptionsOverview();
  }

  if (options.updateHash !== false && window.location.hash !== `#${nextPage}`) {
    window.location.hash = nextPage;
  }
}

function getAccountBadgeClass(status) {
  if (status === 'active') return 'badge-active';
  if (status === 'rejected') return 'badge-rejected';
  if (status === 'suspended') return 'badge-expired';
  return 'badge-pending';
}

function getUsage(subscription) {
  const total = Number(
    subscription.planSnapshot?.guestCount ||
      subscription.selectedGuestCount ||
      0
  );
  const isUsable = subscription.requestStatus === 'active' || subscription.requestStatus === 'approved';
  const sent = isUsable ? Math.min(Math.floor(total * 0.35), total) : 0;
  const remaining = Math.max(total - sent, 0);
  const percentage = total ? Math.round((sent / total) * 100) : 0;

  return {
    total,
    sent,
    remaining,
    percentage,
    isUsable,
  };
}

function getDashboardUser(user, authUser) {
  return {
    fullName: user.fullName || authUser.displayName || 'عميل جديد',
    hallName: user.hallName || 'لم يتم تحديد القاعة بعد',
    email: user.email || authUser.email || '-',
    whatsapp: user.whatsapp || '-',
    accountStatus: user.accountStatus || 'unknown',
  };
}

function renderUser(user, authUser) {
  const dashboardUser = getDashboardUser(user, authUser);
  const displayName = dashboardUser.fullName || dashboardUser.email || 'عميل جديد';
  qs('#topbarUser').textContent = displayName;
  qs('#sidebarUserMeta').textContent = dashboardUser.email;
  qs('#topbarHall').textContent = dashboardUser.hallName;
  qs('#topbarEmail').textContent = dashboardUser.email;
  qs('#clientName').textContent = displayName;
  qs('#clientHall').textContent = textOrDash(dashboardUser.hallName);
  qs('#clientEmail').textContent = textOrDash(dashboardUser.email);
  qs('#clientWhatsapp').textContent = textOrDash(dashboardUser.whatsapp);
  qs('#clientAccountStatus').textContent = getAccountStatusLabel(dashboardUser.accountStatus);
  qs('#clientAccountStatus').className = `status-badge ${getAccountBadgeClass(dashboardUser.accountStatus)}`;
}

function renderStats(subscriptions) {
  const active = subscriptions.filter((subscription) => (
    subscription.requestStatus === 'active' || subscription.requestStatus === 'approved'
  )).length;
  const pending = subscriptions.filter((subscription) => subscription.requestStatus === 'pending').length;
  const unpaid = subscriptions.filter((subscription) => (
    subscription.paymentStatus === 'not_paid' ||
    subscription.paymentStatus === 'partially_paid'
  )).length;

  qs('#statTotalSubscriptions').textContent = String(subscriptions.length);
  qs('#statActiveSubscriptions').textContent = String(active);
  qs('#statPendingSubscriptions').textContent = String(pending);
  qs('#statUnpaidSubscriptions').textContent = String(unpaid);
}

function renderFeatures(features) {
  if (!Array.isArray(features) || !features.length) {
    return '<li>لم يتم تحديد ميزات لهذه الباقة بعد.</li>';
  }

  return features.map((feature) => `<li>${feature}</li>`).join('');
}

function renderSubscription(subscription) {
  const usage = getUsage(subscription);
  const planSnapshot = subscription.planSnapshot || {};
  const guestCount = planSnapshot.guestCount || subscription.selectedGuestCount || '-';
  const price = planSnapshot.price ? `${planSnapshot.price} ${planSnapshot.currency || ''}` : '-';

  return `
    <article class="card subscription-card">
      <div class="subscription-header">
        <div>
          <span class="subscription-label">طلب اشتراك</span>
          <h2>${planSnapshot.name || subscription.selectedPlanId || '-'}</h2>
        </div>
        <div class="badge-row">
          <span class="status-badge ${getRequestBadgeClass(subscription.requestStatus)}">
            ${getRequestStatusLabel(subscription.requestStatus)}
          </span>
          <span class="status-badge badge-payment">
            ${getPaymentStatusLabel(subscription.paymentStatus)}
          </span>
        </div>
      </div>

      <div class="subscription-meta">
        <span>${guestCount} ضيف</span>
        <span>${price}</span>
        <span>${formatDate(subscription.createdAt)}</span>
      </div>

      <ul class="subscription-features">
        ${renderFeatures(planSnapshot.features)}
      </ul>

      <div class="usage-panel">
        ${usage.isUsable ? `
          <div class="usage-numbers">
            <span>الدعوات المرسلة: <strong>${usage.sent}</strong></span>
            <span>الدعوات المتبقية: <strong>${usage.remaining}</strong></span>
            <span>نسبة الاستخدام: <strong>${usage.percentage}%</strong></span>
          </div>
          <div class="progress-track">
            <span style="width: ${usage.percentage}%"></span>
          </div>
        ` : `
          <p class="usage-note">يبدأ احتساب الاستهلاك بعد تفعيل الاشتراك.</p>
        `}
      </div>
    </article>
  `;
}

function renderCompactSubscription(subscription) {
  const planSnapshot = subscription.planSnapshot || {};
  const guestCount = planSnapshot.guestCount || subscription.selectedGuestCount || '-';
  const price = planSnapshot.price ? `${planSnapshot.price} ${planSnapshot.currency || ''}` : '-';

  return `
    <article class="compact-subscription">
      <div>
        <strong>${planSnapshot.name || subscription.selectedPlanId || '-'}</strong>
        <span>${guestCount} ضيف · ${price}</span>
      </div>
      <div class="badge-row">
        <span class="status-badge ${getRequestBadgeClass(subscription.requestStatus)}">
          ${getRequestStatusLabel(subscription.requestStatus)}
        </span>
        <span class="status-badge badge-payment">
          ${getPaymentStatusLabel(subscription.paymentStatus)}
        </span>
      </div>
    </article>
  `;
}

function renderSubscriptionGroup(selector, subscriptions, emptyMessage) {
  const container = qs(selector);
  if (!container) return;

  if (!subscriptions.length) {
    container.innerHTML = `<p class="muted-empty">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = subscriptions.map(renderCompactSubscription).join('');
}

function getSubscriptionPlanName(subscription) {
  return subscription.planSnapshot?.name || subscription.selectedPlanId || 'اشتراك';
}

function getSubscriptionGuestCount(subscription) {
  return Number(subscription.planSnapshot?.guestCount || subscription.selectedGuestCount || 0);
}

function getSubscriptionPrice(subscription) {
  const price = subscription.planSnapshot?.price;
  const currency = subscription.planSnapshot?.currency || '';
  return price ? `${price} ${currency}` : '-';
}

function buildSubscriptionBalancePreview(subscription) {
  // Stage 3A UI preview only. Real balances will be loaded from backend in Stage 3C.
  const total = getSubscriptionGuestCount(subscription);
  const isActive = subscription.requestStatus === 'active' || subscription.requestStatus === 'approved';
  const allocated = isActive ? Math.min(Math.floor(total * 0.25), total) : 0;
  const sent = isActive ? Math.min(Math.floor(total * 0.15), Math.max(total - allocated, 0)) : 0;
  const remaining = isActive ? Math.max(total - allocated - sent, 0) : 0;
  const usedPercentage = total ? Math.round(((allocated + sent) / total) * 100) : 0;

  return {
    total,
    allocated,
    sent,
    remaining,
    usedPercentage,
  };
}

function renderSubscriptionBalanceStats(summary = {}) {
  qs('#subscriptionTotalInvitations').textContent = String(summary.totalInvitations || 0);
  qs('#subscriptionAllocatedInvitations').textContent = String(summary.allocatedInvitations || 0);
  qs('#subscriptionSentInvitations').textContent = String(summary.sentInvitations || 0);
  qs('#subscriptionRemainingInvitations').textContent = String(summary.remainingInvitations || 0);
  qs('#usablePlansNote').textContent = `الاشتراكات القابلة للتخصيص: ${summary.usablePlanCount || 0}`;
}

function renderPlanFeatures(features) {
  if (!Array.isArray(features) || !features.length) {
    return '<li>لم يتم تحديد ميزات لهذه الباقة بعد.</li>';
  }

  return features.slice(0, 8).map((feature) => `<li>${feature}</li>`).join('');
}

function renderActivePlanCard(subscription) {
  const balance = subscription.balance || {};
  const total = Number(balance.totalInvitations || 0);
  const allocated = Number(balance.allocatedInvitations || 0);
  const sent = Number(balance.sentInvitations || 0);
  const remaining = Number(balance.remainingInvitations || 0);
  const usedPercentage = total ? Math.round(((allocated + sent) / total) * 100) : 0;
  const unusableReason = getUnusableReason(subscription);

  return `
    <article class="card detailed-plan-card active-plan-card">
      <div class="plan-card-header">
        <div>
          <span class="subscription-label">اشتراك نشط</span>
          <h3>${getSubscriptionPlanName(subscription)}</h3>
        </div>
        <div class="badge-row">
          <span class="status-badge badge-active">${getRequestStatusLabel(subscription.requestStatus)}</span>
          <span class="status-badge ${balance.usableForEvents ? 'badge-active' : 'badge-expired'}">
            ${balance.usableForEvents ? 'متاح للتخصيص' : 'غير متاح للتخصيص'}
          </span>
        </div>
      </div>

      <div class="plan-meta-grid">
        <span>${total} دعوة</span>
        <span>${getSubscriptionPrice(subscription)}</span>
        <span>${getPaymentStatusLabel(subscription.paymentStatus)}</span>
        <span>${formatDate(subscription.activatedAt || subscription.updatedAt || subscription.createdAt)}</span>
        ${subscription.paidAmount !== null && subscription.paidAmount !== undefined ? `<span>المدفوع: ${subscription.paidAmount}</span>` : ''}
      </div>

      <div class="plan-balance-grid">
        <div><span>الإجمالي</span><strong>${total}</strong></div>
        <div><span>المخصص</span><strong>${allocated}</strong></div>
        <div><span>المرسل</span><strong>${sent}</strong></div>
        <div><span>المتبقي</span><strong>${remaining}</strong></div>
      </div>

      <div class="plan-progress">
        <div class="progress-track">
          <span style="width: ${usedPercentage}%"></span>
        </div>
        <small>${usedPercentage}% مستخدم أو مخصص</small>
      </div>
      ${balance.usableForEvents ? '' : `<p class="plan-note">${unusableReason}</p>`}

      <ul class="subscription-features compact-features">
        ${renderPlanFeatures(subscription.planSnapshot?.features)}
      </ul>
      <button class="btn btn-secondary subscription-details-button" type="button" data-subscription-id="${subscription.id}">عرض التفاصيل</button>
    </article>
  `;
}

function renderPendingPlanCard(subscription) {
  return `
    <article class="card detailed-plan-card pending-plan-card">
      <div class="plan-card-header">
        <div>
          <span class="subscription-label">طلب قيد المراجعة</span>
          <h3>${getSubscriptionPlanName(subscription)}</h3>
        </div>
        <span class="status-badge badge-pending">${getRequestStatusLabel(subscription.requestStatus)}</span>
      </div>
      <div class="plan-meta-grid">
        <span>${getSubscriptionGuestCount(subscription)} دعوة</span>
        <span>${getSubscriptionPrice(subscription)}</span>
        <span>${getPaymentStatusLabel(subscription.paymentStatus)}</span>
        <span>${formatDate(subscription.createdAt)}</span>
      </div>
      <p class="plan-note">سيظهر الرصيد بعد الموافقة وتحديث حالة الدفع.</p>
      <button class="btn btn-secondary subscription-details-button" type="button" data-subscription-id="${subscription.id}">عرض التفاصيل</button>
    </article>
  `;
}

function renderClosedPlanCard(subscription) {
  const isRejected = subscription.requestStatus === 'rejected';

  return `
    <article class="card detailed-plan-card closed-plan-card">
      <div class="plan-card-header">
        <div>
          <span class="subscription-label">طلب غير نشط</span>
          <h3>${getSubscriptionPlanName(subscription)}</h3>
        </div>
        <span class="status-badge ${getRequestBadgeClass(subscription.requestStatus)}">${getRequestStatusLabel(subscription.requestStatus)}</span>
      </div>
      <div class="plan-meta-grid">
        <span>${getSubscriptionGuestCount(subscription)} دعوة</span>
        <span>${getSubscriptionPrice(subscription)}</span>
        <span>${getPaymentStatusLabel(subscription.paymentStatus)}</span>
        <span>${formatDate(subscription.createdAt)}</span>
      </div>
      ${isRejected ? '<p class="plan-note">يمكنك اختيار باقة جديدة أو التواصل مع الدعم.</p>' : ''}
      <button class="btn btn-secondary subscription-details-button" type="button" data-subscription-id="${subscription.id}">عرض التفاصيل</button>
    </article>
  `;
}

function setPlanList(selector, subscriptions, renderer, emptyMessage) {
  const container = qs(selector);
  if (!container) return;

  if (!subscriptions.length) {
    container.innerHTML = `<article class="card empty-state inline-empty"><h2>${emptyMessage}</h2></article>`;
    return;
  }

  container.innerHTML = subscriptions.map(renderer).join('');
}

function getUnusableReason(subscription) {
  const balance = subscription.balance || {};
  if (subscription.paymentStatus === 'not_paid') return 'بانتظار الدفع';
  if (Number(balance.remainingInvitations || 0) <= 0) return 'الرصيد مكتمل التخصيص';
  return 'غير متاح حالياً';
}

function setSubscriptionsLoadingState() {
  renderSubscriptionBalanceStats();
  qs('#subscriptionsEmptyState')?.classList.add('hidden');
  qs('#activePlansList').innerHTML = '<article class="card empty-state inline-empty"><h2>جار تحميل الاشتراكات...</h2></article>';
  qs('#pendingPlansList').innerHTML = '';
  qs('#closedPlansList').innerHTML = '';
  qs('#usablePlansNote').textContent = 'جار تحميل الرصيد...';
}

function setSubscriptionsErrorState() {
  renderSubscriptionBalanceStats();
  qs('#subscriptionsEmptyState')?.classList.add('hidden');
  qs('#activePlansList').innerHTML = `
    <article class="card empty-state inline-empty">
      <h2>تعذر تحميل بيانات الاشتراكات. حاول مرة أخرى.</h2>
      <button id="retrySubscriptionsButton" class="btn btn-gradient" type="button">إعادة المحاولة</button>
    </article>
  `;
  qs('#pendingPlansList').innerHTML = '';
  qs('#closedPlansList').innerHTML = '';
  qs('#retrySubscriptionsButton')?.addEventListener('click', () => loadSubscriptionsOverview({ force: true }));
}

function renderSubscriptionsPage() {
  if (subscriptionsOverviewLoading) {
    setSubscriptionsLoadingState();
    return;
  }

  if (!subscriptionsOverview) {
    renderSubscriptionBalanceStats();
    qs('#subscriptionsEmptyState')?.classList.remove('hidden');
    setPlanList('#activePlansList', [], renderActivePlanCard, 'لا توجد اشتراكات نشطة حالياً');
    setPlanList('#pendingPlansList', [], renderPendingPlanCard, 'لا توجد طلبات قيد المراجعة حالياً');
    setPlanList('#closedPlansList', [], renderClosedPlanCard, 'لا توجد طلبات مرفوضة أو منتهية حالياً');
    return;
  }

  const subscriptions = Array.isArray(subscriptionsOverview.subscriptions) ? subscriptionsOverview.subscriptions : [];
  const groups = subscriptionsOverview.groups || {};
  const activeSubscriptions = Array.isArray(groups.active) ? groups.active : [];
  const pendingSubscriptions = Array.isArray(groups.pending) ? groups.pending : [];
  const closedSubscriptions = Array.isArray(groups.closed) ? groups.closed : [];
  const emptyState = qs('#subscriptionsEmptyState');

  renderSubscriptionBalanceStats(subscriptionsOverview.summary || {});
  emptyState?.classList.toggle('hidden', subscriptions.length > 0);
  setPlanList('#activePlansList', activeSubscriptions, renderActivePlanCard, 'لا توجد اشتراكات نشطة حالياً');
  setPlanList('#pendingPlansList', pendingSubscriptions, renderPendingPlanCard, 'لا توجد طلبات قيد المراجعة حالياً');
  setPlanList('#closedPlansList', closedSubscriptions, renderClosedPlanCard, 'لا توجد طلبات مرفوضة أو منتهية حالياً');
}

async function loadSubscriptionsOverview({ force = false } = {}) {
  if (subscriptionsOverviewLoaded && !force) {
    renderSubscriptionsPage();
    return;
  }

  subscriptionsOverviewLoading = true;
  renderSubscriptionsPage();

  try {
    subscriptionsOverview = await getMySubscriptionsOverview();
    subscriptionsOverviewLoaded = true;
  } catch (error) {
    subscriptionsOverview = null;
    subscriptionsOverviewLoaded = false;
    setSubscriptionsErrorState();
    return;
  } finally {
    subscriptionsOverviewLoading = false;
  }

  renderSubscriptionsPage();
}

function renderRelatedEvents(relatedEvents) {
  if (!Array.isArray(relatedEvents) || !relatedEvents.length) {
    return '<p class="muted-empty">لا توجد مناسبات مرتبطة بهذا الاشتراك.</p>';
  }

  return relatedEvents.map((event) => `
    <article class="related-event-item">
      <div>
        <strong>${event.eventName || '-'}</strong>
        <span>${eventTypeLabels[event.eventType] || 'أخرى'} · ${event.eventLocation || '-'}</span>
      </div>
      <div class="event-list-meta">
        <span>${formatDate(event.eventDate)} · ${event.eventTime || '-'}</span>
        <span>${event.allocatedInvitations || 0} دعوة مخصصة</span>
        <span>${event.invitationsSent || 0} دعوة مرسلة</span>
      </div>
      <span class="status-badge ${event.eventStatus === 'active' ? 'badge-active' : 'badge-expired'}">
        ${event.eventStatus === 'active' ? 'نشطة' : event.eventStatus === 'completed' ? 'مكتملة' : 'ملغية'}
      </span>
      ${event.id ? `<a class="btn btn-secondary event-manage-link" href="/event-details/index.html?eventId=${encodeURIComponent(event.id)}">إدارة المناسبة</a>` : ''}
    </article>
  `).join('');
}

function renderSubscriptionDetails() {
  const panel = qs('#subscriptionDetailsPanel');
  const content = qs('#subscriptionDetailsContent');

  if (!selectedSubscriptionDetails) {
    hide(panel);
    content.innerHTML = '';
    return;
  }

  const subscription = selectedSubscriptionDetails.subscription || {};
  const balance = subscription.balance || {};
  content.innerHTML = `
    <div class="subscription-details-grid">
      <article class="details-block">
        <h3>${getSubscriptionPlanName(subscription)}</h3>
        <div class="plan-meta-grid">
          <span>${getSubscriptionGuestCount(subscription)} دعوة</span>
          <span>${getSubscriptionPrice(subscription)}</span>
          <span>${getRequestStatusLabel(subscription.requestStatus)}</span>
          <span>${getPaymentStatusLabel(subscription.paymentStatus)}</span>
        </div>
      </article>
      <article class="details-block">
        <h3>رصيد الاشتراك</h3>
        <div class="plan-balance-grid">
          <div><span>الإجمالي</span><strong>${balance.totalInvitations || 0}</strong></div>
          <div><span>المخصص</span><strong>${balance.allocatedInvitations || 0}</strong></div>
          <div><span>المرسل</span><strong>${balance.sentInvitations || 0}</strong></div>
          <div><span>المتبقي</span><strong>${balance.remainingInvitations || 0}</strong></div>
        </div>
      </article>
    </div>
    <section class="related-events-section">
      <h3>المناسبات المرتبطة</h3>
      <div class="related-events-list">
        ${renderRelatedEvents(selectedSubscriptionDetails.relatedEvents)}
      </div>
    </section>
  `;
  show(panel);
}

async function openSubscriptionDetails(subscriptionId) {
  const panel = qs('#subscriptionDetailsPanel');
  const content = qs('#subscriptionDetailsContent');
  selectedSubscriptionDetails = null;
  content.innerHTML = '<p class="muted-empty">جار تحميل تفاصيل الاشتراك...</p>';
  show(panel);

  try {
    selectedSubscriptionDetails = await getMySubscriptionDetails(subscriptionId);
    renderSubscriptionDetails();
  } catch (error) {
    content.innerHTML = '<p class="muted-empty">تعذر تحميل تفاصيل الاشتراك. حاول مرة أخرى.</p>';
  }
}

function closeSubscriptionDetails() {
  selectedSubscriptionDetails = null;
  renderSubscriptionDetails();
}

function renderSubscriptions(subscriptions) {
  const latestList = qs('#latestSubscriptionsList');
  const subscriptionsList = qs('#subscriptionsList');
  const emptyState = qs('#emptyState');
  const activeSubscriptions = subscriptions.filter((subscription) => (
    subscription.requestStatus === 'active' || subscription.requestStatus === 'approved'
  ));
  const pendingSubscriptions = subscriptions.filter((subscription) => subscription.requestStatus === 'pending');
  const closedSubscriptions = subscriptions.filter((subscription) => (
    subscription.requestStatus === 'rejected' ||
    subscription.requestStatus === 'expired' ||
    subscription.requestStatus === 'cancelled'
  ));

  if (!subscriptions.length) {
    if (latestList) {
      latestList.innerHTML = `
        <article class="card empty-state inline-empty">
          <h2>لا توجد طلبات اشتراك بعد</h2>
          <a class="btn btn-gradient" href="/">اختيار باقة</a>
        </article>
      `;
    }
    if (subscriptionsList) subscriptionsList.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (latestList) latestList.innerHTML = subscriptions.slice(0, 3).map(renderSubscription).join('');
    if (subscriptionsList) subscriptionsList.innerHTML = subscriptions.map(renderSubscription).join('');
    if (emptyState) emptyState.classList.add('hidden');
  }

  renderSubscriptionGroup(
    '#activeSubscriptionsList',
    activeSubscriptions,
    'لا توجد اشتراكات نشطة حالياً.'
  );
  renderSubscriptionGroup(
    '#pendingSubscriptionsList',
    pendingSubscriptions,
    'لا توجد طلبات قيد المراجعة حالياً.'
  );
  renderSubscriptionGroup(
    '#closedSubscriptionsList',
    closedSubscriptions,
    'لا توجد اشتراكات مرفوضة أو منتهية حالياً.'
  );
}

function renderEventSummary() {
  const activeEvents = clientEvents.filter((event) => event.eventStatus === 'active').length;
  const upcomingEvents = clientEvents.filter((event) => {
    if (event.eventStatus !== 'active') return false;
    const eventDate = new Date(event.eventDate);
    if (Number.isNaN(eventDate.getTime())) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).length;
  const allocatedInvitations = clientEvents.reduce((total, event) => total + Number(event.totalAllocatedInvitations || 0), 0);
  const sentInvitations = clientEvents.reduce((total, event) => total + Number(event.invitationsSent || 0), 0);

  qs('#eventStatActive').textContent = String(activeEvents);
  qs('#eventStatAllocated').textContent = String(allocatedInvitations);
  qs('#eventStatSent').textContent = String(sentInvitations);
  qs('#eventStatUpcoming').textContent = String(upcomingEvents);
}

function renderEventsList() {
  const eventsList = qs('#eventsList');
  const eventsHint = eventsList?.closest('.card')?.querySelector('.section-hint');

  if (eventsHint) {
    eventsHint.textContent = 'المناسبات التي أنشأتها من لوحة التحكم';
  }

  if (eventsLoading) {
    eventsList.innerHTML = '<article class="card empty-state inline-empty"><h2>جار تحميل بيانات المناسبات...</h2></article>';
    return;
  }

  if (eventsError) {
    eventsList.innerHTML = `
      <article class="card empty-state inline-empty">
        <h2>${eventsError}</h2>
      </article>
    `;
    return;
  }

  if (!clientEvents.length) {
    eventsList.innerHTML = `
      <article class="empty-state inline-empty">
        <h2>لا توجد مناسبات حتى الآن</h2>
        <p>يمكنك إنشاء مناسبة جديدة بعد توفر رصيد دعوات من اشتراك نشط.</p>
      </article>
    `;
    return;
  }

  eventsList.innerHTML = clientEvents.map((event) => `
    <article class="event-list-item">
      <div>
        <strong>${event.eventName}</strong>
        <span>${eventTypeLabels[event.eventType] || 'أخرى'} · ${event.eventLocation}</span>
      </div>
      <div class="event-list-meta">
        <span>${formatDate(event.eventDate)} · ${event.eventTime}</span>
        <span>${event.totalAllocatedInvitations || 0} دعوة مخصصة</span>
        <span>${event.invitationsSent || 0} دعوة مرسلة</span>
      </div>
      <span class="status-badge ${event.eventStatus === 'active' ? 'badge-active' : 'badge-expired'}">
        ${event.eventStatus === 'active' ? 'نشطة' : event.eventStatus === 'completed' ? 'مكتملة' : 'ملغية'}
      </span>
      <div class="event-actions">
        ${event.id
          ? `<a class="btn btn-secondary event-manage-link" href="/event-details/index.html?eventId=${encodeURIComponent(event.id)}">إدارة المناسبة</a>`
          : '<button class="btn btn-secondary event-manage-link" type="button" disabled>إدارة المناسبة</button>'}
      </div>
    </article>
  `).join('');
}

function getAllocationInputs() {
  return [...document.querySelectorAll('.allocation-input')];
}

function calculateAllocationTotal() {
  return getAllocationInputs().reduce((total, input) => total + (Number(input.value) || 0), 0);
}

function setEventFormAlert(message, type = 'info') {
  const alert = qs('#eventFormAlert');
  alert.textContent = message;
  alert.className = `event-form-alert ${type ? `event-form-alert-${type}` : ''}`;
  alert.classList.toggle('hidden', !message);
}

function updateAllocationSummary() {
  const total = calculateAllocationTotal();
  const summary = qs('#allocationSummary strong');
  if (summary) {
    summary.textContent = String(total);
  }

  let hasWarning = false;
  getAllocationInputs().forEach((input) => {
    const value = Number(input.value) || 0;
    const max = Number(input.max) || 0;
    const card = input.closest('.allocation-card');
    const warning = card ? qs('.allocation-warning', card) : null;
    const exceeds = value > max;
    hasWarning = hasWarning || exceeds;
    card?.classList.toggle('has-warning', exceeds);
    if (warning) {
      warning.textContent = exceeds ? `الحد المتاح لهذا الاشتراك هو ${max} دعوة.` : '';
      warning.classList.toggle('hidden', !exceeds);
    }
  });

  if (hasWarning) {
    setEventFormAlert('يوجد تخصيص يتجاوز الرصيد المتاح. يرجى تعديل الأرقام قبل المتابعة.', 'warning');
  } else if (qs('#eventFormAlert')?.classList.contains('event-form-alert-warning')) {
    setEventFormAlert('');
  }
}

function validateAllocation() {
  const inputs = getAllocationInputs();
  const total = calculateAllocationTotal();

  if (!eventBalances.length) {
    return 'لا توجد اشتراكات نشطة يمكن تخصيص الدعوات منها.';
  }

  if (total <= 0) {
    return 'يرجى تخصيص دعوة واحدة على الأقل لهذه المناسبة.';
  }

  const invalidInput = inputs.find((input) => {
    const value = Number(input.value) || 0;
    const max = Number(input.max) || 0;
    return value < 0 || value > max;
  });

  if (invalidInput) {
    return 'لا يمكن أن يتجاوز التخصيص الرصيد المتاح لكل اشتراك.';
  }

  return '';
}

function renderPlanAllocationList() {
  const container = qs('#planAllocationList');

  if (eventsLoading) {
    container.innerHTML = '<p class="muted-empty">جار تحميل أرصدة الدعوات...</p>';
    return;
  }

  if (eventsError) {
    container.innerHTML = '<p class="muted-empty">تعذر تحميل أرصدة الدعوات.</p>';
    return;
  }

  if (!eventBalances.length) {
    container.innerHTML = '<p class="muted-empty">لا توجد اشتراكات نشطة برصيد متاح لتخصيص الدعوات.</p>';
    return;
  }

  container.innerHTML = eventBalances.map((plan) => `
    <article class="allocation-card" data-plan-request-id="${plan.planRequestId}">
      <div>
        <strong>${plan.planName}</strong>
        <dl>
          <div><dt>الإجمالي</dt><dd>${plan.totalInvitations}</dd></div>
          <div><dt>المخصص</dt><dd>${plan.allocatedInvitations}</dd></div>
          <div><dt>المرسل</dt><dd>${plan.sentInvitations}</dd></div>
          <div><dt>المتبقي</dt><dd>${plan.remainingInvitations}</dd></div>
        </dl>
      </div>
      <label>
        <span>تخصيص لهذه المناسبة</span>
        <input
          class="allocation-input"
          type="number"
          min="0"
          max="${plan.remainingInvitations}"
          value="0"
          inputmode="numeric"
          data-plan-request-id="${plan.planRequestId}"
        />
      </label>
      <p class="allocation-warning hidden"></p>
    </article>
  `).join('');

  getAllocationInputs().forEach((input) => {
    input.addEventListener('input', updateAllocationSummary);
  });
  updateAllocationSummary();
}

function renderEventsPage() {
  renderEventSummary();
  renderEventsList();
  renderPlanAllocationList();
}

async function loadEventsData() {
  eventsLoading = true;
  eventsError = '';
  renderEventsPage();

  try {
    const [balancesResult, eventsResult] = await Promise.all([
      getMyInvitationBalances(),
      listMyEvents(),
    ]);
    eventBalances = Array.isArray(balancesResult.balances) ? balancesResult.balances : [];
    clientEvents = Array.isArray(eventsResult.events) ? eventsResult.events : [];
    eventsLoaded = true;
  } catch (error) {
    eventsError = 'تعذر تحميل بيانات المناسبات. حاول مرة أخرى.';
  } finally {
    eventsLoading = false;
    renderEventsPage();
  }
}

function openCreateEventPanel() {
  show(qs('#createEventPanel'));
  renderPlanAllocationList();
  setEventFormAlert('');
}

function closeCreateEventPanel() {
  hide(qs('#createEventPanel'));
  qs('#createEventForm')?.reset();
  setEventFormAlert('');
  updateAllocationSummary();
}

function renderDashboard(data, authUser) {
  const user = data.user || {};
  const subscriptions = Array.isArray(data.subscriptions) ? data.subscriptions : [];
  dashboardSubscriptions = subscriptions;
  const hasIncompleteProfile = (
    user.accountStatus === 'unknown' ||
    !user.fullName ||
    !user.hallName ||
    !user.whatsapp
  );

  renderUser(user, authUser);
  renderStats(subscriptions);
  renderSubscriptions(subscriptions);
  renderSubscriptionsPage();
  renderEventsPage();
  profileNotice.classList.toggle('hidden', !hasIncompleteProfile);
  show(welcomeSection);
  show(dashboardGrid);
  show(latestSubscriptions);
  showDashboard();
}

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;

  try {
    await logout();
    window.location.href = '/';
  } catch (error) {
    logoutButton.disabled = false;
    setState({
      title: 'تعذر تسجيل الخروج.',
      message: 'حاول مرة أخرى.',
      actions: '<button id="retryLogoutButton" class="btn btn-secondary" type="button">إعادة المحاولة</button>',
    });
    qs('#retryLogoutButton').addEventListener('click', () => logoutButton.click());
  }
});

async function loadDashboard() {
  setState({
    title: 'جار تحميل لوحة التحكم...',
    message: 'يتم التحقق من حالة تسجيل الدخول وتحميل بيانات الاشتراك.',
  });

  const authUser = await waitForAuthUser();

  if (!authUser) {
    setState({
      title: 'يرجى تسجيل الدخول للوصول إلى لوحة التحكم.',
      message: 'ابدأ من صفحة اختيار الباقة أو سجّل الدخول من مسار الاشتراك.',
      actions: '<a class="btn btn-gradient" href="/onboarding/index.html?plan=basic">اختيار باقة</a><a class="btn btn-secondary" href="/">العودة للصفحة الرئيسية</a>',
    });
    return;
  }

  try {
    const data = await getMyDashboard();
    renderDashboard(data, authUser);
  } catch (error) {
    setState({
      title: 'تعذر تحميل بيانات لوحة التحكم. حاول مرة أخرى.',
      message: 'لم يتم جلب بيانات الاشتراك حالياً.',
      actions: '<button id="retryDashboardButton" class="btn btn-gradient" type="button">إعادة المحاولة</button>',
    });
    qs('#retryDashboardButton').addEventListener('click', loadDashboard);
  }
}

loadDashboard();

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    switchPage(link.dataset.page);
  });
});

window.addEventListener('hashchange', () => {
  switchPage(getCurrentPageFromHash(), { updateHash: false });
});

qs('#openCreateEventButton')?.addEventListener('click', openCreateEventPanel);
qs('#closeCreateEventButton')?.addEventListener('click', closeCreateEventPanel);
qs('#cancelCreateEventButton')?.addEventListener('click', closeCreateEventPanel);

qs('#createEventForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = qs('#submitCreateEventButton');

  if (!form.checkValidity()) {
    form.reportValidity();
    setEventFormAlert('يرجى تعبئة بيانات المناسبة المطلوبة.', 'error');
    return;
  }

  const allocationError = validateAllocation();
  if (allocationError) {
    setEventFormAlert(allocationError, 'error');
    return;
  }

  const formData = new FormData(form);
  const allocations = getAllocationInputs()
    .map((input) => ({
      planRequestId: input.dataset.planRequestId,
      allocatedInvitations: Number(input.value) || 0,
    }))
    .filter((allocation) => allocation.allocatedInvitations > 0);

  submitButton.disabled = true;
  setEventFormAlert('');

  try {
    await createClientEvent({
      eventName: formData.get('eventName'),
      eventType: formData.get('eventType'),
      eventDate: formData.get('eventDate'),
      eventTime: formData.get('eventTime'),
      eventLocation: formData.get('eventLocation'),
      allocations,
    });

    setEventFormAlert('تم إنشاء المناسبة وتخصيص رصيد الدعوات بنجاح.', 'success');
    form.reset();
    await loadEventsData();
    subscriptionsOverviewLoaded = false;
    if (getCurrentPageFromHash() === 'subscriptions') {
      await loadSubscriptionsOverview({ force: true });
    }
    window.setTimeout(() => {
      closeCreateEventPanel();
    }, 900);
  } catch (error) {
    const message = error.code === 'failed-precondition' || (error.originalMessage && error.originalMessage.includes('remaining'))
      ? 'لا يمكن تخصيص أكثر من الرصيد المتاح في أحد الاشتراكات.'
      : error.message || 'تعذر إنشاء المناسبة. حاول مرة أخرى.';
    setEventFormAlert(message, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

qs('#buyMorePlansButton')?.addEventListener('click', () => {
  window.alert('يمكن اختيار باقة جديدة من الصفحة الرئيسية.');
  window.location.href = '/';
});

qs('#subscriptionsPage')?.addEventListener('click', (event) => {
  const detailsButton = event.target.closest('.subscription-details-button');
  if (detailsButton) {
    openSubscriptionDetails(detailsButton.dataset.subscriptionId);
  }
});

qs('#closeSubscriptionDetailsButton')?.addEventListener('click', closeSubscriptionDetails);
