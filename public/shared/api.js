import { functions, httpsCallable } from './firebase-client.js';

function getCallableMessage(error) {
  const code = error && error.code ? error.code.replace('functions/', '') : '';
  const messages = {
    unauthenticated: 'يرجى تسجيل الدخول قبل إرسال الطلب.',
    'invalid-argument': 'يرجى مراجعة البيانات المدخلة.',
    'failed-precondition': 'لا يمكن تنفيذ الطلب حاليا. يرجى التواصل مع الدعم.',
    'permission-denied': 'ليست لديك صلاحية لتنفيذ هذا الطلب.',
    internal: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
  };

  return error && error.message && !messages[code] ? error.message : messages[code] || 'تعذر إرسال الطلب حاليا.';
}

export async function createPlanSubscriptionRequest(payload) {
  try {
    const callable = httpsCallable(functions, 'createPlanSubscriptionRequest');
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    throw new Error(getCallableMessage(error));
  }
}
