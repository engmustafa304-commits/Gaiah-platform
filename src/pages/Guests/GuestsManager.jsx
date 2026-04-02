import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import API from '../../utils/api';

const GuestsManager = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '', companions: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      // جلب بيانات المناسبة
      const eventRes = await API.events.getById(eventId);
      setEvent(eventRes.event);
      
      // جلب قائمة الضيوف (فارغة في البداية)
      const guestsRes = await API.guests.getByEvent(eventId);
      setGuests(guestsRes.guests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      const result = await API.guests.add(eventId, newGuest);
      if (result.success) {
        await fetchData();
        setShowAddModal(false);
        setNewGuest({ name: '', phone: '', email: '', companions: 0 });
      }
    } catch (error) {
      console.error('Error adding guest:', error);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الضيف؟')) {
      await API.guests.delete(guestId);
      await fetchData();
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      const newGuests = rows.map(row => ({
        name: row['الاسم'] || row['name'],
        phone: row['الجوال'] || row['phone'],
        email: row['البريد'] || row['email'] || '',
        companions: parseInt(row['مرافقين'] || row['companions']) || 0
      }));
      
      for (const guest of newGuests) {
        await API.guests.add(eventId, guest);
      }
      await fetchData();
      setShowExcelModal(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.includes(searchTerm) || guest.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      attended: 'bg-blue-100 text-blue-800',
    };
    const texts = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      declined: 'معتذر',
      attended: 'حضر',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>{texts[status]}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <div className="mb-8">
        <button onClick={() => navigate(`/events/${eventId}`)} className="text-primary hover:underline mb-2 inline-block">
          ← العودة إلى تفاصيل المناسبة
        </button>
        <h1 className="text-2xl font-bold text-primary">إدارة الضيوف</h1>
        <p className="text-primary-light mt-1">{event?.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
            >
              <span>+</span> إضافة ضيف
            </button>
            <button
              onClick={() => setShowExcelModal(true)}
              className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition"
            >
              📊 استيراد من Excel
            </button>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="بحث بالاسم أو الجوال..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="declined">معتذر</option>
              <option value="attended">حضر</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">الاسم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">الجوال</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">البريد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">مرافقين</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    لا يوجد ضيوف. قم بإضافة ضيوف جديد
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-primary-light">{guest.name}</td>
                    <td className="px-6 py-4 text-primary-light">{guest.phone}</td>
                    <td className="px-6 py-4 text-primary-light">{guest.email || '-'}</td>
                    <td className="px-6 py-4 text-primary-light">{guest.companions || 0}</td>
                    <td className="px-6 py-4">{getStatusBadge(guest.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="text-red-500 hover:text-red-700"
                        title="حذف"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-primary mb-4">إضافة ضيف جديد</h3>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <input
                type="text"
                placeholder="الاسم *"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
              />
              <input
                type="tel"
                placeholder="رقم الجوال *"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني (اختياري)"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
              />
              <input
                type="number"
                placeholder="عدد المرافقين"
                value={newGuest.companions}
                onChange={(e) => setNewGuest({ ...newGuest, companions: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-primary-light py-3 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-primary mb-4">استيراد ضيوف من Excel</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
                className="w-full"
              />
              <p className="text-xs text-primary-light mt-2">
                صيغ مدعومة: Excel (.xlsx, .xls) أو CSV
              </p>
              <p className="text-xs text-primary-light mt-1">
                الأعمدة المطلوبة: الاسم, الجوال, البريد (اختياري), مرافقين (اختياري)
              </p>
            </div>
            <button
              onClick={() => setShowExcelModal(false)}
              className="w-full mt-4 border border-gray-300 text-primary-light py-2 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GuestsManager;
