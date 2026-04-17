import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, MessageSquare, Users, Crown, Zap } from 'lucide-react';
import { usersAPI } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    language: 'ar',
    timezone: 'Africa/Cairo'
  });
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const steps = [
    { id: 1, title: 'مرحباً!', subtitle: 'هيّئ حسابك في دقائق' },
    { id: 2, title: 'معلوماتك', subtitle: 'أخبرنا المزيد عنك' },
    { id: 3, title: 'اختر خطتك', subtitle: 'ابدأ مجاناً أو اختر خطة مناسبة' },
    { id: 4, title: 'توصيل واتس آب', subtitle: 'ابدأ التواصل مع عملائك' }
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await usersAPI.update(user.id, {
        name: profileData.name || user.name,
        phone: profileData.phone,
        settings: {
          language: profileData.language,
          timezone: profileData.timezone
        }
      });
      
      updateUser({
        name: profileData.name || user.name,
        phone: profileData.phone,
        settings: {
          language: profileData.language,
          timezone: profileData.timezone
        }
      });
      
      setStep(3);
    } catch (error) {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToWhatsApp = () => {
    navigate('/channels');
  };

  const handleComplete = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-500'
                }`}
              >
                {step > s.id ? <Check className="w-5 h-5" /> : s.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 ${
                    step > s.id ? 'bg-primary-500' : 'bg-dark-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-whatsapp to-primary-500 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{steps[0].title}</h1>
              <p className="text-gray-400 mb-8">{steps[0].subtitle}</p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-dark-800 text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="font-bold mb-1">سريع</h3>
                  <p className="text-xs text-gray-500">توصيل في دقائق</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-bold mb-1">فريقك</h3>
                  <p className="text-xs text-gray-500">إدارة متعددة المستخدمين</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-800 text-center">
                  <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="font-bold mb-1">مرونة</h3>
                  <p className="text-xs text-gray-500">خطط تناسب احتياجك</p>
                </div>
              </div>
              
              <button
                onClick={() => setStep(2)}
                className="btn-primary inline-flex items-center gap-2"
              >
                ابدأ الآن
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[1].title}</h2>
              <p className="text-gray-400 mb-6">{steps[1].subtitle}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder={user?.name || 'اسمك'}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="201099129550"
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اللغة</label>
                    <select
                      name="language"
                      value={profileData.language}
                      onChange={handleProfileChange}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">المنطقة الزمنية</label>
                    <select
                      name="timezone"
                      value={profileData.timezone}
                      onChange={handleProfileChange}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="Africa/Cairo">القاهرة</option>
                      <option value="Asia/Riyadh">الرياض</option>
                      <option value="Asia/Dubai">دبي</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  السابق
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? 'جاري الحفظ...' : 'التالي'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[2].title}</h2>
              <p className="text-gray-400 mb-6">{steps[2].subtitle}</p>
              
              <div className="grid gap-4 mb-6">
                {/* Free Plan */}
                <div
                  className="p-4 rounded-xl border-2 border-primary-500 bg-primary-500/10 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">ابدأ مجاناً</h3>
                      <p className="text-sm text-gray-400">100 محادثة، 1000 رسالة</p>
                    </div>
                    <div className="text-2xl font-bold">EGP 0</div>
                  </div>
                </div>
                
                {/* Standard Plan */}
                <div
                  className="p-4 rounded-xl border border-dark-600 hover:border-primary-500/50 cursor-pointer relative"
                >
                  <span className="absolute -top-2 left-4 px-2 py-0.5 bg-whatsapp text-white text-xs rounded-full">
                    الأكثر شعبية
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">قياسي</h3>
                      <p className="text-sm text-gray-400">5000 محادثة، 50000 رسالة</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">EGP 599</div>
                      <div className="text-xs text-gray-500">شهرياً</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mb-6 text-center">
                يمكنك الترقية لاحقاً من إعدادات الاشتراك
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  السابق
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  المتابعة بالخطة المجانية
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: WhatsApp */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[3].title}</h2>
              <p className="text-gray-400 mb-6">{steps[3].subtitle}</p>
              
              <div className="bg-whatsapp/10 border border-whatsapp/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-whatsapp/20 flex items-center justify-center text-3xl">
                    📱
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">واتس آب</h3>
                    <p className="text-sm text-gray-400">توصيل فوري عبر QR</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>مجاني 100%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>بدون API costs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>تشفير من طرف لطرف</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleComplete}
                  className="btn-secondary flex-1"
                >
                  تخطي الآن
                </button>
                <button
                  onClick={handleSkipToWhatsApp}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90"
                >
                  توصيل واتس آب
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        <p className="text-center text-gray-500 text-sm mt-4">
          <button onClick={handleComplete} className="hover:text-white">
            تخطي الإعداد والذهاب للوحة التحكم
          </button>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;