import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import API from '../../utils/api';
import Layout from '../../components/Layout';
import LocationPicker from '../../components/Map/LocationPicker';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    locationName: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (locationData) => {
    console.log('Location selected:', locationData);
    setLocation(locationData);
    setFormData(prev => ({
      ...prev,
      locationName: locationData.address || 'موقع محدد'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      showError('الرجاء تحديد موقع المناسبة على الخريطة');
      return;
    }
    
    setLoading(true);
    try {
      await API.events.create({
        name: formData.name,
        date: formData.date,
        location: {
          name: formData.locationName,
          address: location.address,
          coordinates: { lat: location.lat, lng: location.lng }
        },
        description: formData.description
      });
      showSuccess('تم إنشاء المناسبة بنجاح');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      showError(error.message || 'فشل إنشاء المناسبة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Toast toast={toast} onClose={() => {}} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">إنشاء مناسبة جديدة</h1>
          <p className="text-primary-light mt-1">أدخل تفاصيل مناسبتك</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-primary font-semibold mb-2">اسم المناسبة *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-primary font-semibold mb-2">موقع المناسبة *</label>
              <LocationPicker onLocationSelect={handleLocationSelect} />
              {location && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ تم تحديد الموقع: {location.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-primary font-semibold mb-2">وصف المناسبة</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
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
    </Layout>
  );
};

export default CreateEvent;
