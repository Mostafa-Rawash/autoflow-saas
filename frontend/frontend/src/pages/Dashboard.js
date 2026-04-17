import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, TrendingUp, TrendingDown, Users, Clock, ArrowUpRight, ArrowDownRight, 
  RefreshCw, Smartphone, Zap, BarChart3, Crown, Settings, Bell, ChevronLeft, AlertCircle
} from 'lucide-react';
import { conversationsAPI, analyticsAPI } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [trends] = useState({
    conversations: { value: 12, positive: true },
    messages: { value: 23, positive: true },
    responseTime: { value: 8, positive: true },
    responseRate: { value: 5, positive: true }
  });
  const [channelBreakdown, setChannelBreakdown] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Dashboard: Fetching data...');
      console.log('🔑 Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      
      // Fetch stats
      const statsRes = await conversationsAPI.getStats();
      console.log('📊 Stats response:', statsRes.data);
      
      if (statsRes.data?.success) {
        const statsData = statsRes.data;
        setStats({
          totalConversations: statsData.conversations?.total || 0,
          activeConversations: statsData.conversations?.active || 0,
          totalMessages: statsData.messages?.total || 0,
          responseRate: statsData.conversations?.total > 0
            ? Math.round((statsData.conversations.resolved / statsData.conversations.total) * 100)
            : 0,
          avgResponseTime: '45 ثانية'
        });
        
        if (statsData.byChannel?.length) {
          setChannelBreakdown(statsData.byChannel.map(b => ({
            ...b,
            color: '#25D366',
            name: 'واتس آب'
          })));
        }
      }

      // Fetch recent conversations
      const convRes = await conversationsAPI.getAll({ limit: 5 });
      console.log('💬 Conversations response:', convRes.data);
      
      if (convRes.data?.success && convRes.data.conversations?.length) {
        setRecentConversations(convRes.data.conversations.map(c => ({
          _id: c._id,
          channel: c.channel || 'whatsapp',
          contact: c.contact || { name: 'مستخدم', phone: '' },
          lastMessage: { content: c.lastMessage?.content || 'لا توجد رسائل' },
          status: c.status || 'active',
          unread: c.unreadCount || 0,
          time: c.lastMessage?.timestamp ? new Date(c.lastMessage.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'
        })));
      }

      toast.success('تم تحميل البيانات');
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      console.error('Response:', err.response?.data);
      setError(err.response?.data?.error || 'فشل في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'المحادثات اليوم', value: stats?.totalConversations || 0, icon: MessageSquare, trend: trends.conversations, color: 'primary' },
    { title: 'محادثات نشطة', value: stats?.activeConversations || 0, icon: Users, trend: trends.conversations, color: 'green' },
    { title: 'إجمالي الرسائل', value: stats?.totalMessages || 0, icon: BarChart3, trend: trends.messages, color: 'purple' },
    { title: 'معدل الرضا', value: `${stats?.responseRate || 0}%`, icon: TrendingUp, trend: trends.responseRate, color: 'yellow' }
  ];

  const quickActions = [
    { icon: Smartphone, label: 'توصيل واتس آب', link: '/channels', color: 'whatsapp', available: true },
    { icon: Zap, label: 'الردود التلقائية', link: '/auto-replies', color: 'primary', available: true },
    { icon: MessageSquare, label: 'المحادثات', link: '/conversations', color: 'blue', available: true },
    { icon: Crown, label: 'الاشتراك', link: '/subscription', color: 'yellow', available: true }
  ];

  const quickStats = [
    { label: 'قواعد الرد التلقائي', value: 5, link: '/auto-replies' },
    { label: 'قوالب نشطة', value: 12, link: '/templates' },
    { label: 'أيام متبقية في الاشتراك', value: 23, link: '/subscription' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
        <p className="text-gray-400">يرجى تسجيل الدخول</p>
        <Link to="/login" className="btn-primary mt-4">تسجيل الدخول</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
          <button onClick={fetchData} className="text-red-400 hover:underline text-sm">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">مرحباً، {user?.name?.split(' ')[0] || 'Mostafa'}! 👋</h1>
          <p className="text-gray-400 mt-1">إليك نظرة عامة على أداء حسابك اليوم</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
          <Link to="/settings" className="p-2.5 rounded-lg bg-dark-700 hover:bg-dark-600">
            <Settings className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="card p-5 hover:border-primary-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                stat.color === 'primary' ? 'bg-primary-500/20' :
                stat.color === 'green' ? 'bg-green-500/20' :
                stat.color === 'purple' ? 'bg-purple-500/20' :
                'bg-yellow-500/20'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'primary' ? 'text-primary-500' :
                  stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'purple' ? 'text-purple-500' :
                  'text-yellow-500'
                }`} />
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  stat.trend.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {stat.trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend.value}%
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {quickStats.map((item, i) => (
          <Link key={i} to={item.link} className="card p-4 flex items-center justify-between hover:border-primary-500/30 transition-colors">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <span className="font-bold text-lg">{item.value}</span>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              توزيع المحادثات حسب القناة
            </h3>
            <span className="text-xs text-gray-500">واتس آب فقط</span>
          </div>
          
          {channelBreakdown.length > 0 ? (
            <div className="space-y-4">
              {channelBreakdown.map((item) => (
                <div key={item._id} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="flex-1 font-medium">{item.name}</span>
                  <div className="w-48 h-3 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '100%', background: item.color }} />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-left font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد محادثات بعد</p>
              <Link to="/channels" className="text-primary-500 text-sm hover:underline">توصيل واتس آب</Link>
            </div>
          )}
          
          {/* Mini Chart Visualization */}
          <div className="mt-6 pt-6 border-t border-dark-700">
            <div className="flex items-end gap-2 h-24">
              {[65, 45, 78, 52, 88, 62, 95].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-whatsapp rounded-t transition-all hover:opacity-80" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>السبت</span>
              <span>الأحد</span>
              <span>الإثنين</span>
              <span>الثلاثاء</span>
              <span>الأربعاء</span>
              <span>الخميس</span>
              <span>الجمعة</span>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              أحدث المحادثات
            </h3>
            <Link to="/conversations" className="text-primary-500 text-sm hover:underline flex items-center gap-1">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          {recentConversations.length > 0 ? (
            <div className="space-y-3">
              {recentConversations.map((conv) => (
                <Link key={conv._id} to={`/conversations/${conv._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-whatsapp/20">📱</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{conv.contact.name}</p>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      conv.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      conv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-primary-500/20 text-primary-400'
                    }`}>
                      {conv.status === 'active' ? 'نشط' : conv.status === 'pending' ? 'معلق' : 'محلول'}
                    </span>
                    {conv.unread > 0 && (
                      <span className="bg-whatsapp text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد محادثات</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold">إجراءات سريعة</h3>
          <span className="px-2 py-1 bg-whatsapp/20 text-whatsapp text-xs rounded-full">واتس آب فقط</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.link} className={`p-4 rounded-xl border transition-all hover:scale-105 ${
              action.available 
                ? `bg-${action.color}/10 border-${action.color}/30 hover:bg-${action.color}/20`
                : 'bg-dark-700/30 border-dark-600 opacity-50 cursor-not-allowed'
            }`}>
              <action.icon className={`w-6 h-6 mb-2 ${
                action.color === 'whatsapp' ? 'text-whatsapp' :
                action.color === 'primary' ? 'text-primary-500' :
                action.color === 'blue' ? 'text-blue-500' :
                'text-yellow-500'
              }`} />
              <p className="font-medium text-sm">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-whatsapp/10 border-primary-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center">
              <Clock className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">متوسط وقت الرد</p>
              <p className="text-2xl font-bold">{stats?.avgResponseTime || '45 ثانية'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowDownRight className="w-4 h-4" />
              <span>تحسن {trends.responseTime.value}%</span>
            </div>
            <p className="text-gray-500 text-xs mt-1">مقارنة بالأسبوع الماضي</p>
          </div>
        </div>
      </div>

      {/* WhatsApp-Only Notice */}
      <div className="card p-4 bg-whatsapp/5 border-whatsapp/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <p className="text-sm text-gray-400">
            <span className="text-whatsapp font-medium">واتس آب</span> هو القناة النشطة حالياً. باقي القنوات ستتوفر قريباً.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;