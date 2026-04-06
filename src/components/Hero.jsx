import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden pt-20">
      
      {/* الخلفية */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 640px)" srcSet="/images/hero-mobile.jpg" />
          <source media="(max-width: 1024px)" srcSet="/images/hero-tablet.jpg" />
          <img src="/images/hero-desktop.jpg" alt="Hero Background" className="w-full h-full object-cover" />
        </picture>

        {/* gradient مناسب لليسار */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 pb-16 md:pb-24">
        
        <div className="flex justify-start items-end min-h-screen">
          
          <div className="max-w-xl text-left text-white">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              حوّل مناسبتك إلى{' '}
              <span className="block text-teal-light mt-2">
                تجربة رقمية أنيقة
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 leading-relaxed">
              <span className="text-teal-light font-semibold">
                دعوات إلكترونية
              </span>{' '}
              بتصميم فاخر وتجربة سلسة لضيوفك
            </p>

            <Link 
              to="/register" 
              className="inline-block bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              ابدأ الآن
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
