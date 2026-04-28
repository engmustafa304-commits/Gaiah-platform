class PlanCatalogError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PlanCatalogError";
    this.code = code;
  }
}

const PLAN_CATALOG = {
  basic: {
    planId: "basic",
    name: "الباقة الأساسية",
    currency: "SAR",
    features: [
      "دعوة تجريبية",
      "اختيار تصميم جاهز، 40 تصميم",
      "إرسال الدعوات عبر واتساب",
      "تأكيد حضور فوري",
      "متابعة الضيوف في الوقت الفعلي",
      "إحصائية قائمة المدعوين",
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
    planId: "standard",
    name: "الباقة المتوسطة",
    currency: "SAR",
    features: [
      "دعوة تجريبية",
      "تصميم حسب الطلب",
      "إرسال الدعوات عبر واتساب",
      "تأكيد حضور فوري",
      "متابعة الضيوف",
      "إحصائية قائمة المدعوين",
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
    planId: "premium",
    name: "الباقة الشاملة",
    currency: "SAR",
    popular: true,
    features: [
      "دعوة تجريبية",
      "تصميم حسب ثيم المناسبة",
      "إرسال الدعوات عبر واتساب",
      "تأكيد حضور فوري",
      "متابعة الضيوف",
      "رسالة تذكيرية",
      "إحصائية",
      "خاصية الاتصال على المدعوين",
      "إعداد ملف الأسماء",
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
    planId: "vip",
    name: "باقة VIP",
    currency: "SAR",
    features: [
      "كل ميزات الباقة الشاملة",
      "مدير حساب مخصص",
      "دعم فني 24/7",
      "تقرير مفصل",
      "هدايا ترحيبية",
      "فريق مشرفين متكامل",
    ],
    priceList: [
      { guests: 300, price: 2400 },
      { guests: 400, price: 3200 },
      { guests: 500, price: 4000 },
    ],
  },
  enterprise: {
    planId: "enterprise",
    name: "باقة الشركات",
    currency: "SAR",
    custom: true,
    price: "custom",
    checkoutable: false,
    features: [
      "حلول مخصصة للشركات",
      "هوية تجارية خاصة",
      "تقارير تحليلية متقدمة",
      "فريق دعم مخصص",
      "تكامل مع أنظمتك",
    ],
    priceList: [],
  },
};

function getPlanById(planId) {
  return PLAN_CATALOG[planId] || null;
}

function getPlanPriceTier(planId, guestCount) {
  const plan = getPlanById(planId);
  if (!plan || !Array.isArray(plan.priceList)) {
    return null;
  }

  return plan.priceList.find((tier) => tier.guests === guestCount) || null;
}

function buildTrustedPlanSnapshot(planId, guestCount) {
  const plan = getPlanById(planId);
  if (!plan) {
    throw new PlanCatalogError("unknown-plan", "Unknown plan.");
  }

  if (plan.custom || plan.checkoutable === false) {
    throw new PlanCatalogError("custom-plan", "This plan cannot be requested through checkout.");
  }

  const tier = getPlanPriceTier(planId, guestCount);
  if (!tier) {
    throw new PlanCatalogError("unsupported-guest-count", "Unsupported guest count for selected plan.");
  }

  return {
    planId,
    name: plan.name,
    price: tier.price,
    currency: plan.currency,
    guestCount: tier.guests,
    features: [...plan.features],
    popular: Boolean(plan.popular),
  };
}

module.exports = {
  PLAN_CATALOG,
  getPlanById,
  getPlanPriceTier,
  buildTrustedPlanSnapshot,
};
