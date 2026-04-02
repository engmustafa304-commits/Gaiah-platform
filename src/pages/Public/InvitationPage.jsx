import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const InvitationPage = () => {
  const { link } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responded, setResponded] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    // محاكاة جلب البيانات
    setTimeout(() => {
      setInvitation({
        guestName: 'أحمد محمد',
        eventName: 'حفل زفاف أحمد وسارة',
        eventDate: new Date().toISOString(),
        location: 'قاعة الأفراح - الرياض',
        address: 'الرياض، المملكة العربية السعودية',
        lat: 24.7136,
        lng: 46.6753,
        mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop'
      });
      setLoading(false);
    }, 500);
  }, [link]);

  const handleConfirm = () => {
    setResponded(true);
  };

  const handleDecline = () => {
    setResponded(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-primary mb-2">تم تأكيد حضوركم</h1>
          <p className="text-primary-light">شكراً لتأكيد حضوركم، ننتظركم بفارغ الصبر</p>
          {!showLocation ? (
            <button 
              onClick={() => setShowLocation(true)} 
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              📍 عرض الموقع
            </button>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-primary-light text-sm mb-2">📍 موقع المناسبة:</p>
              <p className="text-primary font-medium">{invitation?.address}</p>
              <a 
                href={`https://www.google.com/maps?q=${invitation?.lat},${invitation?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-primary underline text-sm"
              >
                فتح في خرائط جوجل
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {invitation?.mediaUrl && (
            <div className="bg-gray-100 flex items-center justify-center p-4">
              <img 
                src={invitation.mediaUrl} 
                alt="Event invitation" 
                className="w-full max-h-[400px] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">{invitation?.eventName}</h1>
            <p className="text-primary-light mb-6">يدعوكم لحضور مناسبة سعيدة</p>
            
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 mb-6">
              <p className="text-primary text-lg font-semibold">{invitation?.guestName}</p>
              <p className="text-xs text-primary-light">مدعو(ة) كريم(ة)</p>
            </div>
            
            <div className="space-y-3 mb-8 text-right">
              <div className="flex items-center gap-3 justify-center">
                <span className="text-primary-light">📅 التاريخ:</span>
                <span className="text-primary font-semibold">
                  {new Date(invitation?.eventDate).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="text-primary-light">📍 الموقع:</span>
                <span className="text-primary font-semibold">{invitation?.location}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConfirm}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
              >
                ✅ سأحضر
              </button>
              <button
                onClick={handleDecline}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
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
