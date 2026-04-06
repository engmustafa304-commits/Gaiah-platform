import React from 'react';

const Services = () => {
  const services = [
    { icon: "🎨", title: "تصميم دعوات إلكترونية", desc: "تصاميم فاخرة تناسب مناسبتك" },
    { icon: "💬", title: "إرسال الدعوات عبر واتساب", desc: "وصول سريع ومباشر للضيوف" },
    { icon: "✅", title: "تأكيد الحضور", desc: "نظام متكامل لتأكيد الحضور" },
    { icon: "📊", title: "إحصائيات المدعوين", desc: "تقارير دقيقة ومتابعة لحضور الضيوف" }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white" id="services">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">خدماتنا</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">ماذا نقدم لك؟</h2>
        <p className="text-primary-light text-sm sm:text-base mb-10 sm:mb-12 max-w-2xl mx-auto">نقدم لك مجموعة متكاملة من الخدمات</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-md hover:shadow-xl transition text-center group">
              <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition">{s.icon}</div>
              <h3 className="text-base sm:text-lg font-bold text-primary mb-2">{s.title}</h3>
              <p className="text-primary-light text-xs sm:text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Services;
