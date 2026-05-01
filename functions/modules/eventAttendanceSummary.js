const { onCall } = require("firebase-functions/v2/https");
const { db } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const { requireString } = require("../shared/validators");

function validateEventId(data) {
  try {
    return requireString(data && data.eventId, "eventId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

async function requireOwnedEvent(uid, eventId) {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnapshot = await eventRef.get();

  assert(eventSnapshot.exists, "not-found", "Event was not found.");

  const eventData = eventSnapshot.data() || {};
  assert(eventData.uid === uid, "permission-denied", "You do not have access to this event.");

  return { eventRef, eventData };
}

function createEmptySummary() {
  return {
    totalGuests: 0,
    accepted: 0,
    declined: 0,
    qrIssued: 0,
    arrived: 0,
    notArrived: 0,
    willReturn: 0,
    revoked: 0,
  };
}

function updateSummaryWithGuest(summary, guestData) {
  const invitationStatus = guestData.invitationStatus || "unknown";
  const rsvpStatus = guestData.rsvpStatus || null;
  const attendanceStatus = guestData.attendanceStatus || "not_arrived";
  const hasQrPass = Boolean(guestData.qrPass && guestData.qrPass.qrPayload);

  const isRevoked = invitationStatus === "revoked";
  const isDeclined = invitationStatus === "declined" || rsvpStatus === "declined";
  const isAccepted =
    invitationStatus === "accepted" ||
    rsvpStatus === "accepted" ||
    invitationStatus === "arrived";

  summary.totalGuests += 1;

  if (isRevoked) {
    summary.revoked += 1;
  }
  if (isDeclined) {
    summary.declined += 1;
  }
  if (isAccepted) {
    summary.accepted += 1;
  }
  if (hasQrPass) {
    summary.qrIssued += 1;
  }
  if (attendanceStatus === "arrived") {
    summary.arrived += 1;
  }
  if (attendanceStatus === "will_return") {
    summary.willReturn += 1;
  }
}

const getMyEventAttendanceSummary = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);

    const { eventRef } = await requireOwnedEvent(uid, eventId);
    const summary = createEmptySummary();
    const guestListsSnapshot = await eventRef.collection("guest_lists").get();

    for (const guestListDoc of guestListsSnapshot.docs) {
      const guestsSnapshot = await guestListDoc.ref.collection("guests").get();
      guestsSnapshot.docs.forEach((guestDoc) => {
        updateSummaryWithGuest(summary, guestDoc.data() || {});
      });
    }

    summary.notArrived = Math.max(summary.accepted - summary.arrived - summary.willReturn, 0);

    return {
      ok: true,
      summary,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getMyEventAttendanceSummary,
};
