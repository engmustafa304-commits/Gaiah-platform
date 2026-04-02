import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import API from '../../utils/api';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const GuestsManager = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, showSuccess, showError } = useToast();
  const [guests, setGuests] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '', companions: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, guestsRes] = await Promise.all([API.events.getById(eventId), API.guests.getByEvent(eventId)]);
      setEvent(eventRes.event);
      setGuests(guestsRes.guests || []);
    } catch (error) {
      showError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await API.guests.add(eventId, newGuest);
      showSuccess('تم إضافة الضيف بنجاح');
      setShowAddModal(false);
      setNewGuest({ name: '', phone: '', email: '', companions: 0 });
      fetchData();
    } catch (error) {
      showError(error.message || 'فشل إضافة الضيف');
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الضيف؟')) {
      try {
        await API.guests.delete(guestId);
        showSuccess('تم حذف الضيف بنجاح');
        fetchData();
      } catch (error) {
        showError('فشل حذف الضيف');
      }
    }
  };

  const handleSendInvitation = async (guestId) => {
    try {
      await API.guests.sendInvitation(guestId);
      showSuccess('تم إرسال الدعوة بنجاح');
    } catch (error) {
      showError('فشل إرسال الدعوة');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    try {
      await API.guests.bulkImport(eventId, selectedFile);
      showSuccess('تم استيراد الضيوف بنجاح');
      setShowBulkModal(false);
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      showError('فشل استيراد الضيوف');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await API.guests.export(eventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guests_${eventId}.xlsx`;
      a.click();
      showSuccess('تم تصدير القائمة بنجاح');
    } catch (error) {
      showError('فشل تصدير القائمة');
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.includes(searchTerm) || guest.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800', declined: 'bg-red-100 text-red-800', attended: 'bg-blue-100 text-blue-800' };
    const texts = { pending: 'قيد الانتظار', confirmed: 'مؤكد', declined: 'معتذر', attended: 'حضر' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>{texts[status]}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout>
      <Toast toast={toast} onClose={() => {}} />
      <div className="mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline mb-2 inline-block">← العودة إلى لوحة التحكم</button>
        <h1 className="text-2xl font-bold text-primary">إدارة الضيوف</h1>
        <p className="text-primary-light mt-1">{event?.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setShowAddModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center gap-2"><span>+</span> إضافة ضيف</button>
            <button onClick={() => setShowBulkModal(true)} className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">📁 استيراد من Excel</button>
            <button onClick={handleExport} className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition">📥 تصدير القائمة</button>
          </div>
          <div className="flex gap-3">
            <input type="text" placeholder="بحث بالاسم أو الجوال..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary">
              <option value="all">الكل</option><option value="pending">قيد الانتظار</option><option value="confirmed">مؤكد</option><option value="declined">معتذر</option><option value="attended">حضر</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-right text-sm font-semibold text-primary">الاسم</th><th className="px-6 py-4 text-right text-sm font-semibold text-primary">الجوال</th><th className="px-6 py-4 text-right text-sm font-semibold text-primary">البريد</th><th className="px-6 py-4 text-right text-sm font-semibold text-primary">مرافقين</th><th className="px-6 py-4 text-right text-sm font-semibold text-primary">الحالة</th><th className="px-6 py-4 text-right text-sm font-semibold text-primary">إجراءات</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGuests.length === 0 ? <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">لا يوجد ضيوف</td></tr> : filteredGuests.map((guest) => (<tr key={guest.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 text-primary-light">{guest.name}</td><td className="px-6 py-4 text-primary-light">{guest.phone}</td><td className="px-6 py-4 text-primary-light">{guest.email || '-'}</td><td className="px-6 py-4 text-primary-light">{guest.companions || 0}</td><td className="px-6 py-4">{getStatusBadge(guest.status)}</td><td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => handleSendInvitation(guest.id)} className="text-green-500 hover:text-green-700" title="إرسال دعوة">📱</button><button onClick={() => handleDeleteGuest(guest.id)} className="text-red-500 hover:text-red-700" title="حذف">🗑️</button></div></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-md w-full p-6"><h3 className="text-xl font-bold text-primary mb-4">إضافة ضيف جديد</h3><form onSubmit={handleAddGuest} className="space-y-4"><input type="text" placeholder="الاسم *" value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /><input type="tel" placeholder="رقم الجوال *" value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /><input type="email" placeholder="البريد الإلكتروني (اختياري)" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /><input type="number" placeholder="عدد المرافقين" value={newGuest.companions} onChange={(e) => setNewGuest({ ...newGuest, companions: parseInt(e.target.value) })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /><div className="flex gap-3 pt-4"><button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">إضافة</button><button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-primary-light py-3 rounded-lg hover:bg-gray-50">إلغاء</button></div></form></div></div>)}

      {showBulkModal && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-md w-full p-6"><h3 className="text-xl font-bold text-primary mb-4">استيراد ضيوف من Excel</h3><form onSubmit={handleBulkImport} className="space-y-4"><div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setSelectedFile(e.target.files[0])} className="w-full" required /><p className="text-xs text-primary-light mt-2">صيغ مدعومة: Excel (.xlsx, .xls) أو CSV</p></div><div className="flex gap-3 pt-4"><button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">استيراد</button><button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 border border-gray-300 text-primary-light py-3 rounded-lg hover:bg-gray-50">إلغاء</button></div></form></div></div>)}
    </Layout>
  );
};

export default GuestsManager;
