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

const ALLOWED_ACCOUNT_STATUSES = ["registered", "pending", "active", "rejected", "suspended"];

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
    adminNotes: data.adminNotes || null,
    paidAmount: data.paidAmount === undefined ? null : data.paidAmount,
    paymentNotes: data.paymentNotes || null,
    reviewedAt: serializeTimestamp(data.reviewedAt),
    reviewedBy: data.reviewedBy || null,
    paymentUpdatedAt: serializeTimestamp(data.paymentUpdatedAt),
    paymentUpdatedBy: data.paymentUpdatedBy || null,
    activatedAt: serializeTimestamp(data.activatedAt),
    activatedBy: data.activatedBy || null,
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

function validateListInput(data) {
  try {
    return {
      status: validateEnum(data.status, ALLOWED_ACCOUNT_STATUSES, "status"),
      search: optionalString(data.search, "search", 120),
      limit: optionalLimit(data.limit, 50, 100),
    };
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateUid(data) {
  try {
    return requireString(data.uid, "uid", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function getClientSearchText(client) {
  return [
    client.fullName,
    client.hallName,
    client.email,
    client.whatsapp,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function groupRequestsByUid(requestDocs) {
  const grouped = new Map();

  requestDocs.forEach((doc) => {
    const request = serializeRequest(doc);
    if (!request.uid) {
      return;
    }

    if (!grouped.has(request.uid)) {
      grouped.set(request.uid, []);
    }

    grouped.get(request.uid).push(request);
  });

  grouped.forEach((items) => {
    items.sort((a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt));
  });

  return grouped;
}

function buildClientListItem(doc, requestsByUid) {
  const data = doc.data() || {};
  const user = serializeUser(doc.id, data);
  const requests = requestsByUid.get(doc.id) || [];

  return {
    ...user,
    totalRequestCount: requests.length,
    activeSubscriptionCount: requests.filter((item) => (
      item.requestStatus === "active" || item.requestStatus === "approved"
    )).length,
    pendingRequestCount: requests.filter((item) => item.requestStatus === "pending").length,
    latestRequest: requests[0] || null,
  };
}

async function getLatestRequestDocs(limit) {
  try {
    const snapshot = await db
      .collection("plan_subscription_requests")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs;
  } catch (error) {
    const snapshot = await db.collection("plan_subscription_requests").limit(limit).get();
    return snapshot.docs.sort((a, b) => {
      const aData = a.data() || {};
      const bData = b.data() || {};
      return getTimestampSortValue(bData.createdAt) - getTimestampSortValue(aData.createdAt);
    });
  }
}

const listClients = onCall(async (request) => {
  try {
    await requireSystemAdmin(request);

    const filters = validateListInput(request.data || {});
    const [clientsSnapshot, requestDocs] = await Promise.all([
      db.collection("users").where("role", "==", "client").get(),
      getLatestRequestDocs(200),
    ]);

    const requestsByUid = groupRequestsByUid(requestDocs);
    const search = filters.search ? filters.search.toLowerCase() : null;
    const clients = clientsSnapshot.docs
      .map((doc) => buildClientListItem(doc, requestsByUid))
      .filter((client) => !filters.status || client.accountStatus === filters.status)
      .filter((client) => !search || getClientSearchText(client).includes(search))
      .slice(0, filters.limit);

    return {
      ok: true,
      clients,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getClientDetails = onCall(async (request) => {
  try {
    await requireSystemAdmin(request);

    const uid = validateUid(request.data || {});
    const userSnapshot = await db.collection("users").doc(uid).get();
    if (!userSnapshot.exists) {
      fail("not-found", "Client was not found.");
    }

    const subscriptionsSnapshot = await db
      .collection("plan_subscription_requests")
      .where("uid", "==", uid)
      .get();

    const subscriptions = subscriptionsSnapshot.docs
      .map(serializeRequest)
      .sort((a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt));

    return {
      ok: true,
      user: serializeUser(uid, userSnapshot.data() || {}),
      subscriptions,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  listClients,
  getClientDetails,
};
