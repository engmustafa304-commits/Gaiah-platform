import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Register = () => {
  const [formData, setFormData] = useState({ displayName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('كلمة المرور غير متطابقة'); return; }
    setLoading(true);
    const result = await register({ displayName: formData.displayName, email: formData.email, phone: formData.phone, password: formData.password });
    if (result.success) navigate('/dashboard');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gray-50 pt-20">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-primary text-center mb-6">إنشاء حساب</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="الاسم" required className="w-full p-3 border rounded-lg" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="البريد الإلكتروني" required className="w-full p-3 border rounded-lg" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="رقم الجوال" required className="w-full p-3 border rounded-lg" />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="كلمة المرور" required className="w-full p-3 border rounded-lg" />
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="تأكيد كلمة المرور" required className="w-full p-3 border rounded-lg" />
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">{loading ? 'جاري التسجيل...' : 'تسجيل'}</button>
            <p className="text-center mt-4 text-primary-light text-sm">لديك حساب؟ <Link to="/login" className="text-primary">تسجيل الدخول</Link></p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Register;
