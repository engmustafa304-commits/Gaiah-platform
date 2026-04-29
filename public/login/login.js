import { loginClientAccount, waitForAuthUser } from '../shared/auth.js';
import { getFormValues, qs, setAlert, setLoading } from '../shared/ui.js';

const dashboardPath = '/dashboard/index.html';
const form = qs('#loginForm');
const alertEl = qs('#loginAlert');

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
    setAlert(alertEl, 'يرجى إدخال البريد الإلكتروني وكلمة المرور.', 'error');
    return;
  }

  const values = getFormValues(form);
  const submitButton = qs('.submit-button', form);
  setLoading(submitButton, true);

  try {
    await loginClientAccount({
      email: values.email,
      password: values.password,
    });

    setAlert(alertEl, 'تم تسجيل الدخول بنجاح. سيتم تحويلك الآن.', 'success');
    window.setTimeout(() => {
      window.location.href = dashboardPath;
    }, 700);
  } catch (error) {
    setAlert(alertEl, error.message || 'تعذر تسجيل الدخول. حاول مرة أخرى.', 'error');
  } finally {
    setLoading(submitButton, false);
  }
});
