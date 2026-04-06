import React, { useState } from 'react';

const Supervisors = () => {
  const [selected, setSelected] = useState(null);
  
  const supervisors = [
    { mobile: "/images/supervisors/sup1-mobile.jpg", tablet: "/images/supervisors/sup1-tablet.jpg", desktop: "/images/supervisors/sup1.jpg" },
    { mobile: "/images/supervisors/sup2-mobile.jpg", tablet: "/images/supervisors/sup2-tablet.jpg", desktop: "/images/supervisors/sup2.jpg" },
    { mobile: "/images/supervisors/sup3-mobile.jpg", tablet: "/images/supervisors/sup3-tablet.jpg", desktop: "/images/supervisors/sup3.jpg" }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white" id="supervisors">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">فريقنا المتميز</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">فريق المشرفين</h2>
        <p className="text-primary-light text-sm sm:text-base mb-10 max-w-2xl mx-auto">نخبة من المشرفين المحترفين لضمان نجاح مناسبتك</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {supervisors.map((sup, i) => (
            <div key={i} onClick={() => setSelected(sup.desktop)} className="cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
              <picture>
                <source media="(max-width: 640px)" srcSet={sup.mobile} />
                <source media="(max-width: 1024px)" srcSet={sup.tablet} />
                <img src={sup.desktop} alt="مشرف" className="w-full h-64 sm:h-80 object-cover" />
              </picture>
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setSelected(null)}>
          <img src={selected} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg" />
          <button className="absolute top-4 right-4 text-white text-3xl">✕</button>
        </div>
      )}
    </section>
  );
};
export default Supervisors;
