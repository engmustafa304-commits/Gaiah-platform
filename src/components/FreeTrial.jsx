import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const FreeTrial = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.phone) {
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
      setFormData({ name: '', phone: '' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const features = t.freeTrial.features;

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white" id="free-trial">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="flex justify-center"
        >
          <motion.div variants={cardVariants} className="w-full">
            <div className="text-center mb-8">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                🎁 {t.freeTrial.badge}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mt-6 mb-4">
                {t.freeTrial.title}
              </h2>
              <p className="text-primary-light max-w-2xl mx-auto">
                {t.freeTrial.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Info Card */}
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">{t.freeTrial.cardTitle}</h3>
                  <p className="text-white/80 text-sm">{t.freeTrial.cardSubtitle}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="text-primary text-2xl">✓</span>
                        <span className="text-primary-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-primary-light text-center">
                      <span className="font-semibold text-primary">{t.freeTrial.trialPeriod}</span>
                    </p>
                    <p className="text-xs text-primary-light text-center mt-1">
                      {t.freeTrial.noCard}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Form Card */}
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">{t.freeTrial.formTitle}</h3>
                  <p className="text-white/80 text-sm">{t.freeTrial.formSubtitle}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-primary text-sm font-semibold mb-2">
                        {t.freeTrial.nameLabel}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t.freeTrial.namePlaceholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-primary text-sm font-semibold mb-2">
                        {t.freeTrial.phoneLabel}
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 py-3 border border-gray-200 rounded-xl bg-gray-50">
                          <span className="text-primary-light">+966</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="5xxxxxxxxx"
                          required
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span>📱</span>
                      {t.freeTrial.sendButton}
                    </button>

                    {isSent && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 border border-primary/20 rounded-xl p-3 text-center"
                      >
                        <p className="text-primary text-sm">{t.freeTrial.successMessage}</p>
                      </motion.div>
                    )}

                    <p className="text-xs text-primary-light text-center mt-4">
                      {t.freeTrial.whatsappNote}
                    </p>
                  </div>
                </form>
              </motion.div>
            </div>

            <motion.div variants={cardVariants} className="text-center mt-8">
              <p className="text-sm text-primary-light">
                {t.freeTrial.specialOffer}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FreeTrial;