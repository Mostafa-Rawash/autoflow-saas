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
  Moon
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const menuItems = [
  { path: '/', icon: BarChart3, label: 'لوحة التحكم', available: true },
  { path: '/conversations', icon: MessageSquare, label: 'المحادثات', available: true },
  { path: '/auto-replies', icon: Zap, label: 'الردود التلقائية', available: true },
  { path: '/templates', icon: FileText, label: 'القوالب', available: false },
  { path: '/channels', icon: Radio, label: 'القنوات', available: true },
  { path: '/analytics', icon: BarChart3, label: 'التحليلات', available: false },
  { path: '/team', icon: Users, label: 'الفريق', available: false },
  { path: '/subscription', icon: Crown, label: 'الاشتراك', available: true },
  { path: '/settings', icon: Settings, label: 'الإعدادات', available: true }
];

// Admin menu items
const adminMenuItems = [
  { path: '/admin', icon: BarChart3, label: 'لوحة المدير', available: true },
  { path: '/admin/users', icon: Users, label: 'المستخدمين', available: true },
  { path: '/admin/roles', icon: Lock, label: 'الأدوار', available: true },
  { path: '/admin/system-logs', icon: BarChart3, label: 'سجل الأخطاء', available: true },
  { path: '/admin/articles', icon: FileText, label: 'المقالات', available: true },
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

  return (
    <div className={theme === 'light' ? 'min-h-screen bg-slate-50 text-slate-900' : 'min-h-screen bg-slate-950 text-slate-100'}>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 ${theme === 'light' ? 'bg-white/95 border-b border-slate-200 text-slate-900 shadow-sm' : 'glass-dark text-slate-100'}`}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-500">AutoFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 z-40 transform transition-transform duration-300 lg:translate-x-0 ${theme === 'light' ? 'bg-white border-l border-slate-200 text-slate-900 shadow-xl shadow-slate-200/60' : 'bg-slate-950 border-l border-slate-800 text-slate-100'} ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`hidden lg:flex items-center gap-2 h-16 px-4 ${theme === 'light' ? 'border-b border-slate-200' : 'border-b border-slate-800'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-500">AutoFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (!item.available) {
              return (
                <div
                  key={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed ${theme === 'light' ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-900/40'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : theme === 'light' ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Section */}
        <div className="px-4 py-2">
          <p className={`text-xs font-semibold mb-2 px-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>إدارة النظام</p>
        </div>
        <nav className="px-4 pb-2 space-y-1">
          {adminMenuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                    : theme === 'light' ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {adminMenuItems.length > 4 && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span>عرض الكل...</span>
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${theme === 'light' ? 'border-t border-slate-200' : 'border-t border-dark-700'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-sky-600 font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className={`text-xs truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email}</p>
            </div>
          </div>
          
          {/* Plan Badge */}
          <div className="mb-4">
            <Link
              to="/subscription"
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-900/60 hover:bg-slate-800 text-slate-100'}`}
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm">
                  {user?.subscription?.plan === 'free' ? 'خطة مجانية' :
                   user?.subscription?.plan === 'basic' ? 'خطة أساسية' :
                   user?.subscription?.plan === 'standard' ? 'خطة قياسية' :
                   user?.subscription?.plan === 'premium' ? 'خطة مميزة' : 'خطة مجانية'}
                </span>
              </div>
              {user?.subscription?.plan !== 'premium' && (
                <span className="text-xs text-sky-600">ترقية</span>
              )}
            </Link>
          </div>
          
          <button
            onClick={logout}
            className={`flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'}`}
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64 pt-14 lg:pt-0">
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;