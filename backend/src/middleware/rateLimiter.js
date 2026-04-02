const rateLimit = require('express-rate-limit');

// عام: 100 طلب لكل 15 دقيقة
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'عدد الطلبات كبير جداً. الرجاء المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

// تسجيل الدخول: 5 محاولات لكل 15 دقيقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'محاولات تسجيل دخول كثيرة. الرجاء المحاولة بعد 15 دقيقة' },
  skipSuccessfulRequests: true,
});

// إنشاء مناسبة: 10 لكل ساعة
const eventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'تم إنشاء عدد كبير من المناسبات. الرجاء المحاولة لاحقاً' },
});

// إرسال واتساب: 50 لكل ساعة
const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { error: 'تم إرسال عدد كبير من الرسائل. الرجاء المحاولة لاحقاً' },
});

module.exports = { generalLimiter, authLimiter, eventLimiter, whatsappLimiter };
