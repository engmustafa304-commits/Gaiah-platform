import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import API from '../../utils/api';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, showSuccess, showError } = useToast();
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const eventRes = await API.events.getById(eventId);
      const statsRes = await API.events.getStats(eventId);
      setEvent(eventRes.event);
      setStats(statsRes);
    } catch (error) {
      showError('فشل تحميل بيانات المناسبة');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpdate = async () => {
    if (!mediaFile) {
      showError('الرجاء اختيار ملف');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const mediaUrl = e.target.result;
      await API.events.updateMedia(eventId, { mediaUrl, mediaType });
      setEvent({ ...event, mediaUrl, mediaType });
      showSuccess('تم تحديث وسائط الدعوة بنجاح');
      setShowMediaModal(false);
      setMediaFile(null);
      setMediaPreview(null);
    };
    reader.readAsDataURL(mediaFile);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذه المناسبة؟')) {
      await API.events.delete(eventId);
      showSuccess('تم حذف المناسبة بنجاح');
      navigate('/dashboard');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div>المناسبة غير موجودة</div>;

  return (
    <Layout>
      <Toast toast={toast} onClose={() => {}} />
      
      <div className="mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline mb-2 inline-block">
          ← العودة إلى لوحة التحكم
        </button>
        <h1 className="text-2xl font-bold text-primary">{event.name}</h1>
        <p className="text-primary-light mt-1">{new Date(event.date).toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Media Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative">
              {event.mediaUrl ? (
                <div className="relative bg-gray-100 flex items-center justify-center min-h-[300px]">
                  {event.mediaType === 'video' ? (
                    <video 
                      src={event.mediaUrl} 
                      controls 
                      className="w-full max-h-[500px] object-contain"
                    />
                  ) : (
                    <img 
                      src={event.mediaUrl} 
                      alt="Event invitation" 
                      className="w-full max-h-[500px] object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🖼️</div>
                    <p className="text-primary-light">لا توجد وسائط دعوة</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowMediaModal(true)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-primary px-3 py-1 rounded-lg text-sm shadow-md transition"
              >
                ✏️ تغيير الوسائط
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-primary mb-4">تفاصيل المناسبة</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">الموقع:</span><span className="text-primary">{event.location?.name}</span></div>
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">العنوان:</span><span className="text-primary">{event.location?.address || 'غير محدد'}</span></div>
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">الوصف:</span><span className="text-primary">{event.description || 'لا يوجد وصف'}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-primary mb-4">إحصائيات سريعة</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center"><div className="text-2xl font-bold text-primary">{stats?.total || 0}</div><div className="text-primary-light text-sm">إجمالي الضيوف</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-green-500">{stats?.confirmed || 0}</div><div className="text-primary-light text-sm">مؤكد حضور</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-red-500">{stats?.declined || 0}</div><div className="text-primary-light text-sm">معتذر</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-blue-500">{stats?.attended || 0}</div><div className="text-primary-light text-sm">حضر فعلياً</div></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-primary mb-4">إجراءات سريعة</h2>
            <div className="space-y-3">
              <Link to={`/events/${eventId}/guests`} className="w-full block text-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">إدارة الضيوف</Link>
              <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">مشاركة رابط الدعوة</button>
              <button onClick={handleDelete} className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">حذف المناسبة</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-primary mb-4">معلومات الاشتراك</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-primary-light">الدعوات المستخدمة:</span><span className="text-primary font-bold">{user?.subscription?.usedInvitations || 0}</span></div>
              <div className="flex justify-between"><span className="text-primary-light">الدعوات المتبقية:</span><span className="text-primary font-bold">{user?.subscription?.remainingInvitations || 0}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-primary mb-4">تغيير وسائط الدعوة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-primary text-sm font-medium mb-2">نوع الوسائط</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="image" checked={mediaType === 'image'} onChange={(e) => setMediaType(e.target.value)} /> صورة
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="video" checked={mediaType === 'video'} onChange={(e) => setMediaType(e.target.value)} /> فيديو
                  </label>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition" onClick={() => fileInputRef.current.click()}>
                <input type="file" ref={fileInputRef} accept={mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} className="hidden" />
                {mediaPreview ? (
                  <div>
                    {mediaType === 'image' ? (
                      <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded object-contain" />
                    ) : (
                      <video src={mediaPreview} controls className="max-h-48 mx-auto rounded" />
                    )}
                    <p className="text-sm text-primary-light mt-2">اضغط لتغيير الملف</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">{mediaType === 'image' ? '🖼️' : '🎬'}</div>
                    <p className="text-primary-light">اضغط لرفع {mediaType === 'image' ? 'صورة' : 'فيديو'}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleMediaUpdate} disabled={!mediaFile} className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50">حفظ</button>
                <button onClick={() => setShowMediaModal(false)} className="flex-1 border border-gray-300 text-primary-light py-2 rounded-lg hover:bg-gray-50">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EventDetails;
