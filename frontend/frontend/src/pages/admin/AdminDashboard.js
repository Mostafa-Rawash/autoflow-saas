import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const stats = {
    users: { total: 85, active: 72, new: 8 },
    subscriptions: { total: 45, revenue: 34000, active: 42 },
    content: { articles: 30, docs: 61, views: 12500 },
    conversations: { total: 3500, autoReplies: 2800, satisfaction: 94 }
  };

  const quickLinks = [
    { title: 'المستخدمين', icon: '👥', count: stats.users.total, link: '/admin/users', color: 'purple' },
    { title: 'الاشتراكات', icon: '💳', count: stats.subscriptions.total, link: '/admin/subscriptions', color: 'green' },
    { title: 'المقالات', icon: '📰', count: stats.content.articles, link: '/admin/articles', color: 'blue' },
    { title: 'التوثيق', icon: '📚', count: stats.content.docs, link: '/admin/docs', color: 'yellow' },
    { title: 'الفواتير', icon: '🧾', count: '34K', link: '/admin/invoices', color: 'primary' },
    { title: 'سجل النشاط', icon: '📋', count: '1.2K', link: '/admin/logs', color: 'gray' }
  ];

  const recentActivity = [
    { type: 'user', action: 'مستخدم جديد', details: 'أحمد محمد سجل', time: 'منذ 5 دقائق' },
    { type: 'subscription', action: 'اشتراك جديد', details: 'خطة احترافية - 4000 ج.م', time: 'منذ 15 دقيقة' },
    { type: 'content', action: 'مقال جديد', details: 'دليل أتمتة واتس آب', time: 'منذ 30 دقيقة' },
    { type: 'payment', action: 'دفعة مستلمة', details: 'INV-001 - 4000 ج.م', time: 'منذ ساعة' },
    { type: 'system', action: 'نسخ احتياطي', details: 'تم بنجاح', time: 'منذ 3 ساعات' }
  ];

  const chartData = [
    { month: 'يناير', users: 45, revenue: 15000 },
    { month: 'فبراير', users: 58, revenue: 22000 },
    { month: 'مارس', users: 72, revenue: 28000 },
    { month: 'أبريل', users: 85, revenue: 34000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم المدير</h1>
          <p className="text-gray-400 text-sm mt-1">نظرة عامة على النظام</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            تصدير تقرير
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
              <p className="text-3xl font-black mt-1">{stats.users.total}</p>
              <p className="text-green-400 text-sm mt-1">+{stats.users.new} هذا الأسبوع</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الإيرادات الشهرية</p>
              <p className="text-3xl font-black mt-1">{stats.subscriptions.revenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm mt-1">ج.م</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المحادثات</p>
              <p className="text-3xl font-black mt-1">{stats.conversations.total.toLocaleString()}</p>
              <p className="text-primary-400 text-sm mt-1">{stats.conversations.satisfaction}% رضا</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
              💬
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مشاهدات المحتوى</p>
              <p className="text-3xl font-black mt-1">{stats.content.views.toLocaleString()}</p>
              <p className="text-yellow-400 text-sm mt-1">هذا الشهر</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.link}
            className="glass rounded-xl p-4 hover:scale-105 transition-transform text-center"
          >
            <div className={`w-12 h-12 rounded-xl bg-${link.color}-500/20 flex items-center justify-center text-2xl mx-auto mb-2`}>
              {link.icon}
            </div>
            <p className="font-semibold">{link.title}</p>
            <p className="text-2xl font-bold mt-1">{link.count}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">نمو المستخدمين والإيرادات</h2>
          <div className="space-y-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.month}</span>
                  <span className="text-gray-400">{item.users} مستخدم • {item.revenue.toLocaleString()} ج.م</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(item.users / 100) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(item.revenue / 40000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">آخر النشاطات</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'user' ? 'bg-purple-500/20' :
                  activity.type === 'subscription' ? 'bg-green-500/20' :
                  activity.type === 'content' ? 'bg-blue-500/20' :
                  activity.type === 'payment' ? 'bg-yellow-500/20' :
                  'bg-gray-500/20'
                }`}>
                  {activity.type === 'user' ? '👤' :
                   activity.type === 'subscription' ? '💳' :
                   activity.type === 'content' ? '📝' :
                   activity.type === 'payment' ? '💰' : '⚙️'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">حالة النظام</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <div>
              <p className="font-semibold">API</p>
              <p className="text-xs text-gray-400">متصل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <div>
              <p className="font-semibold">واتس آب</p>
              <p className="text-xs text-gray-400">نشط</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <div>
              <p className="font-semibold">قاعدة البيانات</p>
              <p className="text-xs text-gray-400">سليمة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
            <div>
              <p className="font-semibold">التخزين</p>
              <p className="text-xs text-gray-400">78% مستخدم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;