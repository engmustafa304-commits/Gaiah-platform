import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const Values = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  // البيانات من الملفات
  const vision = {
    title: "رؤيتنا",
    description: "أن نكون الوجهة الأولى في تصميم الدعوات الإلكترونية في المملكة، معيدين تعريف الضيافة الرقمية بلمسات تحاكي ذوقكم الرفيع",
    icon: "🎯"
  };
  const mission = {
    title: "رسالتنا",
    description: "نصمم دعوات إلكترونية راقية وعصرية تعكس هوية كل عميل، ونقدّم تجربة سهلة وسريعة",
    icon: "⭐"
  };
  const goals = [
    "تطوير وتنظيم عمليات إدارة المناسبات بشكل مستمر",
    "تسهيل عملية إرسال الدعوات بطريقة سريعة",
    "توفير خيارات رقمية ذكية في عالم الأفراح والمناسبات",
    "الابتكار المستمر"
  ];
  const valuesList = [
    "حلول رقمية مبتكرة",
    "رضا العميل",
    "الشفافية",
    "تجربة عميل سهلة ومريحة"
  ];

  // عداد متحرك
  const Counter = ({ end, duration = 2, suffix = "" }) => {
    const [count, setCount] = React.useState(0);
    const countRef = useRef(null);
    const isInView = useInView(countRef, { once: true, threshold: 0.5 });

    useEffect(() => {
      if (isInView) {
        let start = 0;
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        return () => clearInterval(timer);
      }
    }, [isInView, end, duration]);

    return <span ref={countRef}>{count}{suffix}</span>;
  };

  const stats = [
    { value: 500, label: "مناسبة ناجحة", suffix: "+" },
    { value: 1000, label: "عميل سعيد", suffix: "+" },
    { value: 50, label: "مشرف محترف", suffix: "+" },
    { value: 99, label: "رضا العملاء", suffix: "%" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="section-padding bg-white" id="values">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={cardVariants}>
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              من نحن
            </span>
          </motion.div>
          <motion.p variants={cardVariants} className="text-xl text-primary-light max-w-3xl mx-auto mt-6 mb-12">
            علامة متخصصة في تصميم الدعوات الإلكترونية، تعمل على تحويل كل مناسبة إلى تجربة رقمية متكاملة من خلال فريق إبداعي يؤمن أن لكل مناسبة روحها الخاصة، وذلك عبر تصميم دعوات إلكترونية لمناسباتكم وفعالياتكم ومنحكم تجربة سلسة وأنيقة.
          </motion.p>

          {/* الرؤية والرسالة */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[vision, mission].map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-primary-light leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* الأهداف والقيم */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div variants={cardVariants} className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-primary mb-6">أهدافنا</h3>
              <ul className="space-y-3 text-right">
                {goals.map((goal, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-primary-light">{goal}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={cardVariants} className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-primary mb-6">قيمنا</h3>
              <div className="grid grid-cols-2 gap-4">
                {valuesList.map((value, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <span className="text-primary-light">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* إحصائيات متحركة */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-primary-light mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Values;