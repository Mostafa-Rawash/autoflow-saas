import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, MessageSquare } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const getTheme = () => localStorage.getItem('theme') || 'light';

const Login = () => {
  const navigate = useNavigate();
  const theme = getTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const { login, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.email, formData.password, rememberMe);

    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/');
    } else {
      const msg = String(result.error || 'فشل تسجيل الدخول').toLowerCase();
      if (msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('429')) {
        toast.error('طلبات كثيرة جدًا. من فضلك انتظر قليلًا ثم حاول مرة أخرى.');
      } else {
        toast.error(result.error || 'فشل تسجيل الدخول');
      }
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-shadow duration-300">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold gradient-text">AutoFlow</span>
          </Link>
          <h1 className={`text-2xl font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            مرحباً بعودتك! 👋
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            سجل دخولك للوصول للوحة التحكم
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="••••••••"
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

            {/* Remember me */}
            <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>تذكرني على هذا الجهاز</span>
            </label>

            {/* Error */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-600 dark:text-rose-400 text-sm">
                {(error || '').toLowerCase().includes('too many requests') || (error || '').toLowerCase().includes('rate limit') || (error || '').includes('429')
                  ? 'طلبات كثيرة جدًا. من فضلك انتظر قليلًا ثم حاول مرة أخرى.'
                  : error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-auth flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-3 ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>أو</span>
            </div>
          </div>

          {/* Register link */}
          <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-teal-600 hover:text-teal-500 font-medium transition-colors">
              سجل الآن
            </Link>
          </p>
        </div>

        {/* Trial info */}
        <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          ✨ تجربة مجانية 14 يوم بدون بطاقة ائتمان
        </p>
      </div>
    </div>
  );
};

export default Login;