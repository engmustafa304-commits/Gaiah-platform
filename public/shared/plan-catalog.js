const PLAN_CATALOG = {
  basic: {
    planId: 'basic',
    name: 'الباقة الأساسية',
    currency: 'SAR',
    features: [
      'دعوة تجريبية',
      'اختيار تصميم جاهز، 40 تصميم',
      'إرسال الدعوات عبر واتساب',
      'تأكيد حضور فوري',
      'متابعة الضيوف في الوقت الفعلي',
      'إحصائية قائمة المدعوين',
    ],
    priceList: [
      { guests: 50, price: 350 },
      { guests: 100, price: 700 },
      { guests: 150, price: 1050 },
      { guests: 200, price: 1400 },
      { guests: 300, price: 2100 },
      { guests: 400, price: 2800 },
      { guests: 500, price: 3500 },
    ],
  },
  standard: {
    planId: 'standard',
    name: 'الباقة المتوسطة',
    currency: 'SAR',
    features: [
      'دعوة تجريبية',
      'تصميم حسب الطلب',
      'إرسال الدعوات عبر واتساب',
      'تأكيد حضور فوري',
      'متابعة الضيوف',
      'إحصائية قائمة المدعوين',
    ],
    priceList: [
      { guests: 100, price: 800 },
      { guests: 150, price: 1200 },
      { guests: 200, price: 1600 },
      { guests: 300, price: 2400 },
      { guests: 400, price: 3200 },
      { guests: 500, price: 4000 },
    ],
  },
  premium: {
    planId: 'premium',
    name: 'الباقة الشاملة',
    currency: 'SAR',
    popular: true,
    features: [
      'دعوة تجريبية',
      'تصميم حسب ثيم المناسبة',
      'إرسال الدعوات عبر واتساب',
      'تأكيد حضور فوري',
      'متابعة الضيوف',
      'رسالة تذكيرية',
      'إحصائية',
      'خاصية الاتصال على المدعوين',
      'إعداد ملف الأسماء',
    ],
    priceList: [
      { guests: 50, price: 400 },
      { guests: 100, price: 800 },
      { guests: 150, price: 1200 },
      { guests: 200, price: 1600 },
      { guests: 300, price: 2400 },
      { guests: 400, price: 3200 },
      { guests: 500, price: 4000 },
    ],
  },
  vip: {
    planId: 'vip',
    name: 'باقة VIP',
    currency: 'SAR',
    features: [
      'كل ميزات الباقة الشاملة',
      'مدير حساب مخصص',
      'دعم فني 24/7',
      'تقرير مفصل',
      'هدايا ترحيبية',
      'فريق مشرفين متكامل',
    ],
    priceList: [
      { guests: 300, price: 2400 },
      { guests: 400, price: 3200 },
      { guests: 500, price: 4000 },
    ],
  },
  enterprise: {
    planId: 'enterprise',
    name: 'باقة الشركات',
    custom: true,
    price: 'custom',
    priceList: [],
  },
};

function getPlanById(planId) {
  return PLAN_CATALOG[planId] || null;
}

function getDefaultGuestCount(planId) {
  const plan = getPlanById(planId);
  return plan && plan.priceList.length ? plan.priceList[0].guests : null;
}

function getPlanPriceTier(planId, guestCount) {
  const plan = getPlanById(planId);
  if (!plan) return null;
  return plan.priceList.find((tier) => tier.guests === Number(guestCount)) || null;
}

function formatPlanPrice(planId, guestCount) {
  const plan = getPlanById(planId);
  const tier = getPlanPriceTier(planId, guestCount);
  if (!plan || !tier) return '';
  return `${tier.price} ${plan.currency}`;
}

export {
  PLAN_CATALOG,
  getPlanById,
  getDefaultGuestCount,
  getPlanPriceTier,
  formatPlanPrice,
};
