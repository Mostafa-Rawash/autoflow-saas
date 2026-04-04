import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, MessageSquare, Clock, BarChart3, PieChart, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const demoAnalytics = {
  overview: {
    totalConversations: 1248,
    activeConversations: 42,
    resolvedConversations: 876,
    pendingConversations: 330,
    totalMessages: 8432,
    avgResponseTime: '45 ثانية',
    satisfactionRate: 94
  },
  trends: {
    conversations: { value: 12, positive: true },
    messages: { value: 23, positive: true },
    responseTime: { value: 8, positive: true },
    satisfaction: { value: 5, positive: true }
  },
  dailyData: [
    { date: '2026-03-28', conversations: 38, messages: 245 },
    { date: '2026-03-29', conversations: 42, messages: 312 },
    { date: '2026-03-30', conversations: 35, messages: 198 },
    { date: '2026-03-31', conversations: 48, messages: 356 },
    { date: '2026-04-01', conversations: 52, messages: 423 },
    { date: '2026-04-02', conversations: 45, messages: 287 },
    { date: '2026-04-03', conversations: 58, messages: 512 },
    { date: '2026-04-04', conversations: 62, messages: 478 }
  ],
  topKeywords: [
    { keyword: 'أسعار', count: 234 },
    { keyword: 'حجز', count: 189 },
    { keyword: 'مواعيد', count: 156 },
    { keyword: 'تواصل', count: 134 },
    { keyword: 'موقع', count: 98 }
  ],
  responseTimes: [
    { range: '0-30 ثانية', count: 456 },
    { range: '30-60 ثانية', count: 312 },
    { range: '1-5 دقيقة', count: 198 },
    { range: '+5 دقيقة', count: 87 }
  ],
  channelBreakdown: [
    { channel: 'واتس آب', count: 1248, percentage: 100 }
  ]
};

const Analytics = () => {
  const { token } = useAuthStore();
  const [analytics, setAnalytics] = useState(demoAnalytics);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data && !data.demo) {
        setAnalytics(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.log('Using demo analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      dateRange,
      ...analytics
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoflow-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon: Icon, trend, suffix = '' }) => (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-500" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}{suffix}</p>
    </div>
  );

  const SimpleBarChart = ({ data, label }) => {
    const max = Math.max(...data.map(d => d.count || d.conversations || d.messages));
    return (
      <div className="space-y-3">
        {data.map((item, i) => {
          const value = item.count || item.conversations || item.messages || 0;
          const width = (value / max) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-400 truncate">{item.range || item.keyword || item.date}</div>
              <div className="flex-1 h-6 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-primary-500 to-whatsapp rounded-full transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="w-16 text-left text-sm font-medium">{value}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">التحليلات والتقارير</h1>
          <p className="text-gray-400 mt-1">نظرة شاملة على أداء واتس آب</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
          >
            <option value="24h">آخر 24 ساعة</option>
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
          </select>
          <button onClick={fetchAnalytics} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
          <button onClick={exportReport} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> تصدير
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي المحادثات" 
          value={analytics.overview.totalConversations.toLocaleString()}
          icon={MessageSquare}
          trend={analytics.trends.conversations}
        />
        <StatCard 
          title="الرسائل المرسلة" 
          value={analytics.overview.totalMessages.toLocaleString()}
          icon={BarChart3}
          trend={analytics.trends.messages}
        />
        <StatCard 
          title="متوسط وقت الرد" 
          value={analytics.overview.avgResponseTime}
          icon={Clock}
          trend={analytics.trends.responseTime}
        />
        <StatCard 
          title="معدل الرضا" 
          value={analytics.overview.satisfactionRate}
          icon={Users}
          trend={analytics.trends.satisfaction}
          suffix="%"
        />
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">محادثات نشطة</span>
            <span className="status-active">{analytics.overview.activeConversations}</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(analytics.overview.activeConversations / analytics.overview.totalConversations) * 100}%` }} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">محادثات معلقة</span>
            <span className="status-pending">{analytics.overview.pendingConversations}</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(analytics.overview.pendingConversations / analytics.overview.totalConversations) * 100}%` }} />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">محادثات محلولة</span>
            <span className="status-resolved">{analytics.overview.resolvedConversations}</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(analytics.overview.resolvedConversations / analytics.overview.totalConversations) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="card p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            تطور المحادثات اليومية
          </h3>
          <SimpleBarChart data={analytics.dailyData} />
        </div>

        {/* Response Time Distribution */}
        <div className="card p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            توزيع أوقات الرد
          </h3>
          <SimpleBarChart data={analytics.responseTimes} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Keywords */}
        <div className="card p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            أكثر الكلمات تكراراً
          </h3>
          <div className="space-y-3">
            {analytics.topKeywords.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-dark-700/30">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="font-medium">{item.keyword}</span>
                </div>
                <span className="text-primary-500 font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="card p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-500" />
            توزيع القنوات
          </h3>
          <div className="space-y-4">
            {analytics.channelBreakdown.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-whatsapp/10 border border-whatsapp/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-whatsapp/20 flex items-center justify-center">📱</div>
                    <span className="font-bold">{item.channel}</span>
                  </div>
                  <span className="text-whatsapp font-bold">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-whatsapp rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">{item.count.toLocaleString()} محادثة</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card p-6 bg-primary-500/10 border-primary-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h3 className="font-bold mb-1">التحليلات في وضع العرض</h3>
            <p className="text-gray-400 text-sm">
              هذه البيانات تجريبية لعرض شكل التحليلات. عند توصيل واتس آب الفعلي، ستظهر البيانات الحقيقية هنا.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;