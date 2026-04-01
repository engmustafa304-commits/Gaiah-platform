import React from 'react'

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* الخلفية */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Hero Background"
          className="w-full h-full object-cover brightness-110 contrast-110"
          style={{ 
            objectPosition: 'center 35%',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552'
          }}
        />

        {/* Gradient احترافي من اليمين */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/50 to-transparent"></div>
      </div>

      {/* المحتوى - يمين تحت مع تحسين للهاتف */}
      <div className="absolute bottom-8 sm:bottom-12 right-4 sm:right-10 md:right-16 z-20 max-w-sm sm:max-w-md md:max-w-xl text-white text-right">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight drop-shadow-2xl">
          حوّل مناسبتك إلى{' '}
          <span className="block text-[#3a7a7a] mt-2">
            تجربة رقمية أنيقة
          </span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 leading-relaxed drop-shadow-md">
          <span className="text-[#6a9a9a] font-semibold">دعوات إلكترونية</span>{' '}
          بتصميم فاخر وتجربة سلسة لضيوفك
        </p>
        <button className="bg-white text-black px-5 sm:px-7 md:px-9 py-2 sm:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold hover:bg-gray-200 transition-all duration-300 shadow-xl hover:scale-105">
          ابدأ الآن
        </button>
      </div>

    </section>
  )
}

export default Hero
