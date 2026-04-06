import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 pt-20">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-primary text-center mb-6">تسجيل الدخول</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required className="w-full p-3 border rounded-lg focus:outline-none focus:border-primary" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required className="w-full p-3 border rounded-lg focus:outline-none focus:border-primary" />
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">{loading ? 'جاري التسجيل...' : 'دخول'}</button>
            <p className="text-center text-primary-light text-sm">ليس لديك حساب؟ <Link to="/register" className="text-primary">إنشاء حساب</Link></p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
