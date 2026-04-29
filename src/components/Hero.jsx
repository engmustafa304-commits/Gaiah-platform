import React from 'react'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">

      {/* الخلفية */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Hero Background"
          className="w-full h-full object-cover brightness-100 contrast-105"
          style={{ objectPosition: 'center 30%' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552'
          }}
        />

        {/* Overlay قوي من جهة النص */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-20 w-full px-6 sm:px-10 lg:px-16 pb-28 sm:pb-32 lg:pb-40">
        <div className="flex justify-start items-end min-h-screen">

          <div className="max-w-xl text-left text-white">

            {/* العنوان */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-2xl">
              حوّل مناسبتك إلى{' '}
              <span className="block text-[#3a7a7a] mt-2 drop-shadow-2xl">
                تجربة رقمية أنيقة
              </span>
            </h1>

            {/* الوصف */}
            <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 leading-relaxed drop-shadow-md">
              <span className="text-[#6a9a9a] font-semibold">
                دعوات إلكترونية
              </span>{' '}
              بتصميم فاخر وتجربة سلسة لضيوفك
            </p>

            {/* زر */}
            <a href="/login/index.html">
              <button className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-all shadow-xl">
                ابدأ الآن
              </button>
            </a>

          </div>

        </div>
      </div>

    </section>
  )
}

export default Hero
