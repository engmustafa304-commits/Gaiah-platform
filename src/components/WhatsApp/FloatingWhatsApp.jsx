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
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const eventTypes = [
    { value: 'wedding', label: 'زفاف', icon: '💍' },
    { value: 'engagement', label: 'خطوبة', icon: '💑' },
    { value: 'birthday', label: 'عيد ميلاد', icon: '🎂' },
    { value: 'corporate', label: 'مناسبة شركات', icon: '🏢' },
    { value: 'graduation', label: 'تخرج', icon: '🎓' },
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

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

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
${formData.message || 'لا توجد ملاحظات'}

---
تم إرسال الطلب عبر الموقع الإلكتروني - يرجى التواصل مع العميل في أقرب وقت`;
  };

  const handleSend = () => {
    const message = generateServiceMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-6 md:left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 sm:bottom-20 sm:left-0 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ right: 0, left: 'auto' }}
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
              {/* Steps */}
              <div className="flex justify-between mt-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step >= s ? 'bg-white text-green-600' : 'bg-green-400 text-white'
                    }`}>
                      {s}
                    </div>
                    {s < 4 && <div className={`w-8 sm:w-12 h-0.5 mx-1 ${step > s ? 'bg-white' : 'bg-green-400'}`}></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Body - Step 1: المعلومات الشخصية */}
            {step === 1 && (
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <h5 className="font-bold text-primary mb-3 text-sm">👤 معلوماتك الشخصية</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-primary-light mb-1 block">الاسم *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="أدخل اسمك الكامل"
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-primary-light mb-1 block">رقم الجوال *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="05xxxxxxxx"
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  disabled={!formData.name || !formData.phone}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition disabled:opacity-50 text-sm"
                >
                  التالي →
                </button>
              </div>
            )}

            {/* Body - Step 2: تفاصيل المناسبة */}
            {step === 2 && (
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <h5 className="font-bold text-primary mb-3 text-sm">🎉 تفاصيل المناسبة</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-primary-light mb-1 block">نوع المناسبة *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, eventType: type.value })}
                          className={`p-2 text-xs rounded-lg border text-right flex items-center gap-2 ${
                            formData.eventType === type.value
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-primary-light mb-1 block">عدد المدعوين *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {guestRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setFormData({ ...formData, guests: range.value })}
                          className={`p-2 text-xs rounded-lg border text-center ${
                            formData.guests === range.value
                              ? 'border-green-500 bg-green-50 text-green-600'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <span>{range.icon}</span> {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-primary-light mb-1 block">تاريخ المناسبة</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-primary-light mb-1 block">الموقع</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="اسم القاعة أو المدينة"
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 bg-gray-100 text-primary py-2 rounded-lg text-sm">← رجوع</button>
                  <button onClick={handleNext} className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg font-semibold text-sm">التالي →</button>
                </div>
              </div>
            )}

            {/* Body - Step 3: الميزانية */}
            {step === 3 && (
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <h5 className="font-bold text-primary mb-3 text-sm">💰 الميزانية المتوقعة</h5>
                <div className="space-y-2">
                  {budgets.map((budget) => (
                    <button
                      key={budget.value}
                      onClick={() => setFormData({ ...formData, budget: budget.value })}
                      className={`w-full p-3 text-sm rounded-lg border text-right flex items-center gap-3 ${
                        formData.budget === budget.value
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <span className="text-lg">{budget.icon}</span>
                      <span>{budget.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 bg-gray-100 text-primary py-2 rounded-lg text-sm">← رجوع</button>
                  <button onClick={handleNext} className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg font-semibold text-sm">التالي →</button>
                </div>
              </div>
            )}

            {/* Body - Step 4: رسالة إضافية وإرسال */}
            {step === 4 && (
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <h5 className="font-bold text-primary mb-3 text-sm">📝 رسالة إضافية</h5>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="أي تفاصيل إضافية تود إضافتها..."
                  rows="4"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-green-500"
                />
                <div className="bg-gray-50 rounded-lg p-3 mt-4 text-xs text-primary-light">
                  <p className="font-semibold mb-1">📋 ملخص طلبك:</p>
                  <p className="truncate">الاسم: {formData.name || 'غير مدخل'}</p>
                  <p className="truncate">نوع المناسبة: {eventTypes.find(e => e.value === formData.eventType)?.label || 'غير محدد'}</p>
                  <p className="truncate">عدد المدعوين: {formData.guests || 'غير محدد'}</p>
                  <p className="truncate">الميزانية: {formData.budget || 'غير محددة'}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 bg-gray-100 text-primary py-2 rounded-lg text-sm">← رجوع</button>
                  <button
                    onClick={handleSend}
                    disabled={isSent}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition disabled:opacity-50 text-sm"
                  >
                    {isSent ? '✓ تم الإرسال' : '📤 إرسال الطلب'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button - محسن للهاتف */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        {isOpen ? (
          <span className="text-xl sm:text-2xl">✕</span>
        ) : (
          <>
            <span className="text-xl sm:text-2xl">💬</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse"></span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingWhatsApp;
