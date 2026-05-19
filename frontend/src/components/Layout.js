import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  Radio,
  BarChart3,
  Settings,
  Users,
  Crown,
  LogOut,
  Menu,
  X,
  Lock,
  Zap,
  Sun,
  Moon,
  ChevronLeft,
  Sparkles,
  Shield,
  ScrollText,
  BookOpen,
  Clock,
  Database,
  Bot,
  GitBranch,
  Building2,
  Contact,
  MessageCircle,
  Link2
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { ThemeProvider } from '../context/ThemeContext';

const menuItems = [
  { path: '/', icon: BarChart3, label: 'لوحة التحكم', available: true },
  { path: '/conversations', icon: MessageSquare, label: 'المحادثات', available: true },
  { path: '/contacts', icon: Contact, label: 'جهات الاتصال', available: true },
  { path: '/departments', icon: Building2, label: 'الأقسام', available: true },
  { path: '/auto-replies', icon: Zap, label: 'الردود التلقائية', available: true },
  { path: '/follow-ups', icon: Clock, label: 'المتابعات', available: true },
  { path: '/workflows', icon: GitBranch, label: 'مسارات العمل', available: true },
  { path: '/help-center', icon: BookOpen, label: 'مركز المساعدة', available: true },
  { path: '/live-chat', icon: MessageCircle, label: 'الدردشة المباشرة', available: true },
  { path: '/webhooks', icon: Link2, label: 'الويب هوكس', available: true },
  { path: '/knowledge-base', icon: Database, label: 'قاعدة المعرفة', available: true },
  { path: '/ai-chat', icon: Bot, label: 'محادثة ذكية', available: true },
  { path: '/templates', icon: FileText, label: 'القوالب', available: true },
  { path: '/channels', icon: Radio, label: 'القنوات', available: true },
  { path: '/analytics', icon: BarChart3, label: 'التحليلات', available: false },
  { path: '/team', icon: Users, label: 'الفريق', available: false },
  { path: '/subscription', icon: Crown, label: 'الاشتراك', available: true },
  { path: '/settings', icon: Settings, label: 'الإعدادات', available: true }
];

const adminMenuItems = [
  { path: '/admin', icon: BarChart3, label: 'لوحة المدير', available: true },
  { path: '/admin/users', icon: Users, label: 'المستخدمين', available: true },
  { path: '/admin/roles', icon: Shield, label: 'الأدوار', available: true },
  { path: '/admin/system-logs', icon: ScrollText, label: 'سجل الأخطاء', available: true },
  { path: '/admin/articles', icon: BookOpen, label: 'المقالات', available: true },
  { path: '/admin/docs', icon: FileText, label: 'التوثيق', available: true },
  { path: '/admin/subscriptions', icon: Crown, label: 'الاشتراكات', available: true },
  { path: '/admin/invoices', icon: FileText, label: 'الفواتير', available: true },
  { path: '/admin/logs', icon: BarChart3, label: 'سجل النشاط', available: true }
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'light');
  const { user, logout } = useAuthStore();
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'min-h-screen bg-slate-950 text-slate-100' : 'min-h-screen bg-slate-50 text-slate-900'}>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 backdrop-blur-xl border-b ${
        isDark ? 'bg-slate-950/80 border-slate-800/60 text-slate-100' : 'bg-white/70 border-slate-200/60 text-slate-900'
      }`}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">AutoFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-teal-50 text-slate-600'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-teal-50 text-slate-600'}`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`sidebar-glass fixed top-0 right-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo area */}
        <div className={`flex items-center justify-between h-16 px-4 ${isDark ? 'border-b border-slate-800/60' : 'border-b border-slate-200/60'}`}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow duration-300">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AutoFlow</span>
          </Link>
          {/* Theme toggle - desktop only */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
              isDark ? 'hover:bg-white/10 text-slate-400 hover:text-teal-400' : 'hover:bg-teal-50 text-slate-400 hover:text-teal-600'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Close button - mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-3" style={{ height: 'calc(100vh - 4rem - 120px)' }}>
          {/* Main Navigation */}
          <div className={`mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="sidebar-section-label mb-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>القائمة الرئيسية</p>
          </div>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              if (!item.available) {
                return (
                  <div
                    key={item.path}
                    className={`sidebar-nav-item cursor-not-allowed opacity-50 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span className="flex-1">{item.label}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-md ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'} flex items-center gap-0.5`}>
                      <Lock className="w-2.5 h-2.5" />
                      قريباً
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-nav-item sidebar-nav-active group ${
                    isActive
                      ? `text-teal-600 ${isDark ? 'text-teal-400' : ''}`
                      : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-teal-400 to-emerald-600 shadow-md shadow-teal-500/25'
                      : isDark ? 'bg-slate-800/60 group-hover:bg-slate-700/80' : 'bg-slate-100 group-hover:bg-teal-50'
                  }`}>
                    <item.icon className={`w-[16px] h-[16px] ${isActive ? 'text-white' : ''}`} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Section */}
          <div className="mt-6 mb-1">
            <p className="sidebar-section-label" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>إدارة النظام</p>
          </div>
          <nav className="space-y-0.5">
            {adminMenuItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-nav-item group ${
                    isActive
                      ? `sidebar-admin-active text-violet-600 ${isDark ? 'text-violet-400' : ''}`
                      : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/25'
                      : isDark ? 'bg-slate-800/60 group-hover:bg-slate-700/80' : 'bg-slate-100 group-hover:bg-violet-50'
                  }`}>
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                  </div>
                  <span className="flex-1 text-[13px]">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" />
                  )}
                </Link>
              );
            })}
            {adminMenuItems.length > 4 && (
              <Link
                to="/admin"
                className={`sidebar-nav-item text-[13px] ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
                <span>عرض الكل</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User section - pinned to bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 ${isDark ? 'border-t border-slate-800/60' : 'border-t border-slate-200/60'}`}>
          <div className="sidebar-user-card p-3">
            {/* Plan badge */}
            <Link
              to="/subscription"
              className={`flex items-center gap-2 mb-3 p-2 rounded-xl transition-all duration-200 ${
                user?.subscription?.plan === 'premium'
                  ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10'
                  : isDark ? 'hover:bg-slate-700/60' : 'hover:bg-teal-50'
              }`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                user?.subscription?.plan === 'premium'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/25'
                  : 'bg-gradient-to-br from-amber-300/20 to-orange-400/20'
              }`}>
                <Crown className={`w-3.5 h-3.5 ${user?.subscription?.plan === 'premium' ? 'text-white' : 'text-amber-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {user?.subscription?.plan === 'free' ? 'خطة مجانية' :
                   user?.subscription?.plan === 'basic' ? 'خطة أساسية' :
                   user?.subscription?.plan === 'standard' ? 'خطة قياسية' :
                   user?.subscription?.plan === 'premium' ? 'خطة مميزة' : 'خطة مجانية'}
                </span>
              </div>
              {user?.subscription?.plan !== 'premium' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/25`}>
                  ترقية
                </span>
              )}
            </Link>

            {/* User info */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.name}</p>
                <p className={`text-[11px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="تسجيل خروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64 pt-14 lg:pt-0">
        <div className="p-4">
          <ThemeProvider value={theme}>
            <Outlet />
          </ThemeProvider>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;