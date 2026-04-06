import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const eventsRes = await API.events.getAll();
      const statsRes = await API.dashboard.getStats();
      setEvents(eventsRes.events || []);
      setStats(statsRes);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // بيانات الرسم البياني للحضور
  const attendanceData = {
    labels: ['مؤكد حضور', 'معتذر', 'حضر فعلياً', 'لم يحضر', 'لم يرد'],
    datasets: [{
      label: 'الضيوف',
      data: [
        stats?.confirmedGuests || 0,
        stats?.declinedGuests || 0,
        stats?.attendedGuests || 0,
        stats?.notAttendedGuests || 0,
        stats?.noResponseGuests || 0
      ],
      backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#9ca3af'],
      borderWidth: 0
    }]
  };

  // بيانات الرسم البياني للرسائل
  const messagesData = {
    labels: ['قرأ الرسالة', 'لم يقرأ بعد'],
    datasets: [{
      label: 'الرسائل',
      data: [stats?.readMessages || 0, (stats?.totalGuests || 0) - (stats?.readMessages || 0)],
      backgroundColor: ['#8b5cf6', '#e5e7eb'],
      borderWidth: 0
    }]
  };

  // خيارات الرسوم البيانية
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', rtl: true } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">مرحباً، {user?.displayName || 'مستخدم'} 👋</h1>
          <p className="text-gray-200 mt-1">منصتك لإدارة الدعوات الإلكترونية</p>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-primary">{stats?.totalEvents || 0}</div><div className="text-xs text-primary-light">مناسبات</div></div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-primary">{stats?.totalGuests || 0}</div><div className="text-xs text-primary-light">إجمالي الضيوف</div></div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-green-600">{stats?.confirmedGuests || 0}</div><div className="text-xs text-primary-light">✅ مؤكد</div></div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-red-500">{stats?.declinedGuests || 0}</div><div className="text-xs text-primary-light">❌ معتذر</div></div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-blue-500">{stats?.attendedGuests || 0}</div><div className="text-xs text-primary-light">🎉 حضر فعلياً</div></div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-purple-600">{stats?.readMessages || 0}</div><div className="text-xs text-primary-light">📖 قرأ الرسالة</div></div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center"><div className="text-2xl font-bold text-gray-500">{stats?.noResponseGuests || 0}</div><div className="text-xs text-primary-light">⏳ لم يرد</div></div>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold text-primary mb-4 text-center">📊 إحصائيات الحضور</h3>
            <div className="h-64"><Pie data={attendanceData} options={chartOptions} /></div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-bold text-primary mb-4 text-center">💬 تفاعل الضيوف مع الرسائل</h3>
            <div className="h-64"><Pie data={messagesData} options={chartOptions} /></div>
          </div>
        </div>

        {/* نسبة الحضور */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-primary mb-2">📈 نسبة تأكيد الحضور</h3>
            <div className="text-4xl font-bold text-green-600">{stats?.confirmationRate || 0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats?.confirmationRate || 0}%` }}></div></div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-primary mb-2">🎯 نسبة الحضور الفعلي</h3>
            <div className="text-4xl font-bold text-blue-500">{stats?.attendanceRate || 0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.attendanceRate || 0}%` }}></div></div>
          </div>
        </div>

        {/* أزرار سريعة */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/create-event" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition text-sm">+ مناسبة جديدة</Link>
          <Link to="/analytics" className="bg-gray-200 text-primary px-5 py-2 rounded-lg hover:bg-gray-300 transition text-sm">📊 تحليلات متقدمة</Link>
        </div>

        {/* قائمة المناسبات */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 border-b"><h2 className="text-xl font-bold text-primary">مناسباتي</h2></div>
          {events.length === 0 ? (
            <div className="p-12 text-center text-gray-500">لا توجد مناسبات بعد</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div key={event.id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div><h3 className="font-semibold text-primary text-lg">{event.name}</h3><p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString('ar-SA')}</p></div>
                    <div className="flex gap-2"><Link to={`/events/${event.id}`} className="text-primary hover:underline text-sm">تفاصيل</Link><Link to={`/events/${event.id}/guests`} className="text-primary hover:underline text-sm">ضيوف</Link></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={logout} className="mt-6 text-red-500 hover:text-red-700 text-sm">تسجيل الخروج</button>
      </div>
      <Footer />
    </div>
  );
};
export default Dashboard;
