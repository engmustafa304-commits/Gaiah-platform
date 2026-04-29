import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الخدمات', href: '#services' },
    { name: 'تجربة مجانية', href: '#free-trial' },
    { name: 'التصاميم', href: '#designs' },
    { name: 'الباقات', href: '#pricing' },
    { name: 'قيمنا', href: '#values' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo/logo.png" 
              alt="Gaiah Logo" 
              className="h-12 w-auto"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-primary hover:text-[#004242] transition-colors duration-300 text-sm lg:text-base">
                {link.name}
              </a>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <a href="/dashboard/index.html" className="text-primary hover:text-[#004242] transition-colors">
                  لوحة التحكم
                </a>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <a href="/login/index.html" className="text-primary hover:text-[#004242] transition-colors">
                  تسجيل الدخول
                </a>
                <a
                  href="/register/index.html"
                  className="bg-primary text-white px-5 lg:px-6 py-2 rounded-full hover:bg-primary-dark transition-all"
                >
                  إنشاء حساب
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-xl shadow-lg">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="block py-2 px-4 text-primary hover:bg-gray-50 transition-colors">
                {link.name}
              </a>
            ))}
            {user ? (
              <>
                <a href="/dashboard/index.html" className="block py-2 px-4 text-primary hover:bg-gray-50">لوحة التحكم</a>
                <button onClick={handleLogout} className="block w-full text-right py-2 px-4 text-red-500 hover:bg-gray-50">تسجيل الخروج</button>
              </>
            ) : (
              <>
                <a href="/login/index.html" className="block py-2 px-4 text-primary hover:bg-gray-50">تسجيل الدخول</a>
                <a href="/register/index.html" className="block py-2 px-4 bg-primary text-white mx-4 rounded-lg text-center">إنشاء حساب</a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
