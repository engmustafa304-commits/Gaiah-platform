const { onCall } = require("firebase-functions/v2/https");
const { createPlanSubscriptionRequest } = require("./modules/planSubscriptions");

exports.healthCheck = onCall(() => {
  return {
    ok: true,
    service: "gaiah-functions",
    timestamp: new Date().toISOString(),
  };
});

exports.createPlanSubscriptionRequest = createPlanSubscriptionRequest;
