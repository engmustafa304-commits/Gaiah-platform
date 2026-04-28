const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const { FieldValue, Timestamp } = admin.firestore;

module.exports = {
  admin,
  db,
  auth,
  FieldValue,
  Timestamp,
};
