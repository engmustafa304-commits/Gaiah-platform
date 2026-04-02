import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await API.events.getEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('خطأ في جلب المناسبات', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">مرحباً، {user?.displayName || 'مستخدم'}</h1>
          <p className="text-gray-200 mt-1">منصتك لإدارة الدعوات الإلكترونية</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary">{events.length}</div>
            <div className="text-primary-light mt-1">مناسبات</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary">0</div>
            <div className="text-primary-light mt-1">مدعو</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-green-500">0</div>
            <div className="text-primary-light mt-1">مؤكد حضور</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-500">0</div>
            <div className="text-primary-light mt-1">حضر فعلياً</div>
          </div>
        </div>

        <div className="mb-8">
          <Link to="/create-event" className="bg-primary text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary-dark transition">
            <span>+</span> مناسبة جديدة
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-primary">مناسباتي</h2>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              لا توجد مناسبات بعد. ابدأ بإنشاء مناسبة جديدة
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-primary text-lg">{event.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(event.date).toLocaleDateString('ar-SA')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{event.location?.name}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/events/${event.id}/guests`} className="text-primary hover:underline text-sm">
                        إدارة الضيوف
                      </Link>
                      <button className="text-red-500 hover:text-red-700 text-sm">
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="mt-8 text-red-500 hover:text-red-700 transition">
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Dashboard;