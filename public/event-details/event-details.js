import {
  addGuestToList,
  bulkAddGuestsToList,
  createGuestListInvitationLink,
  createEventStaffAccount,
  createMyEventGuestList,
  deactivateGuestListInvitationLink,
  disableEventStaffAccount,
  getMyGuestListInvitationLink,
  getMyEventWorkspace,
  getMyEventAttendanceSummary,
  listInvitationMediaCatalogue,
  listEventStaffAccounts,
  listMyEventGuests,
  revokeGuest,
  updateEventStaffAccount,
  updateGuestInList,
  updateGuestStatus,
  updateGuestListInvitationDesign,
} from '../shared/api.js';
import { waitForAuthUser } from '../shared/auth.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const eventTypeLabels = {
  wedding: 'زواج',
  engagement: 'خطوبة',
  celebration: 'احتفال',
  meeting: 'اجتماع',
  other: 'أخرى',
};

const eventStatusLabels = {
  active: 'نشطة',
  cancelled: 'ملغية',
  completed: 'مكتملة',
};

const GUESTS_PER_PAGE = 50;
const MANUAL_BULK_GUESTS_PER_PAGE = 20;
const MANUAL_BULK_GUESTS_MAX_ROWS = 60;
const EXCEL_BULK_GUESTS_MAX_ROWS = 200;

const guestStatusLabels = {
  unknown: 'غير معروف',
  invitation_sent: 'تم إرسال الدعوة',
  accepted: 'قبل الدعوة',
  declined: 'اعتذر',
  arrived: 'وصل',
  not_arrived: 'لم يصل',
  revoked: 'ملغي',
};

const guestStatusBadgeClasses = {
  unknown: 'guest-status-unknown',
  invitation_sent: 'guest-status-invitation-sent',
  accepted: 'guest-status-accepted',
  declined: 'guest-status-declined',
  arrived: 'guest-status-arrived',
  not_arrived: 'guest-status-not-arrived',
  revoked: 'guest-status-revoked',
};

const defaultInvitationText = 'يسرنا دعوتكم لحضور مناسبتنا، ونتطلع لمشاركتكم.';

const stateEl = qs('#eventDetailsState');
const stateActions = qs('#eventStateActions');
const workspaceEl = qs('#eventWorkspace');
const summaryCard = qs('#eventSummaryCard');
const allocationsList = qs('#eventAllocationsList');
const placeholderMessage = qs('#placeholderMessage');
const guestListTabsEl = qs('#guestListTabs');
const guestListSummaryEl = qs('#guestListSummary');
const guestTableContainerEl = qs('#guestTableContainer');
const guestTablePaginationEl = qs('#guestTablePagination');
const guestFormModal = qs('#guestFormModal');
const guestForm = qs('#guestForm');
const guestFormTitle = qs('#guestFormTitle');
const guestFormAlert = qs('#guestFormAlert');
const guestNameInput = qs('#guestName');
const guestWhatsappInput = qs('#guestWhatsapp');
const guestStatusInput = qs('#guestStatus');
const bulkGuestModal = qs('#bulkGuestModal');
const bulkGuestRowsContainer = qs('#bulkGuestRowsContainer');
const bulkGuestPagination = qs('#bulkGuestPagination');
const bulkGuestAlert = qs('#bulkGuestAlert');
const bulkCapacitySummary = qs('#bulkCapacitySummary');
const saveBulkGuestsButton = qs('#saveBulkGuestsButton');
const excelGuestModal = qs('#excelGuestModal');
const excelCapacitySummary = qs('#excelCapacitySummary');
const downloadGuestTemplateButton = qs('#downloadGuestTemplateButton');
const guestExcelFileInput = qs('#guestExcelFileInput');
const excelGuestPreview = qs('#excelGuestPreview');
const excelGuestAlert = qs('#excelGuestAlert');
const submitExcelGuestsButton = qs('#submitExcelGuestsButton');
const guestListFormModal = qs('#guestListFormModal');
const guestListForm = qs('#guestListForm');
const guestListFormAlert = qs('#guestListFormAlert');
const guestListNameInput = qs('#guestListName');
const guestListInvitationTitleInput = qs('#guestListInvitationTitle');
const guestListInvitationTextInput = qs('#guestListInvitationText');
const designGuestListSelect = qs('#designGuestListSelect');
const invitationTextInput = qs('#invitationTextInput');
const mediaCatalogueEl = qs('#mediaCatalogue');
const invitationPreviewEl = qs('#invitationPreview');
const shareGuestListSelect = qs('#shareGuestListSelect');
const shareGuestListStatus = qs('#shareGuestListStatus');
const shareUrlCard = qs('#shareUrlCard');
const staffFullNameInput = qs('#staffFullNameInput');
const staffMobileInput = qs('#staffMobileInput');
const staffSexSelect = qs('#staffSexSelect');
const staffPositionSelect = qs('#staffPositionSelect');
const staffCustomPositionInput = qs('#staffCustomPositionInput');
const staffCustomPositionField = qs('#staffCustomPositionField');
const staffEmailInput = qs('#staffEmailInput');
const staffPasswordInput = qs('#staffPasswordInput');
const staffFormAlert = qs('#staffFormAlert');
const staffPreviewTable = qs('#staffPreviewTable');

let currentEvent = null;
let guestLists = [];
let selectedGuestList = null;
let guests = [];
let guestPagination = {
  page: 1,
  limit: GUESTS_PER_PAGE,
  total: 0,
  pageCount: 0,
  hasNext: false,
  hasPrevious: false,
};
let guestListsLoading = false;
let guestListsError = '';
let guestWriteLoading = false;
let guestListCreateLoading = false;
let selectedGuestListId = null;
let openGuestMenuId = null;
let guestFormMode = 'add';
let editingGuestId = null;
let statusOnlyMode = false;
let bulkGuestRows = createEmptyBulkRows();
let bulkGuestPage = 1;
let bulkGuestLoading = false;
let excelGuestRows = [];
let excelGuestLoading = false;
let mediaCatalogue = [];
let mediaCatalogueLoaded = false;
let mediaCatalogueLoading = false;
let mediaCatalogueError = '';
let designSaveLoading = false;
let selectedDesignGuestListId = null;
let selectedMediaFilter = 'all';
let selectedDraftMediaId = null;
let selectedShareGuestListId = null;
let shareLinkByGuestListId = {};
let shareLinkLoading = false;
let shareLinkError = '';
let staffRows = [];
let staffLoading = false;
let staffSaving = false;
let staffError = '';
let staffEditingUid = null;
let attendanceSummary = {
  totalGuests: 0,
  accepted: 0,
  declined: 0,
  qrIssued: 0,
  arrived: 0,
  notArrived: 0,
  willReturn: 0,
  revoked: 0,
};
let attendanceSummaryLoading = false;
let attendanceSummaryError = '';
let attendanceSummaryLoaded = false;
const guestListCurrentPageById = {};

function createDummyGuests(prefix, count, phoneSeed) {
  const statuses = ['unknown', 'invitation_sent', 'accepted', 'declined', 'arrived', 'not_arrived'];
  return Array.from({ length: count }, (_, index) => {
    const guestNumber = index + 1;
    const status = statuses[index % statuses.length];
    const updatedAt = new Date(Date.now() - guestNumber * 86400000).toISOString();
    const groupName = prefix === 'family' ? 'العائلة' : prefix === 'friends' ? 'الأصدقاء' : 'العمل';
    return {
      id: `${prefix}-${guestNumber}`,
      name: `ضيف ${groupName} ${guestNumber}`,
      whatsapp: `05${String(phoneSeed + guestNumber).padStart(8, '0')}`,
      status,
      updatedAt,
    };
  });
}

const dummyGuestLists = [
  {
    id: 'family',
    name: 'قائمة العائلة',
    invitationTitle: 'دعوة العائلة',
    designName: 'تصميم كلاسيكي',
    design: {
      mediaId: null,
      invitationText: defaultInvitationText,
    },
    guests: createDummyGuests('family', 120, 1000000),
  },
  {
    id: 'friends',
    name: 'قائمة الأصدقاء',
    invitationTitle: 'دعوة الأصدقاء',
    designName: 'تصميم فاخر',
    design: {
      mediaId: null,
      invitationText: defaultInvitationText,
    },
    guests: createDummyGuests('friends', 65, 2000000),
  },
  {
    id: 'work',
    name: 'قائمة العمل',
    invitationTitle: 'دعوة العمل',
    designName: 'تصميم رسمي',
    design: {
      mediaId: null,
      invitationText: defaultInvitationText,
    },
    guests: createDummyGuests('work', 28, 3000000),
  },
];

function getEventIdFromUrl() {
  return new URLSearchParams(window.location.search).get('eventId');
}

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeWhatsapp(value = '') {
  return String(value).trim().replace(/\s+/g, '');
}

function getFriendlyGuestError(error, options = {}) {
  const message = `${error?.message || ''} ${error?.originalMessage || ''}`;
  if (message.includes('WhatsApp') || message.includes('رقم الواتساب')) {
    return options.bulk ? 'يوجد رقم واتساب مكرر في القائمة أو موجود مسبقاً.' : 'رقم الواتساب موجود بالفعل في هذه القائمة.';
  }
  if (error?.code === 'failed-precondition' || message.includes('allocated invitations')) {
    return 'لا يمكن إضافة ضيوف أكثر من عدد الدعوات المخصصة لهذه المناسبة.';
  }
  if (error?.code === 'permission-denied') {
    return 'ليست لديك صلاحية لتنفيذ هذا الإجراء.';
  }
  if (error?.code === 'not-found') {
    return 'تعذر العثور على البيانات المطلوبة.';
  }
  if (error?.code === 'invalid-argument') {
    return 'يرجى مراجعة البيانات المدخلة.';
  }
  return options.bulk ? 'تعذر إضافة الضيوف. حاول مرة أخرى.' : 'تعذر تنفيذ العملية. حاول مرة أخرى.';
}

function getDefaultGuestPagination() {
  return {
    page: 1,
    limit: GUESTS_PER_PAGE,
    total: 0,
    pageCount: 0,
    hasNext: false,
    hasPrevious: false,
  };
}

