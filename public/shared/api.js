import { functions, httpsCallable } from './firebase-client.js';

function getCallableCode(error) {
  return error && error.code ? error.code.replace('functions/', '') : '';
}

function getCallableMessage(error) {
  const code = getCallableCode(error);
  const messages = {
    unauthenticated: 'يرجى تسجيل الدخول قبل إرسال الطلب.',
    'invalid-argument': 'يرجى مراجعة البيانات المدخلة.',
    'failed-precondition': 'لا يمكن تنفيذ الطلب حاليا. يرجى التواصل مع الدعم.',
    'permission-denied': 'ليست لديك صلاحية لتنفيذ هذا الطلب.',
    internal: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
  };

  return error && error.message && !messages[code] ? error.message : messages[code] || 'تعذر إرسال الطلب حاليا.';
}

function normalizeCallableError(error) {
  const normalized = new Error(getCallableMessage(error));
  normalized.code = getCallableCode(error);
  normalized.originalMessage = error && error.message ? error.message : '';
  normalized.details = error && error.details ? error.details : undefined;
  return normalized;
}

export async function createPlanSubscriptionRequest(payload) {
  try {
    const callable = httpsCallable(functions, 'createPlanSubscriptionRequest');
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    throw normalizeCallableError(error);
  }
}

export async function getMyDashboard() {
  try {
    const callable = httpsCallable(functions, 'getMyDashboard');
    const result = await callable();
    return result.data;
  } catch (error) {
    throw normalizeCallableError(error);
  }
}

async function callFunction(name, payload) {
  try {
    const callable = httpsCallable(functions, name);
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    throw normalizeCallableError(error);
  }
}

export function getMyInvitationBalances() {
  return callFunction('getMyInvitationBalances');
}

export function createClientEvent(payload) {
  return callFunction('createClientEvent', payload);
}

export function listMyEvents(filters = {}) {
  return callFunction('listMyEvents', filters);
}

export function getMyEventDetails(eventId) {
  return callFunction('getMyEventDetails', { eventId });
}

export function getMySubscriptionsOverview() {
  return callFunction('getMySubscriptionsOverview');
}

export function getMySubscriptionDetails(subscriptionId) {
  return callFunction('getMySubscriptionDetails', { subscriptionId });
}

export function getSystemAdminOverview() {
  return callFunction('getSystemAdminOverview');
}

export function listPlanSubscriptionRequests(filters = {}) {
  return callFunction('listPlanSubscriptionRequests', filters);
}

export function getPlanSubscriptionRequestDetails(requestId) {
  return callFunction('getPlanSubscriptionRequestDetails', { requestId });
}

export function approvePlanSubscriptionRequest({ requestId, adminNotes }) {
  return callFunction('approvePlanSubscriptionRequest', { requestId, adminNotes });
}

export function rejectPlanSubscriptionRequest({ requestId, adminNotes }) {
  return callFunction('rejectPlanSubscriptionRequest', { requestId, adminNotes });
}

export function updatePlanSubscriptionPaymentStatus({
  requestId,
  paymentStatus,
  paidAmount,
  paymentNotes,
}) {
  return callFunction('updatePlanSubscriptionPaymentStatus', {
    requestId,
    paymentStatus,
    paidAmount,
    paymentNotes,
  });
}

export function activatePlanSubscription({ requestId, adminNotes }) {
  return callFunction('activatePlanSubscription', { requestId, adminNotes });
}

export function listClients(filters = {}) {
  return callFunction('listClients', filters);
}

export function getClientDetails(uid) {
  return callFunction('getClientDetails', { uid });
}
