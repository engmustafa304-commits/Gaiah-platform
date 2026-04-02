const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { eventLimiter } = require('../middleware/rateLimiter');
const { checkInvitationLimit } = require('../middleware/subscriptionCheck');
const eventController = require('../controllers/eventController');
const upload = require('../middleware/upload');

// إنشاء مناسبة جديدة
router.post('/', [
  verifyToken,
  checkInvitationLimit,
  body('name').notEmpty().withMessage('اسم المناسبة مطلوب'),
  body('date').isISO8601().withMessage('تاريخ غير صالح'),
  body('location.name').notEmpty().withMessage('الموقع مطلوب')
], eventLimiter, eventController.createEvent);

// جلب جميع المناسبات
router.get('/', verifyToken, eventController.getEvents);

// جلب مناسبة محددة
router.get('/:eventId', verifyToken, eventController.getEventById);

// تحديث مناسبة
router.put('/:eventId', verifyToken, eventController.updateEvent);

// حذف مناسبة
router.delete('/:eventId', verifyToken, eventController.deleteEvent);

// رفع صورة الغلاف
router.post('/:eventId/cover', verifyToken, upload.single('cover'), eventController.uploadCover);

// إحصائيات المناسبة
router.get('/:eventId/stats', verifyToken, eventController.getEventStats);

module.exports = router;
