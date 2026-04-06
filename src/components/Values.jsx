import React from 'react';

const Values = () => {
  const visionMission = [
    { icon: "🎯", title: "رؤيتنا", desc: "أن نكون الوجهة الأولى في تصميم الدعوات الإلكترونية في المملكة، معيدين تعريف الضيافة الرقمية بلمسات تحاكي ذوقكم الرفيع", color: "text-teal-light" },
    { icon: "⭐", title: "رسالتنا", desc: "نصمم دعوات إلكترونية راقية وعصرية تعكس هوية كل عميل، ونقدّم تجربة سهلة وسريعة تجمع بين الفخامة والتكنولوجيا", color: "text-teal-medium" }
  ];

  const goals = [
    "تطوير وتنظيم عمليات إدارة المناسبات بشكل مستمر",
    "تسهيل عملية إرسال الدعوات بطريقة سريعة وذكية",
    "توفير خيارات رقمية مبتكرة في عالم الأفراح والمناسبات",
    "الابتكار المستمر في مجال الدعوات الإلكترونية"
  ];

  const coreValues = [
    { name: "حلول رقمية مبتكرة", icon: "💡", color: "from-blue-500 to-blue-600", desc: "نقدم حلولاً تقنية مبتكرة تسهل عملية إدارة الدعوات" },
    { name: "رضا العميل", icon: "😊", color: "from-green-500 to-green-600", desc: "نسعى لتحقيق أعلى درجات رضا عملائنا من خلال جودة خدماتنا" },
    { name: "الشفافية", icon: "🔍", color: "from-yellow-500 to-yellow-600", desc: "نعمل بشفافية تامة مع عملائنا في جميع مراحل العمل" },
    { name: "تجربة عميل سهلة ومريحة", icon: "✨", color: "from-purple-500 to-purple-600", desc: "نوفر تجربة سلسة ومريحة للمستخدمين منذ اللحظة الأولى" }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="values">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">من نحن</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">نبني <span className="gradient-text">مستقبل الدعوات الرقمية</span></h2>
          <p className="text-primary-light text-sm sm:text-base max-w-2xl mx-auto">
            علامة متخصصة في تصميم الدعوات الإلكترونية، تعمل على تحويل كل مناسبة إلى تجربة رقمية متكاملة من خلال فريق إبداعي يؤمن أن لكل مناسبة روحها الخاصة
          </p>
        </div>

        {/* الرؤية والرسالة */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {visionMission.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition border-t-4 border-teal">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${item.color}`}>{item.title}</h3>
              <p className="text-primary-light text-sm sm:text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* الأهداف */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg mb-16">
          <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">🎯 أهدافنا</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {goals.map((goal, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition group">
                <span className="text-teal-light text-2xl group-hover:scale-110 transition">✓</span>
                <span className="text-primary-light">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* القيم */}
        <div>
          <h3 className="text-2xl font-bold text-primary mb-6 text-center">💎 قيمنا</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-center group">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-md group-hover:scale-110 transition`}>
                  {value.icon}
                </div>
                <h4 className="text-lg font-bold text-primary mb-2">{value.name}</h4>
                <p className="text-primary-light text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default Values;
