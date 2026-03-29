import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Supervisors = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [selectedImage, setSelectedImage] = useState(null);
  const { language } = useLanguage();
  const t = translations[language];

  const supervisors = [
    { image: "/images/supervisors/organize-door.jpg" },
    { image: "/images/supervisors/organize-door.jpg" },
    { image: "/images/supervisors/organize-door.jpg" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="section-padding bg-gray-50" id="supervisors">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div variants={cardVariants} className="text-center mb-12">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
              {language === 'ar' ? 'فريقنا المتميز' : 'Our Distinguished Team'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {language === 'ar' ? 'فريق المشرفين' : 'Supervisors Team'}
            </h2>
            <p className="text-primary-light max-w-2xl mx-auto">
              {language === 'ar' ? 'نخبة من المشرفين المحترفين لضمان نجاح مناسبتك' : 'Elite professional supervisors to ensure your event\'s success'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {supervisors.map((sup, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -15 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedImage(sup.image)}
              >
                <div className="relative overflow-hidden h-[400px]">
                  <img
                    src={sup.image}
                    alt={`Supervisor ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x500/F8F9FA/6C757D?text=Supervisor+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

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
            alt="Supervisor Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors">✕</button>
        </motion.div>
      )}
    </section>
  );
};

export default Supervisors;