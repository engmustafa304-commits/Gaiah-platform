const { onCall } = require("firebase-functions/v2/https");
const { createPlanSubscriptionRequest } = require("./modules/planSubscriptions");
const { ensureMyUserProfile } = require("./modules/clientProfile");
const { getMyDashboard } = require("./modules/clientDashboard");
const {
  getMyInvitationBalances,
  createClientEvent,
  listMyEvents,
  getMyEventDetails,
} = require("./modules/clientEvents");
const {
  getMyEventWorkspace,
  listMyEventGuestLists,
  getMyEventGuestListDetails,
  listMyEventGuests,
  listInvitationMediaCatalogue,
  updateGuestListInvitationDesign,
  createMyEventGuestList,
  updateMyEventGuestList,
  archiveMyEventGuestList,
  addGuestToList,
  updateGuestInList,
  updateGuestStatus,
  revokeGuest,
  bulkAddGuestsToList,
} = require("./modules/eventGuestLists");
const {
  getMySubscriptionsOverview,
  getMySubscriptionDetails,
} = require("./modules/clientSubscriptions");
const {
  createGuestListInvitationLink,
  getMyGuestListInvitationLink,
  deactivateGuestListInvitationLink,
  getPublicInvitationByToken,
  verifyPublicInvitationGuest,
  submitPublicGuestRsvp,
} = require("./modules/publicInvitations");
const {
  createEventStaffAccount,
  listEventStaffAccounts,
  updateEventStaffAccount,
  disableEventStaffAccount,
} = require("./modules/eventStaffAccounts");
const {
  getMyStaffEventWorkspace,
  verifyEventGuestQr,
  confirmGuestArrival,
  markGuestWillReturn,
} = require("./modules/staffAttendance");
const {
  getMyEventAttendanceSummary,
} = require("./modules/eventAttendanceSummary");
const { getSystemAdminOverview } = require("./modules/adminOverview");
const {
  listPlanSubscriptionRequests,
  getPlanSubscriptionRequestDetails,
} = require("./modules/adminRequests");
const {
  listClients,
  getClientDetails,
} = require("./modules/adminClients");
const {
  approvePlanSubscriptionRequest,
  rejectPlanSubscriptionRequest,
  updatePlanSubscriptionPaymentStatus,
  activatePlanSubscription,
} = require("./modules/adminRequestActions");

exports.healthCheck = onCall(() => {
  return {
    ok: true,
    service: "gaiah-functions",
    timestamp: new Date().toISOString(),
  };
});

exports.createPlanSubscriptionRequest = createPlanSubscriptionRequest;
exports.ensureMyUserProfile = ensureMyUserProfile;
exports.getMyDashboard = getMyDashboard;
exports.getMyInvitationBalances = getMyInvitationBalances;
exports.createClientEvent = createClientEvent;
exports.listMyEvents = listMyEvents;
exports.getMyEventDetails = getMyEventDetails;
exports.getMyEventWorkspace = getMyEventWorkspace;
exports.listMyEventGuestLists = listMyEventGuestLists;
exports.getMyEventGuestListDetails = getMyEventGuestListDetails;
exports.listMyEventGuests = listMyEventGuests;
exports.listInvitationMediaCatalogue = listInvitationMediaCatalogue;
exports.updateGuestListInvitationDesign = updateGuestListInvitationDesign;
exports.createMyEventGuestList = createMyEventGuestList;
exports.updateMyEventGuestList = updateMyEventGuestList;
exports.archiveMyEventGuestList = archiveMyEventGuestList;
exports.addGuestToList = addGuestToList;
exports.updateGuestInList = updateGuestInList;
exports.updateGuestStatus = updateGuestStatus;
exports.revokeGuest = revokeGuest;
exports.bulkAddGuestsToList = bulkAddGuestsToList;
exports.getMySubscriptionsOverview = getMySubscriptionsOverview;
exports.getMySubscriptionDetails = getMySubscriptionDetails;
exports.createGuestListInvitationLink = createGuestListInvitationLink;
exports.getMyGuestListInvitationLink = getMyGuestListInvitationLink;
exports.deactivateGuestListInvitationLink = deactivateGuestListInvitationLink;
exports.getPublicInvitationByToken = getPublicInvitationByToken;
exports.verifyPublicInvitationGuest = verifyPublicInvitationGuest;
exports.submitPublicGuestRsvp = submitPublicGuestRsvp;
exports.createEventStaffAccount = createEventStaffAccount;
exports.listEventStaffAccounts = listEventStaffAccounts;
exports.updateEventStaffAccount = updateEventStaffAccount;
exports.disableEventStaffAccount = disableEventStaffAccount;
exports.getMyStaffEventWorkspace = getMyStaffEventWorkspace;
exports.verifyEventGuestQr = verifyEventGuestQr;
exports.confirmGuestArrival = confirmGuestArrival;
exports.markGuestWillReturn = markGuestWillReturn;
exports.getMyEventAttendanceSummary = getMyEventAttendanceSummary;
exports.getSystemAdminOverview = getSystemAdminOverview;
exports.listPlanSubscriptionRequests = listPlanSubscriptionRequests;
exports.getPlanSubscriptionRequestDetails = getPlanSubscriptionRequestDetails;
exports.listClients = listClients;
exports.getClientDetails = getClientDetails;
exports.approvePlanSubscriptionRequest = approvePlanSubscriptionRequest;
exports.rejectPlanSubscriptionRequest = rejectPlanSubscriptionRequest;
exports.updatePlanSubscriptionPaymentStatus = updatePlanSubscriptionPaymentStatus;
exports.activatePlanSubscription = activatePlanSubscription;
