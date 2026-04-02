import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, statsRes] = await Promise.all([API.events.getById(eventId), API.events.getStats(eventId)]);
      setEvent(eventRes.event);
      setStats(statsRes);
    } catch (error) {
      showError('فشل تحميل بيانات المناسبة');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذه المناسبة؟')) {
      try {
        await API.events.delete(eventId);
        showSuccess('تم حذف المناسبة بنجاح');
        navigate('/dashboard');
      } catch (error) {
        showError('فشل حذف المناسبة');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div>المناسبة غير موجودة</div>;

  return (
    <Layout>
      <Toast toast={toast} onClose={() => {}} />
      <div className="mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline mb-2 inline-block">← العودة إلى لوحة التحكم</button>
        <h1 className="text-2xl font-bold text-primary">{event.name}</h1>
        <p className="text-primary-light mt-1">{new Date(event.date).toLocaleDateString('ar-SA')}</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-primary mb-4">تفاصيل المناسبة</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">الموقع:</span><span className="text-primary">{event.location?.name}</span></div>
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">العنوان:</span><span className="text-primary">{event.location?.address || 'غير محدد'}</span></div>
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">الوصف:</span><span className="text-primary">{event.description || 'لا يوجد وصف'}</span></div>
              <div className="flex items-center gap-3"><span className="text-primary-light w-24">رابط الدعوة:</span><a href={`/invitation/${event.uniqueLink}`} target="_blank" className="text-primary hover:underline">{window.location.origin}/invitation/{event.uniqueLink}</a></div>
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
    </Layout>
  );
};

export default EventDetails;
