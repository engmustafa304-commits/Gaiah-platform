const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const {
  optionalLimit,
  requireString,
  validateEnum,
} = require("../shared/validators");
const { isUsableSubscription } = require("./clientSubscriptions");

const EVENT_STATUS_ACTIVE = "active";
const EVENT_STATUS_CANCELLED = "cancelled";
const EVENT_TYPES = ["wedding", "engagement", "celebration", "meeting", "other"];
const EVENT_STATUSES = ["active", "cancelled", "completed"];

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

function serializeEvent(doc) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    uid: data.uid || null,
    eventName: data.eventName || null,
    eventType: data.eventType || null,
    eventDate: data.eventDate || null,
    eventTime: data.eventTime || null,
    eventLocation: data.eventLocation || null,
    eventStatus: data.eventStatus || null,
    allocations: Array.isArray(data.allocations) ? data.allocations : [],
    totalAllocatedInvitations: data.totalAllocatedInvitations || 0,
    invitationsSent: data.invitationsSent || 0,
    source: data.source || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function serializePlanRequest(doc) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    selectedPlanId: data.selectedPlanId || null,
    selectedGuestCount: data.selectedGuestCount || null,
    planSnapshot: data.planSnapshot || null,
    requestStatus: data.requestStatus || null,
    paymentStatus: data.paymentStatus || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function getPlanTotalInvitations(planData) {
  const total = Number(
    planData.planSnapshot && planData.planSnapshot.guestCount
      ? planData.planSnapshot.guestCount
      : planData.selectedGuestCount || 0
  );

  return Number.isFinite(total) && total > 0 ? total : 0;
}

function getPlanName(planData) {
  return (
    (planData.planSnapshot && planData.planSnapshot.name) ||
    planData.selectedPlanId ||
    "اشتراك نشط"
  );
}

