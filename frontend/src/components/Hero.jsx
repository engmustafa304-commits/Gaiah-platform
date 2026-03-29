import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Hero = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();
  const t = translations[language];

  // اتجاه الحركة يعتمد على اللغة
  const isRTL = language === 'ar';
  
  const fadeInDirection = {
    hidden: { opacity: 0, x: isRTL ? 80 : -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Hero Background" 
          className="w-full h-full object-cover brightness-100 contrast-100"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3';
          }}
        />
        {/* تدرج حسب اتجاه اللغة */}
        <div className={`absolute inset-0 ${
          isRTL 
            ? 'bg-gradient-to-r from-black/40 via-black/20 to-transparent'
            : 'bg-gradient-to-l from-black/40 via-black/20 to-transparent'
        }`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 h-full flex items-end pb-24">
        <div className="container-custom">
          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <motion.div
              ref={ref}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInDirection}
              className={`w-full lg:w-1/2 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <motion.h1
                variants={fadeInDirection}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white"
              >
                {t.hero.title}
                <span className="block text-primary-light">
                  {t.hero.subtitle}
                </span>
              </motion.h1>
              
              <motion.p
                variants={fadeInDirection}
                className="text-lg md:text-xl text-gray-200 mb-8"
              >
                {t.hero.description}
              </motion.p>

              <motion.button
                variants={fadeInDirection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-xl inline-flex items-center gap-2 group"
              >
                {t.hero.cta}
                <svg className={`w-5 h-5 transition-transform group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;