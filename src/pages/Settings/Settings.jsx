import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import API from '../../utils/api';
import Layout from '../../components/Layout';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { toast, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ displayName: user?.displayName || '', phone: user?.phone || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    if (result.success) showSuccess('تم تحديث الملف الشخصي بنجاح');
    else showError(result.error || 'فشل تحديث الملف');
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { showError('كلمة المرور الجديدة غير متطابقة'); return; }
    setLoading(true);
    try {
      await API.auth.changePassword(passwordData.oldPassword, passwordData.newPassword);
      showSuccess('تم تغيير كلمة المرور بنجاح');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) { showError(error.message || 'فشل تغيير كلمة المرور'); }
    setLoading(false);
  };

  return (
    <Layout>
      <Toast toast={toast} onClose={() => {}} />
      <div className="mb-8"><h1 className="text-2xl font-bold text-primary">الإعدادات</h1><p className="text-primary-light mt-1">إدارة حسابك وتفضيلاتك</p></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><h2 className="text-xl font-bold text-primary mb-4">الملف الشخصي</h2><form onSubmit={handleProfileUpdate} className="space-y-4"><div><label className="block text-primary text-sm font-semibold mb-2">الاسم</label><input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /></div><div><label className="block text-primary text-sm font-semibold mb-2">رقم الجوال</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /></div><div><label className="block text-primary text-sm font-semibold mb-2">البريد الإلكتروني</label><input type="email" value={formData.email} disabled className="w-full px-4 py-3 border rounded-lg bg-gray-50" /><p className="text-xs text-primary-light mt-1">لا يمكن تغيير البريد الإلكتروني</p></div><button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">حفظ التغييرات</button></form></div>
        <div className="bg-white rounded-xl shadow-md p-6"><h2 className="text-xl font-bold text-primary mb-4">تغيير كلمة المرور</h2><form onSubmit={handlePasswordChange} className="space-y-4"><div><label className="block text-primary text-sm font-semibold mb-2">كلمة المرور الحالية</label><input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /></div><div><label className="block text-primary text-sm font-semibold mb-2">كلمة المرور الجديدة</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /></div><div><label className="block text-primary text-sm font-semibold mb-2">تأكيد كلمة المرور الجديدة</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary" /></div><button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">تغيير كلمة المرور</button></form></div>
      </div>
      <div className="mt-6 bg-white rounded-xl shadow-md p-6"><h2 className="text-xl font-bold text-primary mb-4">معلومات الاشتراك</h2><div className="grid sm:grid-cols-2 gap-4"><div><p className="text-primary-light text-sm">الباقة الحالية</p><p className="text-xl font-bold text-primary">{user?.subscription?.plan || 'مجاني'}</p></div><div><p className="text-primary-light text-sm">الدعوات المتبقية</p><p className="text-xl font-bold text-primary">{user?.subscription?.remainingInvitations || 0}</p></div><div><p className="text-primary-light text-sm">تاريخ انتهاء الاشتراك</p><p className="text-xl font-bold text-primary">{user?.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString('ar-SA') : 'غير محدد'}</p></div><div><p className="text-primary-light text-sm">الدعوات المستخدمة</p><p className="text-xl font-bold text-primary">{user?.subscription?.usedInvitations || 0} / {user?.subscription?.totalInvitations || 0}</p></div></div></div>
    </Layout>
  );
};

export default Settings;
