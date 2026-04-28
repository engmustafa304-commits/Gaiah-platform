const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const { normalizeEmail, normalizePhone, requireString } = require("../shared/validators");
const { buildTrustedPlanSnapshot } = require("../shared/planCatalog");

const REQUEST_STATUS_PENDING = "pending";
const PAYMENT_STATUS_NOT_PAID = "not_paid";

function requireInputString(data, fieldName, maxLength) {
  try {
    return requireString(data && data[fieldName], fieldName, maxLength);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function requireInteger(value, fieldName) {
  assert(Number.isInteger(value), "invalid-argument", `${fieldName} must be an integer.`);
  return value;
}

function getRequestEmail(request, data) {
  const tokenEmail = request.auth && request.auth.token ? request.auth.token.email : "";
  const email = normalizeEmail(tokenEmail || (data && data.email));
  assert(email, "invalid-argument", "A valid email is required.");
  return email;
}

function handlePlanCatalogError(error) {
  if (error && error.name === "PlanCatalogError") {
    fail("invalid-argument", error.message, { reason: error.code });
  }
}

const createPlanSubscriptionRequest = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const data = request.data || {};

    const uid = authContext.uid;
    const selectedPlanId = requireInputString(data, "selectedPlanId", 80);
    const selectedGuestCount = requireInteger(data.selectedGuestCount, "selectedGuestCount");
    const fullName = requireInputString(data, "fullName", 160);
    const whatsapp = normalizePhone(requireInputString(data, "whatsapp", 40));
    assert(whatsapp.length <= 40, "invalid-argument", "whatsapp must be 40 characters or fewer.");
    const hallName = requireInputString(data, "hallName", 180);
    const email = getRequestEmail(request, data);

    let planSnapshot;
    try {
      planSnapshot = buildTrustedPlanSnapshot(selectedPlanId, selectedGuestCount);
    } catch (error) {
      handlePlanCatalogError(error);
      throw error;
    }

    const pendingSnapshot = await db
      .collection("plan_subscription_requests")
      .where("uid", "==", uid)
      .where("requestStatus", "==", REQUEST_STATUS_PENDING)
      .get();

    const duplicateRequest = pendingSnapshot.docs.find((doc) => {
      const requestData = doc.data() || {};
      return (
        requestData.selectedPlanId === selectedPlanId &&
        requestData.selectedGuestCount === selectedGuestCount
      );
    });

    if (duplicateRequest) {
      return {
        ok: true,
        alreadyExists: true,
        requestId: duplicateRequest.id,
        requestStatus: REQUEST_STATUS_PENDING,
        message: "You already have a pending subscription request for this plan and guest count.",
      };
    }

    const userRef = db.collection("users").doc(uid);
    const requestRef = db.collection("plan_subscription_requests").doc();
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);

      if (userSnapshot.exists) {
        const userData = userSnapshot.data() || {};
        assert(
          userData.role !== "system_admin",
          "failed-precondition",
          "System admin accounts cannot create client subscription requests."
        );
      }

      const userPayload = {
        uid,
        email,
        role: "client",
        accountStatus: REQUEST_STATUS_PENDING,
        fullName,
        whatsapp,
        hallName,
        updatedAt: now,
      };

      if (!userSnapshot.exists) {
        userPayload.createdAt = now;
      }

      const requestPayload = {
        uid,
        email,
        fullName,
        whatsapp,
        hallName,
        selectedPlanId,
        selectedGuestCount,
        planSnapshot,
        requestStatus: REQUEST_STATUS_PENDING,
        paymentStatus: PAYMENT_STATUS_NOT_PAID,
        source: "onboarding",
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(userRef, userPayload, { merge: true });
      transaction.set(requestRef, requestPayload);
    });

    return {
      ok: true,
      alreadyExists: false,
      requestId: requestRef.id,
      requestStatus: REQUEST_STATUS_PENDING,
      paymentStatus: PAYMENT_STATUS_NOT_PAID,
      planSnapshot,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  createPlanSubscriptionRequest,
};
