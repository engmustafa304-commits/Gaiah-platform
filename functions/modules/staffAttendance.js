const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const { requireString } = require("../shared/validators");

const STAFF_ROLE = "event_staff";
const ACTIVE_STATUS = "active";
const QR_PREFIX = "gaiah://invite-pass";

const REASON_MESSAGES = {
  allowed_for_arrival: "QR is valid for arrival.",
  arrival_confirmed: "Guest arrival was confirmed.",
  will_return_marked: "Guest was marked as will return.",
  invalid_qr_format: "Invalid QR format.",
  invitation_link_not_found: "Invitation link was not found.",
  invitation_link_disabled: "Invitation link is disabled.",
  qr_event_mismatch: "This QR belongs to another event.",
  guest_not_found: "Guest was not found for this QR.",
  guest_revoked: "This invitation was revoked by the event owner.",
  guest_declined: "Guest declined the invitation.",
  guest_not_accepted: "Guest has not accepted the invitation yet.",
  qr_pass_missing: "QR pass is missing.",
  qr_pass_inactive: "QR pass is inactive.",
  qr_token_mismatch: "QR token does not match.",
  already_arrived: "Guest has already arrived.",
  not_arrived_yet: "Guest has not arrived yet.",
  staff_not_assigned: "Staff account is not assigned to this event.",
  staff_disabled: "Staff account is disabled.",
  event_not_found: "Event was not found.",
};

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

function maskWhatsapp(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const visible = text.slice(-4);
  return `${"*".repeat(Math.max(text.length - visible.length, 4))}${visible}`;
}

