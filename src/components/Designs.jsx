import React, { useState, useRef } from 'react';

const Designs = () => {
  const [category, setCategory] = useState('men');
  const scrollRef = useRef(null);

  const menImages = [
    "/images/designs/men1.jpg", "/images/designs/men2.jpg", "/images/designs/men3.jpg",
    "/images/designs/men4.jpg", "/images/designs/men5.jpg", "/images/designs/men6.jpg"
  ];
  const womenImages = [
    "/images/designs/women1.jpg", "/images/designs/women2.jpg", "/images/designs/women3.jpg",
    "/images/designs/women4.jpg", "/images/designs/women5.jpg", "/images/designs/women6.jpg"
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white" id="designs">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">تصاميم حصرية</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">تصاميم الدعوات</h2>
        <p className="text-primary-light text-sm sm:text-base mb-8">اختر من بين تصاميمنا الفاخرة للمناسبات</p>
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setCategory('men')} className={`px-6 py-2 rounded-full transition ${category === 'men' ? 'bg-teal-dark text-white shadow-md' : 'bg-gray-200 text-primary'}`}>👨 رجال</button>
          <button onClick={() => setCategory('women')} className={`px-6 py-2 rounded-full transition ${category === 'women' ? 'bg-teal-dark text-white shadow-md' : 'bg-gray-200 text-primary'}`}>👩 نساء</button>
        </div>
        <div className="relative group">
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 hidden md:block"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 hidden md:block"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth"><div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
            {(category === 'men' ? menImages : womenImages).map((img, i) => (<div key={i} className="flex-shrink-0 w-64 cursor-pointer group"><div className="bg-white rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition"><img src={img} alt="تصميم" className="w-full h-80 object-cover group-hover:scale-105 transition duration-500" /></div></div>))}
          </div></div>
        </div>
        <p className="text-xs text-primary-light mt-4 block md:hidden">↔️ اسحب للتنقل بين التصاميم</p>
      </div>
    </section>
  );
};
export default Designs;
