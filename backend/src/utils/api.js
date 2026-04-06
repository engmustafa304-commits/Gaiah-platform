// Mock API (للتجربة بدون Backend)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');

const mockAPI = {
  register: async (userData) => {
    await delay(500);
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) throw new Error('البريد الإلكتروني موجود بالفعل');
    const newUser = {
      uid: Date.now().toString(),
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone,
      role: 'client'
    };
    mockUsers.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('token', 'mock_token');
    localStorage.setItem('user', JSON.stringify(newUser));
    return { token: 'mock_token', user: newUser };
  },
  login: async (email, password) => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('بيانات الدخول غير صحيحة');
    localStorage.setItem('token', 'mock_token');
    localStorage.setItem('user', JSON.stringify(user));
    return { token: 'mock_token', user };
  },
  getMe: async () => {
    const user = localStorage.getItem('user');
    return { user: user ? JSON.parse(user) : null };
  },
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getEvents: async () => ({ events: [] }),
  createEvent: async () => ({ success: true }),
  deleteEvent: async () => ({ success: true }),
  getStats: async () => ({ totalEvents: 0, totalGuests: 0, confirmedGuests: 0, attendedGuests: 0 })
};

export const authAPI = {
  register: (data) => mockAPI.register(data),
  login: (email, password) => mockAPI.login(email, password),
  getMe: () => mockAPI.getMe(),
  logout: () => mockAPI.logout(),
};

export const eventsAPI = {
  getAll: () => mockAPI.getEvents(),
  create: (data) => mockAPI.createEvent(data),
  delete: (id) => mockAPI.deleteEvent(id),
  getStats: () => mockAPI.getStats(),
};

export const guestsAPI = {
  getByEvent: () => Promise.resolve({ guests: [] }),
  add: () => Promise.resolve({ success: true }),
  delete: () => Promise.resolve({ success: true }),
};

export const dashboardAPI = {
  getStats: () => mockAPI.getStats(),
  getRecentEvents: () => Promise.resolve({ events: [] }),
};

const API = { auth: authAPI, events: eventsAPI, guests: guestsAPI, dashboard: dashboardAPI };
export default API;
