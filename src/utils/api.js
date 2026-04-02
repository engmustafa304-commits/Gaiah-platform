// API Configuration - Mock Version (للتجربة بدون Backend)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'حدث خطأ في الطلب');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Mock API (للتجربة بدون Backend حقيقي)
const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');

const mockAPI = {
  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          reject(new Error('البريد الإلكتروني موجود بالفعل'));
          return;
        }
        
        const newUser = {
          uid: Date.now().toString(),
          email: userData.email,
          displayName: userData.displayName,
          phone: userData.phone,
          role: 'client',
          subscription: {
            plan: 'free',
            totalInvitations: 50,
            usedInvitations: 0,
            remainingInvitations: 50,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active'
          },
          createdAt: new Date().toISOString()
        };
        
        mockUsers.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        
        const token = 'mock_token_' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        resolve({ success: true, token, user: newUser });
      }, 500);
    });
  },
  
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          reject(new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة'));
          return;
        }
        
        const token = 'mock_token_' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        resolve({ success: true, token, user });
      }, 500);
    });
  },
  
  getMe: () => {
    return new Promise((resolve) => {
      const user = localStorage.getItem('user');
      resolve({ success: true, user: user ? JSON.parse(user) : null });
    });
  },
  
  getEvents: () => {
    const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
    return Promise.resolve({ success: true, events });
  },
  
  createEvent: (eventData) => {
    return new Promise((resolve) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        userId: user.uid,
        uniqueLink: Math.random().toString(36).substring(2, 10),
        status: 'draft',
        totalGuests: 0,
        confirmedGuests: 0,
        declinedGuests: 0,
        attendedGuests: 0,
        createdAt: new Date().toISOString()
      };
      
      const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
      events.push(newEvent);
      localStorage.setItem('mock_events', JSON.stringify(events));
      
      resolve({ success: true, eventId: newEvent.id });
    });
  },
  
  deleteEvent: (eventId) => {
    return new Promise((resolve) => {
      let events = JSON.parse(localStorage.getItem('mock_events') || '[]');
      events = events.filter(e => e.id !== eventId);
      localStorage.setItem('mock_events', JSON.stringify(events));
      resolve({ success: true });
    });
  },
  
  getEventById: (eventId) => {
    return new Promise((resolve, reject) => {
      const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
      const event = events.find(e => e.id === eventId);
      if (event) {
        resolve({ success: true, event });
      } else {
        reject(new Error('المناسبة غير موجودة'));
      }
    });
  },
  
  getEventStats: (eventId) => {
    return new Promise((resolve) => {
      const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
      const event = events.find(e => e.id === eventId);
      resolve({
        success: true,
        total: event?.totalGuests || 0,
        confirmed: event?.confirmedGuests || 0,
        declined: event?.declinedGuests || 0,
        attended: event?.attendedGuests || 0
      });
    });
  },
  
  getGuests: (eventId) => {
    const guests = JSON.parse(localStorage.getItem(`mock_guests_${eventId}`) || '[]');
    return Promise.resolve({ success: true, guests });
  },
  
  addGuest: (eventId, guestData) => {
    return new Promise((resolve) => {
      const guests = JSON.parse(localStorage.getItem(`mock_guests_${eventId}`) || '[]');
      const newGuest = {
        id: Date.now().toString(),
        ...guestData,
        eventId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      guests.push(newGuest);
      localStorage.setItem(`mock_guests_${eventId}`, JSON.stringify(guests));
      
      // تحديث عدد الضيوف في المناسبة
      const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
      const eventIndex = events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        events[eventIndex].totalGuests = guests.length;
        localStorage.setItem('mock_events', JSON.stringify(events));
      }
      
      resolve({ success: true, guestId: newGuest.id });
    });
  },
  
  deleteGuest: (guestId) => {
    return new Promise((resolve) => {
      // البحث عن guest في جميع الأحداث
      const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
      for (const event of events) {
        let guests = JSON.parse(localStorage.getItem(`mock_guests_${event.id}`) || '[]');
        const newGuests = guests.filter(g => g.id !== guestId);
        if (newGuests.length !== guests.length) {
          localStorage.setItem(`mock_guests_${event.id}`, JSON.stringify(newGuests));
          event.totalGuests = newGuests.length;
          localStorage.setItem('mock_events', JSON.stringify(events));
          break;
        }
      }
      resolve({ success: true });
    });
  },
  
  updateProfile: (data) => {
    return new Promise((resolve) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // تحديث في mock_users
      const mockUsersList = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const userIndex = mockUsersList.findIndex(u => u.email === user.email);
      if (userIndex !== -1) {
        mockUsersList[userIndex] = updatedUser;
        localStorage.setItem('mock_users', JSON.stringify(mockUsersList));
      }
      
      resolve({ success: true, user: updatedUser });
    });
  },
  
  changePassword: (oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      // في النسخة التجريبية، نقبل أي كلمة مرور
      resolve({ success: true });
    });
  },
  
  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        reject(new Error('البريد الإلكتروني غير موجود'));
        return;
      }
      resolve({ success: true, message: 'تم إرسال رابط إعادة التعيين' });
    });
  }
};

// Auth APIs
export const authAPI = {
  register: (userData) => mockAPI.register(userData),
  login: (email, password) => mockAPI.login(email, password),
  getMe: () => mockAPI.getMe(),
  updateProfile: (data) => mockAPI.updateProfile(data),
  changePassword: (oldPassword, newPassword) => mockAPI.changePassword(oldPassword, newPassword),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve({ success: true });
  },
  forgotPassword: (email) => mockAPI.forgotPassword(email),
};

// Events APIs
export const eventsAPI = {
  getAll: () => mockAPI.getEvents(),
  getById: (id) => mockAPI.getEventById(id),
  create: (data) => mockAPI.createEvent(data),
  update: (id, data) => Promise.resolve({ success: true }),
  delete: (id) => mockAPI.deleteEvent(id),
  getStats: (id) => mockAPI.getEventStats(id),
};

// Guests APIs
export const guestsAPI = {
  getByEvent: (eventId) => mockAPI.getGuests(eventId),
  add: (eventId, data) => mockAPI.addGuest(eventId, data),
  update: (guestId, data) => Promise.resolve({ success: true }),
  delete: (guestId) => mockAPI.deleteGuest(guestId),
  bulkImport: (eventId, file) => Promise.resolve({ success: true }),
  export: (eventId) => Promise.resolve(new Blob()),
  sendInvitation: (guestId) => Promise.resolve({ success: true }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => Promise.resolve({ success: true, totalEvents: 0, totalGuests: 0, confirmationRate: 0 }),
  getRecentEvents: () => mockAPI.getEvents(),
};

// Default export
const API = {
  auth: authAPI,
  events: eventsAPI,
  guests: guestsAPI,
  dashboard: dashboardAPI,
};

export default API;
