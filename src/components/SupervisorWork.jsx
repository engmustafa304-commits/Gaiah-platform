import React from 'react';

const SupervisorWork = () => {
  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="supervisor-work">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">خدمات احترافية</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">خدمات المشرفين</h2>
        <p className="text-primary-light text-sm sm:text-base mb-8 max-w-2xl mx-auto">نقدم لك خدمات احترافية لإدارة المناسبة بأعلى مستوى من الجودة</p>
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <picture>
            <source media="(max-width: 640px)" srcSet="/images/supervisor-work/cover-mobile.jpg" />
            <source media="(max-width: 1024px)" srcSet="/images/supervisor-work/cover-tablet.jpg" />
            <img src="/images/supervisor-work/cover.jpg" alt="خدمات المشرفين" className="w-full h-auto object-cover" style={{ maxHeight: '500px' }} />
          </picture>
        </div>
      </div>
    </section>
  );
};
export default SupervisorWork;
