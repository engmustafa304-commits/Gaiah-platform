import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const InvitationPage = () => {
  const { link } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [link]);

  const fetchInvitation = async () => {
    try {
      const response = await API.rsvp.getInvitation(link);
      setInvitation(response);
    } catch (err) {
      setError('الدعوة غير صالحة أو منتهية الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await API.rsvp.confirm(link, { companions: 0 });
      setResponded(true);
    } catch (err) {
      setError('حدث خطأ أثناء تأكيد الحضور');
    }
  };

  const handleDecline = async () => {
    try {
      await API.rsvp.decline(link);
      setResponded(true);
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الاعتذار');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-primary mb-2">عذراً</h1>
          <p className="text-primary-light">{error}</p>
        </div>
      </div>
    );
  }

  if (responded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-primary mb-2">تم استلام ردك</h1>
          <p className="text-primary-light">شكراً لتأكيد حضورك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {invitation?.event?.coverImage && (
            <img src={invitation.event.coverImage} alt="Event" className="w-full h-64 object-cover" />
          )}
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">{invitation?.event?.name}</h1>
            <p className="text-primary-light mb-6">يدعوكم لحضور مناسبة سعيدة</p>
            
            <div className="space-y-3 mb-8 text-right">
              <div className="flex items-center gap-3 justify-center">
                <span className="text-primary-light">📅 التاريخ:</span>
                <span className="text-primary font-semibold">
                  {new Date(invitation?.event?.date).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-primary-light">📍 الموقع:</span>
                <span className="text-primary font-semibold">{invitation?.event?.location?.name}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleConfirm}
                className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition"
              >
                ✅ سأحضر
              </button>
              <button
                onClick={handleDecline}
                className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition"
              >
                ❌ لن أحضر
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
