const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const { requireString, validateEnum } = require("../shared/validators");
const {
  generatePublicInvitationToken,
  generateQrToken,
  buildPublicInvitePath,
  buildPublicInviteUrl,
  buildQrPayload,
} = require("../shared/publicInvitationTokens");

const SOURCE_CLIENT_DASHBOARD = "client_dashboard";
const LINK_STATUSES = ["active", "disabled"];
const RSVP_DECISIONS = ["accepted", "declined"];

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

function normalizeWhatsapp(value) {
  return String(value || "")
    .trim()
    .replace(/[\s\-().]/g, "");
}

function requireInputString(data, fieldName, maxLength) {
  try {
    return requireString(data ? data[fieldName] : null, fieldName, maxLength);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validatePublicToken(data) {
  return requireInputString(data, "publicToken", 180);
}

function validateEventId(data) {
  return requireInputString(data, "eventId", 160);
}

function validateGuestListId(data) {
  return requireInputString(data, "guestListId", 160);
}

function validateWhatsapp(data) {
  const whatsapp = normalizeWhatsapp(data ? data.whatsapp : "");
  assert(whatsapp, "invalid-argument", "whatsapp is required.");
  assert(whatsapp.length <= 40, "invalid-argument", "whatsapp must be 40 characters or fewer.");
  return whatsapp;
}

function validateDecision(data) {
  try {
    const decision = validateEnum(data ? data.decision : null, RSVP_DECISIONS, "decision");
    assert(decision, "invalid-argument", "decision is required.");
    return decision;
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function serializePublicLink(data) {
  if (!data) {
    return null;
  }

  return {
    publicToken: data.publicToken || null,
    publicPath: data.publicPath || null,
    publicUrl: data.publicUrl || null,
    linkStatus: data.linkStatus || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    disabledAt: serializeTimestamp(data.disabledAt),
  };
}

function serializePublicEvent(eventData) {
  return {
    eventName: eventData.eventName || null,
    eventType: eventData.eventType || null,
    eventDate: eventData.eventDate || null,
    eventTime: eventData.eventTime || null,
    eventLocation: eventData.eventLocation || null,
  };
}

function serializePublicFinalMedia(finalMedia) {
  if (!finalMedia || finalMedia.mediaStatus !== "ready") {
    return null;
  }

  return {
    mediaType: finalMedia.mediaType || null,
    publicUrl: finalMedia.publicUrl || finalMedia.downloadUrl || null,
    title: finalMedia.title || null,
  };
}

function serializePublicMedia(guestListData) {
  const media = guestListData.media || {};
  const design = guestListData.invitationDesign || {};

  return {
    mediaId: media.mediaId || design.selectedSampleMediaId || null,
    mediaType: media.mediaType || design.selectedSampleType || null,
    mediaTitle: media.mediaTitle || design.selectedSampleTitle || null,
    sampleUrl: media.sampleUrl || design.selectedSampleUrl || null,
    category: media.category || design.selectedSampleCategory || null,
    source: media.source || design.selectedSampleSource || null,
  };
}

function serializePublicInvitationDesign(guestListData) {
  const design = guestListData.invitationDesign || {};
  const media = guestListData.media || {};

  return {
    selectedSampleMediaId: design.selectedSampleMediaId || media.mediaId || null,
    selectedSampleTitle: design.selectedSampleTitle || media.mediaTitle || null,
    selectedSampleUrl: design.selectedSampleUrl || media.sampleUrl || null,
    selectedSampleType: design.selectedSampleType || media.mediaType || null,
    selectedSampleCategory: design.selectedSampleCategory || media.category || null,
    invitationText: design.invitationText || guestListData.invitationText || null,
    designStatus: design.designStatus || null,
    finalMedia: serializePublicFinalMedia(design.finalMedia || null),
  };
}

// Public response only. Never return raw guest list/invitationDesign data because it can contain internal admin/provider metadata.
function serializePublicGuestList(guestListData) {
  return {
    listName: guestListData.listName || null,
    invitationTitle: guestListData.invitationTitle || null,
    invitationText: guestListData.invitationDesign?.invitationText || guestListData.invitationText || null,
    media: serializePublicMedia(guestListData),
    invitationDesign: serializePublicInvitationDesign(guestListData),
  };
}

function serializePublicGuest(guestData) {
  return {
    guestName: guestData.guestName || null,
    invitationStatus: guestData.invitationStatus || null,
    rsvpStatus: guestData.rsvpStatus || null,
  };
}

function serializeQrPass(guestData) {
  const qrPass = guestData.qrPass || null;
  const canViewPass =
    guestData.invitationStatus === "accepted" ||
    guestData.rsvpStatus === "accepted" ||
    guestData.attendanceStatus === "arrived" ||
    guestData.attendanceStatus === "will_return";

  if (!canViewPass || !qrPass || qrPass.qrStatus !== "active") {
    return null;
  }

  return {
    qrStatus: qrPass.qrStatus || null,
    qrToken: qrPass.qrToken || null,
    qrPayload: qrPass.qrPayload || null,
    issuedAt: serializeTimestamp(qrPass.issuedAt),
    updatedAt: serializeTimestamp(qrPass.updatedAt),
  };
}

async function requireOwnedEvent(uid, eventId) {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnapshot = await eventRef.get();
  assert(eventSnapshot.exists, "not-found", "Event was not found.");
  const eventData = eventSnapshot.data() || {};
  assert(eventData.uid === uid, "permission-denied", "You do not have access to this event.");
  return { eventRef, eventData };
}

async function requireOwnedGuestList(uid, eventId, guestListId) {
  const { eventRef, eventData } = await requireOwnedEvent(uid, eventId);
  const guestListRef = eventRef.collection("guest_lists").doc(guestListId);
  const guestListSnapshot = await guestListRef.get();
  assert(guestListSnapshot.exists, "not-found", "Guest list was not found.");
  const guestListData = guestListSnapshot.data() || {};
  assert(!guestListData.uid || guestListData.uid === uid, "permission-denied", "You do not have access to this guest list.");
  assert(!guestListData.eventId || guestListData.eventId === eventId, "failed-precondition", "Guest list does not belong to this event.");
  return { eventRef, eventData, guestListRef, guestListData };
}

async function requireActivePublicLink(publicToken) {
  const linkRef = db.collection("public_invitation_links").doc(publicToken);
  const linkSnapshot = await linkRef.get();
  assert(linkSnapshot.exists, "not-found", "Invitation link was not found.");
  const linkData = linkSnapshot.data() || {};
  assert(linkData.linkStatus === "active", "failed-precondition", "Invitation link is not active.");

  const eventRef = db.collection("events").doc(linkData.eventId);
  const eventSnapshot = await eventRef.get();
  assert(eventSnapshot.exists, "not-found", "Invitation event was not found.");
  const eventData = eventSnapshot.data() || {};

  const guestListRef = eventRef.collection("guest_lists").doc(linkData.guestListId);
  const guestListSnapshot = await guestListRef.get();
  assert(guestListSnapshot.exists, "not-found", "Invitation guest list was not found.");
  const guestListData = guestListSnapshot.data() || {};
  assert(guestListData.listStatus !== "archived", "failed-precondition", "Invitation guest list is unavailable.");

  return {
    linkRef,
    linkData,
    eventRef,
    eventData,
    guestListRef,
    guestListData,
  };
}

async function findGuestByWhatsapp({ eventId, guestListId, normalizedWhatsapp }) {
  const guestsSnapshot = await db
    .collection("events")
    .doc(eventId)
    .collection("guest_lists")
    .doc(guestListId)
    .collection("guests")
    .where("normalizedWhatsapp", "==", normalizedWhatsapp)
    .limit(1)
    .get();

  if (guestsSnapshot.empty) {
    return null;
  }

  const guestRef = guestsSnapshot.docs[0].ref;
  const guestData = guestsSnapshot.docs[0].data() || {};
  if (guestData.invitationStatus === "revoked") {
    return null;
  }

  return { guestRef, guestData };
}

async function countActiveGuests(guestListRef) {
  const guestsSnapshot = await guestListRef.collection("guests").get();
  return guestsSnapshot.docs.filter((doc) => (doc.data() || {}).invitationStatus !== "revoked").length;
}

function hasInvitationText(guestListData) {
  return Boolean(guestListData.invitationDesign?.invitationText || guestListData.invitationText);
}

function hasSelectedDesign(guestListData) {
  return Boolean(guestListData.invitationDesign?.selectedSampleMediaId || guestListData.media?.mediaId);
}

const createGuestListInvitationLink = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const owned = await requireOwnedGuestList(uid, eventId, guestListId);

    assert(owned.guestListData.listStatus !== "archived", "failed-precondition", "Archived guest lists cannot have public links.");
    assert(hasInvitationText(owned.guestListData), "failed-precondition", "Invitation text is required before creating a public link.");
    assert(hasSelectedDesign(owned.guestListData), "failed-precondition", "Invitation design is required before creating a public link.");
    const activeGuestCount = await countActiveGuests(owned.guestListRef);
    assert(activeGuestCount > 0, "failed-precondition", "At least one active guest is required before creating a public link.");

    const existingLink = owned.guestListData.publicInvitationLink || null;
    if (existingLink?.publicToken && existingLink.linkStatus === "active") {
      return {
        ok: true,
        link: serializePublicLink(existingLink),
      };
    }

    const publicToken = generatePublicInvitationToken();
    const publicPath = buildPublicInvitePath(publicToken);
    const publicUrl = buildPublicInviteUrl(publicToken);
    const linkRef = db.collection("public_invitation_links").doc(publicToken);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const linkSnapshot = await transaction.get(linkRef);
      assert(!linkSnapshot.exists, "already-exists", "Generated invitation token already exists.");

      const linkData = {
        publicToken,
        uid,
        eventId,
        guestListId,
        linkStatus: "active",
        publicPath,
        publicUrl,
        source: SOURCE_CLIENT_DASHBOARD,
        createdAt: now,
        updatedAt: now,
      };
      transaction.set(linkRef, linkData);
      transaction.update(owned.guestListRef, {
        publicInvitationLink: {
          publicToken,
          publicPath,
          publicUrl,
          linkStatus: "active",
          createdAt: now,
          updatedAt: now,
          disabledAt: null,
        },
        updatedAt: now,
      });
    });

    const createdSnapshot = await linkRef.get();

    return {
      ok: true,
      link: serializePublicLink(createdSnapshot.data() || {}),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getMyGuestListInvitationLink = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const owned = await requireOwnedGuestList(uid, eventId, guestListId);

    return {
      ok: true,
      link: serializePublicLink(owned.guestListData.publicInvitationLink || null),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const deactivateGuestListInvitationLink = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const owned = await requireOwnedGuestList(uid, eventId, guestListId);
    const existingLink = owned.guestListData.publicInvitationLink || null;

    if (!existingLink?.publicToken) {
      return {
        ok: true,
        link: null,
      };
    }

    const now = FieldValue.serverTimestamp();
    const linkRef = db.collection("public_invitation_links").doc(existingLink.publicToken);
    await db.runTransaction(async (transaction) => {
      const linkSnapshot = await transaction.get(linkRef);
      if (linkSnapshot.exists) {
        transaction.update(linkRef, {
          linkStatus: "disabled",
          disabledAt: now,
          updatedAt: now,
        });
      }
      transaction.update(owned.guestListRef, {
        "publicInvitationLink.linkStatus": "disabled",
        "publicInvitationLink.disabledAt": now,
        "publicInvitationLink.updatedAt": now,
        updatedAt: now,
      });
    });

    return {
      ok: true,
      linkStatus: "disabled",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getPublicInvitationByToken = onCall(async (request) => {
  try {
    const publicToken = validatePublicToken(request.data || {});
    const link = await requireActivePublicLink(publicToken);

    return {
      ok: true,
      invitation: {
        event: serializePublicEvent(link.eventData),
        guestList: serializePublicGuestList(link.guestListData),
        linkStatus: "active",
      },
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const verifyPublicInvitationGuest = onCall(async (request) => {
  try {
    const data = request.data || {};
    const publicToken = validatePublicToken(data);
    const normalizedWhatsapp = validateWhatsapp(data);
    const link = await requireActivePublicLink(publicToken);
    const match = await findGuestByWhatsapp({
      eventId: link.linkData.eventId,
      guestListId: link.linkData.guestListId,
      normalizedWhatsapp,
    });

    if (!match) {
      return {
        ok: true,
        matched: false,
        reason: "not_found",
      };
    }

    await match.guestRef.update({
      lastVerifiedAt: FieldValue.serverTimestamp(),
      verificationCount: FieldValue.increment(1),
    });

    return {
      ok: true,
      matched: true,
      invitation: {
        event: serializePublicEvent(link.eventData),
        guestList: serializePublicGuestList(link.guestListData),
      },
      guest: serializePublicGuest(match.guestData),
      pass: serializeQrPass(match.guestData),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const submitPublicGuestRsvp = onCall(async (request) => {
  try {
    const data = request.data || {};
    const publicToken = validatePublicToken(data);
    const normalizedWhatsapp = validateWhatsapp(data);
    const decision = validateDecision(data);
    const link = await requireActivePublicLink(publicToken);
    const match = await findGuestByWhatsapp({
      eventId: link.linkData.eventId,
      guestListId: link.linkData.guestListId,
      normalizedWhatsapp,
    });

    if (!match) {
      return {
        ok: true,
        matched: false,
        reason: "not_found",
      };
    }

    let updatedGuestData = null;
    const now = FieldValue.serverTimestamp();
    await db.runTransaction(async (transaction) => {
      const guestSnapshot = await transaction.get(match.guestRef);
      assert(guestSnapshot.exists, "not-found", "Guest was not found.");
      const guestData = guestSnapshot.data() || {};
      assert(guestData.invitationStatus !== "revoked", "failed-precondition", "Guest invitation is unavailable.");

      if (decision === "accepted") {
        const existingQrPass = guestData.qrPass || {};
        const qrToken = existingQrPass.qrToken || generateQrToken();
        const qrPayload = buildQrPayload({
          publicToken,
          guestId: match.guestRef.id,
          qrToken,
        });
        const qrPass = {
          qrToken,
          qrStatus: "active",
          qrPayload,
          issuedAt: existingQrPass.issuedAt || now,
          updatedAt: now,
        };
        transaction.update(match.guestRef, {
          invitationStatus: "accepted",
          rsvpStatus: "accepted",
          respondedAt: now,
          acceptedAt: now,
          declinedAt: null,
          qrPass,
          updatedAt: now,
        });
        updatedGuestData = {
          ...guestData,
          invitationStatus: "accepted",
          rsvpStatus: "accepted",
          qrPass,
        };
      } else {
        const update = {
          invitationStatus: "declined",
          rsvpStatus: "declined",
          respondedAt: now,
          declinedAt: now,
          updatedAt: now,
        };
        let qrPass = guestData.qrPass || null;
        if (qrPass) {
          qrPass = {
            ...qrPass,
            qrStatus: "inactive",
            updatedAt: now,
          };
          update.qrPass = qrPass;
        }
        transaction.update(match.guestRef, update);
        updatedGuestData = {
          ...guestData,
          invitationStatus: "declined",
          rsvpStatus: "declined",
          qrPass,
        };
      }
    });
    const updatedGuestSnapshot = await match.guestRef.get();
    updatedGuestData = updatedGuestSnapshot.data() || updatedGuestData || {};

    return {
      ok: true,
      matched: true,
      decision,
      guest: serializePublicGuest(updatedGuestData || {}),
      pass: decision === "accepted" ? serializeQrPass(updatedGuestData || {}) : null,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  createGuestListInvitationLink,
  getMyGuestListInvitationLink,
  deactivateGuestListInvitationLink,
  getPublicInvitationByToken,
  verifyPublicInvitationGuest,
  submitPublicGuestRsvp,
  serializeTimestamp,
  normalizeWhatsapp,
  serializePublicLink,
  serializePublicEvent,
  serializePublicGuestList,
  serializePublicGuest,
  serializeQrPass,
};
