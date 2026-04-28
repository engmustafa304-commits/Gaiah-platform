const { fail } = require("./errors");
const { db } = require("./admin");

const SYSTEM_ADMIN_ROLE = "system_admin";
const ACTIVE_STATUS = "active";

function requireAuth(request) {
  if (!request.auth) {
    fail("unauthenticated", "Authentication is required.");
  }

  return request.auth;
}

function getTokenRole(request) {
  return request.auth && request.auth.token ? request.auth.token.role || null : null;
}

function normalizeAdmin(uid, data) {
  return {
    uid,
    email: data.email || null,
    role: data.role || null,
    status: data.status || null,
    displayName: data.displayName || null,
  };
}

async function isSystemAdminUid(uid) {
  if (!uid) {
    return false;
  }

  const snapshot = await db.collection("admins").doc(uid).get();
  if (!snapshot.exists) {
    return false;
  }

  const data = snapshot.data() || {};
  return data.role === SYSTEM_ADMIN_ROLE && data.status === ACTIVE_STATUS;
}

async function requireSystemAdmin(request) {
  const authContext = requireAuth(request);
  const uid = authContext.uid;

  const snapshot = await db.collection("admins").doc(uid).get();
  if (!snapshot.exists) {
    fail("permission-denied", "System admin access is required.");
  }

  const data = snapshot.data() || {};
  if (data.role !== SYSTEM_ADMIN_ROLE || data.status !== ACTIVE_STATUS) {
    fail("permission-denied", "System admin access is required.");
  }

  return normalizeAdmin(uid, data);
}

module.exports = {
  requireAuth,
  getTokenRole,
  requireSystemAdmin,
  isSystemAdminUid,
};
