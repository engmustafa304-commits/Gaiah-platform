const { onCall } = require("firebase-functions/v2/https");
const { auth, db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const {
  normalizeEmail,
  optionalString,
  requireString,
  validateEnum,
} = require("../shared/validators");

const SEX_VALUES = ["male", "female"];
const POSITION_VALUES = ["general_supervisor", "security_guard", "entry_organizer", "other"];
const STAFF_STATUSES = ["active", "disabled"];
const STAFF_ROLE = "event_staff";
const SOURCE_EVENT_DETAILS = "event_details";

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

function getDocData(docOrData) {
  if (docOrData && typeof docOrData.data === "function") {
    return docOrData.data() || {};
  }

  return docOrData || {};
}

function serializeStaffAssignment(docOrData) {
  const data = getDocData(docOrData);
  const id = docOrData && docOrData.id ? docOrData.id : data.uid || null;

  return {
    id,
    uid: data.uid || null,
    eventId: data.eventId || null,
    clientUid: data.clientUid || null,
    email: data.email || null,
    fullName: data.fullName || null,
    mobile: data.mobile || null,
    sex: data.sex || null,
    position: data.position || null,
    customPosition: data.customPosition || null,
    staffStatus: data.staffStatus || null,
    source: data.source || null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    disabledAt: serializeTimestamp(data.disabledAt),
  };
}

function requireInputString(data, fieldName, maxLength) {
  try {
    return requireString(data && data[fieldName], fieldName, maxLength);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateEventId(data) {
  return requireInputString(data, "eventId", 160);
}

function validateStaffUid(data) {
  return requireInputString(data, "staffUid", 160);
}

function validateFullName(data) {
  return requireInputString(data, "fullName", 160);
}

function validateOptionalFullName(data) {
  try {
    return optionalString(data && data.fullName, "fullName", 160);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateMobile(data) {
  return requireInputString(data, "mobile", 40);
}

function validateOptionalMobile(data) {
  try {
    return optionalString(data && data.mobile, "mobile", 40);
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateSex(data) {
  try {
    const sex = validateEnum(data && data.sex, SEX_VALUES, "sex");
    assert(sex, "invalid-argument", "sex is required.");
    return sex;
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validateOptionalSex(data) {
  if (!data || data.sex === undefined) {
    return undefined;
  }

  try {
    const sex = validateEnum(data.sex, SEX_VALUES, "sex");
    assert(sex, "invalid-argument", "sex is required.");
    return sex;
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validatePosition(data) {
  try {
    const position = validateEnum(data && data.position, POSITION_VALUES, "position");
    assert(position, "invalid-argument", "position is required.");
    return position;
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validateOptionalPosition(data) {
  if (!data || data.position === undefined) {
    return undefined;
  }

  try {
    const position = validateEnum(data.position, POSITION_VALUES, "position");
    assert(position, "invalid-argument", "position is required.");
    return position;
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validateCustomPosition(data, position) {
  try {
    const customPosition = optionalString(data && data.customPosition, "customPosition", 120);
    if (position === "other") {
      assert(customPosition, "invalid-argument", "customPosition is required when position is other.");
      return customPosition;
    }

    return null;
  } catch (error) {
    if (error.code) {
      throw error;
    }
    fail("invalid-argument", error.message);
  }
}

function validateEmail(data) {
  const email = normalizeEmail(data && data.email);
  assert(email, "invalid-argument", "email is required.");
  assert(email.length <= 180, "invalid-argument", "email must be 180 characters or fewer.");
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "invalid-argument", "email is invalid.");
  return email;
}

function validateOptionalEmail(data) {
  if (!data || data.email === undefined) {
    return undefined;
  }

  return validateEmail(data);
}

function validatePassword(data, { required }) {
  const value = data && data.password;

  if (value === undefined || value === null || value === "") {
    if (required) {
      fail("invalid-argument", "password is required.");
    }
    return null;
  }

  assert(typeof value === "string", "invalid-argument", "password must be a string.");
  assert(value.length >= 6, "invalid-argument", "password must be at least 6 characters.");
  assert(value.length <= 128, "invalid-argument", "password must be 128 characters or fewer.");
  return value;
}

function validateStaffStatus(data) {
  try {
    return validateEnum(data && data.staffStatus, STAFF_STATUSES, "staffStatus");
  } catch (error) {
    fail("invalid-argument", error.message);
  }
}

function validateCreateStaffInput(data) {
  const position = validatePosition(data);

  return {
    eventId: validateEventId(data),
    fullName: validateFullName(data),
    mobile: validateMobile(data),
    sex: validateSex(data),
    position,
    customPosition: validateCustomPosition(data, position),
    email: validateEmail(data),
    password: validatePassword(data, { required: true }),
  };
}

function validateUpdateStaffInput(data, existingStaffData) {
  const update = {};
  const authUpdate = {};
  const userUpdate = {};
  const assignmentUpdate = {};

  const fullName = validateOptionalFullName(data);
  if (fullName !== undefined && fullName !== null) {
    update.fullName = fullName;
    authUpdate.displayName = fullName;
    userUpdate.fullName = fullName;
    assignmentUpdate.fullName = fullName;
  }

  const mobile = validateOptionalMobile(data);
  if (mobile !== undefined && mobile !== null) {
    update.mobile = mobile;
    userUpdate.mobile = mobile;
    assignmentUpdate.mobile = mobile;
  }

  const sex = validateOptionalSex(data);
  if (sex !== undefined) {
    update.sex = sex;
    userUpdate.sex = sex;
    assignmentUpdate.sex = sex;
  }

  const position = validateOptionalPosition(data);
  const effectivePosition = position !== undefined ? position : existingStaffData.position;
  if (position !== undefined) {
    update.position = position;
    userUpdate.position = position;
    assignmentUpdate.position = position;
  }

  if (data && (data.customPosition !== undefined || position !== undefined)) {
    const customPosition =
      effectivePosition === "other"
        ? validateCustomPosition(data, effectivePosition)
        : null;
    update.customPosition = customPosition;
    userUpdate.customPosition = customPosition;
    assignmentUpdate.customPosition = customPosition;
  } else if (effectivePosition === "other") {
    assert(
      existingStaffData.customPosition,
      "invalid-argument",
      "customPosition is required when position is other."
    );
  }

  if (position !== undefined && effectivePosition !== "other") {
    update.customPosition = null;
    userUpdate.customPosition = null;
    assignmentUpdate.customPosition = null;
  }

  const email = validateOptionalEmail(data);
  if (email !== undefined && email !== existingStaffData.email) {
    update.email = email;
    authUpdate.email = email;
    userUpdate.email = email;
    assignmentUpdate.email = email;
  }

  const password = validatePassword(data, { required: false });
  if (password) {
    update.password = password;
    authUpdate.password = password;
  }

  assert(Object.keys(update).length > 0, "invalid-argument", "At least one editable field is required.");

  return {
    authUpdate,
    userUpdate,
    assignmentUpdate,
  };
}

function mapAuthError(error) {
  if (!error || !error.code) {
    return null;
  }

  if (error.code === "auth/email-already-exists") {
    return {
      code: "already-exists",
      message: "A user with this email already exists.",
    };
  }

  if (error.code === "auth/user-not-found") {
    return {
      code: "not-found",
      message: "Staff user was not found.",
    };
  }

  if (error.code === "auth/invalid-email") {
    return {
      code: "invalid-argument",
      message: "email is invalid.",
    };
  }

  if (error.code === "auth/invalid-password") {
    return {
      code: "invalid-argument",
      message: "password is invalid.",
    };
  }

  return null;
}

function throwMappedAuthError(error) {
  const mapped = mapAuthError(error);
  if (mapped) {
    fail(mapped.code, mapped.message);
  }

  throw error;
}

async function requireOwnedEvent(uid, eventId) {
  const eventRef = db.collection("events").doc(eventId);
  const eventSnapshot = await eventRef.get();
  assert(eventSnapshot.exists, "not-found", "Event was not found.");
  const eventData = eventSnapshot.data() || {};
  assert(eventData.uid === uid, "permission-denied", "You do not have access to this event.");
  return { eventRef, eventData };
}

async function requireOwnedStaffAssignment(clientUid, eventId, staffUid) {
  const { eventRef, eventData } = await requireOwnedEvent(clientUid, eventId);
  const staffRef = eventRef.collection("staff").doc(staffUid);
  const staffSnapshot = await staffRef.get();
  assert(staffSnapshot.exists, "not-found", "Staff assignment was not found.");
  const staffData = staffSnapshot.data() || {};
  assert(staffData.clientUid === clientUid, "permission-denied", "You do not have access to this staff account.");
  assert(staffData.eventId === eventId, "failed-precondition", "Staff assignment does not belong to this event.");

  return {
    eventRef,
    eventData,
    staffRef,
    staffData,
  };
}

async function assertEmailAvailable(email) {
  try {
    await auth.getUserByEmail(email);
    fail("already-exists", "A user with this email already exists.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return;
    }
    if (error.code) {
      throwMappedAuthError(error);
    }
    throw error;
  }
}

const createEventStaffAccount = onCall(async (request) => {
  let staffUid = null;

  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const input = validateCreateStaffInput(data);
    const { eventRef } = await requireOwnedEvent(uid, input.eventId);

    await assertEmailAvailable(input.email);

    const userRecord = await auth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.fullName,
      disabled: false,
    });
    staffUid = userRecord.uid;

    const now = FieldValue.serverTimestamp();
    const userRef = db.collection("users").doc(staffUid);
    const staffRef = eventRef.collection("staff").doc(staffUid);
    const userProfile = {
      uid: staffUid,
      email: input.email,
      role: STAFF_ROLE,
      accountStatus: "active",
      fullName: input.fullName,
      mobile: input.mobile,
      sex: input.sex,
      position: input.position,
      customPosition: input.customPosition,
      assignedEventId: input.eventId,
      assignedClientUid: uid,
      createdAt: now,
      updatedAt: now,
      disabledAt: null,
    };
    const staffAssignment = {
      uid: staffUid,
      eventId: input.eventId,
      clientUid: uid,
      email: input.email,
      fullName: input.fullName,
      mobile: input.mobile,
      sex: input.sex,
      position: input.position,
      customPosition: input.customPosition,
      staffStatus: "active",
      source: SOURCE_EVENT_DETAILS,
      createdAt: now,
      updatedAt: now,
      disabledAt: null,
    };

    const batch = db.batch();
    batch.set(userRef, userProfile);
    batch.set(staffRef, staffAssignment);
    await batch.commit();

    return {
      ok: true,
      staff: serializeStaffAssignment({
        id: staffUid,
        ...staffAssignment,
        createdAt: null,
        updatedAt: null,
      }),
    };
  } catch (error) {
    if (staffUid) {
      try {
        await auth.deleteUser(staffUid);
      } catch (rollbackError) {
        console.error("createEventStaffAccount rollback failed", {
          staffUid,
          code: rollbackError && rollbackError.code,
          message: rollbackError && rollbackError.message,
        });
      }
    }

    throw normalizeCallableError(error);
  }
});

const listEventStaffAccounts = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const staffStatus = validateStaffStatus(data);
    const { eventRef } = await requireOwnedEvent(uid, eventId);

    const staffSnapshot = await eventRef.collection("staff").get();
    let staff = staffSnapshot.docs.map((doc) => serializeStaffAssignment(doc));

    if (staffStatus) {
      staff = staff.filter((row) => row.staffStatus === staffStatus);
    }

    staff.sort((a, b) => getTimestampSortValue(b.createdAt) - getTimestampSortValue(a.createdAt));

    return {
      ok: true,
      staff,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const updateEventStaffAccount = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const staffUid = validateStaffUid(data);
    const { staffRef, staffData } = await requireOwnedStaffAssignment(uid, eventId, staffUid);
    const { authUpdate, userUpdate, assignmentUpdate } = validateUpdateStaffInput(data, staffData);

    if (Object.keys(authUpdate).length > 0) {
      try {
        await auth.updateUser(staffUid, authUpdate);
      } catch (error) {
        throwMappedAuthError(error);
      }
    }

    const now = FieldValue.serverTimestamp();
    const userRef = db.collection("users").doc(staffUid);
    const userFirestoreUpdate = {
      ...userUpdate,
      updatedAt: now,
    };
    const assignmentFirestoreUpdate = {
      ...assignmentUpdate,
      updatedAt: now,
    };

    try {
      const batch = db.batch();
      batch.update(userRef, userFirestoreUpdate);
      batch.update(staffRef, assignmentFirestoreUpdate);
      await batch.commit();
    } catch (error) {
      console.error("updateEventStaffAccount Firestore update failed after Auth update", {
        staffUid,
        code: error && error.code,
        message: error && error.message,
      });
      throw error;
    }

    const updatedSnapshot = await staffRef.get();

    return {
      ok: true,
      staff: serializeStaffAssignment(updatedSnapshot),
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

const disableEventStaffAccount = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const data = request.data || {};
    const eventId = validateEventId(data);
    const staffUid = validateStaffUid(data);
    const { staffRef } = await requireOwnedStaffAssignment(uid, eventId, staffUid);

    try {
      await auth.updateUser(staffUid, { disabled: true });
    } catch (error) {
      throwMappedAuthError(error);
    }

    const now = FieldValue.serverTimestamp();
    const userRef = db.collection("users").doc(staffUid);
    const batch = db.batch();
    batch.update(userRef, {
      accountStatus: "disabled",
      disabledAt: now,
      updatedAt: now,
    });
    batch.update(staffRef, {
      staffStatus: "disabled",
      disabledAt: now,
      updatedAt: now,
    });
    await batch.commit();

    return {
      ok: true,
      staffUid,
      staffStatus: "disabled",
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  createEventStaffAccount,
  listEventStaffAccounts,
  updateEventStaffAccount,
  disableEventStaffAccount,
  serializeTimestamp,
  serializeStaffAssignment,
};
