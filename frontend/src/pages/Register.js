import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const getTheme = () => localStorage.getItem('theme') || 'light';

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

  const isDark = theme === 'dark';

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-shadow duration-300">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold gradient-text">AutoFlow</span>
          </Link>
          <h1 className={`text-2xl font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            أنشئ حسابك مجاناً! 🚀
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            ابدأ تجربتك المجانية لمدة 14 يوم
          </p>
        </div>

        {/* Glass Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                الاسم
              </label>
              <div className="relative">
                <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass pr-10"
                  placeholder="أحمد محمد"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-glass pr-10"
                  placeholder="name@example.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                رقم الهاتف (اختياري)
              </label>
              <div className="relative">
                <Phone className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-glass pr-10"
                  placeholder="+20 1xx xxx xxxx"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-glass pr-10 pl-10"
                  placeholder="6 أحرف على الأقل"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-glass pr-10"
                  placeholder="أعد كتابة كلمة المرور"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-auth flex items-center justify-center gap-2 mt-2"
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
          <p className={`text-xs text-center mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            بإنشاء الحساب، أنت توافق على{' '}
            <a href="#" className="text-teal-500 hover:text-teal-400 transition-colors">شروط الخدمة</a>
            {' '}و{' '}
            <a href="#" className="text-teal-500 hover:text-teal-400 transition-colors">سياسة الخصوصية</a>
          </p>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-3 ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>أو</span>
            </div>
          </div>

          {/* Login link */}
          <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-teal-500 hover:text-teal-400 font-medium transition-colors">
              سجل دخولك
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className={`mt-6 grid grid-cols-3 gap-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <div>✓ 14 يوم مجاناً</div>
          <div>✓ بدون بطاقة</div>
          <div>✓ إلغاء أي وقت</div>
        </div>
      </div>
    </div>
  );
};

export default Register;