import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { conversationsAPI, analyticsAPI } from '../api';
import useAuthStore from '../store/authStore';

const mockStats = {
  totalConversations: 48,
  activeConversations: 12,
  totalMessages: 326,
  responseRate: 92
};

const mockChannelBreakdown = [
  { _id: 'whatsapp', count: 48 }
];

const mockRecentConversations = [
  {
    _id: 'conv-1',
    channel: 'whatsapp',
    contact: { name: 'أحمد علي', phone: '+201012345678' },
    lastMessage: { content: 'عايز أعرف سعر الباقة المناسبة ليا' },
    status: 'active'
  },
  {
    _id: 'conv-2',
    channel: 'whatsapp',
    contact: { name: 'سارة محمود', phone: '+201023456789' },
    lastMessage: { content: 'تمام، شكراً على الرد السريع' },
    status: 'pending'
  },
  {
    _id: 'conv-3',
    channel: 'whatsapp',
    contact: { name: 'محمد خالد', phone: '+201034567890' },
    lastMessage: { content: 'محتاج أفعل الحساب' },
    status: 'resolved'
  }
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(mockStats);
  const [channelBreakdown, setChannelBreakdown] = useState(mockChannelBreakdown);
  const [recentConversations, setRecentConversations] = useState(mockRecentConversations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, channelsRes, conversationsRes] = await Promise.allSettled([
        conversationsAPI.getStats(),
        analyticsAPI.getChannels(),
        conversationsAPI.getAll({ limit: 5 })
      ]);

      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data : null;
      const channelData = channelsRes.status === 'fulfilled' ? channelsRes.value.data : null;
      const conversationsData = conversationsRes.status === 'fulfilled' ? conversationsRes.value.data : null;

      setStats({
        totalConversations: statsData?.conversations?.total || mockStats.totalConversations,
        activeConversations: statsData?.conversations?.active || mockStats.activeConversations,
        totalMessages: statsData?.messages?.total || mockStats.totalMessages,
        responseRate: statsData?.conversations?.total > 0
          ? Math.round((statsData.conversations.resolved / statsData.conversations.total) * 100)
          : mockStats.responseRate
      });

      setChannelBreakdown(channelData?.breakdown?.length ? channelData.breakdown : mockChannelBreakdown);
      setRecentConversations(conversationsData?.conversations?.length ? conversationsData.conversations : mockRecentConversations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(mockStats);
      setChannelBreakdown(mockChannelBreakdown);
      setRecentConversations(mockRecentConversations);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'المحادثات اليوم', value: stats.totalConversations, icon: MessageSquare, change: '+12%', positive: true },
    { title: 'محادثات نشطة', value: stats.activeConversations, icon: Users, change: '+5%', positive: true },
    { title: 'إجمالي الرسائل', value: stats.totalMessages, icon: TrendingUp, change: '+23%', positive: true },
    { title: 'معدل الرد', value: `${stats.responseRate}%`, icon: Clock, change: '+8%', positive: true }
  ];

  const channelColors = { whatsapp: '#25D366' };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، {user?.name?.split(' ')[0] || 'Mostafa'}! 👋</h1>
          <p className="text-gray-400 mt-1">إليك نظرة عامة على أداء حسابك</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

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
              {stat.positive ? <ArrowUpRight className="w-4 h-4 text-green-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
              <span className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</span>
              <span className="text-xs text-gray-500 mr-1">من أمس</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold mb-4">توزيع المحادثات حسب القناة</h3>
          <div className="space-y-4">
            {channelBreakdown.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: channelColors[item._id] || '#00D4AA' }} />
                <span className="flex-1 capitalize">{item._id}</span>
                <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '100%', background: channelColors[item._id] || '#00D4AA' }} />
                </div>
                <span className="text-sm text-gray-400 w-12 text-left">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">أحدث المحادثات</h3>
            <Link to="/conversations" className="text-primary-500 text-sm hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {recentConversations.map((conv) => (
              <Link key={conv._id} to={`/conversations/${conv._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: `${channelColors[conv.channel]}20` }}>📱</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{conv.contact?.name || conv.contact?.phone || 'مستخدم'}</p>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content || 'لا توجد رسائل'}</p>
                </div>
                <div className="text-left">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${conv.status === 'active' ? 'status-active' : conv.status === 'pending' ? 'status-pending' : 'status-resolved'}`}>
                    {conv.status === 'active' ? 'نشط' : conv.status === 'pending' ? 'معلق' : 'محلول'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold">إجراءات سريعة</h3>
          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">واتس آب فقط</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/channels" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-whatsapp/10 border border-whatsapp/30 hover:bg-whatsapp/20 transition-colors">
            <div className="text-3xl">📱</div>
            <span className="text-sm font-medium">توصيل واتس آب</span>
          </Link>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-800/30 opacity-50 cursor-not-allowed relative">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">قريباً</span>
            <div className="text-3xl">📝</div>
            <span className="text-sm text-gray-400">إنشاء قالب</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-800/30 opacity-50 cursor-not-allowed relative">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">قريباً</span>
            <div className="text-3xl">📊</div>
            <span className="text-sm text-gray-400">التقارير</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-800/30 opacity-50 cursor-not-allowed relative">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">قريباً</span>
            <div className="text-3xl">👥</div>
            <span className="text-sm text-gray-400">الفريق</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
