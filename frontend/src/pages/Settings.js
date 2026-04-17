import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { usersAPI } from '../api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: 'ar',
    timezone: 'Africa/Cairo',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        language: user.settings?.language || 'ar',
        timezone: user.settings?.timezone || 'Africa/Cairo',
        notifications: user.settings?.notifications || {
          email: true,
          sms: false,
          push: true
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notifications.')) {
      const notifKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notifKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        settings: {
          language: formData.language,
          timezone: formData.timezone,
          notifications: formData.notifications
        }
      });
      
      // Update local store
      updateUser({
        name: formData.name,
        phone: formData.phone,
        settings: {
          language: formData.language,
          timezone: formData.timezone,
          notifications: formData.notifications
        }
      });
      
      toast.success('تم حفظ الإعدادات');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.error || 'فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">الملف الشخصي</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 opacity-50 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">التفضيلات</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اللغة</label>
              <select 
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">المنطقة الزمنية</label>
              <select 
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 focus:border-primary-500 focus:outline-none"
              >
                <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                <option value="Asia/Dubai">دبي (GMT+4)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">الإشعارات</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.email"
                checked={formData.notifications.email}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-500" 
              />
              <span>إشعارات البريد الإلكتروني</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.sms"
                checked={formData.notifications.sms}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-500" 
              />
              <span>إشعارات SMS</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.push"
                checked={formData.notifications.push}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-500" 
              />
              <span>إشعارات المتصفح</span>
            </label>
          </div>
        </div>

        {/* Subscription */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">الاشتراك</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div>
                <p className="font-medium">الخطة الحالية</p>
                <p className="text-sm text-gray-400">
                  {user?.subscription?.plan === 'free' ? 'مجاني' :
                   user?.subscription?.plan === 'basic' ? 'أساسي' :
                   user?.subscription?.plan === 'standard' ? 'قياسي' :
                   user?.subscription?.plan === 'premium' ? 'مميز' : 'مجاني'}
                </p>
              </div>
              {user?.subscription?.isActive ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  نشط
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                  تجربة
                </span>
              )}
            </div>
            <a href="/subscription" className="btn-primary w-full text-center block">
              ترقية الاشتراك
            </a>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave} 
        disabled={loading}
        className="btn-primary flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        حفظ التغييرات
      </button>
    </div>
  );
};

export default Settings;