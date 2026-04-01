import React, { useState } from 'react'

const Designs = () => {
  const [category, setCategory] = useState('men')
  const [selected, setSelected] = useState(null)

  // ضع صورك الخاصة في مجلد public/images/designs/
  const menImages = [
    "/images/designs/men1.jpg",
    "/images/designs/men2.jpg",
    "/images/designs/men3.jpg",
    "/images/designs/men4.jpg",
    "/images/designs/men5.jpg",
    "/images/designs/men6.jpg"
  ]

  const womenImages = [
    "/images/designs/women1.jpg",
    "/images/designs/women2.jpg",
    "/images/designs/women3.jpg",
    "/images/designs/women4.jpg",
    "/images/designs/women5.jpg",
    "/images/designs/women6.jpg"
  ]

  const images = {
    men: menImages,
    women: womenImages
  }

  return (
    <section className="py-16 sm:py-20 bg-white" id="designs">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            تصاميم حصرية
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            تصاميم <span className="text-[#004242]">الدعوات</span>
          </h2>
          <p className="text-primary-light text-sm sm:text-base">اختر من بين تصاميمنا الفاخرة للمناسبات</p>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <button onClick={() => setCategory('men')} className={`px-5 sm:px-6 py-2 rounded-full text-sm sm:text-base transition ${category === 'men' ? 'bg-[#004242] text-white shadow-md' : 'bg-gray-200 text-primary hover:bg-[#3a7a7a] hover:text-white'}`}>👨 رجال</button>
          <button onClick={() => setCategory('women')} className={`px-5 sm:px-6 py-2 rounded-full text-sm sm:text-base transition ${category === 'women' ? 'bg-[#004242] text-white shadow-md' : 'bg-gray-200 text-primary hover:bg-[#3a7a7a] hover:text-white'}`}>👩 نساء</button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide justify-start">
          {images[category].map((img, i) => (
            <div key={i} onClick={() => setSelected(img)} className="flex-shrink-0 w-56 sm:w-64 cursor-pointer group">
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                <img 
                  src={img} 
                  alt="تصميم" 
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x500/F8F9FA/6C757D?text=صورة' }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-primary-light mt-4 text-center block sm:hidden">↔️ اسحب للتنقل بين التصاميم</p>

        {selected && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setSelected(null)}>
            <img src={selected} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button className="absolute top-4 right-4 text-white text-3xl sm:text-4xl hover:text-gray-300">✕</button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Designs
