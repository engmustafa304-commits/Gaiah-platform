const { onCall } = require("firebase-functions/v2/https");
const { db } = require("../shared/admin");
const { requireSystemAdmin } = require("../shared/auth");
const { fail, normalizeCallableError } = require("../shared/errors");
const {
  optionalLimit,
  optionalString,
  requireString,
  validateEnum,
} = require("../shared/validators");

const ALLOWED_REQUEST_STATUSES = ["pending", "approved", "active", "rejected", "expired", "cancelled"];
const ALLOWED_PAYMENT_STATUSES = ["not_paid", "partially_paid", "fully_paid"];

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function getTimestampSortValue(value) {
  const serialized = serializeTimestamp(value);
  if (!serialized) {
    return 0;
  }

  const time = new Date(serialized).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function serializeRequest(doc) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    uid: data.uid || null,
    email: data.email || null,
    fullName: data.fullName || null,
    hallName: data.hallName || null,
    whatsapp: data.whatsapp || null,
    selectedPlanId: data.selectedPlanId || null,
    selectedGuestCount: data.selectedGuestCount || null,
    planSnapshot: data.planSnapshot || null,
    requestStatus: data.requestStatus || null,
    paymentStatus: data.paymentStatus || null,
    source: data.source || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function serializeUser(uid, data) {
  return {
    uid,
    email: data.email || null,
    fullName: data.fullName || null,
    whatsapp: data.whatsapp || null,
    hallName: data.hallName || null,
    role: data.role || null,
    accountStatus: data.accountStatus || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function getSearchText(request) {
  return [
    request.fullName,
    request.hallName,
    request.email,
    request.whatsapp,
    request.selectedPlanId,
    request.planSnapshot && request.planSnapshot.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function validateListInput(data) {
  try {
    return {
      requestStatus: validateEnum(data.requestStatus, ALLOWED_REQUEST_STATUSES, "requestStatus"),
      paymentStatus: validateEnum(data.paymentStatus, ALLOWED_PAYMENT_STATUSES, "paymentStatus"),
      search: optionalString(data.search, "search", 120),
      limit: optionalLimit(data.limit, 50, 100),
    };
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateRequestId(data) {
  try {
    return requireString(data.requestId, "requestId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

async function getLatestRequestDocs(limit) {
  try {
    const snapshot = await db
      .collection("plan_subscription_requests")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snapshot.docs.slice(0, limit);
  } catch (error) {
    const snapshot = await db.collection("plan_subscription_requests").limit(100).get();
    return snapshot.docs
      .sort((a, b) => {
        const aData = a.data() || {};
        const bData = b.data() || {};
        return getTimestampSortValue(bData.createdAt) - getTimestampSortValue(aData.createdAt);
      })
      .slice(0, limit);
  }
}

const listPlanSubscriptionRequests = onCall(async (request) => {
  try {
    await requireSystemAdmin(request);

    const data = request.data || {};
    const filters = validateListInput(data);
    const docs = await getLatestRequestDocs(100);
    const search = filters.search ? filters.search.toLowerCase() : null;

    const requests = docs
      .map(serializeRequest)
      .filter((item) => !filters.requestStatus || item.requestStatus === filters.requestStatus)
      .filter((item) => !filters.paymentStatus || item.paymentStatus === filters.paymentStatus)
      .filter((item) => !search || getSearchText(item).includes(search))
      .slice(0, filters.limit);

    return {
      ok: true,
      requests,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getPlanSubscriptionRequestDetails = onCall(async (request) => {
  try {
    await requireSystemAdmin(request);

    const requestId = validateRequestId(request.data || {});
    const requestSnapshot = await db.collection("plan_subscription_requests").doc(requestId).get();
    if (!requestSnapshot.exists) {
      fail("not-found", "Plan subscription request was not found.");
    }

    const serializedRequest = serializeRequest(requestSnapshot);
    let user = null;

    if (serializedRequest.uid) {
      const userSnapshot = await db.collection("users").doc(serializedRequest.uid).get();
      if (userSnapshot.exists) {
        user = serializeUser(serializedRequest.uid, userSnapshot.data() || {});
      }
    }

    return {
      ok: true,
      request: serializedRequest,
      user,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  listPlanSubscriptionRequests,
  getPlanSubscriptionRequestDetails,
};
