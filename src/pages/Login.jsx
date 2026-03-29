import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </h2>
          <p className="mt-2 text-primary-light">
            {language === 'ar' ? 'مرحباً بك في جيّة' : 'Welcome to Gaiah'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-primary text-sm font-semibold mb-2">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
            />
          </div>

          <div>
            <label className="block text-primary text-sm font-semibold mb-2">
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300 disabled:opacity-50"
          >
            {loading 
              ? (language === 'ar' ? 'جاري التسجيل...' : 'Loading...')
              : (language === 'ar' ? 'تسجيل الدخول' : 'Login')
            }
          </button>

          <p className="text-center text-sm text-primary-light">
            {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Sign up'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;