function setState(title, message, actions = '') {
  stateEl.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>
    <div id="eventStateActions" class="state-actions ${actions ? '' : 'hidden'}">${actions}</div>
  `;
  stateEl.classList.remove('hidden');
  workspaceEl.classList.add('hidden');
}

function showWorkspace() {
  stateEl.classList.add('hidden');
  workspaceEl.classList.remove('hidden');
}

function renderEventSummary(event) {
  summaryCard.innerHTML = `
    <div class="summary-heading">
      <div>
        <span class="eyebrow">تفاصيل المناسبة</span>
        <h2>${event.eventName || '-'}</h2>
        <p>${eventTypeLabels[event.eventType] || 'أخرى'} · ${event.eventLocation || '-'}</p>
      </div>
      <span class="status-badge ${event.eventStatus === 'active' ? 'badge-active' : 'badge-expired'}">
        ${eventStatusLabels[event.eventStatus] || 'غير معروف'}
      </span>
    </div>
    <div class="metric-grid">
      <div><span>التاريخ</span><strong>${formatDate(event.eventDate)}</strong></div>
      <div><span>الوقت</span><strong>${event.eventTime || '-'}</strong></div>
      <div><span>الدعوات المخصصة</span><strong>${event.totalAllocatedInvitations || 0}</strong></div>
      <div><span>الدعوات المرسلة</span><strong>${event.invitationsSent || 0}</strong></div>
      <div><span>قبلوا الدعوة</span><strong>0</strong></div>
      <div><span>اعتذروا</span><strong>0</strong></div>
      <div><span>وصلوا</span><strong>0</strong></div>
    </div>
  `;
}

function renderAllocations(allocations = []) {
  if (!allocations.length) {
    allocationsList.innerHTML = '<article class="card allocation-card">لا توجد تخصيصات دعوات لهذه المناسبة.</article>';
    return;
  }

  allocationsList.innerHTML = allocations.map((allocation) => `
    <article class="card allocation-card">
      <div>
        <strong>${allocation.planName || 'اشتراك'}</strong>
        <span>${allocation.allocatedInvitations || 0} دعوة مخصصة</span>
      </div>
      <dl>
        <div><dt>إجمالي الاشتراك</dt><dd>${allocation.planTotalInvitations || 0}</dd></div>
        <div><dt>قبل التخصيص</dt><dd>${allocation.planRemainingBeforeAllocation || 0}</dd></div>
        <div><dt>بعد التخصيص</dt><dd>${allocation.planRemainingAfterAllocation || 0}</dd></div>
      </dl>
    </article>
  `).join('');
}

function getSelectedGuestList() {
  return selectedGuestList || guestLists.find((list) => list.id === selectedGuestListId) || null;
}

function getGuestStatusLabel(status) {
  return guestStatusLabels[status] || guestStatusLabels.unknown;
}

function getGuestStatusBadgeClass(status) {
  return guestStatusBadgeClasses[status] || guestStatusBadgeClasses.unknown;
}

function getPaginatedGuests(list) {
  return guests;
}

function getGuestById(guestId) {
  return guests.find((guest) => guest.id === guestId) || null;
}

function getCurrentActiveGuestCount() {
  return guestLists.reduce((total, list) => {
    const counts = list.statusCounts || {};
    const listTotal = Number(counts.total || list.guestCount || 0);
    const revoked = Number(counts.revoked || 0);
    return total + Math.max(listTotal - revoked, 0);
  }, 0);
}

function getRemainingInvitationCapacity() {
  const allocated = Number(currentEvent?.totalAllocatedInvitations || 0);
  return Math.max(allocated - getCurrentActiveGuestCount(), 0);
}

function renderCapacitySummary(container) {
  if (!container) return;
  const allocated = Number(currentEvent?.totalAllocatedInvitations || 0);
  const currentGuests = getCurrentActiveGuestCount();
  const remaining = getRemainingInvitationCapacity();
  container.innerHTML = `
    <div>
      <span>الدعوات المخصصة للمناسبة</span>
      <strong>${allocated}</strong>
    </div>
    <div>
      <span>الضيوف الحاليون</span>
      <strong>${currentGuests}</strong>
    </div>
    <div>
      <span>الرصيد المتبقي للإضافة</span>
      <strong>${remaining}</strong>
    </div>
  `;
}

function renderGuestListTabs() {
  if (!guestListTabsEl) return;

  if (guestListsLoading) {
    guestListTabsEl.innerHTML = '<div class="guest-empty-state">جار تحميل قوائم الضيوف...</div>';
    return;
  }

  if (guestListsError) {
    guestListTabsEl.innerHTML = `<div class="guest-empty-state guest-error-state">${guestListsError}</div>`;
    return;
  }

  if (!guestLists.length) {
    guestListTabsEl.innerHTML = '<div class="guest-empty-state">لا توجد قوائم ضيوف حتى الآن.</div>';
    return;
  }

  guestListTabsEl.innerHTML = guestLists.map((list) => {
    const guestCount = list.guestCount ?? list.statusCounts?.total ?? 0;
    return `
    <button
      class="guest-list-tab ${list.id === selectedGuestListId ? 'active' : ''}"
      type="button"
      data-guest-list-id="${list.id}"
    >
      <span>${escapeHtml(list.listName || 'قائمة ضيوف')}</span>
      <strong>${guestCount} ضيف</strong>
    </button>
  `;
  }).join('');

  qsa('[data-guest-list-id]', guestListTabsEl).forEach((button) => {
    button.addEventListener('click', () => selectGuestList(button.dataset.guestListId));
  });
}

function selectGuestList(listId) {
  selectedGuestListId = listId;
  loadGuestPage({ guestListId: listId, page: 1 });
}

function renderSelectedGuestListSummary() {
  if (!guestListSummaryEl) return;
  const list = getSelectedGuestList();

  if (guestListsLoading) {
    guestListSummaryEl.innerHTML = '<article class="card guest-summary-card">جار تحميل تفاصيل القائمة...</article>';
    return;
  }

  if (!list) {
    guestListSummaryEl.innerHTML = '<article class="card guest-summary-card">اختر قائمة ضيوف لعرض التفاصيل.</article>';
    return;
  }

  const counts = list.statusCounts || {};
  const totalCount = list.guestCount ?? counts.total ?? 0;
  const acceptedCount = counts.accepted || 0;
  const declinedCount = counts.declined || 0;
  const unknownCount = counts.unknown || 0;
  const revokedCount = counts.revoked || 0;
  const designName =
    list.media?.mediaTitle ||
    list.invitationDesign?.selectedSampleTitle ||
    'لم يتم اختيار تصميم بعد';

  guestListSummaryEl.innerHTML = `
    <article class="card guest-summary-card">
      <div>
        <span class="eyebrow">القائمة المحددة</span>
        <h3>${escapeHtml(list.listName || 'قائمة ضيوف')}</h3>
        <p>${escapeHtml(list.invitationTitle || 'دعوة الضيوف')} · ${escapeHtml(designName)}</p>
      </div>
      <div class="guest-summary-grid">
        <div><span>عدد الضيوف</span><strong>${totalCount}</strong></div>
        <div><span>قبلوا الدعوة</span><strong>${acceptedCount}</strong></div>
        <div><span>اعتذروا</span><strong>${declinedCount}</strong></div>
        <div><span>غير معروف</span><strong>${unknownCount}</strong></div>
        <div><span>ملغيون</span><strong>${revokedCount}</strong></div>
      </div>
    </article>
  `;
}

function renderGuestTable() {
  if (!guestTableContainerEl) return;
  const list = getSelectedGuestList();

  if (guestListsLoading) {
    guestTableContainerEl.innerHTML = '<div class="guest-empty-state">جار تحميل الضيوف...</div>';
    return;
  }

  if (guestListsError) {
    guestTableContainerEl.innerHTML = `<div class="guest-empty-state guest-error-state">${guestListsError}</div>`;
    return;
  }

  if (!list) {
    guestTableContainerEl.innerHTML = '<div class="guest-empty-state">لا توجد قوائم ضيوف حتى الآن.</div>';
    return;
  }

  const currentGuests = getPaginatedGuests(list);
  const currentPage = guestPagination.page || 1;
  const pageLimit = guestPagination.limit || GUESTS_PER_PAGE;
  const startIndex = (currentPage - 1) * pageLimit;

  if (!currentGuests.length) {
    guestTableContainerEl.innerHTML = '<div class="guest-empty-state">لا توجد أسماء في هذه القائمة حالياً.</div>';
    return;
  }

  guestTableContainerEl.innerHTML = `
    <table class="guest-table">
      <thead>
        <tr>
          <th>#</th>
          <th>اسم الضيف</th>
          <th>رقم الواتساب</th>
          <th>حالة الدعوة</th>
          <th>خيارات</th>
        </tr>
      </thead>
      <tbody>
        ${currentGuests.map((guest, index) => `
          <tr>
            <td>${startIndex + index + 1}</td>
            <td>${escapeHtml(guest.guestName || '-')}</td>
            <td>${escapeHtml(guest.whatsapp)}</td>
            <td><span class="guest-status-badge ${getGuestStatusBadgeClass(guest.invitationStatus)}">${getGuestStatusLabel(guest.invitationStatus)}</span></td>
            <td class="guest-actions-cell">
              <button class="guest-options-button" type="button" data-guest-menu-button="${guest.id}" ${guestWriteLoading ? 'disabled' : ''}>خيارات</button>
              <div class="guest-options-menu ${openGuestMenuId === guest.id ? '' : 'hidden'}" data-guest-menu="${guest.id}">
                <button type="button" data-guest-action="edit" data-guest-id="${guest.id}">تعديل بيانات الضيف</button>
                <button type="button" data-guest-action="status" data-guest-id="${guest.id}">تحديث الحالة</button>
                <button type="button" data-guest-action="revoke" data-guest-id="${guest.id}">إلغاء / حذف الضيف</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  qsa('[data-guest-menu-button]', guestTableContainerEl).forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      openGuestMenuId = openGuestMenuId === button.dataset.guestMenuButton ? null : button.dataset.guestMenuButton;
      renderGuestTable();
    });
  });

  qsa('[data-guest-action]', guestTableContainerEl).forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      handleGuestAction(button.dataset.guestAction, button.dataset.guestId);
    });
  });
}

function renderGuestPagination() {
  if (!guestTablePaginationEl) return;

  if (guestListsLoading || guestListsError || !selectedGuestList) {
    guestTablePaginationEl.innerHTML = '';
    return;
  }

  const pageCount = guestPagination.pageCount || 0;
  const currentPage = guestPagination.page || 1;

  guestTablePaginationEl.innerHTML = `
    <button class="btn btn-secondary" type="button" data-page-action="prev" ${!guestPagination.hasPrevious ? 'disabled' : ''}>السابق</button>
    <span>صفحة ${pageCount ? currentPage : 0} من ${pageCount}</span>
    <button class="btn btn-secondary" type="button" data-page-action="next" ${!guestPagination.hasNext ? 'disabled' : ''}>التالي</button>
  `;

  qsa('[data-page-action]', guestTablePaginationEl).forEach((button) => {
    button.addEventListener('click', () => {
      if (!selectedGuestListId) return;
      const page = button.dataset.pageAction === 'next'
        ? currentPage + 1
        : currentPage - 1;
      loadGuestPage({ guestListId: selectedGuestListId, page });
    });
  });
}

function renderGuestListsTab() {
  renderGuestListTabs();
  renderSelectedGuestListSummary();
  renderGuestTable();
  renderGuestPagination();
}

function getMediaById(mediaId) {
  return mediaCatalogue.find((item) => item.mediaId === mediaId) || null;
}

function getMediaTypeLabel(type) {
  return type === 'video' ? 'فيديو' : 'صورة';
}

function getMediaCategoryLabel(category) {
  if (category === 'men') return 'رجالي';
  if (category === 'women') return 'نسائي';
  return category || '-';
}

function getSelectedDesignGuestList() {
  return guestLists.find((list) => list.id === selectedDesignGuestListId) || null;
}

function renderDesignGuestListSelect() {
  if (!designGuestListSelect) return;

  if (!guestLists.length) {
    designGuestListSelect.innerHTML = '<option value="">لا توجد قوائم ضيوف</option>';
    designGuestListSelect.disabled = true;
    return;
  }

  designGuestListSelect.disabled = false;
  designGuestListSelect.innerHTML = guestLists.map((list) => `
    <option value="${list.id}" ${list.id === selectedDesignGuestListId ? 'selected' : ''}>${escapeHtml(list.listName || 'قائمة ضيوف')}</option>
  `).join('');
}

function renderMediaCatalogue() {
  if (!mediaCatalogueEl) return;

  if (!guestLists.length) {
    mediaCatalogueEl.innerHTML = '<div class="guest-empty-state">لا توجد قوائم ضيوف بعد. أنشئ قائمة ضيوف أولاً ثم اختر تصميم الدعوة.</div>';
    return;
  }

  if (mediaCatalogueLoading) {
    mediaCatalogueEl.innerHTML = '<div class="guest-empty-state">جار تحميل التصاميم...</div>';
    return;
  }

  if (mediaCatalogueError) {
    mediaCatalogueEl.innerHTML = `
      <div class="guest-empty-state guest-error-state">
        <p>${mediaCatalogueError}</p>
        <button class="btn btn-secondary" type="button" data-retry-media-catalogue>إعادة المحاولة</button>
      </div>
    `;
    qs('[data-retry-media-catalogue]', mediaCatalogueEl)?.addEventListener('click', () => loadMediaCatalogue({ force: true }));
    return;
  }

  const visibleMedia = mediaCatalogue.filter((item) => (
    selectedMediaFilter === 'all' ? true : item.mediaType === selectedMediaFilter
  ));

  if (!visibleMedia.length) {
    mediaCatalogueEl.innerHTML = `<div class="guest-empty-state">${selectedMediaFilter === 'video' ? 'لا توجد فيديوهات متاحة حالياً.' : 'لا توجد تصاميم متاحة حالياً.'}</div>`;
    return;
  }

  mediaCatalogueEl.innerHTML = visibleMedia.map((item) => `
    <article class="media-catalogue-item ${item.mediaId === selectedDraftMediaId ? 'selected' : ''}">
      <div class="media-thumb media-image-thumb">
        <img src="${item.sampleUrl}" alt="${escapeHtml(item.mediaTitle)}" loading="lazy" />
      </div>
      <div class="media-card-body">
        <strong>${escapeHtml(item.mediaTitle)}</strong>
        <span>${getMediaTypeLabel(item.mediaType)} · ${getMediaCategoryLabel(item.category)}</span>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <button class="btn btn-secondary" type="button" data-media-id="${item.mediaId}">اختيار</button>
    </article>
  `).join('');

  qsa('[data-media-id]', mediaCatalogueEl).forEach((button) => {
    button.addEventListener('click', () => selectMediaForDraft(button.dataset.mediaId));
  });
}

function renderInvitationPreview() {
  if (!invitationPreviewEl) return;
  const list = getSelectedDesignGuestList();
  const media = getMediaById(selectedDraftMediaId);
  const invitationText = invitationTextInput?.value.trim() || '';

  if (!list) {
    invitationPreviewEl.innerHTML = `
      <div class="guest-empty-state">لا توجد قوائم ضيوف بعد. أنشئ قائمة ضيوف أولاً ثم اختر تصميم الدعوة.</div>
    `;
    return;
  }

  invitationPreviewEl.innerHTML = `
    <div class="preview-heading">
      <div>
        <span class="eyebrow">معاينة الدعوة</span>
        <h3>${escapeHtml(list.listName || 'قائمة ضيوف')}</h3>
      </div>
      <span class="status-badge ${media ? 'badge-active' : 'badge-expired'}">${media ? 'تصميم محدد' : 'بدون تصميم'}</span>
    </div>
    <div class="preview-visual ${media?.sampleUrl ? 'preview-image' : 'preview-empty'}">
      ${media?.sampleUrl
        ? `<img src="${media.sampleUrl}" alt="${escapeHtml(media.mediaTitle)}" />`
        : '<span>لم يتم اختيار تصميم بعد.</span>'}
    </div>
    <dl class="preview-details">
      <div><dt>التصميم</dt><dd>${media ? escapeHtml(media.mediaTitle) : 'لم يتم اختيار تصميم بعد.'}</dd></div>
      <div><dt>النوع</dt><dd>${media ? getMediaTypeLabel(media.mediaType) : '-'}</dd></div>
    </dl>
    <div class="invitation-message-preview">
      <strong>مرحباً أحمد محمد</strong>
      <p>${invitationText ? escapeHtml(invitationText) : 'سيظهر نص الدعوة هنا.'}</p>
      <small>هذا التصميم نموذج مرجعي، وسيتم تجهيز التصميم النهائي لاحقاً.</small>
    </div>
  `;
}

function selectDesignGuestList(listId) {
  selectedDesignGuestListId = listId;
  const list = getSelectedDesignGuestList();
  selectedDraftMediaId = list?.invitationDesign?.selectedSampleMediaId || list?.media?.mediaId || null;
  if (invitationTextInput) {
    invitationTextInput.value = list?.invitationDesign?.invitationText || list?.invitationText || defaultInvitationText;
  }
  renderInvitationDesignTab();
}

function selectMediaFilter(filter) {
  selectedMediaFilter = filter;
  qsa('[data-media-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.mediaFilter === filter);
  });
  renderMediaCatalogue();
}

function selectMediaForDraft(mediaId) {
  selectedDraftMediaId = mediaId;
  renderMediaCatalogue();
  renderInvitationPreview();
}

async function applyInvitationDesignToList() {
  const list = getSelectedDesignGuestList();
  const invitationText = invitationTextInput?.value.trim() || '';

  if (!list) {
    showPlaceholderMessage('يرجى إنشاء أو اختيار قائمة ضيوف أولاً.');
    return;
  }
  if (!selectedDraftMediaId) {
    showPlaceholderMessage('يرجى اختيار تصميم أولاً.');
    return;
  }
  if (!invitationText) {
    showPlaceholderMessage('يرجى كتابة نص الدعوة.');
    return;
  }

  designSaveLoading = true;
  qs('#applyInvitationDesignButton')?.setAttribute('disabled', 'disabled');
  try {
    const result = await updateGuestListInvitationDesign({
      eventId: getEventIdFromUrl(),
      guestListId: selectedDesignGuestListId,
      mediaId: selectedDraftMediaId,
      invitationText,
    });
    if (result.guestList) {
      guestLists = guestLists.map((guestList) => (
        guestList.id === result.guestList.id ? result.guestList : guestList
      ));
      if (selectedGuestList?.id === result.guestList.id) {
        selectedGuestList = result.guestList;
      }
    }
    showPlaceholderMessage('تم حفظ اختيار التصميم ونص الدعوة بنجاح.');
    await loadEventWorkspace({
      guestListId: selectedDesignGuestListId,
      page: guestPagination.page || 1,
    });
    renderInvitationDesignTab();
  } catch (error) {
    const message = error?.code === 'invalid-argument'
      ? 'التصميم المختار غير متاح.'
      : 'تعذر حفظ التصميم. حاول مرة أخرى.';
    showPlaceholderMessage(message);
  } finally {
    designSaveLoading = false;
    qs('#applyInvitationDesignButton')?.removeAttribute('disabled');
  }
}

function renderInvitationDesignTab() {
  if (!guestLists.length) {
    selectedDesignGuestListId = null;
    selectedDraftMediaId = null;
    if (invitationTextInput) {
      invitationTextInput.value = '';
      invitationTextInput.disabled = true;
    }
    qs('#applyInvitationDesignButton')?.setAttribute('disabled', 'disabled');
    renderDesignGuestListSelect();
    renderMediaCatalogue();
    renderInvitationPreview();
    return;
  }

  selectedDesignGuestListId = selectedDesignGuestListId || selectedGuestListId || guestLists[0]?.id;
  const list = getSelectedDesignGuestList();
  selectedDraftMediaId = selectedDraftMediaId === null
    ? list?.invitationDesign?.selectedSampleMediaId || list?.media?.mediaId || null
    : selectedDraftMediaId;
  renderDesignGuestListSelect();
  if (invitationTextInput) {
    invitationTextInput.disabled = false;
  }
  if (invitationTextInput && document.activeElement !== invitationTextInput) {
    invitationTextInput.value = list?.invitationDesign?.invitationText || list?.invitationText || defaultInvitationText;
  }
  if (designSaveLoading) {
    qs('#applyInvitationDesignButton')?.setAttribute('disabled', 'disabled');
  } else {
    qs('#applyInvitationDesignButton')?.removeAttribute('disabled');
  }
  qsa('[data-media-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.mediaFilter === selectedMediaFilter);
  });
  renderMediaCatalogue();
  renderInvitationPreview();
}

function getGuestListDesignTitle(list) {
  return list?.invitationDesign?.selectedSampleTitle
    || list?.media?.mediaTitle
    || 'لم يتم اختيار تصميم بعد';
}

function getGuestListInvitationTextStatus(list) {
  return list?.invitationDesign?.invitationText || list?.invitationText
    ? 'نص الدعوة جاهز'
    : 'لم يتم كتابة نص الدعوة';
}

function getInactiveShareUrlPreview(list) {
  return list ? '/invite/index.html?list=سيتم-إنشاء-الرابط-لاحقاً' : 'لا يوجد رابط حالياً';
}

function getSelectedShareGuestList() {
  return guestLists.find((list) => list.id === selectedShareGuestListId) || null;
}

function getSelectedShareLink() {
  if (!selectedShareGuestListId) return null;
  return shareLinkByGuestListId[selectedShareGuestListId] || null;
}

function getShareListReadiness(list) {
  const guestCount = Number(list?.statusCounts?.total ?? list?.guestCount ?? 0);
  const activeCount = Math.max(guestCount - Number(list?.statusCounts?.revoked || 0), 0);
  const hasDesign = Boolean(list?.invitationDesign?.selectedSampleMediaId || list?.media?.mediaId);
  const hasText = Boolean(list?.invitationDesign?.invitationText || list?.invitationText);
  const isArchived = list?.listStatus === 'archived';

  return {
    guestCount,
    activeCount,
    hasDesign,
    hasText,
    isArchived,
    isReady: activeCount > 0 && hasDesign && hasText && !isArchived,
  };
}

function renderShareGuestListSelect() {
  if (!shareGuestListSelect) return;

  if (!guestLists.length) {
    shareGuestListSelect.innerHTML = '<option value="">لا توجد قوائم ضيوف</option>';
    shareGuestListSelect.disabled = true;
    return;
  }

  shareGuestListSelect.disabled = false;
  shareGuestListSelect.innerHTML = guestLists.map((list) => `
    <option value="${list.id}" ${list.id === selectedShareGuestListId ? 'selected' : ''}>${escapeHtml(list.listName || 'قائمة ضيوف')}</option>
  `).join('');
}

function renderShareGuestListStatus() {
  if (!shareGuestListStatus) return;
  const list = getSelectedShareGuestList();
  const link = getSelectedShareLink();

  if (!list) {
    shareGuestListStatus.innerHTML = `
      <div class="share-empty-state">
        لا توجد قوائم ضيوف بعد. أنشئ قائمة ضيوف أولاً.
      </div>
    `;
    return;
  }

  const readiness = getShareListReadiness(list);
  const designTitle = getGuestListDesignTitle(list);
  const invitationTextStatus = getGuestListInvitationTextStatus(list);
  let linkStatusLabel = 'لم يتم إنشاء الرابط';
  let linkStatusClass = 'inactive-link-badge';

  if (shareLinkLoading) {
    linkStatusLabel = 'جار تحميل الرابط...';
  } else if (link?.linkStatus === 'active') {
    linkStatusLabel = 'مفعل';
    linkStatusClass = 'active-link-badge';
  } else if (link?.linkStatus === 'disabled') {
    linkStatusLabel = 'معطل';
    linkStatusClass = 'disabled-link-badge';
  }

  shareGuestListStatus.innerHTML = `
    <div class="share-status-heading">
      <span class="eyebrow">القائمة المحددة</span>
      <h3>${escapeHtml(list.listName || 'قائمة ضيوف')}</h3>
    </div>
    <dl class="share-status-grid">
      <div><dt>عدد الضيوف</dt><dd>${readiness.guestCount}</dd></div>
      <div><dt>التصميم المختار</dt><dd>${escapeHtml(designTitle)}</dd></div>
      <div><dt>نص الدعوة</dt><dd>${escapeHtml(invitationTextStatus)}</dd></div>
      <div><dt>حالة الرابط</dt><dd><span class="${linkStatusClass}">${escapeHtml(linkStatusLabel)}</span></dd></div>
    </dl>
    ${!readiness.isReady ? '<p class="share-warning-note">لا يمكن إنشاء الرابط قبل تجهيز القائمة.</p>' : '<p class="share-ready-note">القائمة جاهزة لإنشاء الرابط.</p>'}
    ${!readiness.hasDesign || !readiness.hasText ? '<p class="share-warning-note">اختر تصميم الدعوة ونص الدعوة قبل تفعيل الرابط لاحقاً.</p>' : ''}
    ${readiness.activeCount === 0 ? '<p class="share-warning-note">أضف الضيوف إلى القائمة قبل مشاركة الرابط.</p>' : ''}
  `;
}

function renderShareUrlCard() {
  if (!shareUrlCard) return;
  const list = getSelectedShareGuestList();
  const link = getSelectedShareLink();
  const readiness = getShareListReadiness(list);

  if (shareLinkLoading) {
    shareUrlCard.innerHTML = `
      <h3>رابط الدعوة</h3>
      <div class="share-loading-state">جار تحميل رابط الدعوة...</div>
    `;
    return;
  }

  if (shareLinkError) {
    shareUrlCard.innerHTML = `
      <h3>رابط الدعوة</h3>
      <div class="share-error-state">${escapeHtml(shareLinkError)}</div>
      <button class="btn btn-secondary" type="button" data-share-action="retry">إعادة المحاولة</button>
    `;
    return;
  }

  if (!list) {
    shareUrlCard.innerHTML = `
      <h3>رابط الدعوة</h3>
      <div class="share-empty-state">اختر قائمة ضيوف أولاً.</div>
    `;
    return;
  }

  if (!link) {
    shareUrlCard.innerHTML = `
      <h3>رابط الدعوة</h3>
      <p class="share-muted-note">لم يتم إنشاء رابط لهذه القائمة بعد.</p>
      <button class="btn btn-gradient" type="button" data-share-action="create" ${readiness.isReady ? '' : 'disabled'}>إنشاء رابط الدعوة</button>
      ${readiness.isReady ? '' : '<p class="share-warning-note">أضف ضيوفاً واختر التصميم ونص الدعوة قبل إنشاء الرابط.</p>'}
    `;
    return;
  }

  const publicUrl = link.publicUrl || link.publicPath || '';

  if (link.linkStatus === 'disabled') {
    shareUrlCard.innerHTML = `
      <h3>رابط الدعوة</h3>
      <p class="share-muted-note">تم تعطيل الرابط.</p>
      <div class="inactive-url-box public-url-box disabled-url-box">${escapeHtml(publicUrl || getInactiveShareUrlPreview(list))}</div>
      <button class="btn btn-gradient" type="button" data-share-action="create" ${readiness.isReady ? '' : 'disabled'}>إنشاء رابط جديد</button>
      ${readiness.isReady ? '' : '<p class="share-warning-note">أضف ضيوفاً واختر التصميم ونص الدعوة قبل إنشاء الرابط.</p>'}
    `;
    return;
  }

  shareUrlCard.innerHTML = `
    <h3>رابط الدعوة</h3>
    <div class="inactive-url-box public-url-box">${escapeHtml(publicUrl)}</div>
    <div class="share-url-actions">
      <button class="btn btn-gradient" type="button" data-share-action="copy">نسخ الرابط</button>
      <button class="btn btn-secondary" type="button" data-share-action="open">فتح الرابط</button>
      <button class="btn btn-secondary danger-button" type="button" data-share-action="disable">تعطيل الرابط</button>
    </div>
    <p class="share-muted-note">انسخ الرابط وأرسله للضيوف من هاتفك الشخصي.</p>
  `;
}

function renderInvitationLinksTab() {
  if (!guestLists.length) {
    selectedShareGuestListId = null;
  } else if (!selectedShareGuestListId || !guestLists.some((list) => list.id === selectedShareGuestListId)) {
    selectedShareGuestListId = selectedGuestListId || guestLists[0]?.id || null;
  }

  renderShareGuestListSelect();
  renderShareGuestListStatus();
  renderShareUrlCard();
}

async function loadSelectedGuestListInvitationLink({ force = false } = {}) {
  if (!selectedShareGuestListId) {
    renderInvitationLinksTab();
    return;
  }
  const guestListId = selectedShareGuestListId;

  if (Object.prototype.hasOwnProperty.call(shareLinkByGuestListId, guestListId) && !force) {
    renderInvitationLinksTab();
    return;
  }

  shareLinkLoading = true;
  shareLinkError = '';
  renderShareGuestListStatus();
  renderShareUrlCard();

  try {
    const result = await getMyGuestListInvitationLink({
      eventId: getEventIdFromUrl(),
      guestListId,
    });
    shareLinkByGuestListId[guestListId] = result.link || null;
  } catch (error) {
    shareLinkError = 'تعذر تحميل رابط الدعوة. حاول مرة أخرى.';
  } finally {
    shareLinkLoading = false;
    renderShareGuestListStatus();
    renderShareUrlCard();
  }
}

function updateLocalShareLink(link) {
  if (!selectedShareGuestListId) return;
  shareLinkByGuestListId[selectedShareGuestListId] = link || null;
  guestLists = guestLists.map((list) => (
    list.id === selectedShareGuestListId
      ? { ...list, publicInvitationLink: link || null }
      : list
  ));
  if (selectedGuestList?.id === selectedShareGuestListId) {
    selectedGuestList = { ...selectedGuestList, publicInvitationLink: link || null };
  }
}

async function createInvitationLinkForSelectedList() {
  const list = getSelectedShareGuestList();
  const readiness = getShareListReadiness(list);

  if (!selectedShareGuestListId || !list) {
    showPlaceholderMessage('اختر قائمة ضيوف أولاً.');
    return;
  }

  if (!readiness.isReady) {
    showPlaceholderMessage('لا يمكن إنشاء الرابط قبل إضافة ضيوف واختيار التصميم ونص الدعوة.');
    return;
  }

  shareLinkLoading = true;
  shareLinkError = '';
  renderShareGuestListStatus();
  renderShareUrlCard();

  try {
    const result = await createGuestListInvitationLink({
      eventId: getEventIdFromUrl(),
      guestListId: selectedShareGuestListId,
    });
    updateLocalShareLink(result.link || null);
    showPlaceholderMessage('تم إنشاء رابط الدعوة بنجاح.');
  } catch (error) {
    const code = error?.code || '';
    showPlaceholderMessage(code === 'failed-precondition'
      ? 'لا يمكن إنشاء الرابط قبل إضافة ضيوف واختيار التصميم ونص الدعوة.'
      : 'تعذر إنشاء رابط الدعوة. حاول مرة أخرى.');
  } finally {
    shareLinkLoading = false;
    renderInvitationLinksTab();
  }
}

async function copyShareLinkToClipboard(link) {
  const target = link?.publicUrl || link?.publicPath || '';
  if (!target) {
    showPlaceholderMessage('تعذر نسخ الرابط. يمكنك نسخه يدوياً.');
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(target);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = target;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    showPlaceholderMessage('تم نسخ رابط الدعوة.');
  } catch (error) {
    showPlaceholderMessage('تعذر نسخ الرابط. يمكنك نسخه يدوياً.');
  }
}

function openShareLink(link) {
  const target = link?.publicUrl || link?.publicPath || '';
  if (!target) return;
  window.open(target, '_blank', 'noopener,noreferrer');
}

async function deactivateInvitationLinkForSelectedList() {
  if (!selectedShareGuestListId || shareLinkLoading) return;
  const confirmed = window.confirm('هل تريد تعطيل رابط الدعوة؟ لن يتمكن الضيوف من استخدام هذا الرابط بعد التعطيل.');
  if (!confirmed) return;

  shareLinkLoading = true;
  shareLinkError = '';
  renderShareGuestListStatus();
  renderShareUrlCard();

  try {
    await deactivateGuestListInvitationLink({
      eventId: getEventIdFromUrl(),
      guestListId: selectedShareGuestListId,
    });
    const existingLink = getSelectedShareLink();
    updateLocalShareLink(existingLink ? { ...existingLink, linkStatus: 'disabled' } : null);
    showPlaceholderMessage('تم تعطيل رابط الدعوة.');
  } catch (error) {
    showPlaceholderMessage('تعذر تعطيل الرابط. حاول مرة أخرى.');
  } finally {
    shareLinkLoading = false;
    renderInvitationLinksTab();
  }
}

function setStaffFormAlert(message = '') {
  if (!staffFormAlert) return;
  staffFormAlert.textContent = message;
  staffFormAlert.classList.toggle('hidden', !message);
}

function getStaffPositionLabel(row) {
  const labels = {
    general_supervisor: 'General Supervisor',
    security_guard: 'Security Guard',
    entry_organizer: 'Entry Organizer',
    other: row?.customPosition || 'Other',
  };
  return labels[row?.position] || '-';
}

function getStaffFormValues() {
  return {
    fullName: staffFullNameInput?.value.trim() || '',
    mobile: staffMobileInput?.value.trim() || '',
    sex: staffSexSelect?.value || '',
    position: staffPositionSelect?.value || '',
    customPosition: staffCustomPositionInput?.value.trim() || '',
    email: staffEmailInput?.value.trim() || '',
    password: staffPasswordInput?.value || '',
  };
}

function validateStaffForm(values, { isEdit = false } = {}) {
  if (!values.fullName) return 'Full name is required.';
  if (!values.mobile) return 'Mobile number is required.';
  if (!values.sex) return 'Sex is required.';
  if (!values.position) return 'Position is required.';
  if (values.position === 'other' && !values.customPosition) return 'Custom position is required.';
  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return 'Valid email is required.';
  if (!isEdit && !values.password) return 'Password is required.';
  if (values.password && values.password.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

function handleStaffPositionChange() {
  const isOther = staffPositionSelect?.value === 'other';
  staffCustomPositionField?.classList.toggle('hidden', !isOther);
  if (!isOther && staffCustomPositionInput) {
    staffCustomPositionInput.value = '';
  }
}

function resetStaffForm() {
  staffEditingUid = null;
  if (staffFullNameInput) staffFullNameInput.value = '';
  if (staffMobileInput) staffMobileInput.value = '';
  if (staffSexSelect) staffSexSelect.value = '';
  if (staffPositionSelect) staffPositionSelect.value = '';
  if (staffCustomPositionInput) staffCustomPositionInput.value = '';
  if (staffEmailInput) staffEmailInput.value = '';
  if (staffPasswordInput) staffPasswordInput.value = '';
  setStaffFormAlert('');
  handleStaffPositionChange();
  renderStaffFormActions();
}

function getStaffSexLabel(value) {
  const labels = {
    male: 'Male',
    female: 'Female',
  };
  return labels[value] || '-';
}

function getStaffStatusLabel(value) {
  const labels = {
    active: 'Active',
    disabled: 'Disabled',
  };
  return labels[value] || value || '-';
}

function renderStaffFormActions() {
  const submitButton = qs('#addStaffAccountButton');
  const resetButton = qs('#resetStaffFormButton');

  if (submitButton) {
    if (staffSaving) {
      submitButton.textContent = staffEditingUid ? 'Updating...' : 'Creating...';
    } else {
      submitButton.textContent = staffEditingUid ? 'Update Staff Account' : 'Create Staff Account';
    }
    submitButton.disabled = staffSaving;
  }

  if (resetButton) {
    resetButton.textContent = staffEditingUid ? 'Cancel Edit' : 'Reset';
    resetButton.disabled = staffSaving;
  }
}

function renderStaffPreviewTable() {
  if (!staffPreviewTable) return;

  if (staffLoading) {
    staffPreviewTable.innerHTML = '<div class="staff-empty-state">Loading staff accounts...</div>';
    return;
  }

  if (staffError) {
    staffPreviewTable.innerHTML = `
      <div class="staff-empty-state staff-error-state">
        <p>${escapeHtml(staffError)}</p>
        <button class="btn btn-secondary" type="button" data-staff-action="retry">Retry</button>
      </div>
    `;
    return;
  }

  if (!staffRows.length) {
    staffPreviewTable.innerHTML = '<div class="staff-empty-state">No staff accounts created yet.</div>';
    return;
  }

  staffPreviewTable.innerHTML = `
    <div class="staff-table-container">
      <table class="staff-preview-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Sex</th>
            <th>Position</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${staffRows.map((row) => `
            <tr class="${row.staffStatus === 'disabled' ? 'staff-row-disabled' : ''}">
              <td>${escapeHtml(row.fullName)}</td>
              <td>${escapeHtml(row.mobile)}</td>
              <td>${escapeHtml(getStaffSexLabel(row.sex))}</td>
              <td>${escapeHtml(getStaffPositionLabel(row))}</td>
              <td>${escapeHtml(row.email)}</td>
              <td><span class="staff-status-badge staff-status-${escapeHtml(row.staffStatus || 'active')}">${escapeHtml(getStaffStatusLabel(row.staffStatus))}</span></td>
              <td>
                <div class="staff-row-actions">
                  <button class="btn btn-secondary staff-edit-button" type="button" data-staff-action="edit" data-staff-uid="${escapeHtml(row.uid || row.id)}" ${staffSaving ? 'disabled' : ''}>Edit</button>
                  ${row.staffStatus === 'disabled' ? '' : `<button class="btn btn-secondary staff-disable-button" type="button" data-staff-action="disable" data-staff-uid="${escapeHtml(row.uid || row.id)}" ${staffSaving ? 'disabled' : ''}>Disable</button>`}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function getStaffErrorMessage(error, action) {
  if (error?.code === 'already-exists') return 'A user with this email already exists.';
  if (error?.code === 'permission-denied') return 'You do not have permission to manage staff for this event.';
  if (error?.code === 'invalid-argument') return 'Review staff account details and try again.';
  if (action === 'create') return 'Unable to create staff account. Try again.';
  if (action === 'update') return 'Unable to update staff account. Try again.';
  if (action === 'disable') return 'Unable to disable staff account. Try again.';
  return 'Unable to manage staff account. Try again.';
}

function findStaffRow(uid) {
  return staffRows.find((row) => row.uid === uid || row.id === uid) || null;
}

function buildStaffPayload(values, { isEdit = false } = {}) {
  const payload = {
    eventId: getEventIdFromUrl(),
    fullName: values.fullName,
    mobile: values.mobile,
    sex: values.sex,
    position: values.position,
    email: values.email,
  };

  if (values.position === 'other') {
    payload.customPosition = values.customPosition;
  } else if (isEdit) {
    payload.customPosition = null;
  }

  if (values.password) {
    payload.password = values.password;
  }

  return payload;
}

async function loadEventStaffAccounts({ force = false } = {}) {
  if (staffLoading && !force) return;

  staffLoading = true;
  staffError = '';
  renderEventStaffTab();

  try {
    const result = await listEventStaffAccounts({ eventId: getEventIdFromUrl() });
    staffRows = result.staff || [];
  } catch (error) {
    staffError = 'Unable to load event staff accounts.';
  } finally {
    staffLoading = false;
    renderEventStaffTab();
  }
}

async function submitStaffForm() {
  const values = getStaffFormValues();
  const isEdit = Boolean(staffEditingUid);
  const error = validateStaffForm(values, { isEdit });

  if (error) {
    setStaffFormAlert(error);
    return;
  }

  staffSaving = true;
  setStaffFormAlert('');
  renderEventStaffTab();

  try {
    if (isEdit) {
      await updateEventStaffAccount({
        ...buildStaffPayload(values, { isEdit: true }),
        staffUid: staffEditingUid,
      });
      if (staffPasswordInput) staffPasswordInput.value = '';
      resetStaffForm();
      await loadEventStaffAccounts({ force: true });
      showPlaceholderMessage('Staff account updated successfully.');
    } else {
      await createEventStaffAccount(buildStaffPayload(values));
      if (staffPasswordInput) staffPasswordInput.value = '';
      resetStaffForm();
      await loadEventStaffAccounts({ force: true });
      showPlaceholderMessage('Staff account created successfully.');
    }
  } catch (submitError) {
    if (staffPasswordInput) staffPasswordInput.value = '';
    setStaffFormAlert(getStaffErrorMessage(submitError, isEdit ? 'update' : 'create'));
  } finally {
    staffSaving = false;
    renderEventStaffTab();
  }
}

function editStaffRow(uid) {
  const row = findStaffRow(uid);
  if (!row) return;

  staffEditingUid = row.uid || row.id;
  if (staffFullNameInput) staffFullNameInput.value = row.fullName || '';
  if (staffMobileInput) staffMobileInput.value = row.mobile || '';
  if (staffSexSelect) staffSexSelect.value = row.sex || '';
  if (staffPositionSelect) staffPositionSelect.value = row.position || '';
  if (staffCustomPositionInput) staffCustomPositionInput.value = row.customPosition || '';
  if (staffEmailInput) staffEmailInput.value = row.email || '';
  if (staffPasswordInput) staffPasswordInput.value = '';
  setStaffFormAlert('');
  handleStaffPositionChange();
  renderStaffFormActions();
  staffFullNameInput?.focus();
}

async function disableStaffRow(uid) {
  if (!uid) return;
  const confirmed = window.confirm('Disable this staff account? The staff member will no longer be able to log in, but event history will remain.');
  if (!confirmed) return;

  staffSaving = true;
  renderEventStaffTab();

  try {
    await disableEventStaffAccount({
      eventId: getEventIdFromUrl(),
      staffUid: uid,
    });
    await loadEventStaffAccounts({ force: true });
    showPlaceholderMessage('Staff account disabled.');
  } catch (error) {
    showPlaceholderMessage(getStaffErrorMessage(error, 'disable'));
  } finally {
    staffSaving = false;
    renderEventStaffTab();
  }
}

function renderEventStaffTab() {
  handleStaffPositionChange();
  renderStaffFormActions();
  renderStaffPreviewTable();
}

function formatAttendanceNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('ar-SA').format(number);
}

function renderVerificationTab() {
  Object.entries(attendanceSummary).forEach(([key, value]) => {
    const el = qs(`[data-attendance-stat="${key}"]`);
    if (el) el.textContent = formatAttendanceNumber(value);
  });

  const statusEl = qs('#attendanceSummaryStatus');
  if (!statusEl) return;

  if (attendanceSummaryLoading) {
    statusEl.className = 'attendance-summary-status attendance-summary-loading';
    statusEl.textContent = 'جار تحميل إحصائيات الحضور...';
    return;
  }

  if (attendanceSummaryError) {
    statusEl.className = 'attendance-summary-status attendance-summary-error';
    statusEl.innerHTML = `
      <span>${escapeHtml(attendanceSummaryError)}</span>
      <button class="btn btn-secondary" type="button" id="retryAttendanceSummaryButton">إعادة المحاولة</button>
    `;
    qs('#retryAttendanceSummaryButton')?.addEventListener('click', () => loadAttendanceSummary({ force: true }));
    return;
  }

  statusEl.className = 'attendance-summary-status';
  statusEl.textContent = attendanceSummaryLoaded
    ? 'تم تحديث الإحصائيات من بيانات الحضور الفعلية.'
    : 'سيتم تحميل الإحصائيات عند فتح هذا القسم.';
}

async function loadAttendanceSummary({ force = false } = {}) {
  const eventId = getEventIdFromUrl();
  if (!eventId) return;
  if (attendanceSummaryLoading) return;

  if (attendanceSummaryLoaded && !force) {
    renderVerificationTab();
    return;
  }

  attendanceSummaryLoading = true;
  attendanceSummaryError = '';
  renderVerificationTab();

  try {
    const result = await getMyEventAttendanceSummary({ eventId });
    attendanceSummary = {
      totalGuests: Number(result?.summary?.totalGuests || 0),
      accepted: Number(result?.summary?.accepted || 0),
      declined: Number(result?.summary?.declined || 0),
      qrIssued: Number(result?.summary?.qrIssued || 0),
      arrived: Number(result?.summary?.arrived || 0),
      notArrived: Number(result?.summary?.notArrived || 0),
      willReturn: Number(result?.summary?.willReturn || 0),
      revoked: Number(result?.summary?.revoked || 0),
    };
    attendanceSummaryLoaded = true;
  } catch (error) {
    attendanceSummaryError = error?.code === 'permission-denied'
      ? 'ليست لديك صلاحية لعرض إحصائيات هذه المناسبة.'
      : 'تعذر تحميل إحصائيات الحضور. حاول مرة أخرى.';
  } finally {
    attendanceSummaryLoading = false;
    renderVerificationTab();
  }
}

function setGuestFormAlert(message = '') {
  if (!guestFormAlert) return;
  guestFormAlert.textContent = message;
  guestFormAlert.classList.toggle('hidden', !message);
}

function setGuestListFormAlert(message = '') {
  if (!guestListFormAlert) return;
  guestListFormAlert.textContent = message;
  guestListFormAlert.classList.toggle('hidden', !message);
}

function setGuestFormLoading(isLoading) {
  guestWriteLoading = isLoading;
  qsa('button', guestForm || document).forEach((button) => {
    button.disabled = isLoading;
  });
}

function setGuestListFormLoading(isLoading) {
  guestListCreateLoading = isLoading;
  qsa('button', guestListForm || document).forEach((button) => {
    button.disabled = isLoading;
  });
}

function openGuestForm({ mode = 'add', guest = null, statusOnly = false } = {}) {
  if (!guestFormModal || !guestForm) return;
  guestFormMode = mode;
  editingGuestId = guest?.id || null;
  statusOnlyMode = statusOnly;

  guestFormTitle.textContent = statusOnly ? 'تحديث حالة الضيف' : mode === 'edit' ? 'تعديل بيانات الضيف' : 'إضافة ضيف';
  guestNameInput.value = guest?.guestName || '';
  guestWhatsappInput.value = guest?.whatsapp || '';
  guestStatusInput.value = guest?.invitationStatus || 'unknown';
  guestNameInput.disabled = statusOnly;
  guestWhatsappInput.disabled = statusOnly;
  qsa('.guest-form-text-field', guestForm).forEach((field) => {
    field.classList.toggle('muted-field', statusOnly);
  });
  setGuestFormAlert('');
  guestFormModal.classList.remove('hidden');
  window.setTimeout(() => (statusOnly ? guestStatusInput : guestNameInput).focus(), 0);
}

function openGuestListForm() {
  if (!guestListFormModal || !guestListForm) return;
  guestListForm.reset();
  setGuestListFormAlert('');
  guestListFormModal.classList.remove('hidden');
  window.setTimeout(() => guestListNameInput?.focus(), 0);
}

function closeGuestForm() {
  if (!guestFormModal) return;
  guestFormModal.classList.add('hidden');
  guestFormMode = 'add';
  editingGuestId = null;
  statusOnlyMode = false;
  guestNameInput.disabled = false;
  guestWhatsappInput.disabled = false;
  setGuestFormAlert('');
  guestForm?.reset();
}

function closeGuestListForm() {
  if (!guestListFormModal) return;
  guestListFormModal.classList.add('hidden');
  setGuestListFormAlert('');
  guestListForm?.reset();
}

function createEmptyBulkRows() {
  return Array.from({ length: MANUAL_BULK_GUESTS_MAX_ROWS }, () => ({
    guestName: '',
    whatsapp: '',
  }));
}

function setBulkGuestAlert(message = '') {
  if (!bulkGuestAlert) return;
  bulkGuestAlert.textContent = message;
  bulkGuestAlert.classList.toggle('hidden', !message);
}

function setBulkGuestLoading(isLoading) {
  bulkGuestLoading = isLoading;
  qsa('button, input', bulkGuestModal || document).forEach((element) => {
    element.disabled = isLoading;
  });
}

function openBulkGuestModal() {
  if (!bulkGuestModal) return;
  if (!selectedGuestListId) {
    showPlaceholderMessage('يرجى إنشاء أو اختيار قائمة ضيوف أولاً.');
    return;
  }

  bulkGuestRows = createEmptyBulkRows();
  bulkGuestPage = 1;
  setBulkGuestAlert('');
  renderCapacitySummary(bulkCapacitySummary);
  renderBulkGuestRows();
  renderBulkGuestPagination();
  bulkGuestModal.classList.remove('hidden');
}

function closeBulkGuestModal() {
  if (!bulkGuestModal) return;
  bulkGuestModal.classList.add('hidden');
  setBulkGuestAlert('');
  setBulkGuestLoading(false);
}

function updateBulkGuestRow(index, field, value) {
  if (!bulkGuestRows[index]) return;
  bulkGuestRows[index][field] = value;
}

function renderBulkGuestRows() {
  if (!bulkGuestRowsContainer) return;
  const start = (bulkGuestPage - 1) * MANUAL_BULK_GUESTS_PER_PAGE;
  const rows = bulkGuestRows.slice(start, start + MANUAL_BULK_GUESTS_PER_PAGE);

  bulkGuestRowsContainer.innerHTML = `
    <div class="bulk-guest-table" role="table" aria-label="إضافة ضيوف متعددة">
      <div class="bulk-guest-row bulk-guest-row-head" role="row">
        <span>#</span>
        <span>اسم الضيف</span>
        <span>رقم الواتساب</span>
      </div>
      ${rows
        .map((row, offset) => {
          const index = start + offset;
          return `
            <div class="bulk-guest-row" role="row">
              <span class="bulk-row-number">${index + 1}</span>
              <input
                type="text"
                value="${escapeHtml(row.guestName)}"
                data-bulk-row="${index}"
                data-bulk-field="guestName"
                placeholder="اسم الضيف"
                ${bulkGuestLoading ? 'disabled' : ''}
              />
              <input
                type="text"
                value="${escapeHtml(row.whatsapp)}"
                data-bulk-row="${index}"
                data-bulk-field="whatsapp"
                placeholder="05xxxxxxxx"
                ${bulkGuestLoading ? 'disabled' : ''}
              />
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderBulkGuestPagination() {
  if (!bulkGuestPagination) return;
  const pageCount = Math.ceil(MANUAL_BULK_GUESTS_MAX_ROWS / MANUAL_BULK_GUESTS_PER_PAGE);
  bulkGuestPagination.innerHTML = `
    <button class="btn btn-secondary" type="button" data-bulk-page="previous" ${bulkGuestPage <= 1 || bulkGuestLoading ? 'disabled' : ''}>السابق</button>
    <span>صفحة ${bulkGuestPage} من ${pageCount}</span>
    <button class="btn btn-secondary" type="button" data-bulk-page="next" ${bulkGuestPage >= pageCount || bulkGuestLoading ? 'disabled' : ''}>التالي</button>
  `;
  if (saveBulkGuestsButton) {
    saveBulkGuestsButton.disabled = bulkGuestLoading;
  }
}

function collectManualBulkGuests() {
  return bulkGuestRows
    .map((row, index) => ({
      rowNumber: index + 1,
      guestName: row.guestName.trim(),
      whatsapp: normalizeWhatsapp(row.whatsapp),
    }))
    .filter((row) => row.guestName || row.whatsapp);
}

function validateBulkGuestsForSubmit(rows, maxRows, source = 'manual') {
  const seenNumbers = new Set();

  if (!rows.length) {
    return {
      error: source === 'excel' ? 'لم يتم العثور على ضيوف صالحين في الملف.' : 'أدخل ضيفاً واحداً على الأقل.',
      guests: [],
    };
  }

  if (rows.length > maxRows) {
    return {
      error: source === 'excel' ? 'لا يمكن رفع أكثر من 200 ضيف في كل ملف.' : 'لا يمكن إضافة أكثر من 60 ضيفاً يدوياً في كل دفعة.',
      guests: [],
    };
  }

  for (const row of rows) {
    const guestName = row.guestName.trim();
    const whatsapp = normalizeWhatsapp(row.whatsapp);
    if (!guestName || !whatsapp) {
      return {
        error: `يرجى إكمال اسم الضيف ورقم الواتساب في الصف ${row.rowNumber || ''}.`,
        guests: [],
      };
    }
    if (seenNumbers.has(whatsapp)) {
      return {
        error: 'يوجد رقم واتساب مكرر في القائمة أو موجود مسبقاً.',
        guests: [],
      };
    }
    seenNumbers.add(whatsapp);
  }

  if (rows.length > getRemainingInvitationCapacity()) {
    return {
      error: 'لا يمكن إضافة هذا العدد من الضيوف لأن رصيد الدعوات المتبقي غير كافٍ. يرجى شراء أو تخصيص رصيد إضافي.',
      guests: [],
    };
  }

  return {
    error: '',
    guests: rows.map((row) => ({
      guestName: row.guestName.trim(),
      whatsapp: normalizeWhatsapp(row.whatsapp),
      invitationStatus: 'unknown',
    })),
  };
}

async function submitManualBulkGuests() {
  if (!selectedGuestListId || bulkGuestLoading) return;
  const validation = validateBulkGuestsForSubmit(
    collectManualBulkGuests(),
    MANUAL_BULK_GUESTS_MAX_ROWS,
    'manual'
  );
  if (validation.error) {
    setBulkGuestAlert(validation.error);
    return;
  }

  setBulkGuestLoading(true);
  setBulkGuestAlert('');
  try {
    await bulkAddGuestsToList({
      eventId: getEventIdFromUrl(),
      guestListId: selectedGuestListId,
      guests: validation.guests,
    });
    closeBulkGuestModal();
    showPlaceholderMessage('تمت إضافة الضيوف بنجاح.');
    await loadEventWorkspace({
      guestListId: selectedGuestListId,
      page: guestPagination.page || 1,
    });
  } catch (error) {
    setBulkGuestAlert(getFriendlyGuestError(error, { bulk: true }));
  } finally {
    setBulkGuestLoading(false);
    renderBulkGuestRows();
    renderBulkGuestPagination();
  }
}

function setExcelGuestAlert(message = '') {
  if (!excelGuestAlert) return;
  excelGuestAlert.textContent = message;
  excelGuestAlert.classList.toggle('hidden', !message);
}

function setExcelGuestLoading(isLoading) {
  excelGuestLoading = isLoading;
  qsa('button, input', excelGuestModal || document).forEach((element) => {
    element.disabled = isLoading;
  });
}

function openExcelGuestModal() {
  if (!excelGuestModal) return;
  if (!selectedGuestListId) {
    showPlaceholderMessage('يرجى إنشاء أو اختيار قائمة ضيوف أولاً.');
    return;
  }
  excelGuestRows = [];
  if (guestExcelFileInput) guestExcelFileInput.value = '';
  setExcelGuestAlert('');
  renderCapacitySummary(excelCapacitySummary);
  renderExcelGuestPreview();
  excelGuestModal.classList.remove('hidden');
}

function closeExcelGuestModal() {
  if (!excelGuestModal) return;
  excelGuestModal.classList.add('hidden');
  excelGuestRows = [];
  if (guestExcelFileInput) guestExcelFileInput.value = '';
  setExcelGuestAlert('');
  setExcelGuestLoading(false);
}

function downloadGuestTemplate() {
  const csv = '\ufeffguestName,whatsapp\nأحمد محمد,0500000000\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gaiah-guest-template.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizeGuestHeader(value = '') {
  return String(value).trim().replace(/^\ufeff/, '');
}

function mapGuestRowsFromObjects(rows) {
  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      guestName: String(row.guestName || row['اسم الضيف'] || '').trim(),
      whatsapp: normalizeWhatsapp(row.whatsapp || row['رقم الواتساب'] || ''),
    }))
    .filter((row) => row.guestName || row.whatsapp);
}

function parseCsvGuests(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map(normalizeGuestHeader);
  return lines.slice(1)
    .map((line, index) => {
      const values = parseCsvLine(line);
      const row = {};
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] || '';
      });
      return {
        rowNumber: index + 2,
        guestName: String(row.guestName || row['اسم الضيف'] || '').trim(),
        whatsapp: normalizeWhatsapp(row.whatsapp || row['رقم الواتساب'] || ''),
      };
    })
    .filter((row) => row.guestName || row.whatsapp);
}

async function parseExcelGuests(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    return parseCsvGuests(await file.text());
  }

  try {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
    return mapGuestRowsFromObjects(rows);
  } catch (error) {
    throw new Error('يدعم هذا الإصدار رفع CSV حالياً. يمكنك فتح القالب في Excel وحفظه بصيغة CSV.');
  }
}

function renderExcelGuestPreview() {
  if (!excelGuestPreview) return;
  if (!excelGuestRows.length) {
    excelGuestPreview.innerHTML = '<p class="empty-copy">لم يتم اختيار ملف بعد.</p>';
    if (submitExcelGuestsButton) submitExcelGuestsButton.disabled = true;
    return;
  }

  const previewRows = excelGuestRows.slice(0, 10);
  excelGuestPreview.innerHTML = `
    <div class="excel-preview-summary">تم قراءة ${excelGuestRows.length} ضيف. تظهر أول 10 صفوف للمعاينة.</div>
    <div class="excel-preview-table">
      <div class="excel-preview-row excel-preview-row-head">
        <span>#</span>
        <span>اسم الضيف</span>
        <span>رقم الواتساب</span>
      </div>
      ${previewRows.map((row, index) => `
        <div class="excel-preview-row">
          <span>${index + 1}</span>
          <span>${escapeHtml(row.guestName)}</span>
          <span>${escapeHtml(row.whatsapp)}</span>
        </div>
      `).join('')}
    </div>
  `;
  if (submitExcelGuestsButton) submitExcelGuestsButton.disabled = excelGuestLoading || !excelGuestRows.length;
}

async function handleExcelGuestFileChange(event) {
  const file = event.target.files?.[0];
  excelGuestRows = [];
  setExcelGuestAlert('');
  renderExcelGuestPreview();
  if (!file) return;

  setExcelGuestLoading(true);
  try {
    excelGuestRows = await parseExcelGuests(file);
    const validation = validateBulkGuestsForSubmit(excelGuestRows, EXCEL_BULK_GUESTS_MAX_ROWS, 'excel');
    if (validation.error) {
      setExcelGuestAlert(validation.error);
    }
  } catch (error) {
    setExcelGuestAlert(error.message || 'تعذر قراءة الملف. حاول مرة أخرى.');
  } finally {
    setExcelGuestLoading(false);
    renderExcelGuestPreview();
  }
}

async function submitExcelGuests() {
  if (!selectedGuestListId || excelGuestLoading) return;
  const validation = validateBulkGuestsForSubmit(excelGuestRows, EXCEL_BULK_GUESTS_MAX_ROWS, 'excel');
  if (validation.error) {
    setExcelGuestAlert(validation.error);
    return;
  }

  setExcelGuestLoading(true);
  setExcelGuestAlert('');
  try {
    await bulkAddGuestsToList({
      eventId: getEventIdFromUrl(),
      guestListId: selectedGuestListId,
      guests: validation.guests,
    });
    closeExcelGuestModal();
    showPlaceholderMessage('تم استيراد الضيوف بنجاح.');
    await loadEventWorkspace({
      guestListId: selectedGuestListId,
      page: guestPagination.page || 1,
    });
  } catch (error) {
    setExcelGuestAlert(getFriendlyGuestError(error, { bulk: true }));
  } finally {
    setExcelGuestLoading(false);
    renderExcelGuestPreview();
  }
}

function handleGuestAction(action, guestId) {
  const guest = getGuestById(guestId);
  if (!guest) return;
  openGuestMenuId = null;

  if (action === 'edit') {
    openGuestForm({ mode: 'edit', guest });
    return;
  }

  if (action === 'status') {
    openGuestForm({ mode: 'edit', guest, statusOnly: true });
    return;
  }

  if (action === 'revoke') {
    const shouldRevoke = window.confirm('هل تريد إلغاء هذا الضيف من القائمة؟');
    if (!shouldRevoke) {
      renderGuestTable();
      return;
    }
    revokeSelectedGuest(guestId);
  }
}

function validateGuestForm(list, guestId, name, whatsapp) {
  if (!name) return 'اسم الضيف مطلوب.';
  if (!whatsapp) return 'رقم الواتساب مطلوب.';
  return '';
}

async function handleGuestFormSubmit(event) {
  event.preventDefault();
  const list = getSelectedGuestList();
  if (!selectedGuestListId || !list) {
    setGuestFormAlert('يرجى إنشاء أو اختيار قائمة ضيوف أولاً.');
    return;
  }

  const name = guestNameInput.value.trim();
  const whatsapp = normalizeWhatsapp(guestWhatsappInput.value);
  const status = guestStatusInput.value || 'unknown';
  const validationMessage = validateGuestForm(list, editingGuestId, name, whatsapp);

  if (!statusOnlyMode && validationMessage) {
    setGuestFormAlert(validationMessage);
    return;
  }

  if (statusOnlyMode && !editingGuestId) {
    setGuestFormAlert('تعذر تحديد الضيف المطلوب.');
    return;
  }

  setGuestFormLoading(true);
  try {
    const eventId = getEventIdFromUrl();
    if (guestFormMode === 'edit' && statusOnlyMode) {
      await updateGuestStatus({
        eventId,
        guestListId: selectedGuestListId,
        guestId: editingGuestId,
        invitationStatus: status,
      });
      showPlaceholderMessage('تم تحديث حالة الضيف بنجاح.');
    } else if (guestFormMode === 'edit') {
      await updateGuestInList({
        eventId,
        guestListId: selectedGuestListId,
        guestId: editingGuestId,
        guestName: name,
        whatsapp,
      });
      showPlaceholderMessage('تم تحديث بيانات الضيف بنجاح.');
    } else {
      await addGuestToList({
        eventId,
        guestListId: selectedGuestListId,
        guestName: name,
        whatsapp,
        invitationStatus: status,
      });
      showPlaceholderMessage('تمت إضافة الضيف بنجاح.');
    }
    closeGuestForm();
    setGuestFormLoading(false);
    await loadEventWorkspace({
      guestListId: selectedGuestListId,
      page: guestPagination.page || 1,
    });
  } catch (error) {
    setGuestFormAlert(getFriendlyGuestError(error));
  } finally {
    setGuestFormLoading(false);
  }
}

function switchTab(tabName) {
  qsa('.event-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });
  qsa('[data-tab-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.tabPanel !== tabName);
  });
  if (tabName === 'guest-lists') {
    renderGuestListsTab();
  }
  if (tabName === 'invitation-design') {
    loadMediaCatalogue();
  }
  if (tabName === 'invitation-links') {
    renderInvitationLinksTab();
    loadSelectedGuestListInvitationLink();
  }
  if (tabName === 'event-staff') {
    renderEventStaffTab();
    loadEventStaffAccounts({ force: true });
  }
  if (tabName === 'verification') {
    renderVerificationTab();
    loadAttendanceSummary();
  }
}

function showPlaceholderMessage(message) {
  placeholderMessage.textContent = message;
  placeholderMessage.classList.remove('hidden');
  window.setTimeout(() => {
    placeholderMessage.classList.add('hidden');
  }, 2600);
}

async function loadGuestPage({ guestListId, page = 1, invitationStatus = null }) {
  if (!guestListId) return;
  const eventId = getEventIdFromUrl();
  guestListsLoading = true;
  guestListsError = '';
  selectedGuestListId = guestListId;
  selectedGuestList = guestLists.find((list) => list.id === guestListId) || selectedGuestList;
  renderGuestListsTab();

  try {
    const result = await listMyEventGuests({
      eventId,
      guestListId,
      page,
      limit: GUESTS_PER_PAGE,
      invitationStatus,
    });
    guests = result.guests || [];
    guestPagination = result.pagination || getDefaultGuestPagination();
    selectedGuestList = guestLists.find((list) => list.id === guestListId) || selectedGuestList;
  } catch (error) {
    guestListsError = 'تعذر تحميل قوائم الضيوف. حاول مرة أخرى.';
    guests = [];
    guestPagination = getDefaultGuestPagination();
  } finally {
    guestListsLoading = false;
    renderGuestListsTab();
  }
}

async function loadEventWorkspace({ guestListId = null, page = 1 } = {}) {
  const eventId = getEventIdFromUrl();
  guestListsLoading = true;
  guestListsError = '';
  renderGuestListsTab();

  try {
    const result = await getMyEventWorkspace({
      eventId,
      guestListId,
      guestsPage: page,
      guestsLimit: GUESTS_PER_PAGE,
    });
    currentEvent = result.event || null;
    guestLists = result.guestLists || [];
    selectedGuestList = result.selectedGuestList || null;
    selectedGuestListId = selectedGuestList?.id || null;
    guests = result.guests || [];
    guestPagination = result.pagination || getDefaultGuestPagination();
    if (currentEvent) {
      renderEventSummary(currentEvent);
      renderAllocations(currentEvent.allocations || []);
    }
  } catch (error) {
    guestListsError = 'تعذر تحميل قوائم الضيوف. حاول مرة أخرى.';
    guests = [];
    guestPagination = getDefaultGuestPagination();
    renderGuestListsTab();
    throw error;
  } finally {
    guestListsLoading = false;
    renderGuestListsTab();
  }
}

async function loadMediaCatalogue({ force = false } = {}) {
  if (mediaCatalogueLoaded && !force) {
    renderInvitationDesignTab();
    return;
  }

  mediaCatalogueLoading = true;
  mediaCatalogueError = '';
  renderInvitationDesignTab();

  try {
    const result = await listInvitationMediaCatalogue();
    mediaCatalogue = result.items || [];
    mediaCatalogueLoaded = true;
  } catch (error) {
    mediaCatalogueError = 'تعذر تحميل كتالوج التصاميم. حاول مرة أخرى.';
  } finally {
    mediaCatalogueLoading = false;
    renderInvitationDesignTab();
  }
}

async function revokeSelectedGuest(guestId) {
  if (!selectedGuestListId || guestWriteLoading) return;
  guestWriteLoading = true;
  renderGuestTable();

  try {
    await revokeGuest({
      eventId: getEventIdFromUrl(),
      guestListId: selectedGuestListId,
      guestId,
      revokedReason: 'revoked_by_client',
    });
    showPlaceholderMessage('تم إلغاء الضيف بنجاح.');
    guestWriteLoading = false;
    await loadEventWorkspace({
      guestListId: selectedGuestListId,
      page: guestPagination.page || 1,
    });
  } catch (error) {
    showPlaceholderMessage(getFriendlyGuestError(error));
    renderGuestTable();
  } finally {
    guestWriteLoading = false;
    renderGuestTable();
  }
}

async function handleGuestListFormSubmit(event) {
  event.preventDefault();
  const listName = guestListNameInput?.value.trim() || '';
  const invitationTitle = guestListInvitationTitleInput?.value.trim() || '';
  const invitationText = guestListInvitationTextInput?.value.trim() || '';

  if (!listName) {
    setGuestListFormAlert('اسم القائمة مطلوب.');
    return;
  }

  setGuestListFormLoading(true);
  try {
    const result = await createMyEventGuestList({
      eventId: getEventIdFromUrl(),
      listName,
      invitationTitle,
      invitationText,
    });
    closeGuestListForm();
    showPlaceholderMessage('تم إنشاء قائمة الضيوف بنجاح.');
    await loadEventWorkspace({
      guestListId: result.guestListId,
      page: 1,
    });
  } catch (error) {
    setGuestListFormAlert(getFriendlyGuestError(error));
  } finally {
    setGuestListFormLoading(false);
  }
}

async function loadEventDetails() {
  const authUser = await waitForAuthUser();
  if (!authUser) {
    setState(
      'يرجى تسجيل الدخول للوصول إلى تفاصيل المناسبة.',
      'سجل الدخول أولاً ثم افتح صفحة إدارة المناسبة.',
      '<a class="btn btn-gradient" href="/login/index.html">تسجيل الدخول</a>'
    );
    return;
  }

  const eventId = getEventIdFromUrl();
  if (!eventId) {
    setState(
      'لم يتم تحديد المناسبة.',
      'ارجع إلى صفحة المناسبات واختر المناسبة المطلوبة.',
      '<a class="btn btn-gradient" href="/dashboard/index.html#events">العودة للمناسبات</a>'
    );
    return;
  }

  try {
    await loadEventWorkspace({ page: 1 });
    showWorkspace();
  } catch (error) {
    setState(
      'تعذر تحميل تفاصيل المناسبة أو ليست لديك صلاحية الوصول إليها.',
      'تأكد من تسجيل الدخول بالحساب الصحيح ثم حاول مرة أخرى.',
      '<a class="btn btn-secondary" href="/dashboard/index.html#events">العودة للمناسبات</a>'
    );
  }
}

qsa('.event-tab').forEach((button) => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

qs('#addGuestButton')?.addEventListener('click', () => {
  if (!selectedGuestListId) {
    showPlaceholderMessage('يرجى إنشاء أو اختيار قائمة ضيوف أولاً.');
    return;
  }
  openGuestForm({ mode: 'add' });
});

qs('#bulkAddGuestsButton')?.addEventListener('click', openBulkGuestModal);

qs('#importGuestsButton')?.addEventListener('click', openExcelGuestModal);

qs('#guestListPlaceholderButton')?.addEventListener('click', () => {
  openGuestListForm();
});

qsa('.media-card').forEach((button) => {
  button.addEventListener('click', () => {
    showPlaceholderMessage('سيتم تفعيل اختيار التصميم في مرحلة لاحقة.');
  });
});

designGuestListSelect?.addEventListener('change', () => {
  selectDesignGuestList(designGuestListSelect.value);
});

shareGuestListSelect?.addEventListener('change', () => {
  selectedShareGuestListId = shareGuestListSelect.value;
  shareLinkError = '';
  renderInvitationLinksTab();
  loadSelectedGuestListInvitationLink({ force: true });
});

shareUrlCard?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-share-action]');
  if (!button || button.disabled) return;

  const action = button.dataset.shareAction;
  const link = getSelectedShareLink();

  if (action === 'create') {
    createInvitationLinkForSelectedList();
  } else if (action === 'copy') {
    copyShareLinkToClipboard(link);
  } else if (action === 'open') {
    openShareLink(link);
  } else if (action === 'disable') {
    deactivateInvitationLinkForSelectedList();
  } else if (action === 'retry') {
    loadSelectedGuestListInvitationLink({ force: true });
  }
});

invitationTextInput?.addEventListener('input', renderInvitationPreview);

qsa('[data-media-filter]').forEach((button) => {
  button.addEventListener('click', () => selectMediaFilter(button.dataset.mediaFilter));
});

qs('#applyInvitationDesignButton')?.addEventListener('click', applyInvitationDesignToList);

staffPositionSelect?.addEventListener('change', handleStaffPositionChange);
qs('#addStaffAccountButton')?.addEventListener('click', submitStaffForm);
qs('#resetStaffFormButton')?.addEventListener('click', resetStaffForm);
staffPreviewTable?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-staff-action]');
  if (!button) return;
  const staffUid = button.dataset.staffUid;
  if (button.dataset.staffAction === 'edit') {
    editStaffRow(staffUid);
  }
  if (button.dataset.staffAction === 'disable') {
    disableStaffRow(staffUid);
  }
  if (button.dataset.staffAction === 'retry') {
    loadEventStaffAccounts({ force: true });
  }
});

guestForm?.addEventListener('submit', handleGuestFormSubmit);
guestListForm?.addEventListener('submit', handleGuestListFormSubmit);
saveBulkGuestsButton?.addEventListener('click', submitManualBulkGuests);
downloadGuestTemplateButton?.addEventListener('click', downloadGuestTemplate);
guestExcelFileInput?.addEventListener('change', handleExcelGuestFileChange);
submitExcelGuestsButton?.addEventListener('click', submitExcelGuests);

bulkGuestRowsContainer?.addEventListener('input', (event) => {
  const input = event.target.closest('[data-bulk-row][data-bulk-field]');
  if (!input) return;
  updateBulkGuestRow(Number(input.dataset.bulkRow), input.dataset.bulkField, input.value);
});

bulkGuestPagination?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-bulk-page]');
  if (!button || bulkGuestLoading) return;
  const pageCount = Math.ceil(MANUAL_BULK_GUESTS_MAX_ROWS / MANUAL_BULK_GUESTS_PER_PAGE);
  if (button.dataset.bulkPage === 'previous') {
    bulkGuestPage = Math.max(1, bulkGuestPage - 1);
  } else {
    bulkGuestPage = Math.min(pageCount, bulkGuestPage + 1);
  }
  renderBulkGuestRows();
  renderBulkGuestPagination();
});

qsa('[data-close-guest-modal]').forEach((button) => {
  button.addEventListener('click', closeGuestForm);
});

qsa('[data-close-guest-list-modal]').forEach((button) => {
  button.addEventListener('click', closeGuestListForm);
});

qsa('[data-close-bulk-guest-modal]').forEach((button) => {
  button.addEventListener('click', closeBulkGuestModal);
});

qsa('[data-close-excel-guest-modal]').forEach((button) => {
  button.addEventListener('click', closeExcelGuestModal);
});

document.addEventListener('click', () => {
  if (!openGuestMenuId) return;
  openGuestMenuId = null;
  renderGuestTable();
});

loadEventDetails();
