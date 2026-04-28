import React from 'react'

const Pricing = () => {
  const plans = [
    {
      planId: "basic",
      name: "الباقة الأساسية",
      price: "350",
      period: "يبدأ من 50 ضيف",
      icon: "🎯",
      features: ["دعوة تجريبية", "اختيار تصميم جاهز (40 تصميم)", "إرسال الدعوات عبر واتساب", "تأكيد حضور فوري", "متابعة الضيوف في الوقت الفعلي", "إحصائية قائمة المدعوين"],
      priceList: [{ guests: 50, price: 350 }, { guests: 100, price: 700 }, { guests: 150, price: 1050 }, { guests: 200, price: 1400 }, { guests: 300, price: 2100 }, { guests: 400, price: 2800 }, { guests: 500, price: 3500 }]
    },
    {
      planId: "standard",
      name: "الباقة المتوسطة",
      price: "800",
      period: "يبدأ من 100 ضيف",
      icon: "📈",
      features: ["دعوة تجريبية", "تصميم حسب الطلب", "إرسال الدعوات عبر واتساب", "تأكيد حضور فوري", "متابعة الضيوف", "إحصائية قائمة المدعوين"],
      priceList: [{ guests: 100, price: 800 }, { guests: 150, price: 1200 }, { guests: 200, price: 1600 }, { guests: 300, price: 2400 }, { guests: 400, price: 3200 }, { guests: 500, price: 4000 }]
    },
    {
      planId: "premium",
      name: "الباقة الشاملة",
      price: "400",
      period: "يبدأ من 50 ضيف",
      icon: "⭐",
      popular: true,
      features: ["دعوة تجريبية", "تصميم حسب ثيم المناسبة", "إرسال الدعوات عبر واتساب", "تأكيد حضور فوري", "متابعة الضيوف", "رسالة تذكيرية", "إحصائية", "خاصية الاتصال على المدعوين", "إعداد ملف الأسماء"],
      priceList: [{ guests: 50, price: 400 }, { guests: 100, price: 800 }, { guests: 150, price: 1200 }, { guests: 200, price: 1600 }, { guests: 300, price: 2400 }, { guests: 400, price: 3200 }, { guests: 500, price: 4000 }]
    },
    {
      planId: "vip",
      name: "باقة VIP",
      price: "2400",
      period: "يبدأ من 300 ضيف",
      icon: "👑",
      features: ["كل ميزات الباقة الشاملة", "مدير حساب مخصص", "دعم فني 24/7", "تقرير مفصل", "هدايا ترحيبية", "فريق مشرفين متكامل"],
      priceList: [{ guests: 300, price: 2400 }, { guests: 400, price: 3200 }, { guests: 500, price: 4000 }]
    },
    {
      planId: "enterprise",
      name: "باقة الشركات",
      price: "مخصص",
      period: "حسب الطلب",
      icon: "🏢",
      features: ["حلول مخصصة للشركات", "هوية تجارية خاصة", "تقارير تحليلية متقدمة", "فريق دعم مخصص", "تكامل مع أنظمتك"],
      priceList: [],
      custom: true
    }
  ]

  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            باقات مرنة
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            باقات <span className="text-[#004242]">الأسعار</span>
          </h2>
          <p className="text-primary-light text-sm sm:text-base">اختر الباقة المناسبة لعدد مدعوينك واستمتع بتجربة فاخرة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${plan.popular ? 'ring-2 ring-[#004242] transform scale-105 z-10' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#3a7a7a] to-[#004242] text-white text-center py-1.5 text-xs font-bold">
                  🔥 الأكثر طلباً
                </div>
              )}
              <div className={`p-5 ${plan.popular ? 'pt-8' : ''}`}>
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-4 text-white text-center">
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {!plan.custom ? (
                    <>
                      <div className="text-2xl font-bold mt-2">{plan.price} <span className="text-sm">ر.س</span></div>
                      <p className="text-gray-300 text-xs">{plan.period}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-xl font-bold mt-2">{plan.price}</div>
                      <p className="text-gray-300 text-xs">{plan.period}</p>
                    </>
                  )}
                </div>
              </div>

              {plan.priceList.length > 0 && (
                <div className="px-5 mb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-bold text-primary mb-2 text-center text-xs">أسعار تفصيلية</h4>
                    <div className="space-y-1">
                      {plan.priceList.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px] border-b border-gray-200 pb-1">
                          <span className="text-primary-light">{item.guests} مدعو</span>
                          <span className="text-primary font-bold">{item.price} ر.س</span>
                        </div>
                      ))}
                      {plan.priceList.length > 3 && (
                        <details className="text-center text-[10px] text-primary-light">
                          <summary className="cursor-pointer">عرض المزيد +</summary>
                          <div className="mt-1 space-y-1">
                            {plan.priceList.slice(3).map((item, i) => (
                              <div key={i} className="flex justify-between text-[10px] border-b border-gray-200 pb-1">
                                <span className="text-primary-light">{item.guests} مدعو</span>
                                <span className="text-primary font-bold">{item.price} ر.س</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-5 mb-4">
                <h4 className="font-bold text-primary mb-2 text-center text-xs">مميزات الباقة</h4>
                <ul className="space-y-1">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-green-500 text-xs">✓</span>
                      <span className="text-primary-light">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <details className="text-center text-[10px] text-primary-light">
                      <summary className="cursor-pointer">عرض المزيد +</summary>
                      <div className="mt-1 space-y-1">
                        {plan.features.slice(4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-green-500 text-xs">✓</span>
                            <span className="text-primary-light">{feature}</span>
                          </li>
                        ))}
                      </div>
                    </details>
                  )}
                </ul>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    window.location.href = plan.custom ? '#exclusive' : `/onboarding/index.html?plan=${plan.planId}`;
                  }}
                  className="w-full bg-gradient-to-r from-[#3a7a7a] to-[#004242] text-white py-2 rounded-lg font-semibold text-xs hover:opacity-90 transition"
                >
                  {plan.custom ? "اطلب عرضاً" : "اختر الباقة"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-primary-light text-center mt-8"><span className="font-semibold text-primary">ملاحظة:</span> الأسعار غير شاملة ضريبة القيمة المضافة</p>
      </div>
    </section>
  )
}

export default Pricing
