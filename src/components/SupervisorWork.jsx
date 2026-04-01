import React from 'react'

const SupervisorWork = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-100" id="supervisor-work">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            خدمات احترافية
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            خدمات <span className="text-[#004242]">المشرفين</span>
          </h2>
          <p className="text-primary-light text-sm sm:text-base max-w-2xl mx-auto">
            فريق متخصص لإدارة مناسبتك بأعلى مستوى من الاحترافية
          </p>
        </div>

        {/* صورة متجاوبة مع جميع الأجهزة */}
        <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <picture>
            {/* صورة للهاتف (أصغر) */}
            <source 
              media="(max-width: 640px)" 
              srcSet="/images/supervisor-work/cover-mobile.jpg"
            />
            {/* صورة للتابلت */}
            <source 
              media="(max-width: 1024px)" 
              srcSet="/images/supervisor-work/cover-tablet.jpg"
            />
            {/* صورة للكمبيوتر (الأصلية) */}
            <source 
              media="(min-width: 1025px)" 
              srcSet="/images/supervisor-work/cover.jpg"
            />
            <img 
              src="/images/supervisor-work/cover.jpg" 
              alt="خدمات المشرفين" 
              className="w-full h-auto object-cover"
              style={{ 
                maxHeight: '350px',
                objectPosition: 'center 30%'
              }}
              onError={(e) => { 
                e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=500&fit=crop' 
              }}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-100/20 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  )
}

export default SupervisorWork
