import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingWhatsApp = ({ phone = '966558576060' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: '',
    guests: '',
    eventDate: '',
    location: '',
    budget: '',
    message: ''
  });
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const eventTypes = [
    { value: 'wedding', label: 'زفاف', icon: '💍' },
    { value: 'engagement', label: 'خطوبة', icon: '💑' },
    { value: 'birthday', label: 'عيد ميلاد', icon: '🎂' },
    { value: 'corporate', label: 'مناسبة شركات', icon: '🏢' },
    { value: 'other', label: 'أخرى', icon: '✨' }
  ];

  const guestRanges = [
    { value: '1-50', label: 'أقل من 50', icon: '👥' },
    { value: '50-150', label: '50 - 150', icon: '👥👤' },
    { value: '150-300', label: '150 - 300', icon: '👥👥' },
    { value: '300+', label: 'أكثر من 300', icon: '👥👥👤' }
  ];

  const budgets = [
    { value: '500-1000', label: '500 - 1000 ر.س', icon: '💰' },
    { value: '1000-2000', label: '1000 - 2000 ر.س', icon: '💰💰' },
    { value: '2000-5000', label: '2000 - 5000 ر.س', icon: '💰💰💰' },
    { value: '5000+', label: 'أكثر من 5000 ر.س', icon: '💎' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const generateServiceMessage = () => {
    return `*📋 طلب خدمة جديد من جيّة*

*👤 معلومات العميل:*
الاسم: ${formData.name || 'غير مدخل'}
رقم الجوال: ${formData.phone || 'غير مدخل'}

*🎉 تفاصيل المناسبة:*
نوع المناسبة: ${eventTypes.find(e => e.value === formData.eventType)?.label || 'غير محدد'}
عدد المدعوين: ${formData.guests || 'غير محدد'}
تاريخ المناسبة: ${formData.eventDate || 'غير محدد'}
الموقع: ${formData.location || 'غير محدد'}

*💰 الميزانية:*
الميزانية المتوقعة: ${formData.budget || 'غير محددة'}

*📝 ملاحظات إضافية:*
${formData.message || 'لا توجد ملاحظات'}`;
  };

  const handleSend = () => {
    const message = generateServiceMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setIsOpen(false);
      setStep(1);
      setFormData({
        name: '', phone: '', eventType: '', guests: '', eventDate: '', location: '', budget: '', message: ''
      });
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xl">📋</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm sm:text-base">طلب خدمة احترافي</h4>
                  <p className="text-xs text-green-100">املأ البيانات وسنرد عليك فوراً</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white text-xl">✕</button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {step === 1 && (
                <>
                  <h5 className="font-bold text-primary mb-3 text-sm">👤 معلوماتك الشخصية</h5>
                  <div className="space-y-3">
                    <input type="text" name="name" placeholder="الاسم *" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                    <input type="tel" name="phone" placeholder="رقم الجوال *" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <button onClick={handleNext} disabled={!formData.name || !formData.phone} className="w-full mt-6 bg-green-500 text-white py-2 rounded-lg">التالي →</button>
                </>
              )}
              {step === 2 && (
                <>
                  <h5 className="font-bold text-primary mb-3 text-sm">🎉 تفاصيل المناسبة</h5>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {eventTypes.map((type) => (
                        <button key={type.value} onClick={() => setFormData({ ...formData, eventType: type.value })} className={`p-2 text-xs rounded-lg border ${formData.eventType === type.value ? 'border-green-500 bg-green-50' : ''}`}>
                          {type.icon} {type.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {guestRanges.map((range) => (
                        <button key={range.value} onClick={() => setFormData({ ...formData, guests: range.value })} className={`p-2 text-xs rounded-lg border ${formData.guests === range.value ? 'border-green-500 bg-green-50' : ''}`}>
                          {range.icon} {range.label}
                        </button>
                      ))}
                    </div>
                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                    <input type="text" name="location" placeholder="الموقع" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleBack} className="flex-1 bg-gray-100 py-2 rounded-lg">رجوع</button>
                    <button onClick={handleNext} className="flex-1 bg-green-500 text-white py-2 rounded-lg">التالي</button>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h5 className="font-bold text-primary mb-3 text-sm">💰 الميزانية</h5>
                  <div className="space-y-2">
                    {budgets.map((budget) => (
                      <button key={budget.value} onClick={() => setFormData({ ...formData, budget: budget.value })} className={`w-full p-3 text-sm rounded-lg border text-right flex items-center gap-3 ${formData.budget === budget.value ? 'border-green-500 bg-green-50' : ''}`}>
                        <span className="text-lg">{budget.icon}</span> {budget.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleBack} className="flex-1 bg-gray-100 py-2 rounded-lg">رجوع</button>
                    <button onClick={handleNext} className="flex-1 bg-green-500 text-white py-2 rounded-lg">التالي</button>
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <h5 className="font-bold text-primary mb-3 text-sm">📝 رسالة إضافية</h5>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="أي تفاصيل إضافية..." className="w-full px-3 py-2 border rounded-lg" />
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleBack} className="flex-1 bg-gray-100 py-2 rounded-lg">رجوع</button>
                    <button onClick={handleSend} disabled={isSent} className="flex-1 bg-green-500 text-white py-2 rounded-lg">{isSent ? '✓ تم الإرسال' : 'إرسال'}</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? <span className="text-xl sm:text-2xl">✕</span> : <span className="text-xl sm:text-2xl">💬</span>}
      </motion.button>
    </div>
  );
};

export default FloatingWhatsApp;
