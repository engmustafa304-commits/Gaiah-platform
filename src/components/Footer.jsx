import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  const socialLinks = [
    { icon: "📸", name: "Instagram", url: "https://instagram.com/gaiah_sa", color: "hover:bg-gradient-to-tr from-purple-600 to-pink-500" },
    { icon: "🎵", name: "TikTok", url: "https://tiktok.com/@gaiah_sa", color: "hover:bg-black" },
    { icon: "👻", name: "Snapchat", url: "https://snapchat.com/add/gaiah_sa", color: "hover:bg-yellow-500" },
    { icon: "🐦", name: "Twitter", url: "https://twitter.com/gaiah_sa", color: "hover:bg-blue-400" },
    { icon: "💬", name: "WhatsApp", url: "https://wa.me/966558576060", color: "hover:bg-green-500" }
  ];
  const contactInfo = [
    { icon: "📞", text: "+966 55 857 6060", href: "tel:+966558576060" },
    { icon: "📞", text: "+966 56 244 9856", href: "tel:+966562449856" },
    { icon: "✉️", text: "info@gaiah.sa", href: "mailto:info@gaiah.sa" },
    { icon: "📍", text: "الرياض، المملكة العربية السعودية", href: "#" }
  ];

  return (
    <footer className="bg-gradient-to-b from-primary to-primary-dark text-white pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="text-center sm:text-right"><div className="flex justify-center sm:justify-start mb-4"><img src="/images/logo/logo.png" alt="Gaiah Logo" className="h-12 w-auto brightness-0 invert" onError={(e) => e.target.style.display = 'none'} /></div><p className="text-gray-300 text-sm">علامة متخصصة في تصميم الدعوات الإلكترونية، تعمل على تحويل كل مناسبة إلى تجربة رقمية أنيقة.</p></div>
          <div className="text-center sm:text-right"><h4 className="font-bold text-lg mb-4">روابط سريعة</h4><ul className="space-y-2"><li><a href="/" className="text-gray-300 hover:text-teal-light text-sm">الرئيسية</a></li><li><a href="#services" className="text-gray-300 hover:text-teal-light text-sm">الخدمات</a></li><li><a href="#designs" className="text-gray-300 hover:text-teal-light text-sm">التصاميم</a></li><li><a href="#pricing" className="text-gray-300 hover:text-teal-light text-sm">الباقات</a></li></ul></div>
          <div className="text-center sm:text-right"><h4 className="font-bold text-lg mb-4">خدماتنا</h4><ul className="space-y-2"><li><a href="#services" className="text-gray-300 hover:text-teal-light text-sm">دعوات إلكترونية</a></li><li><a href="#supervisor-work" className="text-gray-300 hover:text-teal-light text-sm">خدمات المشرفين</a></li><li><a href="#designs" className="text-gray-300 hover:text-teal-light text-sm">تصاميم حصرية</a></li><li><a href="#exclusive" className="text-gray-300 hover:text-teal-light text-sm">خدمة VIP</a></li></ul></div>
          <div className="text-center sm:text-right"><h4 className="font-bold text-lg mb-4">تواصل معنا</h4><div className="space-y-2 mb-4">{contactInfo.map((c, i) => (<a key={i} href={c.href} className="flex items-center justify-center sm:justify-start gap-2 text-gray-300 hover:text-white text-sm"><span>{c.icon}</span><span>{c.text}</span></a>))}</div><div className="flex justify-center sm:justify-start gap-3">{socialLinks.map((s, i) => (<a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={`w-9 h-9 bg-white/10 rounded-full flex items-center justify-center ${s.color} transition-all hover:scale-110`}><span className="text-base">{s.icon}</span></a>))}</div></div>
        </div>
        <div className="border-t border-white/20 pt-6 text-center text-gray-400 text-sm"><p>© {year} جيّة. جميع الحقوق محفوظة</p><p className="text-xs mt-2">تصميم دعوات إلكترونية فاخرة | منصتك الأولى للدعوات الرقمية</p></div>
      </div>
    </footer>
  );
};
export default Footer;
