import React from 'react'

const Values = () => {
  const visionMission = [
    { icon: "🎯", title: "رؤيتنا", desc: "أن نكون الوجهة الأولى في تصميم الدعوات الإلكترونية في المملكة، معيدين تعريف الضيافة الرقمية بلمسات تحاكي ذوقكم الرفيع", color: "border-[#3a7a7a]" },
    { icon: "⭐", title: "رسالتنا", desc: "نصمم دعوات إلكترونية راقية وعصرية تعكس هوية كل عميل، ونقدّم تجربة سهلة وسريعة تجمع بين الفخامة والتكنولوجيا", color: "border-[#1e5e5e]" },
    { icon: "💎", title: "قيمنا", desc: "الجودة، الإبداع، الاحترافية، الابتكار، والتميز في تقديم الخدمات بأعلى المعايير", color: "border-[#004242]" }
  ]

  const goals = [
    "تطوير وتنظيم عمليات إدارة المناسبات بشكل مستمر",
    "تسهيل عملية إرسال الدعوات بطريقة سريعة وذكية",
    "توفير خيارات رقمية مبتكرة في عالم الأفراح والمناسبات",
    "الابتكار المستمر في مجال الدعوات الإلكترونية"
  ]

  const coreValues = [
    { name: "حلول رقمية مبتكرة", icon: "💡", color: "#3a7a7a" },
    { name: "رضا العميل", icon: "😊", color: "#1e5e5e" },
    { name: "الشفافية", icon: "🔍", color: "#004242" },
    { name: "تجربة عميل سهلة ومريحة", icon: "✨", color: "#6a9a9a" }
  ]

  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="values">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            من نحن
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            نبني <span className="text-[#004242]">مستقبل الدعوات الرقمية</span>
          </h2>
          <p className="text-primary-light text-sm sm:text-base max-w-2xl mx-auto">
            علامة متخصصة في تصميم الدعوات الإلكترونية، تعمل على تحويل كل مناسبة إلى تجربة رقمية متكاملة من خلال فريق إبداعي يؤمن أن لكل مناسبة روحها الخاصة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {visionMission.map((item, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all border-t-4 ${item.color}`}>
              <div className="text-4xl sm:text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3">{item.title}</h3>
              <p className="text-primary-light text-sm sm:text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <span className="text-3xl">🎯</span> أهدافنا
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#3a7a7a] text-xl sm:text-2xl mt-1">✓</span>
                  <span className="text-primary-light text-sm sm:text-base">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <span className="text-3xl">💎</span> قيمنا
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {coreValues.map((value, i) => (
                <div key={i} className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center hover:shadow-md transition">
                  <div className="text-2xl sm:text-3xl mb-2">{value.icon}</div>
                  <span className="text-primary-light text-xs sm:text-sm">{value.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Values
