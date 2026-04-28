import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFunctions,
  httpsCallable,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB_4t4qPXKUm-1B7-iapOmuKDOLVotwmEo',
  authDomain: 'gaiah-platform.firebaseapp.com',
  projectId: 'gaiah-platform',
  storageBucket: 'gaiah-platform.firebasestorage.app',
  messagingSenderId: '378898309815',
  appId: '1:378898309815:web:be020a0ea30490377a2332',
  measurementId: 'G-H41DQS4W5R',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const isFirebaseReady = true;

export {
  app,
  auth,
  functions,
  isFirebaseReady,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  httpsCallable,
};
