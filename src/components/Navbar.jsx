import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '#' },
    { name: t.nav.services, href: '#services' },
    { name: t.nav.freeTrial, href: '#free-trial' },
    { name: t.nav.designs, href: '#designs' },
    { name: t.nav.pricing, href: '#pricing' },
    { name: t.nav.values, href: '#values' },
    { name: t.nav.contact, href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
            <a href="#" className="flex items-center">
              <img src="/assets/images/logo/logo.png" alt="Gaiah Logo" className="h-12 w-auto" />
            </a>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                className="text-primary hover:text-primary-light transition-colors duration-300 font-medium"
              >
                {link.name}
              </motion.a>
            ))}
            
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="text-primary border border-primary/30 px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-white transition-all duration-300"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-all duration-300"
            >
              {t.nav.startNow}
            </motion.button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 bg-white rounded-xl shadow-lg mt-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 px-4 text-primary hover:text-primary-light hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={toggleLanguage}
              className="block w-full text-right py-2 px-4 text-primary hover:text-primary-light hover:bg-gray-50 transition-colors border-t border-gray-100 mt-2"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
            <button className="w-full mt-2 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-all">
              {t.nav.startNow}
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;