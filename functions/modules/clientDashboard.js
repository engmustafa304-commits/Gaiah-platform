const { onCall } = require("firebase-functions/v2/https");
const { db } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
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

function serializeUser(uid, data, fallbackEmail) {
  if (!data) {
    return {
      uid,
      email: fallbackEmail || null,
      role: "client",
      accountStatus: "unknown",
    };
  }

  return {
    uid: data.uid || uid,
    email: data.email || fallbackEmail || null,
    fullName: data.fullName || null,
    whatsapp: data.whatsapp || null,
    hallName: data.hallName || null,
    role: data.role || null,
    accountStatus: data.accountStatus || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function serializeSubscription(doc) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    uid: data.uid || null,
    email: data.email || null,
    fullName: data.fullName || null,
    whatsapp: data.whatsapp || null,
    hallName: data.hallName || null,
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

const getMyDashboard = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const fallbackEmail = authContext.token && authContext.token.email ? authContext.token.email : null;

    const [userSnapshot, subscriptionsSnapshot] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("plan_subscription_requests").where("uid", "==", uid).get(),
    ]);

    const user = serializeUser(
      uid,
      userSnapshot.exists ? userSnapshot.data() || {} : null,
      fallbackEmail
    );

    const subscriptions = subscriptionsSnapshot.docs
      .sort((a, b) => {
        const aData = a.data() || {};
        const bData = b.data() || {};
        return getTimestampSortValue(bData.createdAt) - getTimestampSortValue(aData.createdAt);
      })
      .slice(0, 20)
      .map(serializeSubscription);

    return {
      ok: true,
      user,
      subscriptions,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getMyDashboard,
  serializeTimestamp,
};
