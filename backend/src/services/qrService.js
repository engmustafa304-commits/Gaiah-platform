const QRCode = require('qrcode');
const crypto = require('crypto');

class QRService {
  // إنشاء رمز فريد للباركود
  static generateHash(guestId, eventId) {
    const data = `${guestId}:${eventId}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
  }

  // إنشاء صورة الباركود
  static async generateQRCode(guestId, eventId, hash) {
    const qrData = JSON.stringify({
      guestId,
      eventId,
      hash,
      timestamp: Date.now()
    });

    try {
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#212529',
          light: '#ffffff'
        }
      });
      return qrCodeUrl;
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  }

  // التحقق من صحة الباركود
  static async validateQR(guestId, eventId, hash, db) {
    const guestDoc = await db.collection('guests').doc(guestId).get();
    
    if (!guestDoc.exists) {
      return { valid: false, reason: 'guest_not_found', message: 'الضيف غير موجود' };
    }

    const guest = guestDoc.data();
    
    if (guest.eventId !== eventId) {
      return { valid: false, reason: 'event_mismatch', message: 'خطأ في المناسبة' };
    }

    if (guest.status !== 'confirmed') {
      return { valid: false, reason: 'not_confirmed', message: 'الضيف لم يؤكد حضوره بعد' };
    }

    if (guest.status === 'attended') {
      return { valid: false, reason: 'already_attended', message: 'تم تسجيل الدخول مسبقاً' };
    }

    if (guest.qrCodeHash !== hash) {
      return { valid: false, reason: 'invalid_hash', message: 'باركود غير صالح' };
    }

    return {
      valid: true,
      guest: {
        id: guestId,
        name: guest.name,
        companions: guest.companions || 0,
        phone: guest.phone
      }
    };
  }
}

module.exports = QRService;
