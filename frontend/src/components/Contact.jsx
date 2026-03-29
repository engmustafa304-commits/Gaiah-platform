import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const socialLinks = [
    { name: "Instagram", icon: "📸", username: "gaiah_sa", url: "#" },
    { name: "TikTok", icon: "🎵", username: "gaiah_sa", url: "#" },
    { name: "Snapchat", icon: "👻", username: "gaiah_sa", url: "#" },
  ];

  return (
    <section className="section-padding bg-gray-100" id="contact">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary"
          >
            تواصل معنا
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-center text-primary-light mb-12"
          >
            نرحب باستفساراتكم ونسعد بخدمتكم
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">معلومات الاتصال</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold text-primary">الهاتف</p>
                    <a href="tel:+966558576060" className="text-primary-light hover:text-primary">
                      +966 55 857 6060
                    </a>
                    <br />
                    <a href="tel:+966562449856" className="text-primary-light hover:text-primary">
                      +966 56 244 9856
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">وسائل التواصل</h3>
              
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-2xl">{social.icon}</span>
                    <div>
                      <p className="font-semibold text-primary group-hover:text-primary-dark transition-colors">
                        {social.name}
                      </p>
                      <p className="text-primary-light">@{social.username}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;