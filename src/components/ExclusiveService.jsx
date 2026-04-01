import React from 'react'

const ExclusiveService = () => {
  const features = [
    { icon: "👑", title: "خدمة VIP حصرية", desc: "فريق متخصص يعتني بكل تفاصيل مناسبتك" },
    { icon: "🎨", title: "تصميم حصري", desc: "تصميم دعوات فريد يعكس هويتك وشخصيتك" },
    { icon: "🤝", title: "مدير حساب مخصص", desc: "مدير حساب شخصي لمتابعة مناسبتك خطوة بخطوة" },
    { icon: "⚡", title: "تنفيذ فائق السرعة", desc: "تنفيذ طلباتك في وقت قياسي" },
    { icon: "🔒", title: "خصوصية تامة", desc: "حماية بياناتك بأعلى معايير الأمان" },
    { icon: "🎁", title: "هدايا ترحيبية", desc: "هدايا مميزة لضيوفك تعبر عن تقديرك" }
  ]

  return (
    <section className="py-20 bg-gray-50" id="exclusive">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-gradient-to-r from-[#3a7a7a] to-[#004242] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
          ⭐ خدمة VIP حصرية
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          لماذا <span className="text-[#004242]">نحن مختلفون؟</span>
        </h2>
        <p className="text-primary-light mb-12">نقدم لك تجربة فريدة من نوعها لا تجدها في أي مكان آخر</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-bold text-primary mb-3">{f.title}</h3>
              <p className="text-primary-light">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-gradient-to-r from-[#3a7a7a] to-[#004242] rounded-2xl p-8 text-white">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-2xl font-bold mb-2">عرض حصري للعملاء الجدد</h3>
          <p className="mb-4">احصل على خصم 20% على أول طلب عند الاشتراك في الخدمة الحصرية</p>
          <button className="bg-white text-[#004242] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">اطلب الخدمة الآن</button>
        </div>
      </div>
    </section>
  )
}

export default ExclusiveService
