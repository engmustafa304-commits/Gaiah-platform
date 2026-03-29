import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const InvitationPricing = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center"
        >
          <motion.h2
            variants={cardVariants}
            className="text-3xl md:text-4xl font-bold mb-4 text-primary"
          >
            أسعار الدعوات
          </motion.h2>
          
          <motion.p
            variants={cardVariants}
            className="text-center text-primary-light mb-12 max-w-2xl mx-auto"
          >
            أسعار تنافسية تناسب جميع المناسبات
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">👩</div>
              <h3 className="text-2xl font-bold mb-2 text-primary">دعوة النساء</h3>
              <p className="text-3xl font-bold text-primary">75 ر.س</p>
              <p className="text-primary-light mt-2">للطبعة الواحدة</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">👨</div>
              <h3 className="text-2xl font-bold mb-2 text-primary">دعوة الرجال</h3>
              <p className="text-3xl font-bold text-primary">95 ر.س</p>
              <p className="text-primary-light mt-2">للطبعة الواحدة</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InvitationPricing;