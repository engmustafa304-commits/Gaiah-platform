// Mock API - محاكاة كاملة للباكند
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]');
let mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');

const mockAPI = {
  // ========== Auth APIs ==========
  register: async (userData) => {
    await delay(500);
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) throw new Error('البريد الإلكتروني موجود بالفعل');
    const newUser = {
      uid: Date.now().toString(),
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone,
      role: 'client',
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    localStorage.setItem('token', 'mock_token_' + Date.now());
    localStorage.setItem('user', JSON.stringify(newUser));
    return { token: localStorage.getItem('token'), user: newUser };
  },

  login: async (email, password) => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    localStorage.setItem('token', 'mock_token_' + Date.now());
    localStorage.setItem('user', JSON.stringify(user));
    return { token: localStorage.getItem('token'), user };
  },

  getMe: async () => {
    await delay(300);
    const user = localStorage.getItem('user');
    return { user: user ? JSON.parse(user) : null };
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },

  // ========== Events APIs ==========
  getEvents: async () => {
    await delay(300);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userEvents = mockEvents.filter(e => e.userId === currentUser?.uid);
    return { events: userEvents };
  },

  getEventById: async (id) => {
    await delay(300);
    const event = mockEvents.find(e => e.id === id);
    return { event: event || null };
  },

  createEvent: async (eventData) => {
    await delay(500);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const newEvent = {
      id: Date.now().toString(),
      name: eventData.name,
      date: eventData.date,
      location: eventData.location,
      description: eventData.description || '',
      mediaUrl: eventData.mediaUrl || '',
      mediaType: eventData.mediaType || 'image',
      coordinates: eventData.coordinates || null,
      userId: currentUser?.uid,
      uniqueLink: Math.random().toString(36).substring(2, 10),
      status: 'draft',
      totalGuests: 0,
      confirmedGuests: 0,
      declinedGuests: 0,
      attendedGuests: 0,
      notAttendedGuests: 0,
      readMessages: 0,
      noResponseGuests: 0,
      createdAt: new Date().toISOString()
    };
    mockEvents.push(newEvent);
    localStorage.setItem('mock_events', JSON.stringify(mockEvents));
    return { success: true, eventId: newEvent.id };
  },

  updateEvent: async (id, eventData) => {
    await delay(300);
    const index = mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...eventData, updatedAt: new Date().toISOString() };
      localStorage.setItem('mock_events', JSON.stringify(mockEvents));
      return { success: true };
    }
    return { success: false };
  },

  deleteEvent: async (id) => {
    await delay(300);
    mockEvents = mockEvents.filter(e => e.id !== id);
    localStorage.setItem('mock_events', JSON.stringify(mockEvents));
    localStorage.removeItem(`guests_${id}`);
    return { success: true };
  },

  getEventStats: async (id) => {
    await delay(300);
    const event = mockEvents.find(e => e.id === id);
    const guests = JSON.parse(localStorage.getItem(`guests_${id}`) || '[]');
    const confirmed = guests.filter(g => g.status === 'confirmed').length;
    const declined = guests.filter(g => g.status === 'declined').length;
    const attended = guests.filter(g => g.status === 'attended').length;
    const notAttended = guests.filter(g => g.status === 'not_attended').length;
    const readMessages = guests.filter(g => g.readMessage === true).length;
    const noResponse = guests.filter(g => g.status === 'pending').length;
    
    return {
      total: guests.length,
      confirmed,
      declined,
      attended,
      notAttended,
      readMessages,
      noResponse,
      attendanceRate: guests.length > 0 ? ((attended / guests.length) * 100).toFixed(1) : 0,
      confirmationRate: guests.length > 0 ? ((confirmed / guests.length) * 100).toFixed(1) : 0
    };
  },

  // ========== Guests APIs ==========
  getGuests: async (eventId) => {
    await delay(300);
    const guests = JSON.parse(localStorage.getItem(`guests_${eventId}`) || '[]');
    return { guests };
  },

  addGuest: async (eventId, guestData) => {
    await delay(300);
    const guests = JSON.parse(localStorage.getItem(`guests_${eventId}`) || '[]');
    const newGuest = {
      id: Date.now().toString(),
      name: guestData.name,
      phone: guestData.phone,
      email: guestData.email || '',
      companions: guestData.companions || 0,
      eventId,
      status: 'pending',
      readMessage: false,
      createdAt: new Date().toISOString()
    };
    guests.push(newGuest);
    localStorage.setItem(`guests_${eventId}`, JSON.stringify(guests));
    
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      mockEvents[eventIndex].totalGuests = guests.length;
      mockEvents[eventIndex].noResponseGuests = guests.filter(g => g.status === 'pending').length;
      localStorage.setItem('mock_events', JSON.stringify(mockEvents));
    }
    return { success: true, guestId: newGuest.id };
  },

  updateGuestStatus: async (guestId, status) => {
    await delay(300);
    // البحث عن guest في جميع الأحداث
    for (let i = 0; i < mockEvents.length; i++) {
      const event = mockEvents[i];
      let guests = JSON.parse(localStorage.getItem(`guests_${event.id}`) || '[]');
      const guestIndex = guests.findIndex(g => g.id === guestId);
      if (guestIndex !== -1) {
        guests[guestIndex].status = status;
        guests[guestIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(`guests_${event.id}`, JSON.stringify(guests));
        
        // تحديث إحصائيات الحدث
        mockEvents[i].confirmedGuests = guests.filter(g => g.status === 'confirmed').length;
        mockEvents[i].declinedGuests = guests.filter(g => g.status === 'declined').length;
        mockEvents[i].attendedGuests = guests.filter(g => g.status === 'attended').length;
        mockEvents[i].notAttendedGuests = guests.filter(g => g.status === 'not_attended').length;
        mockEvents[i].noResponseGuests = guests.filter(g => g.status === 'pending').length;
        localStorage.setItem('mock_events', JSON.stringify(mockEvents));
        break;
      }
    }
    return { success: true };
  },

  markMessageAsRead: async (guestId) => {
    await delay(200);
    for (let i = 0; i < mockEvents.length; i++) {
      let guests = JSON.parse(localStorage.getItem(`guests_${mockEvents[i].id}`) || '[]');
      const guestIndex = guests.findIndex(g => g.id === guestId);
      if (guestIndex !== -1 && !guests[guestIndex].readMessage) {
        guests[guestIndex].readMessage = true;
        guests[guestIndex].readAt = new Date().toISOString();
        localStorage.setItem(`guests_${mockEvents[i].id}`, JSON.stringify(guests));
        mockEvents[i].readMessages = guests.filter(g => g.readMessage === true).length;
        localStorage.setItem('mock_events', JSON.stringify(mockEvents));
        break;
      }
    }
    return { success: true };
  },

  deleteGuest: async (guestId) => {
    await delay(300);
    for (let i = 0; i < mockEvents.length; i++) {
      const event = mockEvents[i];
      let guests = JSON.parse(localStorage.getItem(`guests_${event.id}`) || '[]');
      const newGuests = guests.filter(g => g.id !== guestId);
      if (newGuests.length !== guests.length) {
        localStorage.setItem(`guests_${event.id}`, JSON.stringify(newGuests));
        mockEvents[i].totalGuests = newGuests.length;
        mockEvents[i].confirmedGuests = newGuests.filter(g => g.status === 'confirmed').length;
        mockEvents[i].declinedGuests = newGuests.filter(g => g.status === 'declined').length;
        mockEvents[i].attendedGuests = newGuests.filter(g => g.status === 'attended').length;
        mockEvents[i].noResponseGuests = newGuests.filter(g => g.status === 'pending').length;
        localStorage.setItem('mock_events', JSON.stringify(mockEvents));
        break;
      }
    }
    return { success: true };
  },

  bulkImportGuests: async (eventId, guestsList) => {
    await delay(1000);
    const existingGuests = JSON.parse(localStorage.getItem(`guests_${eventId}`) || '[]');
    const newGuests = guestsList.map(g => ({
      id: Date.now().toString() + Math.random(),
      name: g.name,
      phone: g.phone,
      email: g.email || '',
      companions: parseInt(g.companions) || 0,
      eventId,
      status: 'pending',
      readMessage: false,
      createdAt: new Date().toISOString()
    }));
    const allGuests = [...existingGuests, ...newGuests];
    localStorage.setItem(`guests_${eventId}`, JSON.stringify(allGuests));
    
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      mockEvents[eventIndex].totalGuests = allGuests.length;
      mockEvents[eventIndex].noResponseGuests = allGuests.filter(g => g.status === 'pending').length;
      localStorage.setItem('mock_events', JSON.stringify(mockEvents));
    }
    return { success: true, imported: newGuests.length };
  },

  // ========== Dashboard APIs ==========
  getDashboardStats: async () => {
    await delay(300);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userEvents = mockEvents.filter(e => e.userId === currentUser?.uid);
    let totalGuests = 0, confirmedGuests = 0, declinedGuests = 0, attendedGuests = 0;
    let notAttendedGuests = 0, readMessages = 0, noResponseGuests = 0;
    
    for (const event of userEvents) {
      const guests = JSON.parse(localStorage.getItem(`guests_${event.id}`) || '[]');
      totalGuests += guests.length;
      confirmedGuests += guests.filter(g => g.status === 'confirmed').length;
      declinedGuests += guests.filter(g => g.status === 'declined').length;
      attendedGuests += guests.filter(g => g.status === 'attended').length;
      notAttendedGuests += guests.filter(g => g.status === 'not_attended').length;
      readMessages += guests.filter(g => g.readMessage === true).length;
      noResponseGuests += guests.filter(g => g.status === 'pending').length;
    }
    
    return {
      totalEvents: userEvents.length,
      totalGuests,
      confirmedGuests,
      declinedGuests,
      attendedGuests,
      notAttendedGuests,
      readMessages,
      noResponseGuests,
      attendanceRate: totalGuests > 0 ? ((attendedGuests / totalGuests) * 100).toFixed(1) : 0,
      confirmationRate: totalGuests > 0 ? ((confirmedGuests / totalGuests) * 100).toFixed(1) : 0
    };
  },

  getRecentEvents: async () => {
    await delay(300);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userEvents = mockEvents.filter(e => e.userId === currentUser?.uid);
    return { events: userEvents.slice(0, 5) };
  }
};

