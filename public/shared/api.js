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

export function getMyEventWorkspace(payload) {
  return callFunction('getMyEventWorkspace', payload);
}

export function listMyEventGuestLists(payload) {
  return callFunction('listMyEventGuestLists', payload);
}

export function getMyEventGuestListDetails(payload) {
  return callFunction('getMyEventGuestListDetails', payload);
}

export function listMyEventGuests(payload) {
  return callFunction('listMyEventGuests', payload);
}

export function createMyEventGuestList(payload) {
  return callFunction('createMyEventGuestList', payload);
}

export function addGuestToList(payload) {
  return callFunction('addGuestToList', payload);
}

export function bulkAddGuestsToList(payload) {
  return callFunction('bulkAddGuestsToList', payload);
}

export function updateGuestInList(payload) {
  return callFunction('updateGuestInList', payload);
}

export function updateGuestStatus(payload) {
  return callFunction('updateGuestStatus', payload);
}

export function revokeGuest(payload) {
  return callFunction('revokeGuest', payload);
}

export function listInvitationMediaCatalogue(filters = {}) {
  return callFunction('listInvitationMediaCatalogue', filters);
}

export function updateGuestListInvitationDesign(payload) {
  return callFunction('updateGuestListInvitationDesign', payload);
}

export function createGuestListInvitationLink(payload) {
  return callFunction('createGuestListInvitationLink', payload);
}

export function getMyGuestListInvitationLink(payload) {
  return callFunction('getMyGuestListInvitationLink', payload);
}

export function deactivateGuestListInvitationLink(payload) {
  return callFunction('deactivateGuestListInvitationLink', payload);
}

export function getPublicInvitationByToken(payload) {
  return callFunction('getPublicInvitationByToken', payload);
}

export function verifyPublicInvitationGuest(payload) {
  return callFunction('verifyPublicInvitationGuest', payload);
}

export function submitPublicGuestRsvp(payload) {
  return callFunction('submitPublicGuestRsvp', payload);
}

export function createEventStaffAccount(payload) {
  return callFunction('createEventStaffAccount', payload);
}

export function listEventStaffAccounts(payload) {
  return callFunction('listEventStaffAccounts', payload);
}

export function updateEventStaffAccount(payload) {
  return callFunction('updateEventStaffAccount', payload);
}

export function disableEventStaffAccount(payload) {
  return callFunction('disableEventStaffAccount', payload);
}

export function getMyStaffEventWorkspace(payload = {}) {
  return callFunction('getMyStaffEventWorkspace', payload);
}

export function verifyEventGuestQr(payload) {
  return callFunction('verifyEventGuestQr', payload);
}

export function confirmGuestArrival(payload) {
  return callFunction('confirmGuestArrival', payload);
}

export function markGuestWillReturn(payload) {
  return callFunction('markGuestWillReturn', payload);
}

export function getMyEventAttendanceSummary(payload) {
  return callFunction('getMyEventAttendanceSummary', payload);
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
