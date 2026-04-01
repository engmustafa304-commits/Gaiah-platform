import React, { useState } from 'react'

const FreeTrial = () => {
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (phone) {
      setSent(true)
      setTimeout(() => setSent(false), 3000)
      setPhone('')
    }
  }

  const features = [
    { icon: "✨", title: "دعوة تجريبية كاملة", desc: "تصميم احترافي يعكس هويتك" },
    { icon: "💬", title: "إرسال مباشر عبر واتساب", desc: "وصول سريع ومباشر للضيوف" },
    { icon: "✅", title: "تأكيد حضور تجريبي", desc: "نظام متكامل للتأكيد" },
    { icon: "🎯", title: "تجربة واجهة المدعوين", desc: "تعرف على تجربة ضيوفك" },
    { icon: "🛡️", title: "دعم فني فوري", desc: "فريق دعم على مدار الساعة" },
    { icon: "📊", title: "تقرير تجريبي شامل", desc: "تحليل كامل للتجربة" }
  ]

  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="free-trial">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block bg-gradient-to-r from-[#3a7a7a] to-[#004242] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-md">
              🎁 عرض حصري لفترة محدودة
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              جرب <span className="text-[#004242]">خدمتنا</span> مجاناً
            </h2>
            <p className="text-primary-light text-sm sm:text-base">احصل على دعوة تجريبية كاملة على جوالك خلال دقائق</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Features Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-6 text-center">مميزات التجربة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-bold text-primary text-sm">{feature.title}</h4>
                      <p className="text-primary-light text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-primary-light"><span className="font-bold text-primary">مدة التجربة:</span> 14 يوم مجاني</p>
                <p className="text-xs text-primary-light mt-1">* بدون بطاقة ائتمان</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-gradient-to-br from-[#3a7a7a] to-[#004242] rounded-2xl p-6 sm:p-8 shadow-xl text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center">جرب الآن مجاناً</h3>
              <p className="text-gray-200 text-center text-sm mb-6">أدخل رقم جوالك لتجربة الدعوة</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">الاسم (اختياري)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="أدخل اسمك"
                    className="w-full px-4 py-3 rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">رقم الجوال *</label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-4 py-3 bg-white/20 rounded-xl">
                      <span>+966</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5xxxxxxxxx"
                      required
                      className="flex-1 px-4 py-3 rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-white text-[#004242] py-3 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition shadow-lg">
                  📱 إرسال الدعوة
                </button>
                {sent && <p className="text-green-300 text-center text-sm">✓ تم إرسال الدعوة بنجاح! تفقد جوالك</p>}
                <p className="text-xs text-gray-200 text-center">* سيتم إرسال دعوة تجريبية على رقم الجوال عبر واتساب</p>
              </form>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-primary-light text-xs sm:text-sm">
              🎁 <span className="font-semibold text-primary">عرض خاص:</span> أول 100 مشترك يحصلون على خصم 25% على الباقة الشاملة
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FreeTrial
