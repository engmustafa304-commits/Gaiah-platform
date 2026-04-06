import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.events.create(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('حدث خطأ أثناء إنشاء المناسبة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-primary mb-6">إنشاء مناسبة جديدة</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-primary font-semibold mb-2">اسم المناسبة *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" placeholder="مثال: حفل زفاف أحمد وسارة" />
            </div>
            <div>
              <label className="block text-primary font-semibold mb-2">تاريخ المناسبة *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-primary font-semibold mb-2">الموقع *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" placeholder="اسم القاعة أو الموقع" />
            </div>
            <div>
              <label className="block text-primary font-semibold mb-2">وصف المناسبة</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" placeholder="تفاصيل إضافية عن المناسبة..." />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">
              {loading ? 'جاري الإنشاء...' : 'إنشاء المناسبة'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;
