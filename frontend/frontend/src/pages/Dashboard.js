import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { conversationsAPI, analyticsAPI } from '../api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    responseRate: 0
  });
  const [channelBreakdown, setChannelBreakdown] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, channelsRes, conversationsRes] = await Promise.all([
        conversationsAPI.getStats(),
        analyticsAPI.getChannels(),
        conversationsAPI.getAll({ limit: 5 })
      ]);

      setStats({
        totalConversations: statsRes.data.conversations?.total || 0,
        activeConversations: statsRes.data.conversations?.active || 0,
        totalMessages: statsRes.data.messages?.total || 0,
        responseRate: statsRes.data.conversations?.total > 0
          ? Math.round((statsRes.data.conversations?.resolved / statsRes.data.conversations?.total) * 100)
          : 0
      });
      setChannelBreakdown(channelsRes.data.breakdown || []);
      setRecentConversations(conversationsRes.data.conversations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'المحادثات اليوم',
      value: stats.totalConversations,
      icon: MessageSquare,
      change: '+12%',
      positive: true
    },
    {
      title: 'محادثات نشطة',
      value: stats.activeConversations,
      icon: Users,
      change: '+5%',
      positive: true
    },
    {
      title: 'إجمالي الرسائل',
      value: stats.totalMessages,
      icon: TrendingUp,
      change: '+23%',
      positive: true
    },
    {
      title: 'معدل الرد',
      value: `${stats.responseRate}%`,
      icon: Clock,
      change: '+8%',
      positive: true
    }
  ];

  const channelColors = {
    whatsapp: '#25D366',
    messenger: '#0084FF',
    instagram: '#E4405F',
    telegram: '#0088cc',
    livechat: '#00D4AA',
    email: '#EA4335',
    sms: '#7C3AED',
    api: '#F59E0B'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-400 mt-1">إليك نظرة عامة على أداء حسابك</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {stat.positive ? (
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 mr-1">من أمس</span>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Breakdown & Recent Conversations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">توزيع المحادثات حسب القناة</h3>
          <div className="space-y-4">
            {channelBreakdown.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: channelColors[item._id] || '#00D4AA' }}
                />
                <span className="flex-1 capitalize">{item._id}</span>
                <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / stats.totalConversations) * 100}%`,
                      background: channelColors[item._id] || '#00D4AA'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-left">
                  {item.count}
                </span>
              </div>
            ))}
            {channelBreakdown.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                لا توجد محادثات بعد. ابدأ بتوصيل قناة!
              </p>
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">أحدث المحادثات</h3>
            <Link to="/conversations" className="text-primary-500 text-sm hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {recentConversations.map((conv) => (
              <Link
                key={conv._id}
                to={`/conversations/${conv._id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: `${channelColors[conv.channel]}20` }}
                >
                  {conv.channel === 'whatsapp' && '📱'}
                  {conv.channel === 'messenger' && '💬'}
                  {conv.channel === 'instagram' && '📷'}
                  {conv.channel === 'telegram' && '✈️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {conv.contact?.name || conv.contact?.phone || 'مستخدم'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage?.content || 'لا توجد رسائل'}
                  </p>
                </div>
                <div className="text-left">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    conv.status === 'active' ? 'status-active' :
                    conv.status === 'pending' ? 'status-pending' : 'status-resolved'
                  }`}>
                    {conv.status === 'active' ? 'نشط' :
                     conv.status === 'pending' ? 'معلق' : 'محلول'}
                  </span>
                </div>
              </Link>
            ))}
            {recentConversations.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                لا توجد محادثات بعد
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold">إجراءات سريعة</h3>
          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
            واتس آب فقط
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/channels"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-whatsapp/10 border border-whatsapp/30 hover:bg-whatsapp/20 transition-colors"
          >
            <div className="text-3xl">📱</div>
            <span className="text-sm font-medium">توصيل واتس آب</span>
          </Link>
          <div
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-800/30 opacity-50 cursor-not-allowed relative"
          >
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
              قريباً
            </span>
            <div className="text-3xl">📝</div>
            <span className="text-sm text-gray-400">إنشاء قالب</span>
          </div>
          <div
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-800/30 opacity-50 cursor-not-allowed relative"
          >
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
              قريباً
            </span>
            <div className="text-3xl">👥</div>
            <span className="text-sm text-gray-400">دعوة فريق</span>
          </div>
          <div
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-800/30 opacity-50 cursor-not-allowed relative"
          >
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
              قريباً
            </span>
            <div className="text-3xl">📊</div>
            <span className="text-sm text-gray-400">التحليلات</span>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">
          المزيد من الميزات قيد التطوير وستكون متاحة قريباً!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;