import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalGuests: 0,
    totalConfirmed: 0,
    totalAttended: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
      
      // Calculate stats
      let totalGuests = 0;
      let totalConfirmed = 0;
      let totalAttended = 0;
      
      // In a real app, you'd fetch guest counts per event
      // This is a simplified version
      
      setStats({
        totalEvents: response.data.length,
        totalGuests: 0,
        totalConfirmed: 0,
        totalAttended: 0
      });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ar' ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}
          </h1>
          <p className="text-gray-200">
            {language === 'ar' 
              ? 'منصتك لإدارة الدعوات الإلكترونية بكل سهولة'
              : 'Your platform for managing digital invitations with ease'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary">{stats.totalEvents}</div>
            <div className="text-primary-light mt-1">
              {language === 'ar' ? 'إجمالي المناسبات' : 'Total Events'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary">{stats.totalGuests}</div>
            <div className="text-primary-light mt-1">
              {language === 'ar' ? 'إجمالي المدعوين' : 'Total Guests'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-green-500">{stats.totalConfirmed}</div>
            <div className="text-primary-light mt-1">
              {language === 'ar' ? 'تأكيد الحضور' : 'Confirmed'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-500">{stats.totalAttended}</div>
            <div className="text-primary-light mt-1">
              {language === 'ar' ? 'حضر فعلياً' : 'Attended'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            to="/create-event"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all duration-300"
          >
            <span>+</span>
            {language === 'ar' ? 'إنشاء مناسبة جديدة' : 'Create New Event'}
          </Link>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-primary">
              {language === 'ar' ? 'آخر المناسبات' : 'Recent Events'}
            </h2>
          </div>
          {events.length === 0 ? (
            <div className="p-12 text-center text-primary-light">
              {language === 'ar' 
                ? 'لا توجد مناسبات بعد. قم بإنشاء مناسبة جديدة'
                : 'No events yet. Create your first event'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.slice(0, 5).map((event) => (
                <div key={event._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-primary">{event.name}</h3>
                      <p className="text-sm text-primary-light mt-1">
                        {new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <Link
                      to={`/events/${event._id}/guests`}
                      className="text-primary hover:underline text-sm"
                    >
                      {language === 'ar' ? 'إدارة المدعوين' : 'Manage Guests'} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;