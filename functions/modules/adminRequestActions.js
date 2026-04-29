const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireSystemAdmin } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const {
  optionalNumber,
  optionalString,
  requireString,
  validateEnum,
} = require("../shared/validators");

const PAYMENT_STATUSES = ["not_paid", "partially_paid", "fully_paid"];

function validateRequestId(data) {
  try {
    return requireString(data.requestId, "requestId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateAdminNotes(data) {
  try {
    return optionalString(data.adminNotes, "adminNotes", 500);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validatePaymentInput(data) {
  try {
    const paymentStatus = validateEnum(data.paymentStatus, PAYMENT_STATUSES, "paymentStatus");
    assert(paymentStatus, "invalid-argument", "paymentStatus is required.");

    const paidAmount = optionalNumber(data.paidAmount, "paidAmount");
    assert(paidAmount === null || paidAmount >= 0, "invalid-argument", "paidAmount must be 0 or greater.");

    return {
      paymentStatus,
      paidAmount,
      paymentNotes: optionalString(data.paymentNotes, "paymentNotes", 500),
    };
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function getAdminActor(admin) {
  return {
    uid: admin.uid || null,
    email: admin.email || null,
    displayName: admin.displayName || null,
  };
}

function getRequestRef(requestId) {
  return db.collection("plan_subscription_requests").doc(requestId);
}

function assertRequestExists(snapshot) {
  if (!snapshot.exists) {
    fail("not-found", "Plan subscription request was not found.");
  }
}

async function hasOtherActiveOrApprovedRequest(transaction, uid, currentRequestId) {
  if (!uid) {
    return false;
  }

  const querySnapshot = await transaction.get(
    db.collection("plan_subscription_requests").where("uid", "==", uid)
  );

  return querySnapshot.docs.some((doc) => {
    if (doc.id === currentRequestId) {
      return false;
    }

    const data = doc.data() || {};
    return data.requestStatus === "active" || data.requestStatus === "approved";
  });
}

const approvePlanSubscriptionRequest = onCall(async (request) => {
  try {
    const admin = await requireSystemAdmin(request);
    const data = request.data || {};
    const requestId = validateRequestId(data);
    const adminNotes = validateAdminNotes(data);
    const actor = getAdminActor(admin);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const requestRef = getRequestRef(requestId);
      const requestSnapshot = await transaction.get(requestRef);
      assertRequestExists(requestSnapshot);

      const requestData = requestSnapshot.data() || {};
      assert(
        requestData.requestStatus === "pending" || requestData.requestStatus === "rejected",
        "failed-precondition",
        "Only pending or rejected requests can be approved."
      );

      const requestPayload = {
        requestStatus: "approved",
        reviewedAt: now,
        reviewedBy: actor,
        updatedAt: now,
      };
      if (adminNotes) requestPayload.adminNotes = adminNotes;

      transaction.update(requestRef, requestPayload);

      if (requestData.uid) {
        transaction.set(
          db.collection("users").doc(requestData.uid),
          {
            accountStatus: "active",
            updatedAt: now,
          },
          { merge: true }
        );
      }
    });

    return {
      ok: true,
      requestId,
      requestStatus: "approved",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const rejectPlanSubscriptionRequest = onCall(async (request) => {
  try {
    const admin = await requireSystemAdmin(request);
    const data = request.data || {};
    const requestId = validateRequestId(data);
    const adminNotes = validateAdminNotes(data);
    const actor = getAdminActor(admin);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const requestRef = getRequestRef(requestId);
      const requestSnapshot = await transaction.get(requestRef);
      assertRequestExists(requestSnapshot);

      const requestData = requestSnapshot.data() || {};
      assert(
        requestData.requestStatus === "pending" || requestData.requestStatus === "approved",
        "failed-precondition",
        "Only pending or approved requests can be rejected."
      );

      const hasActiveOrApproved = await hasOtherActiveOrApprovedRequest(
        transaction,
        requestData.uid,
        requestId
      );

      const requestPayload = {
        requestStatus: "rejected",
        reviewedAt: now,
        reviewedBy: actor,
        updatedAt: now,
      };
      if (adminNotes) requestPayload.adminNotes = adminNotes;

      transaction.update(requestRef, requestPayload);

      if (requestData.uid) {
        transaction.set(
          db.collection("users").doc(requestData.uid),
          {
            accountStatus: hasActiveOrApproved ? "active" : "rejected",
            updatedAt: now,
          },
          { merge: true }
        );
      }
    });

    return {
      ok: true,
      requestId,
      requestStatus: "rejected",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const updatePlanSubscriptionPaymentStatus = onCall(async (request) => {
  try {
    const admin = await requireSystemAdmin(request);
    const data = request.data || {};
    const requestId = validateRequestId(data);
    const paymentInput = validatePaymentInput(data);
    const actor = getAdminActor(admin);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const requestRef = getRequestRef(requestId);
      const requestSnapshot = await transaction.get(requestRef);
      assertRequestExists(requestSnapshot);

      const payload = {
        paymentStatus: paymentInput.paymentStatus,
        paymentUpdatedAt: now,
        paymentUpdatedBy: actor,
        updatedAt: now,
      };
      if (paymentInput.paidAmount !== null) payload.paidAmount = paymentInput.paidAmount;
      if (paymentInput.paymentNotes) payload.paymentNotes = paymentInput.paymentNotes;

      transaction.update(requestRef, payload);
    });

    return {
      ok: true,
      requestId,
      paymentStatus: paymentInput.paymentStatus,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const activatePlanSubscription = onCall(async (request) => {
  try {
    const admin = await requireSystemAdmin(request);
    const data = request.data || {};
    const requestId = validateRequestId(data);
    const adminNotes = validateAdminNotes(data);
    const actor = getAdminActor(admin);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const requestRef = getRequestRef(requestId);
      const requestSnapshot = await transaction.get(requestRef);
      assertRequestExists(requestSnapshot);

      const requestData = requestSnapshot.data() || {};
      assert(
        requestData.requestStatus === "approved" || requestData.requestStatus === "active",
        "failed-precondition",
        "Only approved or active requests can be activated."
      );
      assert(
        requestData.paymentStatus === "fully_paid" || requestData.paymentStatus === "partially_paid",
        "failed-precondition",
        "The request must be fully or partially paid before activation."
      );

      const requestPayload = {
        requestStatus: "active",
        activatedAt: now,
        activatedBy: actor,
        updatedAt: now,
      };
      if (adminNotes) requestPayload.adminNotes = adminNotes;

      transaction.update(requestRef, requestPayload);

      if (requestData.uid) {
        transaction.set(
          db.collection("users").doc(requestData.uid),
          {
            accountStatus: "active",
            activePlanRequestId: requestId,
            activePlanId: requestData.selectedPlanId || null,
            updatedAt: now,
          },
          { merge: true }
        );
      }
    });

    return {
      ok: true,
      requestId,
      requestStatus: "active",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  approvePlanSubscriptionRequest,
  rejectPlanSubscriptionRequest,
  updatePlanSubscriptionPaymentStatus,
  activatePlanSubscription,
};
