import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: {
      name: '',
      address: ''
    },
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'locationName') {
      setFormData({
        ...formData,
        location: { ...formData.location, name: value }
      });
    } else if (name === 'locationAddress') {
      setFormData({
        ...formData,
        location: { ...formData.location, address: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const eventData = {
        name: formData.name,
        date: formData.date,
        location: formData.location,
        description: formData.description
      };
      await API.events.createEvent(eventData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'فشل إنشاء المناسبة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-primary mb-6">إنشاء مناسبة جديدة</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-primary font-semibold mb-2">اسم المناسبة *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="مثال: حفل زفاف أحمد وسارة"
              />
            </div>

            <div>
              <label className="block text-primary font-semibold mb-2">تاريخ المناسبة *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-primary font-semibold mb-2">اسم الموقع *</label>
              <input
                type="text"
                name="locationName"
                value={formData.location.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="اسم القاعة أو الموقع"
              />
            </div>

            <div>
              <label className="block text-primary font-semibold mb-2">العنوان التفصيلي</label>
              <input
                type="text"
                name="locationAddress"
                value={formData.location.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="العنوان الكامل مع الخريطة"
              />
            </div>

            <div>
              <label className="block text-primary font-semibold mb-2">وصف المناسبة</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="تفاصيل إضافية عن المناسبة..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء المناسبة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
