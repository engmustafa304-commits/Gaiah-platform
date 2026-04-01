import React from 'react'

const Footer = () => {
  const year = new Date().getFullYear()

  const socialLinks = [
    { icon: "📸", name: "Instagram", url: "https://instagram.com/gaiah_sa", color: "hover:bg-gradient-to-tr from-purple-600 to-pink-500" },
    { icon: "🎵", name: "TikTok", url: "https://tiktok.com/@gaiah_sa", color: "hover:bg-black" },
    { icon: "👻", name: "Snapchat", url: "https://snapchat.com/add/gaiah_sa", color: "hover:bg-yellow-500" },
    { icon: "🐦", name: "Twitter", url: "https://twitter.com/gaiah_sa", color: "hover:bg-blue-400" },
    { icon: "💬", name: "WhatsApp", url: "https://wa.me/966558576060", color: "hover:bg-green-500" }
  ]

  const quickLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "الخدمات", href: "#services" },
    { name: "التصاميم", href: "#designs" },
    { name: "الباقات", href: "#pricing" },
    { name: "قيمنا", href: "#values" }
  ]

  const services = [
    { name: "دعوات إلكترونية", href: "#services" },
    { name: "خدمات المشرفين", href: "#supervisor-work" },
    { name: "تصاميم حصرية", href: "#designs" },
    { name: "خدمة VIP", href: "#exclusive" }
  ]

  const contactInfo = [
    { icon: "📞", text: "+966 55 857 6060", href: "tel:+966558576060" },
    { icon: "📞", text: "+966 56 244 9856", href: "tel:+966562449856" },
    { icon: "✉️", text: "info@gaiah.sa", href: "mailto:info@gaiah.sa" },
    { icon: "📍", text: "الرياض، المملكة العربية السعودية", href: "#" }
  ]

  return (
    <footer className="bg-gradient-to-b from-primary to-primary-dark text-white pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 sm:mb-12">
          {/* Logo & Description */}
          <div className="text-center sm:text-right">
            <div className="flex justify-center sm:justify-start items-center mb-4">
              <img 
                src="/images/logo/logo.png" 
                alt="Gaiah Logo" 
                className="h-12 w-auto brightness-0 invert"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              علامة متخصصة في تصميم الدعوات الإلكترونية، تعمل على تحويل كل مناسبة إلى تجربة رقمية أنيقة.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-right">
            <h4 className="font-bold text-base sm:text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-gray-300 hover:text-[#3a7a7a] transition-all text-xs sm:text-sm hover:translate-x-1 inline-block">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="text-center sm:text-right">
            <h4 className="font-bold text-base sm:text-lg mb-4">خدماتنا</h4>
            <ul className="space-y-2">
              {services.map((service, idx) => (
                <li key={idx}>
                  <a href={service.href} className="text-gray-300 hover:text-[#3a7a7a] transition-all text-xs sm:text-sm hover:translate-x-1 inline-block">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="text-center sm:text-right">
            <h4 className="font-bold text-base sm:text-lg mb-4">تواصل معنا</h4>
            <div className="space-y-2 mb-4">
              {contactInfo.map((contact, idx) => (
                <a key={idx} href={contact.href} className="flex items-center justify-center sm:justify-start gap-2 text-gray-300 hover:text-white text-xs sm:text-sm">
                  <span className="text-base">{contact.icon}</span>
                  <span>{contact.text}</span>
                </a>
              ))}
            </div>
            <div className="flex justify-center sm:justify-start gap-2 sm:gap-3">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-8 h-8 sm:w-9 sm:h-9 bg-white/10 rounded-full flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110`}
                >
                  <span className="text-sm sm:text-base">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">© {year} جيّة. جميع الحقوق محفوظة</p>
          <p className="text-gray-500 text-[10px] sm:text-xs mt-2">تصميم دعوات إلكترونية فاخرة | منصتك الأولى للدعوات الرقمية</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
