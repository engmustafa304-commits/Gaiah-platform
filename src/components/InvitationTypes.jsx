import React, { useState } from 'react';

const InvitationTypes = () => {
  const [selectedType, setSelectedType] = useState(null);

  const types = [
    {
      id: 1,
      code: "01",
      title: "دعوة مع قبول وإعتذار وكود دخول",
      icon: "🎫",
      color: "from-primary to-primary-dark",
      bg: "bg-gradient-to-br from-gray-50 to-white",
      badge: "الأكثر طلباً",
      description: "دعوة متكاملة تحتوي على زر قبول، زر اعتذار، وكود دخول فريد لكل ضيف",
      features: ["زر قبول الحضور", "زر اعتذار عن الحضور", "كود دخول فريد لكل ضيف", "تتبع الحضور فورياً", "إحصائيات دقيقة", "باركود QR"]
    },
    {
      id: 2,
      code: "02",
      title: "دعوة مع قبول وإعتذار فقط",
      icon: "📝",
      color: "from-primary-dark to-primary-medium",
      bg: "bg-gradient-to-br from-gray-50 to-white",
      badge: "",
      description: "دعوة تفاعلية تحتوي على زر قبول وزر اعتذار فقط بدون كود دخول",
      features: ["زر قبول الحضور", "زر اعتذار عن الحضور", "تأكيد الحضور فوري", "إحصائيات الحضور", "مناسب للمناسبات الصغيرة"]
    },
    {
      id: 3,
      code: "03",
      title: "دعوة مع كود دخول فقط",
      icon: "🔑",
      color: "from-primary-medium to-primary-light",
      bg: "bg-gradient-to-br from-gray-50 to-white",
      badge: "",
      description: "دعوة تحتوي على كود دخول فريد لكل ضيف بدون أزرار قبول/اعتذار",
      features: ["كود دخول فريد لكل ضيف", "مسح الباركود عند الدخول", "تتبع الحضور الفعلي", "مناسب للمناسبات الرسمية", "دخول آمن ومنظم"]
    },
    {
      id: 4,
      code: "04",
      title: "دعوة بدون قبول وإعتذار وبدون كود",
      icon: "📄",
      color: "from-primary-light to-gray-300",
      bg: "bg-gradient-to-br from-gray-50 to-white",
      badge: "بسيط",
      description: "دعوة بسيطة للاطلاع فقط، مناسبة للإعلانات والإشعارات",
      features: ["عرض معلومات المناسبة", "تصميم احترافي", "مشاركة سهلة", "مناسبة للإعلانات", "لا يحتاج تفاعل من الضيف"]
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="invitation-types">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">اختر نوع الدعوة المناسب</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">أنواع الدعوات</h2>
          <p className="text-primary-light text-sm sm:text-base max-w-2xl mx-auto">نقدم لك 4 أنواع مختلفة من الدعوات لتناسب جميع احتياجاتك</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {types.map((type) => (
            <div
              key={type.id}
              onClick={() => setSelectedType(type)}
              className={`relative ${type.bg} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100`}
            >
              {type.badge && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    🔥 {type.badge}
                  </span>
                </div>
              )}
              <div className={`bg-gradient-to-r ${type.color} p-6 text-white text-center`}>
                <div className="text-5xl mb-2">{type.icon}</div>
                <div className="text-3xl font-bold">{type.code}</div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-primary mb-2 text-right">{type.title}</h3>
                <p className="text-primary-light text-xs mb-3 text-right line-clamp-2">{type.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex -space-x-1">
                    {type.features.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs border-2 border-white">✓</div>
                    ))}
                    {type.features.length > 3 && (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs border-2 border-white text-primary-light">
                        +{type.features.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-primary hover:underline">عرض التفاصيل</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal للتفاصيل */}
      {selectedType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedType(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${selectedType.color} p-4 text-white text-center rounded-t-2xl`}>
              <div className="text-5xl mb-2">{selectedType.icon}</div>
              <div className="text-2xl font-bold">{selectedType.code}</div>
              <h3 className="text-lg font-bold mt-2">{selectedType.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-primary-light mb-4">{selectedType.description}</p>
              <h4 className="font-bold text-primary mb-3">المميزات كاملة:</h4>
              <ul className="space-y-2 mb-6">
                {selectedType.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm"><span className="text-green-500 text-lg">✓</span><span className="text-primary-light">{feature}</span></li>
                ))}
              </ul>
              <button onClick={() => setSelectedType(null)} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default InvitationTypes;
