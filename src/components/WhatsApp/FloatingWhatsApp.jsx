import React, { useState } from 'react';

const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', eventType: '', guests: '', date: '', location: '', budget: '' });
  const [sent, setSent] = useState(false);

  const eventTypes = [{ value: 'wedding', label: 'زفاف', icon: '💍' }, { value: 'engagement', label: 'خطوبة', icon: '💑' }, { value: 'birthday', label: 'عيد ميلاد', icon: '🎂' }, { value: 'corporate', label: 'مناسبة شركات', icon: '🏢' }, { value: 'other', label: 'أخرى', icon: '✨' }];
  const guestRanges = [{ value: '1-50', label: 'أقل من 50', icon: '👥' }, { value: '50-150', label: '50 - 150', icon: '👥👤' }, { value: '150-300', label: '150 - 300', icon: '👥👥' }, { value: '300+', label: 'أكثر من 300', icon: '👥👥👤' }];
  const budgets = [{ value: '500-1000', label: '500 - 1000 ر.س', icon: '💰' }, { value: '1000-2000', label: '1000 - 2000 ر.س', icon: '💰💰' }, { value: '2000-5000', label: '2000 - 5000 ر.س', icon: '💰💰💰' }, { value: '5000+', label: 'أكثر من 5000 ر.س', icon: '💎' }];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const generateMessage = () => `*📋 طلب خدمة جديد من جيّة*\n\n*👤 معلومات العميل:*\nالاسم: ${formData.name || 'غير مدخل'}\nرقم الجوال: ${formData.phone || 'غير مدخل'}\n\n*🎉 تفاصيل المناسبة:*\nنوع المناسبة: ${eventTypes.find(e => e.value === formData.eventType)?.label || 'غير محدد'}\nعدد المدعوين: ${formData.guests || 'غير محدد'}\nالتاريخ: ${formData.date || 'غير محدد'}\nالموقع: ${formData.location || 'غير محدد'}\n\n*💰 الميزانية:* ${formData.budget || 'غير محددة'}`;

  const handleSend = () => { window.open(`https://wa.me/966558576060?text=${encodeURIComponent(generateMessage())}`, '_blank'); setSent(true); setTimeout(() => { setSent(false); setIsOpen(false); setStep(1); setFormData({}); }, 2000); };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (<div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white flex justify-between items-center"><div><h4 className="font-bold">طلب خدمة احترافي</h4><p className="text-xs">املأ البيانات وسنرد عليك فوراً</p></div><button onClick={() => setIsOpen(false)} className="text-white">✕</button></div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {step === 1 && (<><h5 className="font-bold text-primary mb-3">👤 معلوماتك الشخصية</h5><input type="text" name="name" placeholder="الاسم *" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg mb-3" /><input type="tel" name="phone" placeholder="رقم الجوال *" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded-lg mb-3" /><button onClick={handleNext} disabled={!formData.name || !formData.phone} className="w-full bg-green-500 text-white py-2 rounded-lg">التالي →</button></>)}
          {step === 2 && (<><h5 className="font-bold text-primary mb-3">🎉 تفاصيل المناسبة</h5><div className="grid grid-cols-2 gap-2 mb-3">{eventTypes.map(t => (<button key={t.value} onClick={() => setFormData({ ...formData, eventType: t.value })} className={`p-2 text-xs rounded-lg border ${formData.eventType === t.value ? 'border-green-500 bg-green-50' : ''}`}>{t.icon} {t.label}</button>))}</div><div className="grid grid-cols-2 gap-2 mb-3">{guestRanges.map(r => (<button key={r.value} onClick={() => setFormData({ ...formData, guests: r.value })} className={`p-2 text-xs rounded-lg border ${formData.guests === r.value ? 'border-green-500 bg-green-50' : ''}`}>{r.icon} {r.label}</button>))}</div><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-lg mb-3" /><input type="text" name="location" placeholder="الموقع" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-lg mb-3" /><div className="flex gap-2"><button onClick={handleBack} className="flex-1 bg-gray-100 py-2 rounded-lg">رجوع</button><button onClick={handleNext} className="flex-1 bg-green-500 text-white py-2 rounded-lg">التالي</button></div></>)}
          {step === 3 && (<><h5 className="font-bold text-primary mb-3">💰 الميزانية</h5>{budgets.map(b => (<button key={b.value} onClick={() => setFormData({ ...formData, budget: b.value })} className={`w-full p-2 text-sm rounded-lg border mb-2 text-right flex items-center gap-2 ${formData.budget === b.value ? 'border-green-500 bg-green-50' : ''}`}><span>{b.icon}</span> {b.label}</button>))}<div className="flex gap-2 mt-4"><button onClick={handleBack} className="flex-1 bg-gray-100 py-2 rounded-lg">رجوع</button><button onClick={handleSend} className="flex-1 bg-green-500 text-white py-2 rounded-lg">{sent ? '✓ تم الإرسال' : 'إرسال الطلب'}</button></div></>)}
        </div>
      </div>)}
      <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center"><span className="text-xl">💬</span></button>
    </div>
  );
};
export default FloatingWhatsApp;
