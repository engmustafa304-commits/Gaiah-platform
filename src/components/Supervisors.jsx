import React, { useState } from 'react'

const Supervisors = () => {
  const [selected, setSelected] = useState(null)

  const supervisors = [
    "/images/supervisors/sup1.jpg",
    "/images/supervisors/sup2.jpg",
    "/images/supervisors/sup3.jpg"
  ]

  return (
    <section className="py-16 sm:py-20 bg-white" id="supervisors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            فريقنا المتميز
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            فريق <span className="text-[#004242]">المشرفين</span>
          </h2>
          <p className="text-primary-light text-sm sm:text-base">نخبة من المشرفين المحترفين لضمان نجاح مناسبتك</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {supervisors.map((img, i) => (
            <div key={i} onClick={() => setSelected(img)} className="cursor-pointer group">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <img 
                  src={img} 
                  alt="مشرف" 
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setSelected(null)}>
            <img src={selected} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button className="absolute top-4 right-4 text-white text-3xl sm:text-4xl">✕</button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Supervisors
