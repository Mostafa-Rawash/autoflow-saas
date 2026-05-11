import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { Users, CreditCard, MessageSquare, TrendingUp, Wifi, Server, Database, HardDrive, RefreshCw, AlertTriangle, Activity, Clock, Phone } from 'lucide-react';

const AdminDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statsRes, healthRes, logsRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/health'),
        api.get('/admin/logs', { params: { limit: 5 } })
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.stats);
        setError(null);
      } else if (statsRes.status === 'rejected') {
        setError('فشل في تحميل بيانات لوحة التحكم');
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value.data);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.data?.success) {
        setRecentLogs(logsRes.value.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 24) return `${Math.floor(hours / 24)} يوم`;
    if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
    return `${minutes} دقيقة`;
  };

  const quickLinks = [
    { title: 'المستخدمين', icon: Users, count: stats?.users?.total ?? '—', link: '/admin/users', colorClass: 'bg-purple-500/20 text-purple-400' },
    { title: 'الاشتراكات', icon: CreditCard, count: stats?.subscriptions ? (stats.subscriptions.free + stats.subscriptions.basic + stats.subscriptions.standard + stats.subscriptions.premium) : '—', link: '/admin/subscriptions', colorClass: 'bg-green-500/20 text-green-400' },
    { title: 'سجل النشاط', icon: Activity, count: recentLogs.length || '—', link: '/admin/logs', colorClass: 'bg-blue-500/20 text-blue-400' },
    { title: 'سجل الأخطاء', icon: AlertTriangle, count: '—', link: '/admin/system-logs', colorClass: 'bg-yellow-500/20 text-yellow-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary px-4 py-2 rounded-lg" aria-label="إعادة المحاولة">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>لوحة تحكم المدير</h1>
          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
            {lastRefresh ? `آخر تحديث: ${lastRefresh.toLocaleTimeString('ar-EG')}` : 'نظرة عامة على النظام'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className={`btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 ${refreshing ? 'opacity-50' : ''}`}
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-xl p-5 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>إجمالي المستخدمين</p>
              <p className={`text-3xl font-black mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{stats?.users?.total ?? '—'}</p>
              <p className="text-green-400 text-sm mt-1">
                +{stats?.users?.newToday ?? 0} اليوم
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>الإيرادات الشهرية</p>
              <p className={`text-3xl font-black mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {(stats?.subscriptions?.totalRevenue ?? 0).toLocaleString()}
              </p>
              <p className="text-green-400 text-sm mt-1">ج.م</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>المحادثات (30 يوم)</p>
              <p className={`text-3xl font-black mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {(stats?.activity?.conversationsLast30Days ?? 0).toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                {(stats?.activity?.messagesLast30Days ?? 0).toLocaleString()} رسالة
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>واتس آب</p>
              <p className={`text-3xl font-black mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {stats?.integrations?.whatsappConnected ?? 0}/{stats?.integrations?.whatsappMaxLimit ?? 10}
              </p>
              <p className="text-green-400 text-sm mt-1">
                {stats?.integrations?.whatsappActiveNow ?? 0} نشط الآن
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Phone className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.link}
            className={`rounded-xl p-4 hover:scale-105 transition-transform text-center ${theme === 'light' ? 'bg-white border border-slate-200 hover:shadow-md' : 'bg-dark-800 border border-dark-700 hover:border-dark-600'}`}
          >
            <div className={`w-12 h-12 rounded-xl ${link.colorClass} flex items-center justify-center mx-auto mb-2`}>
              <link.icon className="w-6 h-6" />
            </div>
            <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{link.title}</p>
            <p className={`text-2xl font-bold mt-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{link.count}</p>
          </Link>
        ))}
      </div>

      {/* Subscriptions Breakdown */}
      {stats?.subscriptions && (
        <div className={`rounded-xl p-6 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <h2 className={`text-lg font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>توزيع الاشتراكات</h2>
          <div className="space-y-3">
            {[
              { key: 'free', label: 'مجاني', count: stats.subscriptions.free, max: stats.users?.total || 1, color: 'bg-slate-400' },
              { key: 'basic', label: 'أساسي', count: stats.subscriptions.basic, max: stats.users?.total || 1, color: 'bg-blue-500' },
              { key: 'standard', label: 'قياسي', count: stats.subscriptions.standard, max: stats.users?.total || 1, color: 'bg-purple-500' },
              { key: 'premium', label: 'احترافي', count: stats.subscriptions.premium, max: stats.users?.total || 1, color: 'bg-green-500' },
            ].map(plan => (
              <div key={plan.key} className="flex items-center gap-3">
                <span className={`w-20 text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{plan.label}</span>
                <div className={`flex-1 h-3 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-dark-700'}`}>
                  <div
                    className={`h-full ${plan.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min((plan.count / plan.max) * 100, 100)}%` }}
                  />
                </div>
                <span className={`w-10 text-sm text-right font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{plan.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className={`rounded-xl p-6 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>آخر النشاطات</h2>
            <Link to="/admin/logs" className={`text-sm ${theme === 'light' ? 'text-primary-600 hover:text-primary-700' : 'text-primary-400 hover:text-primary-300'}`}>
              عرض الكل
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className={`w-10 h-10 mx-auto mb-2 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>لا يوجد نشاط حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log, idx) => {
                const typeMap = {
                  auth: { icon: Users, bg: 'bg-blue-500/20', text: 'text-blue-400' },
                  user: { icon: Users, bg: 'bg-purple-500/20', text: 'text-purple-400' },
                  subscription: { icon: CreditCard, bg: 'bg-green-500/20', text: 'text-green-400' },
                  conversation: { icon: MessageSquare, bg: 'bg-primary-500/20', text: 'text-primary-400' },
                  system: { icon: Server, bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
                };
                const typeInfo = typeMap[log.type] || typeMap.system;
                const Icon = typeInfo.icon;
                return (
                  <div key={log._id || idx} className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-dark-700/50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.bg}`}>
                      <Icon className={`w-4 h-4 ${typeInfo.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{log.action || log.message || '—'}</p>
                      <p className={`text-xs truncate ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{log.details || log.metadata || ''}</p>
                    </div>
                    <span className={`text-xs whitespace-nowrap ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString('ar-EG') : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className={`rounded-xl p-6 ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-dark-800 border border-dark-700'}`}>
          <h2 className={`text-lg font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>حالة النظام</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <div className="flex-1">
                <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>API</p>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  {health?.status === 'ok' ? 'متصل' : 'غير متصل'}
                </p>
              </div>
              <Server className={`w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${(stats?.integrations?.whatsappActiveNow ?? 0) > 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <div className="flex-1">
                <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>واتس آب</p>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  {(stats?.integrations?.whatsappActiveNow ?? 0) > 0 ? `${stats.integrations.whatsappActiveNow} نشط` : 'لا يوجد اتصالات نشطة'}
                </p>
              </div>
              <Phone className={`w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <div className="flex-1">
                <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>قاعدة البيانات</p>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>سليمة</p>
              </div>
              <Database className={`w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-blue-400' : 'bg-blue-400'}`} />
              <div className="flex-1">
                <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>وقت التشغيل</p>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  {formatUptime(health?.uptime)} {health?.version ? `• v${health.version}` : ''}
                </p>
              </div>
              <Clock className={`w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-green-400' : 'bg-green-400'}`} />
              <div className="flex-1">
                <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>البيئة</p>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  {health?.environment || '—'}
                </p>
              </div>
              <HardDrive className={`w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;