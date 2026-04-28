function requireString(value, fieldName, maxLength) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  if (maxLength && normalized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
  }

  return normalized;
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizePhone(phone) {
  return typeof phone === "string" ? phone.trim().replace(/\s+/g, "") : "";
}

module.exports = {
  requireString,
  normalizeEmail,
  normalizePhone,
};
