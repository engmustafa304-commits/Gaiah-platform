const { onCall } = require("firebase-functions/v2/https");
const { db, FieldValue } = require("../shared/admin");
const { requireAuth } = require("../shared/auth");
const { assert, fail, normalizeCallableError } = require("../shared/errors");
const {
  normalizeEmail,
  normalizePhone,
  optionalString,
} = require("../shared/validators");

function normalizeOptionalProfileInput(data) {
  try {
    const fullName = optionalString(data.fullName, "fullName", 160);
    const hallName = optionalString(data.hallName, "hallName", 180);
    const whatsappInput = optionalString(data.whatsapp, "whatsapp", 80);
    const whatsapp = whatsappInput ? normalizePhone(whatsappInput) : null;

    assert(
      !whatsapp || whatsapp.length <= 40,
      "invalid-argument",
      "whatsapp must be 40 characters or fewer."
    );

    return {
      fullName,
      hallName,
      whatsapp,
    };
  } catch (error) {
    if (error.code) {
      throw error;
    }

    fail("invalid-argument", error.message);
  }
}

function buildReturnedUser(uid, email, existingData, updatePayload) {
  return {
    uid,
    email,
    role: updatePayload.role || existingData.role || "client",
    accountStatus: updatePayload.accountStatus || existingData.accountStatus || "registered",
    fullName: updatePayload.fullName || existingData.fullName || null,
    whatsapp: updatePayload.whatsapp || existingData.whatsapp || null,
    hallName: updatePayload.hallName || existingData.hallName || null,
  };
}

const ensureMyUserProfile = onCall(async (request) => {
  try {
    const authContext = requireAuth(request);
    const uid = authContext.uid;
    const email = normalizeEmail(authContext.token && authContext.token.email);

    assert(email, "invalid-argument", "Authenticated user email is required.");

    const data = request.data || {};
    const profileInput = normalizeOptionalProfileInput(data);
    const userRef = db.collection("users").doc(uid);
    const now = FieldValue.serverTimestamp();

    const user = await db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const existingData = userSnapshot.exists ? userSnapshot.data() || {} : {};

      assert(
        existingData.role !== "system_admin",
        "failed-precondition",
        "System admin accounts cannot create client profiles."
      );

      const updatePayload = {
        uid,
        email,
        role: existingData.role || "client",
        updatedAt: now,
      };

      if (!userSnapshot.exists) {
        updatePayload.accountStatus = "registered";
        updatePayload.profileSource = "standalone_auth";
        updatePayload.createdAt = now;
      } else if (!existingData.accountStatus) {
        updatePayload.accountStatus = "registered";
      }

      if (profileInput.fullName) {
        updatePayload.fullName = profileInput.fullName;
      }

      if (profileInput.whatsapp) {
        updatePayload.whatsapp = profileInput.whatsapp;
      }

      if (profileInput.hallName) {
        updatePayload.hallName = profileInput.hallName;
      }

      transaction.set(userRef, updatePayload, { merge: true });

      return buildReturnedUser(uid, email, existingData, updatePayload);
    });

    return {
      ok: true,
      user,
    };
  } catch (error) {
    throw normalizeCallableError(error);
  }
});

module.exports = {
  ensureMyUserProfile,
};
