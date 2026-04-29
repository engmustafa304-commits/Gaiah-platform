import { registerClientAccount, waitForAuthUser } from '../shared/auth.js';
import { getFormValues, qs, setAlert, setLoading } from '../shared/ui.js';

const dashboardPath = '/dashboard/index.html';
const form = qs('#registerForm');
const alertEl = qs('#registerAlert');

waitForAuthUser().then((user) => {
  if (user) {
    window.location.href = dashboardPath;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setAlert(alertEl, '');

  if (!form.checkValidity()) {
    form.reportValidity();
    setAlert(alertEl, 'يرجى تعبئة الحقول المطلوبة.', 'error');
    return;
  }

  const values = getFormValues(form);
  if (values.password !== values.confirmPassword) {
    setAlert(alertEl, 'كلمة المرور وتأكيدها غير متطابقين.', 'error');
    return;
  }

  const submitButton = qs('.submit-button', form);
  setLoading(submitButton, true);

  try {
    await registerClientAccount({
      email: values.email,
      password: values.password,
      displayName: values.fullName,
    });

    // TODO Phase 4: call ensureMyUserProfile to create users/{uid} without subscription request.
    setAlert(alertEl, 'تم إنشاء الحساب بنجاح. سيتم تحويلك الآن.', 'success');
    window.setTimeout(() => {
      window.location.href = dashboardPath;
    }, 800);
  } catch (error) {
    setAlert(alertEl, error.message || 'تعذر إنشاء الحساب. حاول مرة أخرى.', 'error');
  } finally {
    setLoading(submitButton, false);
  }
});