function validateQrPayloadInput(data) {
  try {
    return requireString(data && data.qrPayload, "qrPayload", 500);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function parseQrPayload(qrPayload) {
  const payload = String(qrPayload || "").trim();

  if (!payload || payload.length > 500 || !payload.startsWith(QR_PREFIX)) {
    return buildParsedInvalid();
  }

  const queryIndex = payload.indexOf("?");
  if (queryIndex === -1) {
    return buildParsedInvalid();
  }

  const params = new URLSearchParams(payload.slice(queryIndex + 1));
  const publicToken = params.get("t") || "";
  const guestId = params.get("g") || "";
  const qrToken = params.get("p") || "";

  if (!publicToken || !guestId || !qrToken) {
    return buildParsedInvalid();
  }

  return {
    isValid: true,
    publicToken,
    guestId,
    qrToken,
    reasonCode: null,
    reasonMessage: null,
  };
}

function buildParsedInvalid() {
  return {
    isValid: false,
    publicToken: null,
    guestId: null,
    qrToken: null,
    reasonCode: "invalid_qr_format",
    reasonMessage: REASON_MESSAGES.invalid_qr_format,
  };
}

function buildRejectedResult(reasonCode, reasonMessage, extra = {}) {
  return {
    ok: true,
    allowed: false,
    reasonCode,
    reasonMessage: reasonMessage || REASON_MESSAGES[reasonCode] || "QR was rejected.",
    ...extra,
  };
}

function buildAllowedResult(extra = {}) {
  return {
    ok: true,
    allowed: true,
    reasonCode: "allowed_for_arrival",
    reasonMessage: REASON_MESSAGES.allowed_for_arrival,
    ...extra,
  };
}

function getStaffSnapshot(staffContext) {
  const staffData = staffContext.staffData || {};
  const userData = staffContext.userData || {};

  return {
    uid: staffContext.staffUid,
    fullName: staffData.fullName || userData.fullName || null,
    position: staffData.position || userData.position || null,
    customPosition: staffData.customPosition || userData.customPosition || null,
    email: staffData.email || userData.email || null,
  };
}

async function requireActiveEventStaff(request) {
  const authContext = requireAuth(request);
  const staffUid = authContext.uid;
  const userRef = db.collection("users").doc(staffUid);
  const userSnapshot = await userRef.get();

  assert(userSnapshot.exists, "permission-denied", REASON_MESSAGES.staff_not_assigned, {
    reasonCode: "staff_not_assigned",
  });

  const userData = userSnapshot.data() || {};
  assert(userData.role === STAFF_ROLE, "permission-denied", REASON_MESSAGES.staff_not_assigned, {
    reasonCode: "staff_not_assigned",
  });
  assert(userData.accountStatus === ACTIVE_STATUS, "permission-denied", REASON_MESSAGES.staff_disabled, {
    reasonCode: "staff_disabled",
  });
  assert(userData.assignedEventId, "permission-denied", REASON_MESSAGES.staff_not_assigned, {
    reasonCode: "staff_not_assigned",
  });

  const eventId = userData.assignedEventId;
  const staffRef = db.collection("events").doc(eventId).collection("staff").doc(staffUid);
  const staffSnapshot = await staffRef.get();

  assert(staffSnapshot.exists, "permission-denied", REASON_MESSAGES.staff_not_assigned, {
    reasonCode: "staff_not_assigned",
  });

  const staffData = staffSnapshot.data() || {};
  assert(staffData.staffStatus === ACTIVE_STATUS, "permission-denied", REASON_MESSAGES.staff_disabled, {
    reasonCode: "staff_disabled",
  });
  assert(staffData.eventId === eventId, "permission-denied", REASON_MESSAGES.staff_not_assigned, {
    reasonCode: "staff_not_assigned",
  });

  return {
    staffUid,
    userData,
    eventId,
    staffRef,
    staffData,
  };
}

async function loadStaffEvent(eventId) {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnapshot = await eventRef.get();
  assert(eventSnapshot.exists, "not-found", REASON_MESSAGES.event_not_found, {
    reasonCode: "event_not_found",
  });

  return {
    eventRef,
    eventData: eventSnapshot.data() || {},
  };
}

async function loadPublicInvitationLink(publicToken) {
  const linkRef = db.collection("public_invitation_links").doc(publicToken);
  const linkSnapshot = await linkRef.get();
  if (!linkSnapshot.exists) {
    return buildRejectedResult("invitation_link_not_found", REASON_MESSAGES.invitation_link_not_found, { linkRef });
  }

  const linkData = linkSnapshot.data() || {};
  if (linkData.linkStatus !== ACTIVE_STATUS) {
    return buildRejectedResult("invitation_link_disabled", REASON_MESSAGES.invitation_link_disabled, {
      linkRef,
      linkData,
    });
  }

  return {
    ok: true,
    allowed: true,
    linkRef,
    linkData,
  };
}

async function loadGuestForQr({ eventId, guestListId, guestId }) {
  const guestRef = db
    .collection("events")
    .doc(eventId)
    .collection("guest_lists")
    .doc(guestListId)
    .collection("guests")
    .doc(guestId);
  const guestSnapshot = await guestRef.get();

  if (!guestSnapshot.exists) {
    return buildRejectedResult("guest_not_found", REASON_MESSAGES.guest_not_found, { guestRef });
  }

  return {
    ok: true,
    allowed: true,
    guestRef,
    guestData: guestSnapshot.data() || {},
  };
}

function evaluateGuestDataForArrival({ guestData, qrToken, rejectArrived = true }) {
  if (guestData.invitationStatus === "revoked") {
    return buildRejectedResult("guest_revoked", REASON_MESSAGES.guest_revoked);
  }

  if (guestData.invitationStatus === "declined" || guestData.rsvpStatus === "declined") {
    return buildRejectedResult("guest_declined", REASON_MESSAGES.guest_declined);
  }

  if (guestData.invitationStatus !== "accepted" && guestData.rsvpStatus !== "accepted" && guestData.invitationStatus !== "arrived") {
    return buildRejectedResult("guest_not_accepted", REASON_MESSAGES.guest_not_accepted);
  }

  const qrPass = guestData.qrPass || null;
  if (!qrPass) {
    return buildRejectedResult("qr_pass_missing", REASON_MESSAGES.qr_pass_missing);
  }

  if (qrPass.qrStatus !== ACTIVE_STATUS) {
    return buildRejectedResult("qr_pass_inactive", REASON_MESSAGES.qr_pass_inactive);
  }

  if (qrPass.qrToken !== qrToken) {
    return buildRejectedResult("qr_token_mismatch", REASON_MESSAGES.qr_token_mismatch);
  }

  const attendanceStatus = guestData.attendanceStatus || "not_arrived";
  if (rejectArrived && attendanceStatus === "arrived") {
    return buildRejectedResult("already_arrived", REASON_MESSAGES.already_arrived);
  }

  return buildAllowedResult({
    attendanceStatus,
  });
}

async function evaluateQrForStaff({ staffContext, qrPayload }) {
  const parsedQr = parseQrPayload(qrPayload);
  if (!parsedQr.isValid) {
    return buildRejectedResult(parsedQr.reasonCode, parsedQr.reasonMessage, { parsedQr });
  }

  const linkResult = await loadPublicInvitationLink(parsedQr.publicToken);
  if (!linkResult.allowed) {
    return {
      ...linkResult,
      parsedQr,
    };
  }

  const linkData = linkResult.linkData || {};
  if (linkData.eventId !== staffContext.eventId) {
    return buildRejectedResult("qr_event_mismatch", REASON_MESSAGES.qr_event_mismatch, {
      parsedQr,
      linkData,
      linkRef: linkResult.linkRef,
    });
  }

  const { eventRef, eventData } = await loadStaffEvent(staffContext.eventId);
  const guestResult = await loadGuestForQr({
    eventId: linkData.eventId,
    guestListId: linkData.guestListId,
    guestId: parsedQr.guestId,
  });

  if (!guestResult.allowed) {
    return {
      ...guestResult,
      parsedQr,
      linkData,
      linkRef: linkResult.linkRef,
      eventRef,
      eventData,
    };
  }

  const guestEvaluation = evaluateGuestDataForArrival({
    guestData: guestResult.guestData,
    qrToken: parsedQr.qrToken,
    rejectArrived: true,
  });

  const refs = {
    eventRef,
    linkRef: linkResult.linkRef,
    guestRef: guestResult.guestRef,
  };

  return {
    ...guestEvaluation,
    event: serializeStaffEvent(staffContext.eventId, eventData),
    guest: serializeStaffGuest(guestResult.guestData),
    attendanceStatus: guestResult.guestData.attendanceStatus || "not_arrived",
    canConfirmArrival: Boolean(guestEvaluation.allowed),
    parsedQr,
    linkData,
    eventData,
    guestData: guestResult.guestData,
    refs,
  };
}

function serializeStaffEvent(eventId, eventData) {
  return {
    eventId,
    eventName: eventData.eventName || null,
    eventType: eventData.eventType || null,
    eventDate: eventData.eventDate || null,
    eventTime: eventData.eventTime || null,
    eventLocation: eventData.eventLocation || null,
    eventStatus: eventData.eventStatus || null,
  };
}

function serializeStaffProfile(staffData, userData) {
  return {
    uid: staffData.uid || userData.uid || null,
    fullName: staffData.fullName || userData.fullName || null,
    mobile: staffData.mobile || userData.mobile || null,
    sex: staffData.sex || userData.sex || null,
    position: staffData.position || userData.position || null,
    customPosition: staffData.customPosition || userData.customPosition || null,
    email: staffData.email || userData.email || null,
  };
}

function serializeAttendanceSummary(summary) {
  const data = summary || {};

  return {
    arrivalCount: Number(data.arrivalCount || 0),
    lastArrivedAt: serializeTimestamp(data.lastArrivedAt),
    lastExitMarkedAt: serializeTimestamp(data.lastExitMarkedAt),
    lastScannedAt: serializeTimestamp(data.lastScannedAt),
    lastScannedBy: data.lastScannedBy || null,
  };
}

function serializeStaffGuest(guestData) {
  return {
    guestName: guestData.guestName || null,
    whatsappMasked: maskWhatsapp(guestData.whatsapp),
    invitationStatus: guestData.invitationStatus || null,
    rsvpStatus: guestData.rsvpStatus || null,
    attendanceStatus: guestData.attendanceStatus || "not_arrived",
    attendanceSummary: serializeAttendanceSummary(guestData.attendanceSummary),
  };
}

function serializeVerificationResult(evaluation) {
  return {
    ok: true,
    allowed: Boolean(evaluation.allowed),
    reasonCode: evaluation.reasonCode,
    reasonMessage: evaluation.reasonMessage,
    event: evaluation.event || null,
    guest: evaluation.guest || null,
    attendanceStatus: evaluation.attendanceStatus || null,
    canConfirmArrival: Boolean(evaluation.allowed),
  };
}

function buildGuestSnapshot(guestData) {
  if (!guestData) {
    return null;
  }

  return {
    guestName: guestData.guestName || null,
    whatsappMasked: maskWhatsapp(guestData.whatsapp),
    invitationStatus: guestData.invitationStatus || null,
    attendanceStatus: guestData.attendanceStatus || "not_arrived",
  };
}

async function writeAttendanceLog({
  eventId,
  action,
  result,
  reasonCode,
  reasonMessage,
  qrPayload,
  parsedQr,
  staffContext,
  guestData,
  guestListId,
  guestId,
}) {
  if (!eventId) {
    return;
  }

  const logRef = db.collection("events").doc(eventId).collection("attendance_logs").doc();
  await logRef.set({
    eventId,
    guestListId: guestListId || null,
    guestId: guestId || (parsedQr && parsedQr.guestId) || null,
    staffUid: staffContext ? staffContext.staffUid : null,
    action,
    result,
    reasonCode,
    reasonMessage,
    qrPayload: qrPayload || null,
    publicToken: parsedQr ? parsedQr.publicToken || null : null,
    qrToken: parsedQr ? parsedQr.qrToken || null : null,
    guestName: guestData ? guestData.guestName || null : null,
    staffSnapshot: staffContext ? getStaffSnapshot(staffContext) : null,
    guestSnapshot: buildGuestSnapshot(guestData),
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function getMyStaffEventWorkspaceImpl(staffContext) {
  const { eventRef, eventData } = await loadStaffEvent(staffContext.eventId);
  const guestListsSnapshot = await eventRef.collection("guest_lists").get();
  const stats = {
    totalAcceptedGuests: 0,
    arrived: 0,
    notArrived: 0,
    willReturn: 0,
  };

  for (const guestListDoc of guestListsSnapshot.docs) {
    const guestsSnapshot = await guestListDoc.ref.collection("guests").get();
    guestsSnapshot.docs.forEach((guestDoc) => {
      const guestData = guestDoc.data() || {};
      const accepted = guestData.invitationStatus === "accepted" || guestData.rsvpStatus === "accepted" || guestData.invitationStatus === "arrived";
      if (!accepted) {
        return;
      }

      stats.totalAcceptedGuests += 1;
      const attendanceStatus = guestData.attendanceStatus || "not_arrived";
      if (attendanceStatus === "arrived") {
        stats.arrived += 1;
      } else if (attendanceStatus === "will_return") {
        stats.willReturn += 1;
      }
    });
  }

  stats.notArrived = Math.max(stats.totalAcceptedGuests - stats.arrived - stats.willReturn, 0);

  let recentArrivals = [];
  try {
    const logsSnapshot = await eventRef
      .collection("attendance_logs")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    recentArrivals = logsSnapshot.docs
      .filter((doc) => (doc.data() || {}).action === "arrival_confirmed")
      .slice(0, 10)
      .map((doc) => {
        const data = doc.data() || {};
        return {
          id: doc.id,
          guestName: data.guestName || null,
          guestId: data.guestId || null,
          staffSnapshot: data.staffSnapshot || null,
          createdAt: serializeTimestamp(data.createdAt),
        };
      });
  } catch (error) {
    console.error("getMyStaffEventWorkspace recent arrivals query failed", {
      code: error && error.code,
      message: error && error.message,
    });
    recentArrivals = [];
  }

  return {
    ok: true,
    staff: serializeStaffProfile(staffContext.staffData, staffContext.userData),
    event: serializeStaffEvent(staffContext.eventId, eventData),
    stats,
    recentArrivals,
  };
}

async function readLinkAndGuestInTransaction(transaction, parsedQr) {
  const linkRef = db.collection("public_invitation_links").doc(parsedQr.publicToken);
  const linkSnapshot = await transaction.get(linkRef);
  if (!linkSnapshot.exists) {
    return buildRejectedResult("invitation_link_not_found", REASON_MESSAGES.invitation_link_not_found, {
      linkRef,
    });
  }

  const linkData = linkSnapshot.data() || {};
  if (linkData.linkStatus !== ACTIVE_STATUS) {
    return buildRejectedResult("invitation_link_disabled", REASON_MESSAGES.invitation_link_disabled, {
      linkRef,
      linkData,
    });
  }

  const guestRef = db
    .collection("events")
    .doc(linkData.eventId)
    .collection("guest_lists")
    .doc(linkData.guestListId)
    .collection("guests")
    .doc(parsedQr.guestId);
  const guestSnapshot = await transaction.get(guestRef);
  if (!guestSnapshot.exists) {
    return buildRejectedResult("guest_not_found", REASON_MESSAGES.guest_not_found, {
      linkRef,
      linkData,
      guestRef,
    });
  }

  return buildAllowedResult({
    linkRef,
    linkData,
    guestRef,
    guestData: guestSnapshot.data() || {},
  });
}

const getMyStaffEventWorkspace = onCall(async (request) => {
  try {
    const staffContext = await requireActiveEventStaff(request);
    return await getMyStaffEventWorkspaceImpl(staffContext);
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const verifyEventGuestQr = onCall(async (request) => {
  try {
    const staffContext = await requireActiveEventStaff(request);
    const qrPayload = validateQrPayloadInput(request.data || {});
    const evaluation = await evaluateQrForStaff({ staffContext, qrPayload });
    const parsedQr = evaluation.parsedQr || parseQrPayload(qrPayload);
    const result = evaluation.allowed ? "allowed" : "rejected";

    await writeAttendanceLog({
      eventId: staffContext.eventId,
      action: "qr_checked",
      result,
      reasonCode: evaluation.reasonCode,
      reasonMessage: evaluation.reasonMessage,
      qrPayload,
      parsedQr,
      staffContext,
      guestData: evaluation.guestData,
      guestListId: evaluation.linkData ? evaluation.linkData.guestListId : null,
      guestId: parsedQr.guestId,
    });

    return serializeVerificationResult(evaluation);
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const confirmGuestArrival = onCall(async (request) => {
  try {
    const staffContext = await requireActiveEventStaff(request);
    const qrPayload = validateQrPayloadInput(request.data || {});
    const parsedQr = parseQrPayload(qrPayload);
    let transactionResult = null;

    if (!parsedQr.isValid) {
      transactionResult = buildRejectedResult(parsedQr.reasonCode, parsedQr.reasonMessage, { parsedQr });
    } else {
      await db.runTransaction(async (transaction) => {
        const readResult = await readLinkAndGuestInTransaction(transaction, parsedQr);
        if (!readResult.allowed) {
          transactionResult = {
            ...readResult,
            parsedQr,
          };
          return;
        }

        if (readResult.linkData.eventId !== staffContext.eventId) {
          transactionResult = buildRejectedResult("qr_event_mismatch", REASON_MESSAGES.qr_event_mismatch, {
            parsedQr,
            linkData: readResult.linkData,
            guestData: readResult.guestData,
          });
          return;
        }

        const guestEvaluation = evaluateGuestDataForArrival({
          guestData: readResult.guestData,
          qrToken: parsedQr.qrToken,
          rejectArrived: true,
        });

        if (!guestEvaluation.allowed) {
          transactionResult = {
            ...guestEvaluation,
            parsedQr,
            linkData: readResult.linkData,
            guestRef: readResult.guestRef,
            guestData: readResult.guestData,
          };
          return;
        }

        const now = FieldValue.serverTimestamp();
        const staffSnapshot = getStaffSnapshot(staffContext);
        transaction.update(readResult.guestRef, {
          attendanceStatus: "arrived",
          "attendanceSummary.arrivalCount": FieldValue.increment(1),
          "attendanceSummary.lastArrivedAt": now,
          "attendanceSummary.lastScannedAt": now,
          "attendanceSummary.lastScannedBy": staffSnapshot,
          updatedAt: now,
        });

        transactionResult = {
          ok: true,
          allowed: true,
          confirmed: true,
          reasonCode: "arrival_confirmed",
          reasonMessage: REASON_MESSAGES.arrival_confirmed,
          parsedQr,
          linkData: readResult.linkData,
          guestRef: readResult.guestRef,
          guestData: {
            ...readResult.guestData,
            attendanceStatus: "arrived",
          },
          attendanceStatus: "arrived",
        };
      });
    }

    const logAction = transactionResult.confirmed ? "arrival_confirmed" : "arrival_rejected";
    const logResult = transactionResult.confirmed ? "confirmed" : "rejected";
    await writeAttendanceLog({
      eventId: staffContext.eventId,
      action: logAction,
      result: logResult,
      reasonCode: transactionResult.reasonCode,
      reasonMessage: transactionResult.reasonMessage,
      qrPayload,
      parsedQr,
      staffContext,
      guestData: transactionResult.guestData,
      guestListId: transactionResult.linkData ? transactionResult.linkData.guestListId : null,
      guestId: parsedQr.guestId,
    });

    if (!transactionResult.confirmed) {
      return {
        ok: true,
        confirmed: false,
        reasonCode: transactionResult.reasonCode,
        reasonMessage: transactionResult.reasonMessage,
        guest: transactionResult.guestData ? serializeStaffGuest(transactionResult.guestData) : null,
        attendanceStatus: transactionResult.guestData ? transactionResult.guestData.attendanceStatus || "not_arrived" : null,
      };
    }

    return {
      ok: true,
      confirmed: true,
      reasonCode: "arrival_confirmed",
      guest: serializeStaffGuest(transactionResult.guestData),
      attendanceStatus: "arrived",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const markGuestWillReturn = onCall(async (request) => {
  try {
    const staffContext = await requireActiveEventStaff(request);
    const qrPayload = validateQrPayloadInput(request.data || {});
    const parsedQr = parseQrPayload(qrPayload);
    let transactionResult = null;

    if (!parsedQr.isValid) {
      transactionResult = buildRejectedResult(parsedQr.reasonCode, parsedQr.reasonMessage, { parsedQr });
    } else {
      await db.runTransaction(async (transaction) => {
        const readResult = await readLinkAndGuestInTransaction(transaction, parsedQr);
        if (!readResult.allowed) {
          transactionResult = {
            ...readResult,
            parsedQr,
          };
          return;
        }

        if (readResult.linkData.eventId !== staffContext.eventId) {
          transactionResult = buildRejectedResult("qr_event_mismatch", REASON_MESSAGES.qr_event_mismatch, {
            parsedQr,
            linkData: readResult.linkData,
            guestData: readResult.guestData,
          });
          return;
        }

        const guestEvaluation = evaluateGuestDataForArrival({
          guestData: readResult.guestData,
          qrToken: parsedQr.qrToken,
          rejectArrived: false,
        });

        if (!guestEvaluation.allowed) {
          transactionResult = {
            ...guestEvaluation,
            parsedQr,
            linkData: readResult.linkData,
            guestRef: readResult.guestRef,
            guestData: readResult.guestData,
          };
          return;
        }

        if ((readResult.guestData.attendanceStatus || "not_arrived") !== "arrived") {
          transactionResult = buildRejectedResult("not_arrived_yet", REASON_MESSAGES.not_arrived_yet, {
            parsedQr,
            linkData: readResult.linkData,
            guestRef: readResult.guestRef,
            guestData: readResult.guestData,
          });
          return;
        }

        const now = FieldValue.serverTimestamp();
        const staffSnapshot = getStaffSnapshot(staffContext);
        transaction.update(readResult.guestRef, {
          attendanceStatus: "will_return",
          "attendanceSummary.lastExitMarkedAt": now,
          "attendanceSummary.lastScannedAt": now,
          "attendanceSummary.lastScannedBy": staffSnapshot,
          updatedAt: now,
        });

        transactionResult = {
          ok: true,
          allowed: true,
          marked: true,
          reasonCode: "will_return_marked",
          reasonMessage: REASON_MESSAGES.will_return_marked,
          parsedQr,
          linkData: readResult.linkData,
          guestRef: readResult.guestRef,
          guestData: {
            ...readResult.guestData,
            attendanceStatus: "will_return",
          },
          attendanceStatus: "will_return",
        };
      });
    }

    const logAction = transactionResult.marked ? "will_return_marked" : "arrival_rejected";
    const logResult = transactionResult.marked ? "confirmed" : "rejected";
    await writeAttendanceLog({
      eventId: staffContext.eventId,
      action: logAction,
      result: logResult,
      reasonCode: transactionResult.reasonCode,
      reasonMessage: transactionResult.reasonMessage,
      qrPayload,
      parsedQr,
      staffContext,
      guestData: transactionResult.guestData,
      guestListId: transactionResult.linkData ? transactionResult.linkData.guestListId : null,
      guestId: parsedQr.guestId,
    });

    if (!transactionResult.marked) {
      return {
        ok: true,
        marked: false,
        reasonCode: transactionResult.reasonCode,
        reasonMessage: transactionResult.reasonMessage,
        guest: transactionResult.guestData ? serializeStaffGuest(transactionResult.guestData) : null,
        attendanceStatus: transactionResult.guestData ? transactionResult.guestData.attendanceStatus || "not_arrived" : null,
      };
    }

    return {
      ok: true,
      marked: true,
      reasonCode: "will_return_marked",
      guest: serializeStaffGuest(transactionResult.guestData),
      attendanceStatus: "will_return",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getMyStaffEventWorkspace,
  verifyEventGuestQr,
  confirmGuestArrival,
  markGuestWillReturn,
  serializeTimestamp,
  maskWhatsapp,
  parseQrPayload,
  serializeStaffEvent,
  serializeStaffProfile,
  serializeStaffGuest,
};
