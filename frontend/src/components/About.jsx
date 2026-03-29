import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const About = () => {
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

  return (
    <section className="section-padding bg-white" id="about">
      <div className="container-custom">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="inline-block mb-4"
          >
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              من نحن
            </span>
          </motion.div>
          
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-6 text-primary"
          >
            قصة نجاح
            <span className="block text-primary-light mt-2">
              جيّة
            </span>
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-primary-light leading-relaxed mb-8"
          >
            علامة متخصصة في تصميم الدعوات الإلكترونية، تعمل على تحويل كل مناسبة إلى تجربة رقمية متكاملة تجمع بين الفخامة والسهولة
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-primary-light leading-relaxed"
          >
            نؤمن بأن كل مناسبة تستحق أن تكون ذكرى لا تُنسى، لذلك نقدم لك دعوات إلكترونية بتصاميم فاخرة وتجربة سلسة لضيوفك، مع أحدث التقنيات وأعلى معايير الجودة
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;