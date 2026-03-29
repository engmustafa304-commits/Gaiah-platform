import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const SupervisorWork = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { language } = useLanguage();
  const t = translations[language];

  const supervisorPricing = [
    { count: 1, price: 460, description: language === 'ar' ? "مشرف بوابة" : "Gate Supervisor", guests: "50-100", icon: "👤" },
    { count: 2, price: 920, description: language === 'ar' ? "مشرفين بوابة" : "Gate Supervisors", guests: "100-150", icon: "👥" },
    { count: 3, price: 1380, description: language === 'ar' ? "مشرفين بوابة" : "Gate Supervisors", guests: "150-300", icon: "👥👤" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white" id="supervisor-work">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="space-y-12"
        >
          {/* العنوان */}
          <motion.div variants={itemVariants} className="text-center">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
              {language === 'ar' ? 'خدمات احترافية' : 'Professional Services'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              {language === 'ar' ? 'خدمات المشرفين' : 'Supervisor Services'}
            </h2>
            <p className="text-primary-light max-w-2xl mx-auto">
              {language === 'ar' ? 'نقدم لك خدمات احترافية لإدارة المناسبة بأعلى مستوى من الجودة' : 'We offer professional services to manage your event with the highest quality'}
            </p>
          </motion.div>

          {/* الصورة - بحجم أصغر وواضح */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <div className="relative max-w-2xl w-full mx-auto rounded-xl overflow-hidden shadow-md group">
              <img
                src="/images/work.jpg"
                alt="Supervisor Work"
                className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                style={{ maxHeight: '320px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x320/F8F9FA/6C757D?text=Supervisor+Work';
                }}
              />
              {/* تدرج خفيف عند hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>

          {/* أسعار المشرفين - بطاقات مدمجة */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {supervisorPricing.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="group text-center p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {item.price} <span className="text-base font-normal text-primary-light">ر.س</span>
                  </div>
                  <div className="text-primary-light font-medium mb-1">{item.description}</div>
                  <div className="text-sm text-gray-400">
                    {language === 'ar' ? `لـ ${item.count} مشرف${item.count > 1 ? 'ين' : ''}` : `For ${item.count} Supervisor${item.count > 1 ? 's' : ''}`}
                  </div>
                  <div className="text-xs text-primary-light mt-2">
                    {language === 'ar' ? `عدد الحضور: ${item.guests} مدعو` : `Guests: ${item.guests}`}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-xs text-primary-light">
                * {language === 'ar' ? 'الأسعار غير شاملة ضريبة القيمة المضافة' : 'Prices are exclusive of VAT'}
              </p>
              <button className="mt-6 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform">
                {language === 'ar' ? 'أضف خدمة المشرفين' : 'Add Supervisor Service'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SupervisorWork;