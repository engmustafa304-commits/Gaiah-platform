import React from 'react';

const ExclusiveService = () => {
  const features = [
    { icon: "👑", title: "خدمة VIP", desc: "فريق متخصص يعتني بكل التفاصيل" },
    { icon: "🎨", title: "تصميم حصري", desc: "تصميم دعوات فريد يعكس هويتك" },
    { icon: "⚡", title: "تنفيذ سريع", desc: "تنفيذ طلباتك في وقت قياسي" }
  ];
  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="exclusive">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">⭐ خدمة VIP حصرية</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">لماذا نحن مختلفون؟</h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (<div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg text-center group"><div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition">{f.icon}</div><h3 className="text-base sm:text-lg font-bold text-primary mb-2">{f.title}</h3><p className="text-primary-light text-xs sm:text-sm">{f.desc}</p></div>))}
        </div>
        <div className="mt-8 sm:mt-10 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-5 sm:p-6 text-white max-w-2xl mx-auto"><h3 className="text-lg sm:text-xl font-bold mb-2">عرض حصري للعملاء الجدد</h3><p className="text-sm mb-3">خصم 20% على أول طلب</p><button className="bg-white text-primary px-5 sm:px-6 py-2 rounded-full text-sm font-semibold">اطلب الخدمة</button></div>
      </div>
    </section>
  );
};
export default ExclusiveService;
