const { onCall } = require("firebase-functions/v2/https");

exports.healthCheck = onCall(() => {
  return {
    ok: true,
    service: "gaiah-functions",
    timestamp: new Date().toISOString(),
  };
});
