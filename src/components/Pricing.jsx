import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'الباقة الأساسية',
      price: '350',
      period: 'يبدأ من 50 ضيف',
      icon: '🎯',
      color: 'from-primary to-primary-dark',
      badge: '',
      features: [
        'دعوة تجريبية قبل المناسبة',
        'اختيار تصميم جاهز (40 تصميم)',
        'إرسال الدعوات عبر الواتساب',
        'تأكيد حضور فوري',
        'متابعة الضيوف في الوقت الفعلي',
        'رسالة تذكيرية قبل المناسبة',
        'إحصائية قائمة المدعوين',
        '3 أيام عمل من استلام التفاصيل'
      ],
      priceList: [
        { guests: 50, price: 350, perGuest: 7 },
        { guests: 100, price: 700, perGuest: 7 },
        { guests: 150, price: 1050, perGuest: 7 },
        { guests: 200, price: 1400, perGuest: 7 },
        { guests: 300, price: 2100, perGuest: 7 },
        { guests: 400, price: 2800, perGuest: 7 },
        { guests: 500, price: 3500, perGuest: 7 }
      ],
      popular: false,
      link: '/dashboard?plan=basic'
    },
    {
      id: 'premium',
      name: 'الباقة الشاملة',
      price: '400',
      period: 'يبدأ من 50 ضيف',
      icon: '⭐',
      color: 'from-teal-light to-teal-dark',
      badge: 'الأكثر طلباً',
      features: [
        'دعوة تجريبية قبل المناسبة',
        'تصميم حسب ثيم المناسبة',
        'إرسال الدعوات عبر الواتساب',
        'تأكيد حضور فوري',
        'متابعة الضيوف في الوقت الفعلي',
        'رسالة تذكيرية قبل المناسبة (يوم ويومين)',
        'إحصائية قائمة المدعوين',
        'خاصية الاتصال على المدعوين (3 على الأكثر)',
        'إعداد ملف الأسماء من قبل (جيّة)',
        'قروب الدعم الفني المخصص',
        '8 أيام عمل من استلام التفاصيل'
      ],
      priceList: [
        { guests: 50, price: 400, perGuest: 8 },
        { guests: 100, price: 800, perGuest: 8 },
        { guests: 150, price: 1200, perGuest: 8 },
        { guests: 200, price: 1600, perGuest: 8 },
        { guests: 300, price: 2400, perGuest: 8 },
        { guests: 400, price: 3200, perGuest: 8 },
        { guests: 500, price: 4000, perGuest: 8 }
      ],
      popular: true,
      link: '/dashboard?plan=premium'
    },
    {
      id: 'vip',
      name: 'باقة VIP',
      price: '2400',
      period: 'يبدأ من 300 ضيف',
      icon: '👑',
      color: 'from-primary-medium to-primary',
      badge: '',
      features: [
        'كل ميزات الباقة الشاملة',
        'مدير حساب مخصص',
        'دعم فني 24/7',
        'تقرير مفصل بعد المناسبة',
        'هدايا ترحيبية للضيوف',
        'فريق مشرفين متكامل',
        'تصميم حصري VIP',
        'أولوية في الدعم'
      ],
      priceList: [
        { guests: 300, price: 2400, perGuest: 8 },
        { guests: 400, price: 3200, perGuest: 8 },
        { guests: 500, price: 4000, perGuest: 8 }
      ],
      popular: false,
      link: '/dashboard?plan=vip'
    },
    {
      id: 'corporate',
      name: 'باقة الشركات',
      price: 'مخصص',
      period: 'حسب الطلب',
      icon: '🏢',
      color: 'from-primary-light to-primary-medium',
      badge: 'للشركات',
      features: [
        'حلول مخصصة للشركات',
        'هوية تجارية خاصة',
        'تقارير تحليلية متقدمة',
        'فريق دعم مخصص',
        'تكامل مع أنظمتك',
        'مدير حساب تنفيذي',
        'تدريب للموظفين',
        'دعم فني على مدار الساعة',
        'تخصيص كامل للتصاميم',
        'تقرير شامل بعد كل مناسبة'
      ],
      priceList: [],
      popular: false,
      link: '/contact'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">باقات مرنة تناسب مناسبتك</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">باقات الأسعار</h2>
          <p className="text-primary-light text-sm sm:text-base max-w-2xl mx-auto">اختر الباقة المناسبة لعدد مدعوينك واستمتع بتجربة فاخرة</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-teal-dark scale-105 z-10' : ''}`}>
              {plan.badge && (
                <div className={`absolute top-0 left-0 right-0 ${plan.badge === 'الأكثر طلباً' ? 'bg-gradient-to-r from-teal-light to-teal-dark' : 'bg-gradient-to-r from-primary-light to-primary-medium'} text-white text-center py-1.5 text-xs font-bold z-20`}>
                  {plan.badge === 'الأكثر طلباً' ? '🔥 الأكثر طلباً' : '🏢 للشركات والمؤسسات'}
                </div>
              )}
              
              <div className={`bg-gradient-to-r ${plan.color} p-5 text-white text-center ${plan.badge ? 'pt-10' : ''}`}>
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm shadow-lg">{plan.icon}</div>
                <h3 className="text-xl font-bold mt-3">{plan.name}</h3>
                {plan.price !== 'مخصص' ? (
                  <>
                    <div className="mt-2"><span className="text-3xl font-bold">{plan.price}</span><span className="text-sm"> ر.س</span></div>
                    <p className="text-white/80 text-xs">{plan.period}</p>
                  </>
                ) : (
                  <>
                    <div className="mt-2"><span className="text-2xl font-bold">{plan.price}</span></div>
                    <p className="text-white/80 text-xs">{plan.period}</p>
                  </>
                )}
              </div>

              <div className="p-5">
                {plan.priceList.length > 0 && (
                  <>
                    <button onClick={() => setShowDetails(showDetails === plan.id ? null : plan.id)} className="w-full flex justify-between items-center text-primary hover:text-teal-dark transition mb-3 text-sm">
                      <span>📋 تفاصيل الأسعار</span>
                      <svg className={`w-4 h-4 transition-transform ${showDetails === plan.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showDetails === plan.id && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 animate-fade-in">
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {plan.priceList.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs border-b border-gray-200 pb-1">
                              <span className="text-primary-light">{item.guests} مدعو</span>
                              <span className="text-primary font-bold">{item.price} ر.س</span>
                              <span className="text-xs text-primary-light">≈ {item.perGuest} ر.س/مدعو</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2 mb-4">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-green-500 text-base">✓</span>
                      <span className="text-primary-light">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <details className="text-center text-xs text-primary-light">
                      <summary className="cursor-pointer text-primary hover:text-teal-dark">عرض {plan.features.length - 3} مميزات أخرى +</summary>
                      <div className="mt-2 space-y-1 pt-2 border-t border-gray-100">
                        {plan.features.slice(3).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-green-500 text-base">✓</span>
                            <span className="text-primary-light">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                <Link to={plan.link} className="block w-full bg-gradient-to-r from-primary to-primary-dark text-white py-2.5 rounded-xl text-center text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  {plan.price === 'مخصص' ? 'تواصل معنا' : `اختر ${plan.name}`}
                </Link>
                {plan.id === 'basic' && <p className="text-xs text-primary-light text-center mt-2">* السعر غير شامل مشرف الباركود</p>}
                {plan.id === 'premium' && <p className="text-xs text-primary-light text-center mt-2">* 8 أيام عمل من استلام التفاصيل</p>}
                {plan.id === 'corporate' && <p className="text-xs text-primary-light text-center mt-2">* أسعار خاصة للشركات - تواصل معنا</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-primary-light text-center mt-8"><span className="font-semibold text-primary">ملاحظة:</span> الأسعار غير شاملة ضريبة القيمة المضافة</p>
      </div>
    </section>
  );
};
export default Pricing;
