import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Pricing = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const plans = [
    {
      name: "الباقة الأساسية",
      price: "350",
      priceSub: "يبدأ من 50 ضيف",
      description: "حلول أساسية لمناسبتك - تدير كل شيء بنفسك",
      color: "from-primary to-primary-dark",
      badge: null,
      features: [
        "دعوة تجريبية قبل المناسبة",
        "اختيار تصميم جاهز (40 تصميم)",
        "إرسال الدعوات عبر الواتساب",
        "تأكيد حضور فوري",
        "متابعة الضيوف في الوقت الفعلي",
        "رسالة تذكيرية قبل المناسبة",
        "إحصائية قائمة المدعوين",
        "دعوة تعويضية من إجمالي 25%",
        "3 أيام عمل من استلام التفاصيل"
      ],
      buttonText: "ابدأ الآن",
      buttonColor: "bg-primary hover:bg-primary-dark"
    },
    {
      name: "الباقة الشاملة",
      price: "400",
      priceSub: "يبدأ من 50 ضيف",
      description: "خدمة متكاملة - تتولى كل شيء نيابة عنكم",
      color: "from-primary-dark to-primary-medium",
      badge: "الأكثر طلباً",
      features: [
        "دعوة تجريبية قبل المناسبة",
        "تصميم حسب ثيم المناسبة",
        "إرسال الدعوات عبر الواتساب",
        "تأكيد حضور فوري",
        "متابعة الضيوف في الوقت الفعلي",
        "رسالة تذكيرية قبل المناسبة (يوم ويومين)",
        "إحصائية قائمة المدعوين",
        "خاصية الاتصال على المدعوين (3 على الأكثر)",
        "إعداد ملف الأسماء من قبل (جيّة)",
        "قروب الدعم الفني المخصص",
        "8 أيام عمل من استلام التفاصيل"
      ],
      buttonText: "اطلب الباقة",
      buttonColor: "bg-primary hover:bg-primary-dark"
    },
    {
      name: "خدمة المشرفين",
      price: "460",
      priceSub: "يبدأ من مشرف واحد",
      description: "خدمات احترافية لإدارة المناسبة",
      color: "from-primary-medium to-primary-light",
      badge: "خدمة إضافية",
      features: [
        "تنظيم الدخول",
        "مسح الباركود",
        "زي موحد للفريق",
        "مدة العمل 6 ساعات",
        "مشرف واحد: 460 ر.س",
        "مشرفين: 920 ر.س",
        "3 مشرفين: 1380 ر.س"
      ],
      buttonText: "أضف الخدمة",
      buttonColor: "bg-primary-medium hover:bg-primary"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white" id="pricing">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={cardVariants} className="inline-block mb-4">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              باقات مرنة تناسب مناسبتك
            </span>
          </motion.div>
          
          <motion.h2
            variants={cardVariants}
            className="text-3xl md:text-4xl font-bold mb-4 text-primary"
          >
            باقات الأسعار
          </motion.h2>
          
          <motion.p
            variants={cardVariants}
            className="text-primary-light mb-12 max-w-2xl mx-auto"
          >
            اختر الباقة المناسبة لمناسبتك واستمتع بتجربة فاخرة
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🔥 {plan.badge}
                    </span>
                  </div>
                )}
                
                {/* Header */}
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white text-center`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-1">{plan.price} <span className="text-lg">ر.س</span></div>
                  <p className="text-white/80 text-sm">{plan.priceSub}</p>
                </div>
                
                {/* Description */}
                <div className="px-6 pt-6">
                  <p className="text-primary-light text-sm text-center border-b border-gray-100 pb-4">
                    {plan.description}
                  </p>
                </div>
                
                {/* Features */}
                <div className="flex-1 p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-primary text-lg">✓</span>
                        <span className="text-primary-light">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                {/* Footer */}
                <div className="p-6 pt-0">
                  <button className={`w-full ${plan.buttonColor} text-white py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}>
                    {plan.buttonText}
                  </button>
                  {index === 0 && (
                    <p className="text-xs text-primary-light text-center mt-3">
                      * السعر غير شامل مشرف الباركود
                    </p>
                  )}
                  {index === 1 && (
                    <p className="text-xs text-primary-light text-center mt-3">
                      * 8 أيام عمل من استلام التفاصيل
                    </p>
                  )}
                  {index === 2 && (
                    <p className="text-xs text-primary-light text-center mt-3">
                      * الأسعار غير شاملة ضريبة القيمة المضافة
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ملاحظة إضافية */}
          <motion.div variants={cardVariants} className="mt-12 text-center">
            <p className="text-sm text-primary-light">
              <span className="font-semibold text-primary">للشركات والفعاليات الكبرى:</span> باقات مخصصة حسب الطلب - تواصل معنا للحصول على عرض خاص
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;