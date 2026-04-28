const { HttpsError } = require("firebase-functions/v2/https");

function fail(code, message, details) {
  throw new HttpsError(code, message, details);
}

function assert(condition, code, message, details) {
  if (!condition) {
    fail(code, message, details);
  }
}

function normalizeCallableError(error) {
  if (error instanceof HttpsError) {
    return error;
  }

  return new HttpsError(
    "internal",
    error && error.message ? error.message : "Unexpected callable error",
    error && error.details ? error.details : undefined
  );
}

module.exports = {
  fail,
  assert,
  normalizeCallableError,
};