function requireInputString(data, fieldName, maxLength) {
  try {
    return requireString(data && data[fieldName], fieldName, maxLength);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function requirePositiveInteger(value, fieldName) {
  const numberValue = Number(value);
  assert(
    Number.isInteger(numberValue) && numberValue > 0,
    "invalid-argument",
    `${fieldName} must be a positive integer.`
  );

  return numberValue;
}

function validateCreateEventInput(data) {
  try {
    const eventType = validateEnum(data.eventType, EVENT_TYPES, "eventType");
    assert(eventType, "invalid-argument", "eventType is required.");

    const allocations = Array.isArray(data.allocations) ? data.allocations : null;
    assert(allocations, "invalid-argument", "allocations is required.");
    assert(allocations.length > 0, "invalid-argument", "At least one allocation is required.");
    assert(allocations.length <= 20, "invalid-argument", "allocations must contain 20 items or fewer.");

    const seenPlanIds = new Set();
    const normalizedAllocations = allocations.map((allocation, index) => {
      const planRequestId = requireInputString(allocation, "planRequestId", 160);
      assert(
        !seenPlanIds.has(planRequestId),
        "invalid-argument",
        "planRequestId must be unique in allocations."
      );
      seenPlanIds.add(planRequestId);

      return {
        planRequestId,
        allocatedInvitations: requirePositiveInteger(
          allocation.allocatedInvitations,
          `allocations[${index}].allocatedInvitations`
        ),
      };
    });

    const totalAllocatedInvitations = normalizedAllocations.reduce(
      (total, allocation) => total + allocation.allocatedInvitations,
      0
    );
    assert(totalAllocatedInvitations > 0, "invalid-argument", "total allocated invitations must be greater than 0.");

    return {
      eventName: requireInputString(data, "eventName", 160),
      eventType,
      eventDate: requireInputString(data, "eventDate", 40),
      eventTime: requireInputString(data, "eventTime", 40),
      eventLocation: requireInputString(data, "eventLocation", 240),
      allocations: normalizedAllocations,
      totalAllocatedInvitations,
    };
  } catch (error) {
    if (error.code) {
      throw error;
    }

    fail("invalid-argument", error.message);
  }
}

function validateListEventsInput(data) {
  try {
    return {
      eventStatus: validateEnum(data.eventStatus, EVENT_STATUSES, "eventStatus"),
      limit: optionalLimit(data.limit, 50, 100),
    };
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateEventId(data) {
  try {
    return requireString(data.eventId, "eventId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function getAllocatedByPlan(eventDocs) {
  const allocatedByPlan = new Map();

  eventDocs.forEach((doc) => {
    const data = doc.data() || {};
    if (data.eventStatus === EVENT_STATUS_CANCELLED) {
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

function buildBalance(planDoc, allocatedByPlan) {
  const data = planDoc.data() || {};
  const totalInvitations = getPlanTotalInvitations(data);
  const allocatedInvitations = allocatedByPlan.get(planDoc.id) || 0;
  const remainingInvitations = Math.max(totalInvitations - allocatedInvitations, 0);

  return {
    planRequestId: planDoc.id,
    selectedPlanId: data.selectedPlanId || null,
    planName: getPlanName(data),
    totalInvitations,
    allocatedInvitations,
    sentInvitations: 0,
    remainingInvitations,
    requestStatus: data.requestStatus || null,
    paymentStatus: data.paymentStatus || null,
    createdAt: serializeTimestamp(data.createdAt),
    activatedAt: serializeTimestamp(data.activatedAt),
  };
}

async function getPlanDocsForUid(uid) {
  const snapshot = await db
    .collection("plan_subscription_requests")
    .where("uid", "==", uid)
    .get();

  return snapshot.docs;
}

async function getEventDocsForUid(uid) {
  const snapshot = await db.collection("events").where("uid", "==", uid).get();
  return snapshot.docs;
}

const getMyInvitationBalances = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;

    const [planDocs, eventDocs] = await Promise.all([
      getPlanDocsForUid(uid),
      getEventDocsForUid(uid),
    ]);
    const allocatedByPlan = getAllocatedByPlan(eventDocs);

    return {
      ok: true,
      balances: planDocs
        .filter((doc) => isUsableSubscription(doc.data() || {}))
        .map((doc) => buildBalance(doc, allocatedByPlan))
        .filter((balance) => balance.remainingInvitations > 0),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const createClientEvent = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const input = validateCreateEventInput(request.data || {});
    const eventRef = db.collection("events").doc();
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);
      if (userSnapshot.exists) {
        const userData = userSnapshot.data() || {};
        assert(
          userData.role !== "system_admin",
          "failed-precondition",
          "System admin accounts cannot create client events."
        );
      }

      const planSnapshots = new Map();
      for (const allocation of input.allocations) {
        const planRef = db.collection("plan_subscription_requests").doc(allocation.planRequestId);
        const planSnapshot = await transaction.get(planRef);
        assert(planSnapshot.exists, "not-found", "Plan subscription was not found.");

        const planData = planSnapshot.data() || {};
        assert(planData.uid === uid, "permission-denied", "This plan subscription does not belong to the current user.");
        assert(
          isUsableSubscription(planData),
          "failed-precondition",
          "Only approved or active paid subscriptions can be allocated to events."
        );

        planSnapshots.set(allocation.planRequestId, {
          id: planSnapshot.id,
          data: planData,
        });
      }

      const eventsQuery = db.collection("events").where("uid", "==", uid);
      const existingEventsSnapshot = await transaction.get(eventsQuery);
      const allocatedByPlan = getAllocatedByPlan(existingEventsSnapshot.docs);

      const trustedAllocations = input.allocations.map((allocation) => {
        const plan = planSnapshots.get(allocation.planRequestId);
        const planTotalInvitations = getPlanTotalInvitations(plan.data);
        const alreadyAllocated = allocatedByPlan.get(allocation.planRequestId) || 0;
        const planRemainingBeforeAllocation = Math.max(planTotalInvitations - alreadyAllocated, 0);

        assert(
          allocation.allocatedInvitations <= planRemainingBeforeAllocation,
          "failed-precondition",
          "Allocated invitations exceed the remaining balance for an active plan."
        );

        return {
          planRequestId: allocation.planRequestId,
          planName: getPlanName(plan.data),
          planId: plan.data.selectedPlanId || null,
          allocatedInvitations: allocation.allocatedInvitations,
          planTotalInvitations,
          planRemainingBeforeAllocation,
          planRemainingAfterAllocation: planRemainingBeforeAllocation - allocation.allocatedInvitations,
        };
      });

      transaction.set(eventRef, {
        uid,
        eventName: input.eventName,
        eventType: input.eventType,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        eventLocation: input.eventLocation,
        eventStatus: EVENT_STATUS_ACTIVE,
        allocations: trustedAllocations,
        totalAllocatedInvitations: input.totalAllocatedInvitations,
        invitationsSent: 0,
        source: "client_dashboard",
        createdAt: now,
        updatedAt: now,
      });
    });

    const eventSnapshot = await eventRef.get();

    return {
      ok: true,
      eventId: eventRef.id,
      event: serializeEvent(eventSnapshot),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const listMyEvents = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const filters = validateListEventsInput(request.data || {});

    const eventDocs = await getEventDocsForUid(uid);
    const events = eventDocs
      .map(serializeEvent)
      .filter((event) => !filters.eventStatus || event.eventStatus === filters.eventStatus)
      .sort((a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt))
      .slice(0, filters.limit);

    return {
      ok: true,
      events,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getMyEventDetails = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const eventId = validateEventId(request.data || {});
    const eventSnapshot = await db.collection("events").doc(eventId).get();

    if (!eventSnapshot.exists) {
      fail("not-found", "Event was not found.");
    }

    const eventData = eventSnapshot.data() || {};
    if (eventData.uid !== uid) {
      fail("permission-denied", "You do not have access to this event.");
    }

    return {
      ok: true,
      event: serializeEvent(eventSnapshot),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getMyInvitationBalances,
  createClientEvent,
  listMyEvents,
  getMyEventDetails,
  serializeTimestamp,
  serializeEvent,
  serializePlanRequest,
};
