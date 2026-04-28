import {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from './firebase-client.js';

function normalizeUser(user) {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
  };
}

function getAuthMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل.',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح.',
    'auth/weak-password': 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.',
    'auth/invalid-credential': 'بيانات تسجيل الدخول غير صحيحة.',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني.',
    'auth/wrong-password': 'كلمة المرور غير صحيحة.',
    'auth/too-many-requests': 'تمت محاولات كثيرة. حاول مرة أخرى لاحقا.',
  };

  return messages[error && error.code] || 'تعذر إكمال عملية الدخول. حاول مرة أخرى.';
}

export async function registerClientAccount({ email, password, displayName }) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    return normalizeUser(auth.currentUser || credential.user);
  } catch (error) {
    throw new Error(getAuthMessage(error));
  }
}

export async function loginClientAccount({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return normalizeUser(credential.user);
  } catch (error) {
    throw new Error(getAuthMessage(error));
  }
}

export async function logout() {
  await signOut(auth);
}

export function getCurrentUser() {
  return normalizeUser(auth.currentUser);
}

export function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(normalizeUser(user));
    });
  });
}
