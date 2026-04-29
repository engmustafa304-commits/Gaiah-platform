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
  getMySubscriptionsOverview,
  getMySubscriptionDetails,
} = require("./modules/clientSubscriptions");
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
exports.getMySubscriptionsOverview = getMySubscriptionsOverview;
exports.getMySubscriptionDetails = getMySubscriptionDetails;
exports.getSystemAdminOverview = getSystemAdminOverview;
exports.listPlanSubscriptionRequests = listPlanSubscriptionRequests;
exports.getPlanSubscriptionRequestDetails = getPlanSubscriptionRequestDetails;
exports.listClients = listClients;
exports.getClientDetails = getClientDetails;
exports.approvePlanSubscriptionRequest = approvePlanSubscriptionRequest;
exports.rejectPlanSubscriptionRequest = rejectPlanSubscriptionRequest;
exports.updatePlanSubscriptionPaymentStatus = updatePlanSubscriptionPaymentStatus;
exports.activatePlanSubscription = activatePlanSubscription;
