import React, { useState, useRef } from 'react';
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
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    locationName: '',
    description: '',
    mediaType: 'image',
    mediaFile: null
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, mediaFile: file });
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
    setFormData(prev => ({
      ...prev,
      locationName: locationData.address || 'موقع محدد'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError('الرجاء تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    
    if (!location) {
      showError('الرجاء تحديد موقع المناسبة على الخريطة');
      return;
    }
    
    setLoading(true);
    try {
      let mediaUrl = '';
      let mediaType = formData.mediaType;
      
      if (formData.mediaFile) {
        // تخزين الصورة كـ base64 مؤقتاً
        const reader = new FileReader();
        mediaUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(formData.mediaFile);
        });
      } else if (formData.mediaType !== 'none') {
        // صورة افتراضية إذا لم يرفع المستخدم صورة
        mediaUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop';
      }
      
      const result = await API.events.create({
        name: formData.name,
        date: formData.date,
        location: {
          name: formData.locationName,
          address: location.address,
          coordinates: { lat: location.lat, lng: location.lng }
        },
        description: formData.description,
        mediaUrl: mediaUrl,
        mediaType: mediaType
      });
      
      if (result.success) {
        showSuccess('تم إنشاء المناسبة بنجاح');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showError(result.error || 'فشل إنشاء المناسبة');
      }
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
          <p className="text-primary-light mt-1">أدخل تفاصيل مناسبتك وحدد الموقع على الخريطة</p>
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
              <label className="block text-primary font-semibold mb-2">صورة الدعوة</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediaType"
                    value="image"
                    checked={formData.mediaType === 'image'}
                    onChange={handleChange}
                  />
                  رفع صورة
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediaType"
                    value="none"
                    checked={formData.mediaType === 'none'}
                    onChange={handleChange}
                  />
                  بدون صورة
                </label>
              </div>

              {formData.mediaType === 'image' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition" onClick={() => fileInputRef.current.click()}>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                  {mediaPreview ? (
                    <div>
                      <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded object-contain" />
                      <p className="text-sm text-primary-light mt-2">اضغط لتغيير الصورة</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-primary-light">اضغط لرفع صورة الدعوة</p>
                      <p className="text-xs text-primary-light mt-1">يدعم JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
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
