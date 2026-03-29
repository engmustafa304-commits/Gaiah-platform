import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Services = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const services = [
    {
      icon: "🎨",
      title: "تصميم دعوات إلكترونية",
      description: "تصاميم فاخرة تناسب مناسبتك",
    },
    {
      icon: "💬",
      title: "إرسال الدعوات عبر واتساب",
      description: "وصول سريع ومباشر للضيوف",
    },
    {
      icon: "✅",
      title: "تأكيد الحضور",
      description: "نظام متكامل لتأكيد الحضور",
    },
    {
      icon: "📊",
      title: "إحصائيات المدعوين",
      description: "تقارير دقيقة ومتابعة لحضور الضيوف",
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
    <section className="section-padding bg-gray-100" id="services">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2
            variants={cardVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary"
          >
            خدماتنا
          </motion.h2>
          
          <motion.p
            variants={cardVariants}
            className="text-center text-primary-light mb-12 max-w-2xl mx-auto"
          >
            نقدم لك مجموعة متكاملة من الخدمات لتجعل مناسبتك لا تُنسى
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-center group"
              >
                <div className="text-5xl mb-4 inline-block p-4 rounded-full bg-gray-100">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">{service.title}</h3>
                <p className="text-primary-light">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;