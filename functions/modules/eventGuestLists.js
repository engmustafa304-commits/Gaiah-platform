const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const {
  normalizePhone,
  optionalLimit,
  optionalString,
  requireString,
  validateEnum,
} = require("../shared/validators");
const {
  getInvitationMediaById,
  listInvitationMediaItems,
} = require("../shared/invitationMediaCatalog");

const GUEST_LIST_STATUSES = ["active", "archived"];
const MEDIA_CATEGORIES = ["men", "women"];
const MEDIA_TYPES = ["image"];
const INVITATION_STATUSES = [
  "unknown",
  "invitation_sent",
  "accepted",
  "declined",
  "arrived",
  "not_arrived",
  "revoked",
];
const DEFAULT_INVITATION_TEXT = "يسرنا دعوتكم لحضور مناسبتنا، ونتطلع لمشاركتكم.";
const SOURCE_CLIENT_DASHBOARD = "client_dashboard";

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

function emptyStatusCounts() {
  return {
    total: 0,
    unknown: 0,
    invitation_sent: 0,
    accepted: 0,
    declined: 0,
    arrived: 0,
    not_arrived: 0,
    revoked: 0,
  };
}

function serializeGuestList(doc, counts = null) {
  const data = doc.data() || {};
  const statusCounts = counts || null;

  return {
    id: doc.id,
    uid: data.uid || null,
    eventId: data.eventId || null,
    listName: data.listName || null,
    invitationTitle: data.invitationTitle || null,
    invitationText: data.invitationText || null,
    media: data.media || null,
    invitationDesign: data.invitationDesign || null,
    listStatus: data.listStatus || null,
    guestCount: statusCounts ? statusCounts.total : null,
    statusCounts,
    source: data.source || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function serializeGuest(doc) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    uid: data.uid || null,
    eventId: data.eventId || null,
    guestListId: data.guestListId || null,
    guestName: data.guestName || null,
    whatsapp: data.whatsapp || null,
    invitationStatus: data.invitationStatus || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

function validateEventId(data) {
  try {
    return requireString(data && data.eventId, "eventId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateGuestListId(data) {
  try {
    return requireString(data && data.guestListId, "guestListId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateGuestListStatus(data) {
  try {
    return validateEnum(data && data.listStatus, GUEST_LIST_STATUSES, "listStatus");
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateMediaCategory(data) {
  try {
    return validateEnum(data && data.category, MEDIA_CATEGORIES, "category");
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateMediaType(data) {
  try {
    return validateEnum(data && data.mediaType, MEDIA_TYPES, "mediaType");
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateInvitationStatus(data) {
  try {
    return validateEnum(data && data.invitationStatus, INVITATION_STATUSES, "invitationStatus");
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateInvitationDesignInput(data) {
  try {
    const mediaId = requireString(data && data.mediaId, "mediaId", 80);
    const invitationText = requireString(data && data.invitationText, "invitationText", 1200);
    const media = getInvitationMediaById(mediaId);
    assert(media, "invalid-argument", "mediaId is invalid.");

    return {
      media,
      invitationText,
    };
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validateLimit(data, defaultLimit = 50, maxLimit = 50) {
  try {
    return optionalLimit(data && data.limit, defaultLimit, maxLimit);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validatePage(data) {
  const value = data && data.page !== undefined ? data.page : 1;
  const page = Number(value);
  assert(Number.isInteger(page) && page > 0, "invalid-argument", "page must be a positive integer.");
  return page;
}

function validateOptionalGuestListId(data) {
  try {
    return optionalString(data && data.guestListId, "guestListId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateGuestId(data) {
  try {
    return requireString(data && data.guestId, "guestId", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateGuestListInput(data, { partial = false } = {}) {
  try {
    const listName = partial
      ? optionalString(data && data.listName, "listName", 140)
      : requireString(data && data.listName, "listName", 140);
    const invitationTitle = optionalString(data && data.invitationTitle, "invitationTitle", 180);
    const invitationText = optionalString(data && data.invitationText, "invitationText", 1000);

    const fields = {};
    if (listName) {
      fields.listName = listName;
    }
    if (invitationTitle) {
      fields.invitationTitle = invitationTitle;
    } else if (!partial && listName) {
      fields.invitationTitle = listName;
    }
    if (invitationText) {
      fields.invitationText = invitationText;
    } else if (!partial) {
      fields.invitationText = DEFAULT_INVITATION_TEXT;
    }

    return fields;
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateGuestInput(data, { partial = false } = {}) {
  try {
    const guestName = partial
      ? optionalString(data && data.guestName, "guestName", 160)
      : requireString(data && data.guestName, "guestName", 160);
    const whatsappInput = partial
      ? optionalString(data && data.whatsapp, "whatsapp", 40)
      : requireString(data && data.whatsapp, "whatsapp", 40);
    const invitationStatus = validateEnum(
      data && data.invitationStatus,
      INVITATION_STATUSES,
      "invitationStatus"
    ) || "unknown";
    const fields = {};

    if (guestName) {
      fields.guestName = guestName;
    }
    if (whatsappInput) {
      const normalizedWhatsapp = normalizePhone(whatsappInput);
      assert(normalizedWhatsapp, "invalid-argument", "whatsapp is required.");
      fields.whatsapp = whatsappInput;
      fields.normalizedWhatsapp = normalizedWhatsapp;
    }
    if (!partial || data.invitationStatus !== undefined) {
      fields.invitationStatus = invitationStatus;
    }

    return fields;
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validateRevokedReason(data) {
  try {
    return optionalString(data && data.revokedReason, "revokedReason", 300);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateBulkGuests(data) {
  const guests = data && Array.isArray(data.guests) ? data.guests : null;
  assert(guests, "invalid-argument", "guests array is required.");
  assert(guests.length > 0, "invalid-argument", "guests array must not be empty.");
  assert(guests.length <= 200, "invalid-argument", "guests array must contain 200 items or fewer.");

  const seen = new Set();
  return guests.map((guest, index) => {
    const normalized = validateGuestInput(guest);
    assert(
      !seen.has(normalized.normalizedWhatsapp),
      "invalid-argument",
      `Duplicate WhatsApp number in guests[${index}].`
    );
    seen.add(normalized.normalizedWhatsapp);
    return normalized;
  });
}

async function requireOwnedEvent(uid, eventId) {
  const eventSnapshot = await db.collection("events").doc(eventId).get();

  if (!eventSnapshot.exists) {
    fail("not-found", "Event was not found.");
  }

  const eventData = eventSnapshot.data() || {};
  if (eventData.uid !== uid) {
    fail("permission-denied", "You do not have access to this event.");
  }

  return {
    snapshot: eventSnapshot,
    data: eventData,
  };
}

async function requireOwnedGuestList(uid, eventId, guestListId) {
  await requireOwnedEvent(uid, eventId);

  const guestListSnapshot = await db
    .collection("events")
    .doc(eventId)
    .collection("guest_lists")
    .doc(guestListId)
    .get();

  if (!guestListSnapshot.exists) {
    fail("not-found", "Guest list was not found.");
  }

  const guestListData = guestListSnapshot.data() || {};
  if (guestListData.uid && guestListData.uid !== uid) {
    fail("permission-denied", "You do not have access to this guest list.");
  }

  if (guestListData.eventId && guestListData.eventId !== eventId) {
    fail("failed-precondition", "Guest list does not belong to this event.");
  }

  return {
    snapshot: guestListSnapshot,
    data: guestListData,
  };
}

async function getGuestListDocs(eventId) {
  const snapshot = await db
    .collection("events")
    .doc(eventId)
    .collection("guest_lists")
    .get();

  return snapshot.docs;
}

async function getGuestDocs(eventId, guestListId) {
  const snapshot = await db
    .collection("events")
    .doc(eventId)
    .collection("guest_lists")
    .doc(guestListId)
    .collection("guests")
    .get();

  return snapshot.docs;
}

function countActiveGuestDocs(guestDocs) {
  return guestDocs.filter((doc) => {
    const data = doc.data() || {};
    return data.invitationStatus !== "revoked";
  }).length;
}

async function countActiveGuestsForEvent(eventId) {
  const snapshot = await db
    .collectionGroup("guests")
    .where("eventId", "==", eventId)
    .get();

  return countActiveGuestDocs(snapshot.docs);
}

async function getGuestListsSnapshotForTransaction(transaction, eventRef) {
  return transaction.get(eventRef.collection("guest_lists"));
}

async function countActiveGuestsForEventInTransaction(transaction, eventRef) {
  const guestListsSnapshot = await getGuestListsSnapshotForTransaction(transaction, eventRef);
  let count = 0;

  for (const guestListDoc of guestListsSnapshot.docs) {
    const guestsSnapshot = await transaction.get(guestListDoc.ref.collection("guests"));
    count += countActiveGuestDocs(guestsSnapshot.docs);
  }

  return count;
}

async function assertWhatsappUnique(
  transaction,
  eventId,
  guestListId,
  normalizedWhatsapp,
  excludeGuestId = null
) {
  const guestListRef = db
    .collection("events")
    .doc(eventId)
    .collection("guest_lists")
    .doc(guestListId);
  const duplicateQuery = guestListRef
    .collection("guests")
    .where("normalizedWhatsapp", "==", normalizedWhatsapp);
  const duplicateSnapshot = await transaction.get(duplicateQuery);

  duplicateSnapshot.docs.forEach((doc) => {
    if (doc.id !== excludeGuestId) {
      fail("invalid-argument", "This WhatsApp number already exists in this guest list.");
    }
  });
}

async function buildGuestStatusCounts(eventId, guestListId) {
  const counts = emptyStatusCounts();
  const guestDocs = await getGuestDocs(eventId, guestListId);

  guestDocs.forEach((doc) => {
    const data = doc.data() || {};
    const status = INVITATION_STATUSES.includes(data.invitationStatus)
      ? data.invitationStatus
      : "unknown";
    counts.total += 1;
    counts[status] += 1;
  });

  return counts;
}

async function serializeGuestListsWithCounts(guestListDocs) {
  const guestLists = await Promise.all(
    guestListDocs.map(async (doc) => {
      const data = doc.data() || {};
      const eventId = data.eventId || doc.ref.parent.parent.id;
      const counts = await buildGuestStatusCounts(eventId, doc.id);
      return serializeGuestList(doc, counts);
    })
  );

  return guestLists.sort(
    (a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt)
  );
}

function paginateGuests(guestDocs, page, limit, invitationStatus = null) {
  const allGuests = guestDocs
    .map(serializeGuest)
    .filter((guest) => !invitationStatus || guest.invitationStatus === invitationStatus)
    .sort((a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt));
  const total = allGuests.length;
  const pageCount = total ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  const guests = allGuests.slice(start, start + limit);

  return {
    guests,
    pagination: {
      page,
      limit,
      total,
      pageCount,
      hasNext: pageCount ? page < pageCount : false,
      hasPrevious: page > 1 && pageCount > 0,
    },
  };
}

const listMyEventGuestLists = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const listStatus = validateGuestListStatus(data);

    await requireOwnedEvent(uid, eventId);
    const guestListDocs = await getGuestListDocs(eventId);
    const filteredDocs = guestListDocs.filter((doc) => {
      const guestListData = doc.data() || {};
      return !listStatus || guestListData.listStatus === listStatus;
    });

    return {
      ok: true,
      guestLists: await serializeGuestListsWithCounts(filteredDocs),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getMyEventGuestListDetails = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const guestList = await requireOwnedGuestList(uid, eventId, guestListId);
    const statusCounts = await buildGuestStatusCounts(eventId, guestListId);

    return {
      ok: true,
      guestList: serializeGuestList(guestList.snapshot, statusCounts),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const listMyEventGuests = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const page = validatePage(data);
    const limit = validateLimit(data);
    const invitationStatus = validateInvitationStatus(data);

    await requireOwnedGuestList(uid, eventId, guestListId);
    const guestDocs = await getGuestDocs(eventId, guestListId);

    return {
      ok: true,
      ...paginateGuests(guestDocs, page, limit, invitationStatus),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const getMyEventWorkspace = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const requestedGuestListId = validateOptionalGuestListId(data);
    const guestsPage = validatePage({
      page: data.guestsPage !== undefined ? data.guestsPage : 1,
    });
    const guestsLimit = validateLimit({ limit: data.guestsLimit });
    const event = await requireOwnedEvent(uid, eventId);
    const guestListDocs = await getGuestListDocs(eventId);
    const guestLists = await serializeGuestListsWithCounts(guestListDocs);
    let selectedGuestList = null;

    if (requestedGuestListId) {
      const selected = await requireOwnedGuestList(uid, eventId, requestedGuestListId);
      const counts = await buildGuestStatusCounts(eventId, requestedGuestListId);
      selectedGuestList = serializeGuestList(selected.snapshot, counts);
    } else {
      selectedGuestList =
        guestLists.find((guestList) => guestList.listStatus === "active") ||
        guestLists[0] ||
        null;
    }

    let guests = [];
    let pagination = {
      page: 1,
      limit: guestsLimit,
      total: 0,
      pageCount: 0,
      hasNext: false,
      hasPrevious: false,
    };

    if (selectedGuestList) {
      const guestDocs = await getGuestDocs(eventId, selectedGuestList.id);
      const result = paginateGuests(guestDocs, guestsPage, guestsLimit);
      guests = result.guests;
      pagination = result.pagination;
    }

    return {
      ok: true,
      event: serializeEvent(event.snapshot),
      guestLists,
      selectedGuestList,
      guests,
      pagination,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const listInvitationMediaCatalogue = onCall(async (request) => {
  try {
    requireAuth(request);
    const data = request.data || {};
    const category = validateMediaCategory(data);
    const mediaType = validateMediaType(data);
    const items = listInvitationMediaItems()
      .filter((item) => !category || item.category === category)
      .filter((item) => !mediaType || item.mediaType === mediaType);

    return {
      ok: true,
      items,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const updateGuestListInvitationDesign = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const { media, invitationText } = validateInvitationDesignInput(data);
    const guestList = await requireOwnedGuestList(uid, eventId, guestListId);
    const now = FieldValue.serverTimestamp();
    const mediaSnapshot = {
      mediaId: media.mediaId,
      mediaType: media.mediaType,
      mediaTitle: media.mediaTitle,
      mediaPreviewStyle: media.mediaId,
      sampleUrl: media.sampleUrl,
      fileName: media.fileName,
      category: media.category,
      source: media.source,
    };

    await guestList.snapshot.ref.update({
      invitationText,
      media: mediaSnapshot,
      invitationDesign: {
        selectedSampleMediaId: media.mediaId,
        selectedSampleTitle: media.mediaTitle,
        selectedSampleUrl: media.sampleUrl,
        selectedSampleType: media.mediaType,
        selectedSampleCategory: media.category,
        selectedSampleFileName: media.fileName,
        selectedSampleSource: media.source,
        invitationText,
        designStatus: "sample_selected",
        finalMedia: null,
        updatedAt: now,
        updatedBy: {
          uid,
          email: authContext.token && authContext.token.email ? authContext.token.email : null,
        },
      },
      updatedAt: now,
    });

    const updatedSnapshot = await guestList.snapshot.ref.get();
    const counts = await buildGuestStatusCounts(eventId, guestListId);

    return {
      ok: true,
      guestList: serializeGuestList(updatedSnapshot, counts),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const createMyEventGuestList = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const input = validateGuestListInput(data);
    const now = FieldValue.serverTimestamp();

    await requireOwnedEvent(uid, eventId);
    const guestListRef = db
      .collection("events")
      .doc(eventId)
      .collection("guest_lists")
      .doc();

    await guestListRef.set({
      uid,
      eventId,
      listName: input.listName,
      invitationTitle: input.invitationTitle,
      invitationText: input.invitationText,
      media: null,
      listStatus: "active",
      source: SOURCE_CLIENT_DASHBOARD,
      createdAt: now,
      updatedAt: now,
    });

    const guestListSnapshot = await guestListRef.get();

    return {
      ok: true,
      guestListId: guestListRef.id,
      guestList: serializeGuestList(guestListSnapshot, emptyStatusCounts()),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const updateMyEventGuestList = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const input = validateGuestListInput(data, { partial: true });

    assert(
      Object.keys(input).length > 0,
      "invalid-argument",
      "At least one editable guest list field is required."
    );

    const guestList = await requireOwnedGuestList(uid, eventId, guestListId);
    await guestList.snapshot.ref.update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedSnapshot = await guestList.snapshot.ref.get();
    const counts = await buildGuestStatusCounts(eventId, guestListId);

    return {
      ok: true,
      guestList: serializeGuestList(updatedSnapshot, counts),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const archiveMyEventGuestList = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const guestList = await requireOwnedGuestList(uid, eventId, guestListId);
    const now = FieldValue.serverTimestamp();

    await guestList.snapshot.ref.update({
      listStatus: "archived",
      archivedAt: now,
      updatedAt: now,
    });

    return {
      ok: true,
      guestListId,
      listStatus: "archived",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const addGuestToList = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const input = validateGuestInput(data);
    const eventRef = db.collection("events").doc(eventId);
    const guestListRef = eventRef.collection("guest_lists").doc(guestListId);
    const guestRef = guestListRef.collection("guests").doc();
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const eventSnapshot = await transaction.get(eventRef);
      assert(eventSnapshot.exists, "not-found", "Event was not found.");
      const eventData = eventSnapshot.data() || {};
      assert(eventData.uid === uid, "permission-denied", "You do not have access to this event.");

      const guestListSnapshot = await transaction.get(guestListRef);
      assert(guestListSnapshot.exists, "not-found", "Guest list was not found.");
      const guestListData = guestListSnapshot.data() || {};
      assert(
        !guestListData.uid || guestListData.uid === uid,
        "permission-denied",
        "You do not have access to this guest list."
      );
      assert(
        !guestListData.eventId || guestListData.eventId === eventId,
        "failed-precondition",
        "Guest list does not belong to this event."
      );

      await assertWhatsappUnique(transaction, eventId, guestListId, input.normalizedWhatsapp);

      const currentActiveGuestCount = await countActiveGuestsForEventInTransaction(transaction, eventRef);
      const capacity = Number(eventData.totalAllocatedInvitations || 0);
      assert(
        currentActiveGuestCount + 1 <= capacity,
        "failed-precondition",
        "Event guest count cannot exceed allocated invitations."
      );

      transaction.set(guestRef, {
        uid,
        eventId,
        guestListId,
        guestName: input.guestName,
        whatsapp: input.whatsapp,
        normalizedWhatsapp: input.normalizedWhatsapp,
        invitationStatus: input.invitationStatus,
        source: SOURCE_CLIENT_DASHBOARD,
        createdAt: now,
        updatedAt: now,
      });
    });

    const guestSnapshot = await guestRef.get();

    return {
      ok: true,
      guestId: guestRef.id,
      guest: serializeGuest(guestSnapshot),
    };
  } catch (error) {
    console.error("addGuestToList failed", error);
    throw normalizeCallableError(error);
  }
});

const updateGuestInList = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const guestId = validateGuestId(data);
    const input = validateGuestInput(data, { partial: true });

    assert(
      input.guestName || input.normalizedWhatsapp,
      "invalid-argument",
      "guestName or whatsapp is required."
    );

    const eventRef = db.collection("events").doc(eventId);
    const guestListRef = eventRef.collection("guest_lists").doc(guestListId);
    const guestRef = db
      .collection("events")
      .doc(eventId)
      .collection("guest_lists")
      .doc(guestListId)
      .collection("guests")
      .doc(guestId);

    await db.runTransaction(async (transaction) => {
      const guestSnapshot = await transaction.get(guestRef);
      assert(guestSnapshot.exists, "not-found", "Guest was not found.");
      const guestData = guestSnapshot.data() || {};
      assert(
        !guestData.uid || guestData.uid === uid,
        "permission-denied",
        "You do not have access to this guest."
      );

      if (input.normalizedWhatsapp) {
        await assertWhatsappUnique(
          transaction,
          eventId,
          guestListId,
          input.normalizedWhatsapp,
          guestId
        );
      }

      const update = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (input.guestName) {
        update.guestName = input.guestName;
      }
      if (input.normalizedWhatsapp) {
        update.whatsapp = input.whatsapp;
        update.normalizedWhatsapp = input.normalizedWhatsapp;
      }

      transaction.update(guestRef, update);
    });

    const updatedSnapshot = await guestRef.get();

    return {
      ok: true,
      guest: serializeGuest(updatedSnapshot),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const updateGuestStatus = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const guestId = validateGuestId(data);
    const invitationStatus = validateInvitationStatus(data);
    assert(invitationStatus, "invalid-argument", "invitationStatus is required.");

    const eventRef = db.collection("events").doc(eventId);
    const guestListRef = eventRef.collection("guest_lists").doc(guestListId);
    const guestRef = guestListRef.collection("guests").doc(guestId);

    await db.runTransaction(async (transaction) => {
      const eventSnapshot = await transaction.get(eventRef);
      assert(eventSnapshot.exists, "not-found", "Event was not found.");
      const eventData = eventSnapshot.data() || {};
      assert(eventData.uid === uid, "permission-denied", "You do not have access to this event.");

      const guestListSnapshot = await transaction.get(guestListRef);
      assert(guestListSnapshot.exists, "not-found", "Guest list was not found.");
      const guestListData = guestListSnapshot.data() || {};
      assert(
        !guestListData.uid || guestListData.uid === uid,
        "permission-denied",
        "You do not have access to this guest list."
      );
      assert(
        !guestListData.eventId || guestListData.eventId === eventId,
        "failed-precondition",
        "Guest list does not belong to this event."
      );

      const guestSnapshot = await transaction.get(guestRef);
      assert(guestSnapshot.exists, "not-found", "Guest was not found.");
      const guestData = guestSnapshot.data() || {};
      assert(!guestData.uid || guestData.uid === uid, "permission-denied", "You do not have access to this guest.");

      if (guestData.invitationStatus === "revoked" && invitationStatus !== "revoked") {
        const currentActiveGuestCount = await countActiveGuestsForEventInTransaction(transaction, eventRef);
        const capacity = Number(eventData.totalAllocatedInvitations || 0);
        assert(
          currentActiveGuestCount + 1 <= capacity,
          "failed-precondition",
          "Event guest count cannot exceed allocated invitations."
        );
      }

      const update = {
        invitationStatus,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (invitationStatus === "revoked") {
        update.revokedAt = FieldValue.serverTimestamp();
      }
      transaction.update(guestRef, update);
    });

    return {
      ok: true,
      guestId,
      invitationStatus,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const revokeGuest = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const guestId = validateGuestId(data);
    const revokedReason = validateRevokedReason(data);

    await requireOwnedGuestList(uid, eventId, guestListId);
    const guestRef = db
      .collection("events")
      .doc(eventId)
      .collection("guest_lists")
      .doc(guestListId)
      .collection("guests")
      .doc(guestId);
    const guestSnapshot = await guestRef.get();
    assert(guestSnapshot.exists, "not-found", "Guest was not found.");
    const guestData = guestSnapshot.data() || {};
    assert(!guestData.uid || guestData.uid === uid, "permission-denied", "You do not have access to this guest.");

    const update = {
      invitationStatus: "revoked",
      revokedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (revokedReason) {
      update.revokedReason = revokedReason;
    }
    await guestRef.update(update);

    return {
      ok: true,
      guestId,
      invitationStatus: "revoked",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const bulkAddGuestsToList = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const guestListId = validateGuestListId(data);
    const guestsInput = validateBulkGuests(data);
    const eventRef = db.collection("events").doc(eventId);
    const guestListRef = eventRef.collection("guest_lists").doc(guestListId);
    const now = FieldValue.serverTimestamp();
    const guestRefs = [];

    await db.runTransaction(async (transaction) => {
      const eventSnapshot = await transaction.get(eventRef);
      assert(eventSnapshot.exists, "not-found", "Event was not found.");
      const eventData = eventSnapshot.data() || {};
      assert(eventData.uid === uid, "permission-denied", "You do not have access to this event.");

      const guestListSnapshot = await transaction.get(guestListRef);
      assert(guestListSnapshot.exists, "not-found", "Guest list was not found.");
      const guestListData = guestListSnapshot.data() || {};
      assert(
        !guestListData.uid || guestListData.uid === uid,
        "permission-denied",
        "You do not have access to this guest list."
      );
      assert(
        !guestListData.eventId || guestListData.eventId === eventId,
        "failed-precondition",
        "Guest list does not belong to this event."
      );

      const existingGuestsSnapshot = await transaction.get(guestListRef.collection("guests"));
      const existingNumbers = new Set(
        existingGuestsSnapshot.docs
          .map((doc) => (doc.data() || {}).normalizedWhatsapp)
          .filter(Boolean)
      );
      guestsInput.forEach((guest) => {
        assert(
          !existingNumbers.has(guest.normalizedWhatsapp),
          "invalid-argument",
          "This WhatsApp number already exists in this guest list."
        );
      });

      const currentActiveGuestCount = await countActiveGuestsForEventInTransaction(transaction, eventRef);
      const capacity = Number(eventData.totalAllocatedInvitations || 0);
      assert(
        currentActiveGuestCount + guestsInput.length <= capacity,
        "failed-precondition",
        "Event guest count cannot exceed allocated invitations."
      );

      guestsInput.forEach((guest) => {
        const guestRef = guestListRef.collection("guests").doc();
        guestRefs.push(guestRef);
        transaction.set(guestRef, {
          uid,
          eventId,
          guestListId,
          guestName: guest.guestName,
          whatsapp: guest.whatsapp,
          normalizedWhatsapp: guest.normalizedWhatsapp,
          invitationStatus: guest.invitationStatus,
          source: SOURCE_CLIENT_DASHBOARD,
          createdAt: now,
          updatedAt: now,
        });
      });
    });

    const guests = guestsInput.map((guest, index) => ({
      id: guestRefs[index].id,
      uid,
      eventId,
      guestListId,
      guestName: guest.guestName,
      whatsapp: guest.whatsapp,
      invitationStatus: guest.invitationStatus,
      createdAt: null,
      updatedAt: null,
    }));

    return {
      ok: true,
      createdCount: guests.length,
      guests,
    };
  } catch (error) {
    console.error("bulkAddGuestsToList failed", error);
    throw normalizeCallableError(error);
  }
});

module.exports = {
  getMyEventWorkspace,
  listMyEventGuestLists,
  getMyEventGuestListDetails,
  listMyEventGuests,
  listInvitationMediaCatalogue,
  updateGuestListInvitationDesign,
  createMyEventGuestList,
  updateMyEventGuestList,
  archiveMyEventGuestList,
  addGuestToList,
  updateGuestInList,
  updateGuestStatus,
  revokeGuest,
  bulkAddGuestsToList,
  serializeTimestamp,
  getTimestampSortValue,
  serializeGuestList,
  serializeGuest,
  countActiveGuestsForEvent,
};
