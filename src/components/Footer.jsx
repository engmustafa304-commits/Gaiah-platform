import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const t = translations[language];

  const footerLinks = [
    { title: t.footer.quickLinks, links: [
      { name: t.nav.home, href: "#" },
      { name: t.nav.services, href: "#services" },
      { name: t.nav.freeTrial, href: "#free-trial" },
      { name: t.nav.designs, href: "#designs" },
      { name: t.nav.pricing, href: "#pricing" },
      { name: t.nav.values, href: "#values" },
      { name: language === 'ar' ? 'خدمة حصرية' : 'Exclusive Service', href: "#exclusive" }
    ]},
    { title: t.footer.ourServices, links: [
      { name: t.nav.services, href: "#services" },
      { name: language === 'ar' ? "خدمات المشرفين" : "Supervisor Services", href: "#supervisor-work" },
      { name: t.nav.designs, href: "#designs" },
      { name: language === 'ar' ? "خدمة VIP" : "VIP Service", href: "#exclusive" }
    ]}
  ];

  const socialLinks = [
    { name: "Instagram", icon: "📸", url: "https://instagram.com/gaiah_sa", username: "gaiah_sa", bgColor: "hover:bg-gradient-to-tr from-purple-600 to-pink-500" },
    { name: "TikTok", icon: "🎵", url: "https://tiktok.com/@gaiah_sa", username: "gaiah_sa", bgColor: "hover:bg-black" },
    { name: "Snapchat", icon: "👻", url: "https://snapchat.com/add/gaiah_sa", username: "gaiah_sa", bgColor: "hover:bg-yellow-500" },
    { name: "Twitter", icon: "🐦", url: "https://twitter.com/gaiah_sa", username: "gaiah_sa", bgColor: "hover:bg-blue-400" },
    { name: "WhatsApp", icon: "💬", url: "https://wa.me/966558576060", username: "+966 55 857 6060", bgColor: "hover:bg-green-500" }
  ];

  const contactInfo = [
    { icon: "📞", text: "+966 55 857 6060", href: "tel:+966558576060" },
    { icon: "📞", text: "+966 56 244 9856", href: "tel:+966562449856" },
    { icon: "✉️", text: "info@gaiah.sa", href: "mailto:info@gaiah.sa" },
    { icon: "📍", text: language === 'ar' ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia", href: "#" }
  ];

  return (
    <footer className="relative text-white pt-16 pb-8 overflow-hidden bg-gradient-to-b from-primary to-primary-dark">
      <div className="container-custom relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary text-xl font-bold">ج</span>
              </div>
              <h3 className="text-2xl font-bold">Gaiah</h3>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed mb-4">
              {t.footer.description}
            </p>
          </div>

          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-bold mb-4 text-lg">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block transition-transform"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-bold mb-4 text-lg">{language === 'ar' ? 'تابعنا' : 'Follow Us'}</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 group ${social.bgColor}`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{social.icon}</span>
                  <span className="text-xs truncate">{social.username}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/20">
          <div>
            <h4 className="font-bold mb-3 text-lg">{t.footer.contactUs}</h4>
            <div className="space-y-2 text-sm text-gray-200">
              {contactInfo.map((contact, idx) => (
                <a
                  key={idx}
                  href={contact.href}
                  className="flex items-center gap-3 hover:text-white transition-colors group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{contact.icon}</span>
                  <span>{contact.text}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-lg">{t.footer.workingHours}</h4>
            <p className="text-gray-200 text-sm">
              {language === 'ar' ? 'السبت - الخميس: 9ص - 9م' : 'Sat - Thu: 9AM - 9PM'}<br />
              {language === 'ar' ? 'الجمعة: 2م - 9م' : 'Friday: 2PM - 9PM'}
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-gray-300 text-sm">
          <p>© {currentYear} Gaiah. {t.footer.copyright}</p>
          <p className="text-xs mt-2 text-gray-400">{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;