import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const getTheme = () => localStorage.getItem('autoflow_theme') || 'light';

const Register = () => {
  const theme = getTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const { register, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });

    if (result.success) {
      toast.success('تم إنشاء الحساب بنجاح! 🎉');
    } else {
      toast.error(result.error || 'فشل إنشاء الحساب');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-dark-950'}`}>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50' : 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950'}`}></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 212, 170, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-whatsapp to-primary-500 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <span className="text-2xl font-bold gradient-text">AutoFlow</span>
          </Link>
          <h1 className={`text-2xl font-bold mt-6 mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>أنشئ حسابك مجاناً! 🚀</h1>
          <p className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'}>ابدأ تجربتك المجانية لمدة 14 يوم</p>
        </div>

        {/* Form */}
        <div className={`card rounded-2xl p-8 ${theme === 'light' ? 'bg-white border border-slate-200' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">الاسم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full border rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'}`}
                  placeholder="أحمد محمد"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full border rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'}`}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف (اختياري)</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full border rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'}`}
                  placeholder="+20 1xx xxx xxxx"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full border rounded-lg py-3 pr-10 pl-10 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'}`}
                  placeholder="6 أحرف على الأقل"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full border rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-dark-800 border-dark-600'}`}
                  placeholder="أعد كتابة كلمة المرور"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>إنشاء الحساب</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className={`text-xs text-center mt-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
            بإنشاء الحساب، أنت توافق على{' '}
            <a href="#" className="text-primary-500 hover:underline">شروط الخدمة</a>
            {' '}و{' '}
            <a href="#" className="text-primary-500 hover:underline">سياسة الخصوصية</a>
          </p>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'light' ? 'border-slate-300' : 'border-dark-600'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${theme === 'light' ? 'bg-slate-50 text-slate-500' : 'bg-dark-900 text-gray-500'}`}>أو</span>
            </div>
          </div>

          {/* Login link */}
          <p className={`text-center ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary-500 hover:underline">
              سجل دخولك
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className={`mt-6 grid grid-cols-3 gap-2 text-center text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
          <div>✓ 14 يوم مجاناً</div>
          <div>✓ بدون بطاقة</div>
          <div>✓ إلغاء أي وقت</div>
        </div>
      </div>
    </div>
  );
};

export default Register;