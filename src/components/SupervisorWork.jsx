import React from 'react'

const SupervisorWork = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-100" id="supervisor-work">
      <div className="container mx-auto px-4">
        
        {/* العنوان */}
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

        {/* الصورة */}
        <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl relative">

          <img 
            src="/images/supervisor-work/cover.jpg" 
            alt="خدمات المشرفين" 
            className="w-full aspect-[1200/500] object-cover"
          />

          {/* Overlay خفيف */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

        </div>

      </div>
    </section>
  )
}

export default SupervisorWork