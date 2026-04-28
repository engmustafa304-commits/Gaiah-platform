export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

export function setAlert(element, message, type = 'info') {
  if (!element) return;
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

export function setLoading(button, loading, loadingText = 'جاري المعالجة...') {
  if (!button) return;
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }
  button.disabled = loading;
  button.classList.toggle('is-loading', loading);
  button.textContent = loading ? loadingText : button.dataset.defaultText;
}

export function getFormValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}
