import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase/client';

const notImplemented = (area) => {
  throw new Error(`${area} API is not implemented yet.`);
};

const whatsappNotConfigured = () => {
  throw new Error(
    'WhatsApp backend is not configured yet. This will be handled by Firebase Cloud Functions.'
  );
};

const callFunction = async (name, payload = {}) => {
  if (!isFirebaseConfigured || !functions) {
    throw new Error('Firebase is not configured yet. Add VITE_FIREBASE_* values to .env.local.');
  }

  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result.data;
};

const auth = {
  register: () => notImplemented('Auth register'),
  login: () => notImplemented('Auth login'),
  logout: () => notImplemented('Auth logout'),
  getCurrentUser: () => notImplemented('Auth current user'),
  updateProfile: () => notImplemented('Auth profile'),
};

const users = {
  getProfile: () => notImplemented('Users profile'),
  updateProfile: () => notImplemented('Users profile update'),
};

const events = {
  list: () => notImplemented('Events list'),
  getById: () => notImplemented('Events detail'),
  create: () => notImplemented('Events create'),
  update: () => notImplemented('Events update'),
  remove: () => notImplemented('Events delete'),
};

const guests = {
  listByEvent: () => notImplemented('Guests list'),
  add: () => notImplemented('Guests add'),
  update: () => notImplemented('Guests update'),
  remove: () => notImplemented('Guests delete'),
  bulkImport: () => notImplemented('Guests bulk import'),
};

const invitations = {
  getBySlug: () => notImplemented('Invitations lookup'),
  updateRsvp: () => notImplemented('Invitations RSVP'),
};

const analytics = {
  getDashboardStats: () => notImplemented('Analytics dashboard'),
  getEventStats: () => notImplemented('Analytics event stats'),
};

const subscriptions = {
  getCurrentPlan: () => notImplemented('Subscriptions current plan'),
  updatePlan: () => notImplemented('Subscriptions update plan'),
};

const whatsapp = {
  sendInvitation: () => whatsappNotConfigured(),
  sendReminder: () => whatsappNotConfigured(),
  sendBulkInvitations: () => whatsappNotConfigured(),
};

const qr = {
  createForGuest: () => notImplemented('QR create'),
  validate: () => notImplemented('QR validate'),
};

const settings = {
  get: () => notImplemented('Settings get'),
  update: () => notImplemented('Settings update'),
};

const system = {
  callFunction,
  healthCheck: () => callFunction('healthCheck'),
};

const gaiahApi = {
  auth,
  users,
  events,
  guests,
  invitations,
  analytics,
  subscriptions,
  whatsapp,
  qr,
  settings,
  system,
};

export {
  auth,
  users,
  events,
  guests,
  invitations,
  analytics,
  subscriptions,
  whatsapp,
  qr,
  settings,
  system,
  callFunction,
};

export default gaiahApi;
