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

function optionalString(value, fieldName, maxLength) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    return null;
  }

  if (maxLength && normalized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
  }

  return normalized;
}

function optionalLimit(value, defaultLimit, maxLimit) {
  if (value === undefined || value === null || value === "") {
    return defaultLimit;
  }

  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("limit must be a positive integer.");
  }

  return Math.min(limit, maxLimit);
}

function optionalNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error(`${fieldName} must be a number.`);
  }

  return numberValue;
}

function validateEnum(value, allowedValues, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} is invalid.`);
  }

  return value;
}

module.exports = {
  requireString,
  normalizeEmail,
  normalizePhone,
  optionalString,
  optionalLimit,
  optionalNumber,
  validateEnum,
};
