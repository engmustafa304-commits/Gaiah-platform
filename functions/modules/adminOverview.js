const { onCall } = require("firebase-functions/v2/https");
const { db } = require("../shared/admin");
const { requireSystemAdmin } = require("../shared/auth");
const { normalizeCallableError } = require("../shared/errors");

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
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function incrementCounter(stats, key) {
  stats[key] = (stats[key] || 0) + 1;
}

function buildStats(clientDocs, requestDocs) {
  const stats = {
    totalClients: clientDocs.length,
    registeredClients: 0,
    activeClients: 0,
    pendingClients: 0,
    rejectedClients: 0,
    suspendedClients: 0,
    totalRequests: requestDocs.length,
    pendingRequests: 0,
    approvedRequests: 0,
    activeRequests: 0,
    rejectedRequests: 0,
    expiredRequests: 0,
    unpaidRequests: 0,
    partiallyPaidRequests: 0,
    fullyPaidRequests: 0,
  };

  clientDocs.forEach((doc) => {
    const data = doc.data() || {};
    if (data.accountStatus === "registered") incrementCounter(stats, "registeredClients");
    if (data.accountStatus === "active") incrementCounter(stats, "activeClients");
    if (data.accountStatus === "pending") incrementCounter(stats, "pendingClients");
    if (data.accountStatus === "rejected") incrementCounter(stats, "rejectedClients");
    if (data.accountStatus === "suspended") incrementCounter(stats, "suspendedClients");
  });

  requestDocs.forEach((doc) => {
    const data = doc.data() || {};
    if (data.requestStatus === "pending") incrementCounter(stats, "pendingRequests");
    if (data.requestStatus === "approved") incrementCounter(stats, "approvedRequests");
    if (data.requestStatus === "active") incrementCounter(stats, "activeRequests");
    if (data.requestStatus === "rejected") incrementCounter(stats, "rejectedRequests");
    if (data.requestStatus === "expired") incrementCounter(stats, "expiredRequests");
    if (data.paymentStatus === "not_paid") incrementCounter(stats, "unpaidRequests");
    if (data.paymentStatus === "partially_paid") incrementCounter(stats, "partiallyPaidRequests");
    if (data.paymentStatus === "fully_paid") incrementCounter(stats, "fullyPaidRequests");
  });

  return stats;
}

function buildNotifications(requests) {
  const notifications = [];

  requests.forEach((request) => {
    if (request.requestStatus === "pending") {
      notifications.push({
        type: "pending_request",
        title: "طلب اشتراك جديد قيد المراجعة",
        message: `${request.fullName || request.email || "عميل"} ينتظر مراجعة طلب الاشتراك.`,
        severity: "info",
        requestId: request.id,
        uid: request.uid,
        createdAt: request.createdAt,
      });
    }

    const isApprovedOrActive = request.requestStatus === "approved" || request.requestStatus === "active";
    const isUnpaid = request.paymentStatus === "not_paid" || request.paymentStatus === "partially_paid";
    if (isApprovedOrActive && isUnpaid) {
      notifications.push({
        type: "unpaid_active_request",
        title: "اشتراك يحتاج متابعة الدفع",
        message: `${request.fullName || request.email || "عميل"} لديه اشتراك موافق عليه أو نشط ولم يكتمل دفعه.`,
        severity: "warning",
        requestId: request.id,
        uid: request.uid,
        createdAt: request.createdAt,
      });
    }
  });

  return notifications.slice(0, 20);
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

const getSystemAdminOverview = onCall(async (request) => {
  try {
    await requireSystemAdmin(request);

    const [clientsSnapshot, requestDocs] = await Promise.all([
      db.collection("users").where("role", "==", "client").get(),
      getLatestRequestDocs(100),
    ]);

    const recentRequests = requestDocs.slice(0, 10).map(serializeRequest);

    return {
      ok: true,
      stats: buildStats(clientsSnapshot.docs, requestDocs),
      recentRequests,
      notifications: buildNotifications(requestDocs.map(serializeRequest)),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getSystemAdminOverview,
};
