import { loginClientAccount, registerClientAccount } from '../shared/auth.js';
import { createPlanSubscriptionRequest } from '../shared/api.js';
import {
  formatPlanPrice,
  getDefaultGuestCount,
  getPlanById,
  getPlanPriceTier,
} from '../shared/plan-catalog.js';
import { getFormValues, qs, qsa, setAlert, setLoading } from '../shared/ui.js';

const dashboardPath = '/dashboard/index.html';
const fallbackRedirectPath = '/';
const dashboardExists = false;

const searchParams = new URLSearchParams(window.location.search);
const selectedPlanId = searchParams.get('plan') || 'basic';
const selectedPlan = getPlanById(selectedPlanId);
const defaultGuestCount = getDefaultGuestCount(selectedPlanId);

const alertEl = qs('#formAlert');
const newAccountForm = qs('#newAccountForm');
const existingAccountForm = qs('#existingAccountForm');
const guestCountSelect = qs('#guestCountSelect');
const selectedPlanFeatures = qs('#selectedPlanFeatures');
const guestPriceOptions = qs('#guestPriceOptions');
const submitButtons = qsa('.submit-button');

function setSubmitDisabled(disabled) {
  submitButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function renderPlanSummary() {
  if (!selectedPlan || selectedPlan.custom || !selectedPlan.priceList.length) {
    qs('#selectedPlanName').textContent = 'باقة غير متاحة للطلب المباشر';
    qs('#selectedPlanDescription').textContent = 'يرجى العودة للصفحة الرئيسية واختيار باقة قابلة للطلب.';
    qs('#selectedPlanPrice').textContent = '-';
    selectedPlanFeatures.innerHTML = '';
    guestPriceOptions.innerHTML = '';
    setAlert(alertEl, 'هذه الباقة غير متاحة للطلب من نموذج الاشتراك.', 'error');
    setSubmitDisabled(true);
    guestCountSelect.disabled = true;
    return;
  }

  qs('#selectedPlanName').textContent = selectedPlan.name;
  qs('#selectedPlanDescription').textContent = selectedPlan.features.slice(0, 3).join('، ');
  selectedPlanFeatures.innerHTML = selectedPlan.features
    .map((feature) => `<li class="plan-feature-item">${feature}</li>`)
    .join('');

  guestCountSelect.innerHTML = selectedPlan.priceList
    .map((tier) => `<option value="${tier.guests}">${tier.guests} ضيف</option>`)
    .join('');
  guestPriceOptions.innerHTML = selectedPlan.priceList
    .map((tier) => `
      <button class="guest-price-option" type="button" data-guest-count="${tier.guests}">
        <span>${tier.guests} ضيف</span>
        <strong>${tier.price} ${selectedPlan.currency}</strong>
      </button>
    `)
    .join('');
  guestCountSelect.value = String(defaultGuestCount);
  updateSelectedPrice();
}

function updateSelectedPrice() {
  const guestCount = Number(guestCountSelect.value);
  const tier = getPlanPriceTier(selectedPlanId, guestCount);
  qs('#selectedPlanPrice').textContent = tier ? formatPlanPrice(selectedPlanId, guestCount) : '-';
  qsa('.guest-price-option', guestPriceOptions).forEach((option) => {
    option.classList.toggle('active', Number(option.dataset.guestCount) === guestCount);
  });
}

function getSelectedGuestCount() {
  const guestCount = Number(guestCountSelect.value);
  if (!Number.isInteger(guestCount)) {
    throw new Error('يرجى اختيار عدد الضيوف.');
  }
  return guestCount;
}

function getSuccessRedirectPath() {
  // TODO: Set dashboardExists to true when public/dashboard/index.html is created.
  return dashboardExists ? dashboardPath : fallbackRedirectPath;
}

function getSuccessMessage(result) {
  if (result && result.alreadyExists) {
    return 'لديك طلب اشتراك قيد المراجعة لهذه الباقة وعدد الضيوف. سيتم تحويلك الآن.';
  }

  return 'تم إرسال طلب الاشتراك بنجاح. سيتم تحويلك الآن.';
}

function validateSelectedPlan() {
  if (!selectedPlan || selectedPlan.custom || !selectedPlan.priceList.length) {
    throw new Error('الباقة المختارة غير متاحة للطلب المباشر.');
  }
}

function buildRequestPayload(values, user) {
  return {
    selectedPlanId,
    selectedGuestCount: getSelectedGuestCount(),
    fullName: values.fullName || user.displayName || values.email,
    whatsapp: values.whatsapp,
    hallName: values.hallName,
    email: user.email || values.email,
  };
}

async function handleNewAccount(values) {
  if (values.password !== values.confirmPassword) {
    throw new Error('كلمة المرور وتأكيدها غير متطابقين.');
  }

  const user = await registerClientAccount({
    email: values.email,
    password: values.password,
    displayName: values.fullName,
  });

  return createPlanSubscriptionRequest(buildRequestPayload(values, user));
}

async function handleExistingAccount(values) {
  const user = await loginClientAccount({
    email: values.email,
    password: values.password,
  });

  return createPlanSubscriptionRequest(buildRequestPayload(values, user));
}

qsa('.tab-button').forEach((button) => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;
    qsa('.tab-button').forEach((item) => item.classList.toggle('active', item === button));
    newAccountForm.classList.toggle('hidden', tab !== 'new-account');
    existingAccountForm.classList.toggle('hidden', tab !== 'existing-account');
    setAlert(alertEl, '');
  });
});

guestCountSelect.addEventListener('change', updateSelectedPrice);

guestPriceOptions.addEventListener('click', (event) => {
  const option = event.target.closest('.guest-price-option');
  if (!option || option.disabled) {
    return;
  }

  guestCountSelect.value = option.dataset.guestCount;
  updateSelectedPrice();
});

qsa('.onboarding-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAlert(alertEl, '');

    if (!form.checkValidity()) {
      form.reportValidity();
      setAlert(alertEl, 'يرجى تعبئة جميع الحقول المطلوبة.', 'error');
      return;
    }

    const values = getFormValues(form);
    const flowType = form.dataset.flow;
    const submitButton = qs('.submit-button', form);
    setLoading(submitButton, true);

    try {
      validateSelectedPlan();

      const result = flowType === 'new-account'
        ? await handleNewAccount(values)
        : await handleExistingAccount(values);

      setAlert(alertEl, getSuccessMessage(result), 'success');

      window.setTimeout(() => {
        window.location.href = getSuccessRedirectPath();
      }, 1100);
    } catch (error) {
      setAlert(alertEl, error.message || 'تعذر إرسال الطلب حاليا.', 'error');
    } finally {
      setLoading(submitButton, false);
    }
  });
});

renderPlanSummary();
