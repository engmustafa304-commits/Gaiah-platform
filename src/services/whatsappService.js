class WhatsAppService {
  constructor() {
    this.notConfiguredMessage = 'WhatsApp backend is not configured yet. This will be handled by Firebase Cloud Functions.';
  }

  // إرسال رسالة نصية
  async sendTextMessage(to, message) {
    return {
      success: false,
      error: this.notConfiguredMessage,
      to,
      message
    };
  }

  // إرسال دعوة مناسبة
  async sendInvitation(to, guestName, eventName, invitationLink, eventDate, location) {
    const message = this.generateInvitationMessage(guestName, eventName, invitationLink, eventDate, location);
    return this.sendTextMessage(to, message);
  }

  // إنشاء نص الدعوة
  generateInvitationMessage(guestName, eventName, invitationLink, eventDate, location) {
    return `🎉 *السلام عليكم ورحمة الله وبركاته* 🎉

*${guestName}*، يسرنا دعوتكم لحضور:
✨ *${eventName}* ✨

📅 *التاريخ:* ${new Date(eventDate).toLocaleDateString('ar-SA')}
📍 *الموقع:* ${location.name}
🗺️ *العنوان:* ${location.address || 'سيتم إرساله لاحقاً'}

🔗 *رابط الدعوة:*
${invitationLink}

نأمل تأكيد حضوركم عبر الرابط أعلاه.

نتمنى حضوركم الكريم 🤍`;
  }

  // إرسال تذكير
  async sendReminder(to, guestName, eventName, eventDate, location) {
    const message = `⭐ *تذكير بمناسبة سعيدة* ⭐

السلام عليكم *${guestName}*،

نذكركم بمناسبة:
✨ *${eventName}* ✨

📅 *التاريخ:* ${new Date(eventDate).toLocaleDateString('ar-SA')}
📍 *الموقع:* ${location.name}

نترقب حضوركم الكريم 🤍`;
    return this.sendTextMessage(to, message);
  }

  // إرسال رسالة شكر بعد المناسبة
  async sendThankYou(to, guestName, eventName) {
    const message = `🙏 *شكراً لحضوركم* 🙏

*${guestName}*،

نشكركم على تشريفنا في مناسبة:
✨ *${eventName}* ✨

نسأل الله أن تكون المناسبة من أجمل الذكريات.

دمتم بخير 🤍`;
    return this.sendTextMessage(to, message);
  }

  // إرسال دعوات جماعية (مع تأخير بين الرسائل)
  async bulkSend(guests, eventDetails, delayMs = 1000) {
    const results = [];
    
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      const result = await this.sendInvitation(
        guest.phone,
        guest.name,
        eventDetails.name,
        guest.invitationLink,
        eventDetails.date,
        eventDetails.location
      );
      results.push({ guestId: guest.id, ...result });
      
      // تأخير بين الرسائل لتجنب الحظر
      if (i < guests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    return {
      total: guests.length,
      sent: successCount,
      failed: guests.length - successCount,
      results
    };
  }

  // الحصول على رابط واتساب للإرسال اليدوي
  static getWhatsAppLink(phone, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }
}

export default WhatsAppService;