// تصدير واجهات API
export const authAPI = {
  register: (data) => mockAPI.register(data),
  login: (email, password) => mockAPI.login(email, password),
  getMe: () => mockAPI.getMe(),
  logout: () => mockAPI.logout(),
};

export const eventsAPI = {
  getAll: () => mockAPI.getEvents(),
  getById: (id) => mockAPI.getEventById(id),
  create: (data) => mockAPI.createEvent(data),
  update: (id, data) => mockAPI.updateEvent(id, data),
  delete: (id) => mockAPI.deleteEvent(id),
  getStats: (id) => mockAPI.getEventStats(id),
};

export const guestsAPI = {
  getByEvent: (eventId) => mockAPI.getGuests(eventId),
  add: (eventId, data) => mockAPI.addGuest(eventId, data),
  updateStatus: (guestId, status) => mockAPI.updateGuestStatus(guestId, status),
  markAsRead: (guestId) => mockAPI.markMessageAsRead(guestId),
  delete: (guestId) => mockAPI.deleteGuest(guestId),
  bulkImport: (eventId, guestsList) => mockAPI.bulkImportGuests(eventId, guestsList),
};

export const dashboardAPI = {
  getStats: () => mockAPI.getDashboardStats(),
  getRecentEvents: () => mockAPI.getRecentEvents(),
};

const API = { auth: authAPI, events: eventsAPI, guests: guestsAPI, dashboard: dashboardAPI };
export default API;
