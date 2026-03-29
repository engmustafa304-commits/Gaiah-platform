import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const ExclusiveService = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { language } = useLanguage();

  const exclusiveFeatures = [
    {
      icon: "👑",
      title: language === 'ar' ? "خدمة VIP حصرية" : "Exclusive VIP Service",
      description: language === 'ar' ? "فريق متخصص يعتني بكل تفاصيل مناسبتك من البداية حتى النهاية" : "A specialized team takes care of every detail of your event from start to finish"
    },
    {
      icon: "🎨",
      title: language === 'ar' ? "تصميم حصري" : "Exclusive Design",
      description: language === 'ar' ? "تصميم دعوات فريد يعكس هويتك وشخصيتك بشكل حصري" : "Unique invitation design that reflects your identity and personality exclusively"
    },
    {
      icon: "🤝",
      title: language === 'ar' ? "مدير حساب مخصص" : "Dedicated Account Manager",
      description: language === 'ar' ? "مدير حساب شخصي لمتابعة مناسبتك خطوة بخطوة" : "Personal account manager to follow up on your event step by step"
    },
    {
      icon: "⚡",
      title: language === 'ar' ? "تنفيذ فائق السرعة" : "Ultra-Fast Execution",
      description: language === 'ar' ? "تنفيذ طلباتك في وقت قياسي مع أعلى معايير الجودة" : "Execute your requests in record time with the highest quality standards"
    },
    {
      icon: "🔒",
      title: language === 'ar' ? "خصوصية تامة" : "Complete Privacy",
      description: language === 'ar' ? "حماية بياناتك وخصوصية مدعويك بأعلى معايير الأمان" : "Protect your data and the privacy of your guests with the highest security standards"
    },
    {
      icon: "🎁",
      title: language === 'ar' ? "هدايا ترحيبية" : "Welcome Gifts",
      description: language === 'ar' ? "هدايا مميزة لضيوفك تعبر عن مدى تقديرك لهم" : "Distinctive gifts for your guests that express your appreciation"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white" id="exclusive">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={cardVariants} className="text-center mb-12">
            <span className="bg-gradient-to-r from-gold-500 to-yellow-500 text-primary px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
              ⭐ {language === 'ar' ? 'خدمة VIP حصرية' : 'Exclusive VIP Service'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {language === 'ar' ? 'لماذا نحن مختلفون؟' : 'Why Are We Different?'}
            </h2>
            <p className="text-primary-light max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نقدم لك تجربة فريدة من نوعها لا تجدها في أي مكان آخر' 
                : 'We offer you a unique experience you won\'t find anywhere else'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exclusiveFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4 inline-block group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-primary-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </motion.div>
            ))}
          </div>

          {/* بطاقة عرض مميزة */}
          <motion.div
            variants={cardVariants}
            className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white text-center max-w-3xl mx-auto"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'عرض حصري للعملاء الجدد' : 'Exclusive Offer for New Clients'}
            </h3>
            <p className="text-gray-200 mb-4">
              {language === 'ar' 
                ? 'احصل على خصم 20% على أول طلب عند الاشتراك في الخدمة الحصرية'
                : 'Get 20% off your first order when subscribing to the exclusive service'}
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              {language === 'ar' ? 'اطلب الخدمة الآن' : 'Order Now'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExclusiveService;