import React, { useState } from 'react';

const FreeTrial = () => {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const features = [
    { icon: "✨", title: "دعوة تجريبية كاملة", desc: "تصميم احترافي يعكس هويتك" },
    { icon: "💬", title: "إرسال مباشر عبر واتساب", desc: "وصول سريع ومباشر للضيوف" },
    { icon: "✅", title: "تأكيد حضور تجريبي", desc: "نظام متكامل للتأكيد" },
    { icon: "🎯", title: "تجربة واجهة المدعوين", desc: "تعرف على تجربة ضيوفك" },
    { icon: "🛡️", title: "دعم فني فوري", desc: "فريق دعم على مدار الساعة" },
    { icon: "📊", title: "تقرير تجريبي شامل", desc: "تحليل كامل للتجربة" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone) { setSent(true); setTimeout(() => setSent(false), 3000); setPhone(''); }
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white" id="free-trial">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block bg-gradient-to-r from-teal-light to-teal-dark text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">🎁 عرض حصري لفترة محدودة</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">جرب خدمتنا مجاناً</h2>
          <p className="text-primary-light text-sm sm:text-base max-w-2xl mx-auto">احصل على دعوة تجريبية كاملة على جوالك خلال دقائق</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-primary mb-4 text-center">مميزات التجربة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
                  <span className="text-2xl">{f.icon}</span>
                  <div><h4 className="font-bold text-primary text-sm">{f.title}</h4><p className="text-primary-light text-xs">{f.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center"><p className="text-sm">مدة التجربة: 14 يوم مجاني</p><p className="text-xs">* بدون بطاقة ائتمان</p></div>
          </div>

          <div className="bg-gradient-to-br from-teal-light to-teal-dark rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-2 text-center">جرب الآن مجاناً</h3>
            <p className="text-center text-sm mb-4">أدخل رقم جوالك لتجربة الدعوة</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm mb-1">الاسم (اختياري)</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="أدخل اسمك" className="w-full px-4 py-2 rounded-lg text-primary bg-white" /></div>
              <div><label className="block text-sm mb-1">رقم الجوال *</label><div className="flex gap-2"><div className="flex items-center px-3 bg-white/20 rounded-lg">+966</div><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5xxxxxxxxx" required className="flex-1 px-4 py-2 rounded-lg text-primary bg-white" /></div></div>
              <button type="submit" className="w-full bg-white text-teal-dark py-2 rounded-lg font-semibold hover:bg-gray-100 transition">📱 إرسال الدعوة</button>
              {sent && <p className="text-green-300 text-center text-sm">✓ تم إرسال الدعوة بنجاح!</p>}
            </form>
            <p className="text-xs text-center mt-4">* سيتم إرسال دعوة تجريبية عبر واتساب</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FreeTrial;
