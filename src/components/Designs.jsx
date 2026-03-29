import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Designs = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [activeCategory, setActiveCategory] = useState('men');
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollContainerRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language];

  // 6 صور رجال و 6 صور نساء
  const designs = {
    men: [
      { image: "/images/designs/men1.jpg", title: language === 'ar' ? "رجال - كلاسيك" : "Men - Classic" },
      { image: "/images/designs/men1.jpg", title: language === 'ar' ? "رجال - عصري" : "Men - Modern" },
      { image: "/images/designs/men1.jpg", title: language === 'ar' ? "رجال - فاخر" : "Men - Luxury" },
      { image: "/images/designs/men1.jpg", title: language === 'ar' ? "رجال - أنيق" : "Men - Elegant" },
      { image: "/images/designs/men1.jpg", title: language === 'ar' ? "رجال - بسيط" : "Men - Simple" },
      { image: "/images/designs/men1.jpg", title: language === 'ar' ? "رجال - ملكي" : "Men - Royal" }
    ],
    women: [
      { image: "/images/designs/women1.jpg", title: language === 'ar' ? "نساء - كلاسيك" : "Women - Classic" },
      { image: "/images/designs/women2.jpg", title: language === 'ar' ? "نساء - عصري" : "Women - Modern" },
      { image: "/images/designs/women1.jpg", title: language === 'ar' ? "نساء - فاخر" : "Women - Luxury" },
      { image: "/images/designs/women2.jpg", title: language === 'ar' ? "نساء - أنيق" : "Women - Elegant" },
      { image: "/images/designs/women1.jpg", title: language === 'ar' ? "نساء - بسيط" : "Women - Simple" },
      { image: "/images/designs/women2.jpg", title: language === 'ar' ? "نساء - ملكي" : "Women - Royal" }
    ]
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="section-padding bg-gray-50" id="designs">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={cardVariants} className="text-center mb-12">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
              {language === 'ar' ? 'تصاميم حصرية' : 'Exclusive Designs'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {language === 'ar' ? 'تصاميم الدعوات' : 'Invitation Designs'}
            </h2>
            <p className="text-primary-light max-w-2xl mx-auto">
              {language === 'ar' ? 'اختر من بين تصاميمنا الفاخرة للمناسبات' : 'Choose from our luxurious invitation designs'}
            </p>
          </motion.div>

          {/* تبويب احترافي */}
          <motion.div variants={cardVariants} className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveCategory('men')}
              className={`group relative px-8 py-3 rounded-full font-semibold transition-all duration-300 overflow-hidden ${
                activeCategory === 'men'
                  ? 'text-white'
                  : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
              }`}
            >
              {activeCategory === 'men' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">👨</span>
                {language === 'ar' ? 'رجال' : 'Men'}
              </span>
            </button>
            <button
              onClick={() => setActiveCategory('women')}
              className={`group relative px-8 py-3 rounded-full font-semibold transition-all duration-300 overflow-hidden ${
                activeCategory === 'women'
                  ? 'text-white'
                  : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
              }`}
            >
              {activeCategory === 'women' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">👩</span>
                {language === 'ar' ? 'نساء' : 'Women'}
              </span>
            </button>
          </motion.div>

          {/* صف أفقي مع أزرار تمرير */}
          <div className="relative group">
            {/* زر التمرير لليسار */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-primary text-primary hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* زر التمرير لليمين */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-primary text-primary hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* حاوية التمرير الأفقي */}
            <AnimatePresence mode="wait">
              <div
                key={activeCategory}
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
                  {designs[activeCategory].map((design, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex-shrink-0"
                      style={{ width: '280px' }}
                      onClick={() => setSelectedImage(design.image)}
                    >
                      <div className="relative overflow-hidden h-[320px]">
                        <img
                          src={design.image}
                          alt={design.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/280x320/F8F9FA/6C757D?text=' + encodeURIComponent(design.title);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white text-sm font-bold text-center">{design.title}</h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatePresence>
          </div>

          {/* مؤشر التمرير */}
          <motion.div variants={cardVariants} className="text-center mt-6">
            <p className="text-xs text-primary-light">
              {language === 'ar' ? '↔️ اسحب للتنقل بين التصاميم' : '↔️ Swipe to browse designs'}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            src={selectedImage}
            alt="Design Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors">✕</button>
        </motion.div>
      )}
    </section>
  );
};

export default Designs;