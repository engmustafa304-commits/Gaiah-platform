import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import API from '../../utils/api';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast, showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await API.dashboard.getStats();
      const eventsRes = await API.dashboard.getRecentEvents();
      setStats(statsRes);
      setRecentEvents(eventsRes.events || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (window.confirm(`هل أنت متأكد من حذف مناسبة "${eventName}"؟`)) {
      try {
        await API.events.delete(eventId);
        showSuccess('تم حذف المناسبة بنجاح');
        fetchDashboardData();
      } catch (error) {
        showError('فشل حذف المناسبة');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'إجمالي المناسبات', value: stats?.totalEvents || 0, icon: '🎉', color: 'from-blue-500 to-blue-600' },
    { title: 'إجمالي الضيوف', value: stats?.totalGuests || 0, icon: '👥', color: 'from-green-500 to-green-600' },
    { title: 'تأكيد الحضور', value: `${stats?.confirmationRate || 0}%`, icon: '✅', color: 'from-purple-500 to-purple-600' },
    { title: 'الدعوات المتبقية', value: user?.subscription?.remainingInvitations || 0, icon: '📨', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <Layout>
      <Toast toast={toast} onClose={() => {}} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">مرحباً، {user?.displayName} 👋</h1>
        <p className="text-primary-light mt-1">مرحباً بك في منصة جيّة لإدارة الدعوات الرقمية</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-light text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-primary mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center text-white text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <Link
          to="/create-event"
          className="bg-primary text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary-dark transition shadow-md hover:shadow-lg"
        >
          <span className="text-xl">+</span>
          إنشاء مناسبة جديدة
        </Link>
        <Link
          to="/analytics"
          className="bg-gray-100 text-primary px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <span className="text-xl">📊</span>
          عرض التحليلات
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-primary">مناسباتي</h2>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-5xl mb-4">🎉</div>
            <p className="mb-4">لا توجد مناسبات بعد</p>
            <Link to="/create-event" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              إنشاء مناسبة جديدة
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {event.mediaUrl && (
                        <img src={event.mediaUrl} alt={event.name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <h3 className="font-semibold text-primary text-lg">{event.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          📅 {new Date(event.date).toLocaleDateString('ar-SA')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">📍 {event.location?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/events/${event.id}`} className="text-primary hover:underline text-sm">تفاصيل</Link>
                    <Link to={`/events/${event.id}/guests`} className="text-primary hover:underline text-sm">إدارة الضيوف</Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
