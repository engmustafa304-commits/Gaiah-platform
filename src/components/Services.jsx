import React from 'react'

const Services = () => {
  const services = [
    { icon: "🎨", title: "تصميم دعوات إلكترونية", desc: "تصاميم فاخرة تناسب مناسبتك", color: "#3a7a7a" },
    { icon: "💬", title: "إرسال الدعوات عبر واتساب", desc: "وصول سريع ومباشر للضيوف", color: "#1e5e5e" },
    { icon: "✅", title: "تأكيد الحضور", desc: "نظام متكامل لتأكيد الحضور", color: "#004242" },
    { icon: "📊", title: "إحصائيات المدعوين", desc: "تقارير دقيقة ومتابعة لحضور الضيوف", color: "#6a9a9a" }
  ]

  return (
    <section className="py-20 bg-white" id="services">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          خدماتنا
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">ماذا نقدم لك؟</h2>
        <p className="text-primary-light mb-12">نقدم لك مجموعة متكاملة من الخدمات</p>
        <div className="grid md:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all text-center group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform" style={{ color: s.color }}>{s.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-2">{s.title}</h3>
              <p className="text-primary-light text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
