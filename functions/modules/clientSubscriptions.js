const { onCall } = require("firebase-functions/v2/https");
const { db } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { fail, normalizeCallableError } = require("../shared/errors");
const { requireString } = require("../shared/validators");

const USABLE_REQUEST_STATUSES = ["approved", "active"];
const USABLE_PAYMENT_STATUSES = ["partially_paid", "fully_paid"];
const CLOSED_REQUEST_STATUSES = ["rejected", "expired", "cancelled"];

function isUsableSubscription(data) {
  return (
    USABLE_REQUEST_STATUSES.includes(data.requestStatus) &&
    USABLE_PAYMENT_STATUSES.includes(data.paymentStatus)
  );
}

function getPlanTotalInvitations(subscriptionData) {
  const total = Number(
    subscriptionData.planSnapshot && subscriptionData.planSnapshot.guestCount
      ? subscriptionData.planSnapshot.guestCount
      : subscriptionData.selectedGuestCount || 0
  );

  return Number.isFinite(total) && total > 0 ? total : 0;
}

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

function buildAllocatedByPlan(eventDocs) {
  const allocatedByPlan = new Map();

  eventDocs.forEach((doc) => {
    const data = doc.data() || {};
    if (data.eventStatus === "cancelled") {
      return;
    }

    const allocations = Array.isArray(data.allocations) ? data.allocations : [];
    allocations.forEach((allocation) => {
      if (!allocation.planRequestId) {
        return;
      }

      const current = allocatedByPlan.get(allocation.planRequestId) || 0;
      allocatedByPlan.set(
        allocation.planRequestId,
        current + Number(allocation.allocatedInvitations || 0)
      );
    });
  });

  return allocatedByPlan;
}

function buildSubscriptionBalance(doc, allocatedByPlan) {
  const data = doc.data() || {};
  const totalInvitations = getPlanTotalInvitations(data);
  const allocatedInvitations = allocatedByPlan.get(doc.id) || 0;
  const sentInvitations = 0;
  const remainingInvitations = Math.max(totalInvitations - allocatedInvitations - sentInvitations, 0);

  return {
    totalInvitations,
    allocatedInvitations,
    sentInvitations,
    remainingInvitations,
    usableForEvents: isUsableSubscription(data) && remainingInvitations > 0,
  };
}

function serializeSubscription(doc, balanceInfo = null) {
  const data = doc.data() || {};
  const balance = balanceInfo || {
    totalInvitations: getPlanTotalInvitations(data),
    allocatedInvitations: 0,
    sentInvitations: 0,
    remainingInvitations: getPlanTotalInvitations(data),
    usableForEvents: isUsableSubscription(data),
  };

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
    paidAmount: data.paidAmount === undefined ? null : data.paidAmount,
    paymentNotes: data.paymentNotes || null,
    source: data.source || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    reviewedAt: serializeTimestamp(data.reviewedAt),
    paymentUpdatedAt: serializeTimestamp(data.paymentUpdatedAt),
    activatedAt: serializeTimestamp(data.activatedAt),
    balance,
  };
}

function serializeRelatedEvent(doc, subscriptionId) {
  const data = doc.data() || {};
  const allocations = Array.isArray(data.allocations) ? data.allocations : [];
  const matchingAllocation = allocations.find((allocation) => allocation.planRequestId === subscriptionId);

  return {
    id: doc.id,
    eventName: data.eventName || null,
    eventType: data.eventType || null,
    eventDate: data.eventDate || null,
    eventTime: data.eventTime || null,
    eventLocation: data.eventLocation || null,
    eventStatus: data.eventStatus || null,
    allocatedInvitations: matchingAllocation ? Number(matchingAllocation.allocatedInvitations || 0) : 0,
    invitationsSent: data.invitationsSent || 0,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

async function getSubscriptionDocsForUid(uid) {
  const snapshot = await db.collection("plan_subscription_requests").where("uid", "==", uid).get();
  return snapshot.docs;
}

async function getEventDocsForUid(uid) {
  const snapshot = await db.collection("events").where("uid", "==", uid).get();
  return snapshot.docs;
}

function sortByCreatedAtDesc(items) {
  return items.sort((a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt));
}

function validateSubscriptionId(data) {
  try {
    return requireString(data.subscriptionId, "subscriptionId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

const getMySubscriptionsOverview = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;

    const [subscriptionDocs, eventDocs] = await Promise.all([
      getSubscriptionDocsForUid(uid),
      getEventDocsForUid(uid),
    ]);
    const allocatedByPlan = buildAllocatedByPlan(eventDocs);
    const subscriptions = sortByCreatedAtDesc(
      subscriptionDocs.map((doc) => serializeSubscription(doc, buildSubscriptionBalance(doc, allocatedByPlan)))
    );

    const active = subscriptions.filter((subscription) => (
      subscription.requestStatus === "active" || subscription.requestStatus === "approved"
    ));
    const pending = subscriptions.filter((subscription) => subscription.requestStatus === "pending");
    const closed = subscriptions.filter((subscription) => CLOSED_REQUEST_STATUSES.includes(subscription.requestStatus));

    const summary = subscriptions.reduce((totals, subscription) => {
      totals.totalInvitations += subscription.balance.totalInvitations;
      totals.allocatedInvitations += subscription.balance.allocatedInvitations;
      totals.sentInvitations += subscription.balance.sentInvitations;
      totals.remainingInvitations += subscription.balance.remainingInvitations;
      if (subscription.balance.usableForEvents) totals.usablePlanCount += 1;
      return totals;
    }, {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: active.length,
      pendingSubscriptions: pending.length,
      closedSubscriptions: closed.length,
      totalInvitations: 0,
      allocatedInvitations: 0,
      sentInvitations: 0,
      remainingInvitations: 0,
      usablePlanCount: 0,
    });

    return {
      ok: true,
      summary,
      subscriptions,
      groups: {
        active,
        pending,
        closed,
      },
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getMySubscriptionDetails = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const subscriptionId = validateSubscriptionId(request.data || {});

    const subscriptionSnapshot = await db.collection("plan_subscription_requests").doc(subscriptionId).get();
    if (!subscriptionSnapshot.exists) {
      fail("not-found", "Subscription was not found.");
    }

    const subscriptionData = subscriptionSnapshot.data() || {};
    if (subscriptionData.uid !== uid) {
      fail("permission-denied", "You do not have access to this subscription.");
    }

    const eventDocs = await getEventDocsForUid(uid);
    const allocatedByPlan = buildAllocatedByPlan(eventDocs);
    const relatedEvents = sortByCreatedAtDesc(
      eventDocs
        .filter((doc) => {
          const data = doc.data() || {};
          const allocations = Array.isArray(data.allocations) ? data.allocations : [];
          return allocations.some((allocation) => allocation.planRequestId === subscriptionId);
        })
        .map((doc) => serializeRelatedEvent(doc, subscriptionId))
    );

    return {
      ok: true,
      subscription: serializeSubscription(
        subscriptionSnapshot,
        buildSubscriptionBalance(subscriptionSnapshot, allocatedByPlan)
      ),
      relatedEvents,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getMySubscriptionsOverview,
  getMySubscriptionDetails,
  USABLE_REQUEST_STATUSES,
  USABLE_PAYMENT_STATUSES,
  isUsableSubscription,
  getPlanTotalInvitations,
  buildAllocatedByPlan,
  serializeTimestamp,
  serializeSubscription,
};
