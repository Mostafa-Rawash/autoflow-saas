import React from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuthStore();

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات');
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
                defaultValue={user?.name}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                defaultValue={user?.phone}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
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
              <select className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">المنطقة الزمنية</label>
              <select className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4">
                <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">الإشعارات</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
              <span>إشعارات البريد الإلكتروني</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 accent-primary-500" />
              <span>إشعارات SMS</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
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
                <p className="text-sm text-gray-400">تجربة مجانية</p>
              </div>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm">
                14 يوم متبقي
              </span>
            </div>
            <button className="btn-primary w-full">
              ترقية الاشتراك
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">
        حفظ التغييرات
      </button>
    </div>
  );
};

export default Settings;