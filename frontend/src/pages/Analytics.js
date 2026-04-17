import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, RefreshCw, Calendar } from 'lucide-react';
import { analyticsAPI } from '../api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [overview, setOverview] = useState({
    conversations: { total: 0, active: 0, resolved: 0 },
    messages: { total: 0, byBot: 0, byAgent: 0, byContact: 0 }
  });
  const [channels, setChannels] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, channelsRes, timelineRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getChannels(),
        analyticsAPI.getTimeline({ days })
      ]);
      
      setOverview(overviewRes.data);
      setChannels(channelsRes.data.breakdown || []);
      setTimeline(timelineRes.data.timeline || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('فشل في تحميل التحليلات');
    } finally {
      setLoading(false);
    }
  };

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

  const channelIcons = {
    whatsapp: '📱',
    messenger: '💬',
    instagram: '📷',
    telegram: '✈️',
    livechat: '🖥️',
    email: '📧',
    sms: '📱',
    api: '🔗'
  };

  const statsCards = [
    {
      title: 'إجمالي المحادثات',
      value: overview.conversations.total,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'محادثات نشطة',
      value: overview.conversations.active,
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'محادثات محلولة',
      value: overview.conversations.resolved,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'إجمالي الرسائل',
      value: overview.messages.total,
      icon: BarChart3,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  const maxTimelineValue = Math.max(...timeline.map(t => t.count), 1);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">التحليلات</h1>
          <p className="text-gray-400 mt-1">نظرة عامة على أداء محادثاتك</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={14}>آخر 14 يوم</option>
            <option value={30}>آخر 30 يوم</option>
          </select>
          <button
            onClick={fetchData}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Timeline Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">المحادثات عبر الوقت</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            آخر {days} يوم
          </div>
        </div>
        
        {timeline.length > 0 ? (
          <div className="h-48 flex items-end gap-2">
            {timeline.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-400"
                  style={{ height: `${(item.count / maxTimelineValue) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                  {new Date(item._id).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-xs text-primary-400">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد بيانات كافية لعرضها</p>
              <p className="text-xs">ابدأ بتوصيل قناة واستقبال محادثات</p>
            </div>
          </div>
        )}
      </div>

      {/* Channels Breakdown & Message Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Channels Breakdown */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">توزيع المحادثات حسب القناة</h3>
          
          {channels.length > 0 ? (
            <div className="space-y-4">
              {channels.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: `${channelColors[item._id]}20` }}
                  >
                    {channelIcons[item._id] || '📱'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="capitalize font-medium">{item._id}</span>
                      <span className="text-sm text-gray-400">{item.count} محادثة</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.count / overview.conversations.total) * 100}%`,
                          background: channelColors[item._id] || '#00D4AA'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد محادثات بعد</p>
            </div>
          )}
        </div>

        {/* Message Distribution */}
        <div className="card p-6">
          <h3 className="font-bold mb-4">توزيع الرسائل حسب المرسل</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  🤖
                </div>
                <span>ردود تلقائية</span>
              </div>
              <span className="font-bold text-blue-400">
                {overview.messages.byBot.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  👤
                </div>
                <span>ردود الوكيل</span>
              </div>
              <span className="font-bold text-green-400">
                {overview.messages.byAgent.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  💬
                </div>
                <span>رسائل العملاء</span>
              </div>
              <span className="font-bold text-purple-400">
                {overview.messages.byContact.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pie Chart Placeholder */}
          {overview.messages.total > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-600">
              <div className="flex items-center justify-center gap-8">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${(overview.messages.byBot / overview.messages.total) * 100} ${100 - (overview.messages.byBot / overview.messages.total) * 100}`}
                      strokeDashoffset="25"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="transparent"
                      stroke="#22C55E"
                      strokeWidth="3"
                      strokeDasharray={`${(overview.messages.byAgent / overview.messages.total) * 100} ${100 - (overview.messages.byAgent / overview.messages.total) * 100}`}
                      strokeDashoffset={25 - (overview.messages.byBot / overview.messages.total) * 100}
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="transparent"
                      stroke="#A855F7"
                      strokeWidth="3"
                      strokeDasharray={`${(overview.messages.byContact / overview.messages.total) * 100} ${100 - (overview.messages.byContact / overview.messages.total) * 100}`}
                      strokeDashoffset={25 - ((overview.messages.byBot + overview.messages.byAgent) / overview.messages.total) * 100}
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{overview.messages.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">إجمالي الرسائل</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">تصدير البيانات</h3>
            <p className="text-sm text-gray-500">قم بتصدير تحليلاتك بصيغة JSON</p>
          </div>
          <button
            onClick={() => window.open('/api/analytics/export', '_blank')}
            className="btn-secondary"
          >
            تصدير
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;