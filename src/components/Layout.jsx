import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '📊', label: 'لوحة التحكم', path: '/dashboard', id: 'dashboard' },
    { icon: '📈', label: 'التحليلات', path: '/analytics', id: 'analytics' },
    { icon: '⚙️', label: 'الإعدادات', path: '/settings', id: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 bg-white shadow-sm z-30 lg:mr-64">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            {/* زر العودة للواجهة الرئيسية */}
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium">الرئيسية</span>
            </Link>
            
            <div className="relative">
              <button className="flex items-center gap-2 text-primary hover:text-primary-dark">
                <span className="text-sm font-medium">{user?.displayName || 'مستخدم'}</span>
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                  {user?.displayName?.charAt(0) || 'م'}
                </div>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-primary">جيّة</h2>
          <p className="text-sm text-primary-light mt-1">منصة الدعوات الرقمية</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition mb-1 ${
                location.pathname === item.path 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-primary hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-2 text-primary-light">
            <span>🔔</span>
            <span className="text-sm">الاشتراك: {user?.subscription?.plan || 'مجاني'}</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 lg:mr-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
