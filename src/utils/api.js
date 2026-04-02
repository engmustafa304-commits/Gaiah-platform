// API Configuration - Mock Version مع تخزين منفصل لكل مناسبة
const STORAGE_KEYS = {
  EVENTS: 'gaiah_events',
  USERS: 'gaiah_users',
  CURRENT_USER: 'gaiah_current_user'
};

// Helper functions
const getCurrentUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

const getEvents = () => {
  const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return events ? JSON.parse(events) : [];
};

const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

const getGuestsForEvent = (eventId) => {
  const guests = localStorage.getItem(`gaiah_guests_${eventId}`);
  return guests ? JSON.parse(guests) : [];
};

const saveGuestsForEvent = (eventId, guests) => {
  localStorage.setItem(`gaiah_guests_${eventId}`, JSON.stringify(guests));
};

// Auth APIs
export const authAPI = {
  register: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
          resolve({ success: false, error: 'البريد الإلكتروني موجود بالفعل' });
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
            totalInvitations: 1,        // دعوة تجريبية واحدة فقط
            usedInvitations: 0,
            remainingInvitations: 1,    // دعوة واحدة متبقية
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active'
          }
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
        
        resolve({ success: true, token: 'mock_token', user: newUser });
      }, 500);
    });
  },
  
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const user = users.find(u => u.email === email);
        if (!user) {
          reject(new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة'));
          return;
        }
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        resolve({ success: true, token: 'mock_token', user });
      }, 500);
    });
  },
  
  getMe: () => {
    const user = getCurrentUser();
    return Promise.resolve({ success: true, user });
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return Promise.resolve({ success: true });
  },
  
  updateProfile: (data) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return Promise.resolve({ success: false, error: 'No user logged in' });
    
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.uid === currentUser.uid);
    if (index !== -1) users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return Promise.resolve({ success: true, user: updatedUser });
  }
};

// Events APIs
export const eventsAPI = {
  getAll: async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: true, events: [] };
    
    const allEvents = getEvents();
    const userEvents = allEvents.filter(e => e.userId === currentUser.uid);
    return { success: true, events: userEvents };
  },
  
  getById: async (id) => {
    const allEvents = getEvents();
    const event = allEvents.find(e => e.id === id);
    if (event) {
      return { success: true, event };
    }
    return { success: false, error: 'Event not found' };
  },
  
  create: async (eventData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }
    
    // التحقق من وجود دعوات متبقية
    if (currentUser.subscription.remainingInvitations <= 0) {
      return { 
        success: false, 
        error: '⚠️ انتهت الدعوات التجريبية. يرجى شراء باقة اشتراك للاستمرار',
        needUpgrade: true 
      };
    }
    
    const allEvents = getEvents();
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      userId: currentUser.uid,
      uniqueLink: Math.random().toString(36).substring(2, 10),
      status: 'draft',
      totalGuests: 0,
      confirmedGuests: 0,
      declinedGuests: 0,
      attendedGuests: 0,
      createdAt: new Date().toISOString()
    };
    
    allEvents.push(newEvent);
    saveEvents(allEvents);
    
    // تحديث عدد الدعوات المستخدمة
    const updatedUser = {
      ...currentUser,
      subscription: {
        ...currentUser.subscription,
        usedInvitations: currentUser.subscription.usedInvitations + 1,
        remainingInvitations: currentUser.subscription.remainingInvitations - 1
      }
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    
    // تحديث في قائمة المستخدمين
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.uid === currentUser.uid);
    if (index !== -1) users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return { success: true, eventId: newEvent.id };
  },
  
  update: async (id, data) => {
    const allEvents = getEvents();
    const index = allEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      allEvents[index] = { ...allEvents[index], ...data, updatedAt: new Date().toISOString() };
      saveEvents(allEvents);
      return { success: true };
    }
    return { success: false, error: 'Event not found' };
  },
  
  delete: async (id) => {
    const allEvents = getEvents();
    const filteredEvents = allEvents.filter(e => e.id !== id);
    saveEvents(filteredEvents);
    localStorage.removeItem(`gaiah_guests_${id}`);
    return { success: true };
  },
  
  getStats: async (id) => {
    const guests = getGuestsForEvent(id);
    return {
      success: true,
      total: guests.length,
      confirmed: guests.filter(g => g.status === 'confirmed').length,
      declined: guests.filter(g => g.status === 'declined').length,
      attended: guests.filter(g => g.status === 'attended').length
    };
  },
  
  updateMedia: async (id, mediaData) => {
    const allEvents = getEvents();
    const index = allEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      allEvents[index] = { ...allEvents[index], ...mediaData };
      saveEvents(allEvents);
      return { success: true };
    }
    return { success: false, error: 'Event not found' };
  }
};

// Guests APIs
export const guestsAPI = {
  getByEvent: async (eventId) => {
    const guests = getGuestsForEvent(eventId);
    return { success: true, guests };
  },
  
  add: async (eventId, guestData) => {
    const guests = getGuestsForEvent(eventId);
    const newGuest = {
      id: Date.now().toString(),
      ...guestData,
      eventId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    guests.push(newGuest);
    saveGuestsForEvent(eventId, guests);
    
    const allEvents = getEvents();
    const eventIndex = allEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      allEvents[eventIndex].totalGuests = guests.length;
      saveEvents(allEvents);
    }
    
    return { success: true, guestId: newGuest.id };
  },
  
  delete: async (guestId) => {
    const allEvents = getEvents();
    for (const event of allEvents) {
      let guests = getGuestsForEvent(event.id);
      const newGuests = guests.filter(g => g.id !== guestId);
      if (newGuests.length !== guests.length) {
        saveGuestsForEvent(event.id, newGuests);
        event.totalGuests = newGuests.length;
        saveEvents(allEvents);
        break;
      }
    }
    return { success: true };
  },
  
  bulkImport: async (eventId, guestsList) => {
    const existingGuests = getGuestsForEvent(eventId);
    const newGuests = guestsList.map(g => ({
      id: Date.now().toString(),
      ...g,
      eventId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));
    const allGuests = [...existingGuests, ...newGuests];
    saveGuestsForEvent(eventId, allGuests);
    
    const allEvents = getEvents();
    const eventIndex = allEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      allEvents[eventIndex].totalGuests = allGuests.length;
      saveEvents(allEvents);
    }
    
    return { success: true, imported: newGuests.length };
  }
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: true, totalEvents: 0, totalGuests: 0, confirmationRate: 0 };
    
    const allEvents = getEvents();
    const userEvents = allEvents.filter(e => e.userId === currentUser.uid);
    
    let totalGuests = 0;
    let confirmedGuests = 0;
    let attendedGuests = 0;
    
    for (const event of userEvents) {
      const guests = getGuestsForEvent(event.id);
      totalGuests += guests.length;
      confirmedGuests += guests.filter(g => g.status === 'confirmed').length;
      attendedGuests += guests.filter(g => g.status === 'attended').length;
    }
    
    const confirmationRate = totalGuests > 0 ? ((confirmedGuests / totalGuests) * 100).toFixed(0) : 0;
    
    return {
      success: true,
      totalEvents: userEvents.length,
      totalGuests,
      confirmedGuests,
      attendedGuests,
      confirmationRate
    };
  },
  
  getRecentEvents: async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: true, events: [] };
    
    const allEvents = getEvents();
    const userEvents = allEvents.filter(e => e.userId === currentUser.uid);
    return { success: true, events: userEvents.slice(0, 5) };
  }
};

// Default export
const API = {
  auth: authAPI,
  events: eventsAPI,
  guests: guestsAPI,
  dashboard: dashboardAPI,
};

export default API;
