import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../utils/api';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const eventsRes = await API.events.getAll();
      setEvents(eventsRes.events || []);
      let totalGuests = 0, confirmedGuests = 0, declinedGuests = 0, attendedGuests = 0;
      setStats({ totalEvents: eventsRes.events?.length || 0, totalGuests, confirmedGuests, declinedGuests, attendedGuests });
    } catch (error) { console.error('Error fetching analytics:', error); } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  const totalGuests = stats?.totalGuests || 0;
  const confirmed = stats?.confirmedGuests || 0;
  const declined = stats?.declinedGuests || 0;
  const attended = stats?.attendedGuests || 0;
  const pending = totalGuests - confirmed - declined;

  return (
    <Layout>
      <div className="mb-8"><h1 className="text-2xl font-bold text-primary">التحليلات</h1><p className="text-primary-light mt-1">إحصائيات وتقارير منصتك</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6"><div className="text-3xl font-bold text-primary">{totalGuests}</div><div className="text-primary-light mt-1">إجمالي الضيوف</div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="text-3xl font-bold text-green-500">{confirmed}</div><div className="text-primary-light mt-1">مؤكد حضور</div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="text-3xl font-bold text-red-500">{declined}</div><div className="text-primary-light mt-1">معتذر</div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="text-3xl font-bold text-blue-500">{attended}</div><div className="text-primary-light mt-1">حضر فعلياً</div></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-bold text-primary mb-4">نسبة الحضور</h3><div className="relative pt-4"><div className="flex h-8 rounded-full overflow-hidden"><div className="bg-green-500" style={{ width: `${totalGuests ? (confirmed / totalGuests) * 100 : 0}%` }} /><div className="bg-red-500" style={{ width: `${totalGuests ? (declined / totalGuests) * 100 : 0}%` }} /><div className="bg-yellow-500" style={{ width: `${totalGuests ? (pending / totalGuests) * 100 : 0}%` }} /></div><div className="flex justify-center gap-6 mt-4 text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span>مؤكد ({confirmed})</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div><span>معتذر ({declined})</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded"></div><span>قيد الانتظار ({pending})</span></div></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-bold text-primary mb-4">إحصائيات الاشتراك</h3><div className="space-y-3"><div className="flex justify-between items-center"><span className="text-primary-light">الدعوات المتبقية</span><span className="text-2xl font-bold text-primary">{user?.subscription?.remainingInvitations || 0}</span></div><div className="flex justify-between items-center"><span className="text-primary-light">الدعوات المستخدمة</span><span className="text-2xl font-bold text-primary">{user?.subscription?.usedInvitations || 0}</span></div><div className="flex justify-between items-center"><span className="text-primary-light">إجمالي الدعوات</span><span className="text-2xl font-bold text-primary">{user?.subscription?.totalInvitations || 0}</span></div></div></div>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden"><div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold text-primary">قائمة المناسبات</h3></div><div className="divide-y divide-gray-100">{events.map((event) => (<div key={event.id} className="p-6 hover:bg-gray-50 transition"><div className="flex justify-between items-center"><div><h4 className="font-semibold text-primary">{event.name}</h4><p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleDateString('ar-SA')}</p></div><div className="flex gap-4 text-sm"><div><span className="text-primary-light">مدعو: </span><span className="font-bold">{event.totalGuests || 0}</span></div><div><span className="text-primary-light">حضر: </span><span className="font-bold text-green-500">{event.attendedGuests || 0}</span></div><div><span className="text-primary-light">نسبة: </span><span className="font-bold">{((event.attendedGuests || 0) / (event.totalGuests || 1) * 100).toFixed(0)}%</span></div></div></div></div>))}</div></div>
    </Layout>
  );
};

export default Analytics;
