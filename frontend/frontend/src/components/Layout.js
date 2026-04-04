import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Lock
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const menuItems = [
  { path: '/', icon: BarChart3, label: 'لوحة التحكم', available: true },
  { path: '/conversations', icon: MessageSquare, label: 'المحادثات', available: true },
  { path: '/templates', icon: FileText, label: 'القوالب', available: false },
  { path: '/channels', icon: Radio, label: 'القنوات', available: true },
  { path: '/analytics', icon: BarChart3, label: 'التحليلات', available: false },
  { path: '/team', icon: Users, label: 'الفريق', available: false },
  { path: '/subscription', icon: Crown, label: 'الاشتراك', available: true },
  { path: '/settings', icon: Settings, label: 'الإعدادات', available: true }
];

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-dark h-16 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-whatsapp to-primary-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold gradient-text">AutoFlow</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-dark-900 border-l border-dark-700 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-2 h-16 px-4 border-b border-dark-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-whatsapp to-primary-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AutoFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (!item.available) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 bg-dark-800/30 cursor-not-allowed"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full flex items-center gap-1">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-500 font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Plan Badge */}
          <div className="mb-4">
            <Link
              to="/subscription"
              className="flex items-center justify-between p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
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
                <span className="text-xs text-primary-500">ترقية</span>
              )}
            </Link>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64 pt-16 lg:pt-0">
        <div className="p-6">
          {children}
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