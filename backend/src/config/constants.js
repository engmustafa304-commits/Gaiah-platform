module.exports = {
  // Subscription plans
  PLANS: {
    free: {
      name: 'مجاني',
      invitations: 50,
      events: 1,
      price: 0,
      features: ['basic_invitations', 'qr_code']
    },
    basic: {
      name: 'أساسي',
      invitations: 200,
      events: 5,
      price: 99,
      features: ['basic_invitations', 'qr_code', 'custom_design']
    },
    premium: {
      name: 'مميز',
      invitations: 500,
      events: 20,
      price: 199,
      features: ['whatsapp_api', 'advanced_analytics', 'custom_design']
    },
    vip: {
      name: 'VIP',
      invitations: 2000,
      events: -1, // unlimited
      price: 399,
      features: ['whatsapp_api', 'advanced_analytics', 'custom_design', 'priority_support', 'supervisor_app']
    }
  },
  
  // Guest statuses
  GUEST_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    DECLINED: 'declined',
    ATTENDED: 'attended'
  },
  
  // Event statuses
  EVENT_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    COMPLETED: 'completed'
  },
  
  // User roles
  USER_ROLES: {
    CLIENT: 'client',
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor'
  }
};
