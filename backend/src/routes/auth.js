const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

// تسجيل مستخدم جديد
router.post('/register', [
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('displayName').notEmpty().withMessage('الاسم مطلوب'),
  body('phone').notEmpty().withMessage('رقم الجوال مطلوب')
], authLimiter, authController.register);

// تسجيل الدخول
router.post('/login', [
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], authLimiter, authController.login);

// الحصول على بيانات المستخدم
router.get('/me', verifyToken, authController.getMe);

// تحديث الملف الشخصي
router.put('/profile', verifyToken, authController.updateProfile);

// تغيير كلمة المرور
router.post('/change-password', verifyToken, authController.changePassword);

// تسجيل الخروج
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
