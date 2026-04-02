const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  // إرسال دعوة عبر واتساب
  async sendInvitation(phoneNumber, guestName, eventName, invitationLink, eventDate, location) {
    const message = `🎉 *السلام عليكم ورحمة الله وبركاته* 🎉

*${guestName}*، يسرنا دعوتكم لحضور:
✨ *${eventName}* ✨

📅 *التاريخ:* ${new Date(eventDate).toLocaleDateString('ar-SA')}
📍 *الموقع:* ${location.name}
🗺️ *العنوان:* ${location.address}

🔗 *رابط الدعوة:*
${invitationLink}

نأمل تأكيد حضوركم عبر الرابط أعلاه.

نتمنى حضوركم الكريم 🤍`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp API error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // إنشاء رابط واتساب للإرسال اليدوي
  static generateWhatsAppLink(phoneNumber, eventName, invitationLink) {
    const message = `مرحباً، أنا أدعوك لحضور ${eventName}\n\nللتأكيد: ${invitationLink}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }
}

module.exports = WhatsAppService;
