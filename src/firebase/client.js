import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.warn('Firebase is not configured yet. Add VITE_FIREBASE_* values to .env.local.');
}

const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
const storage = firebaseApp ? getStorage(firebaseApp) : null;
const functions = firebaseApp ? getFunctions(firebaseApp) : null;

const analyticsPromise = firebaseApp
  ? isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null)
  : Promise.resolve(null);

export {
  firebaseConfig,
  isFirebaseConfigured,
  firebaseApp,
  auth,
  db,
  storage,
  functions,
  analyticsPromise,
};
