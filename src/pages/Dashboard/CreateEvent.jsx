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
        const reader = new FileReader();
        mediaUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(formData.mediaFile);
        });
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
      } else if (result.needUpgrade) {
        showError(result.error);
        setTimeout(() => navigate('/subscription'), 2000);
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
          {user?.subscription?.remainingInvitations <= 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              ⚠️ لا توجد دعوات متبقية. يرجى شراء باقة اشتراك للاستمرار.
            </div>
          )}
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
              <label className="block text-primary font-semibold mb-2">وسائط الدعوة</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediaType"
                    value="image"
                    checked={formData.mediaType === 'image'}
                    onChange={handleChange}
                  />
                  صورة
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediaType"
                    value="video"
                    checked={formData.mediaType === 'video'}
                    onChange={handleChange}
                  />
                  فيديو
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediaType"
                    value="none"
                    checked={formData.mediaType === 'none'}
                    onChange={handleChange}
                  />
                  بدون
                </label>
              </div>

              {formData.mediaType !== 'none' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition" onClick={() => fileInputRef.current.click()}>
                  <input type="file" ref={fileInputRef} accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} className="hidden" />
                  {mediaPreview ? (
                    <div>
                      {formData.mediaType === 'image' ? (
                        <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded object-contain" />
                      ) : (
                        <video src={mediaPreview} controls className="max-h-48 mx-auto rounded" />
                      )}
                      <p className="text-sm text-primary-light mt-2">اضغط لتغيير الملف</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">{formData.mediaType === 'image' ? '🖼️' : '🎬'}</div>
                      <p className="text-primary-light">اضغط لرفع {formData.mediaType === 'image' ? 'صورة' : 'فيديو'} الدعوة</p>
                      <p className="text-xs text-primary-light mt-1">
                        {formData.mediaType === 'image' ? 'يدعم JPG, PNG, WebP' : 'يدعم MP4, MOV, AVI (حد أقصى 50MB)'}
                      </p>
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
              disabled={loading || user?.subscription?.remainingInvitations <= 0}
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
