const crypto = require("crypto");

const DEFAULT_PUBLIC_APP_BASE_URL = "https://gaiah-platform.web.app";

function randomToken(byteLength = 32) {
  try {
    return crypto.randomBytes(byteLength).toString("base64url");
  } catch (error) {
    return crypto.randomBytes(byteLength).toString("hex");
  }
}

function generatePublicInvitationToken() {
  return randomToken(32);
}

function generateQrToken() {
  return randomToken(32);
}

function buildPublicInvitePath(publicToken) {
  return `/invite/index.html?t=${encodeURIComponent(publicToken)}`;
}

function buildPublicInviteUrl(publicToken) {
  const baseUrl = (process.env.PUBLIC_APP_BASE_URL || DEFAULT_PUBLIC_APP_BASE_URL).replace(/\/+$/, "");
  return `${baseUrl}${buildPublicInvitePath(publicToken)}`;
}

function buildQrPayload({ publicToken, guestId, qrToken }) {
  return `gaiah://invite-pass?t=${encodeURIComponent(publicToken)}&g=${encodeURIComponent(guestId)}&p=${encodeURIComponent(qrToken)}`;
}

module.exports = {
  generatePublicInvitationToken,
  generateQrToken,
  buildPublicInvitePath,
  buildPublicInviteUrl,
  buildQrPayload,
};
