import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, Phone, Mail, Clock } from 'lucide-react';

const Conversations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock conversations data
  const mockConversations = [
    {
      id: '1',
      contact: { name: 'أحمد محمد', phone: '+201012345678', avatar: null },
      channel: 'whatsapp',
      lastMessage: 'مرحباً، عايز أعرف أسعار المنتجات الجديدة',
      lastMessageTime: '2026-04-04T14:30:00Z',
      status: 'active',
      unread: 2
    },
    {
      id: '2',
      contact: { name: 'سارة علي', phone: '+201098765432', avatar: null },
      channel: 'messenger',
      lastMessage: 'شكراً على المساعدة السريعة! 🙏',
      lastMessageTime: '2026-04-04T13:45:00Z',
      status: 'resolved',
      unread: 0
    },
    {
      id: '3',
      contact: { name: 'محمد خالد', phone: '+201112223334', avatar: null },
      channel: 'instagram',
      lastMessage: 'هل عندكم فرع في الإسكندرية؟',
      lastMessageTime: '2026-04-04T12:20:00Z',
      status: 'pending',
      unread: 1
    },
    {
      id: '4',
      contact: { name: 'فاطمة أحمد', phone: '+201223334445', avatar: null },
      channel: 'whatsapp',
      lastMessage: 'عيز أطلب حجز للعيادة بكرة',
      lastMessageTime: '2026-04-04T11:00:00Z',
      status: 'active',
      unread: 3
    },
    {
      id: '5',
      contact: { name: 'يوسف حسن', phone: '+201334445556', avatar: null },
      channel: 'telegram',
      lastMessage: 'الطلب وصل بسلام، شكراً!',
      lastMessageTime: '2026-04-04T10:15:00Z',
      status: 'resolved',
      unread: 0
    },
    {
      id: '6',
      contact: { name: 'نور الدين', phone: '+201445556667', avatar: null },
      channel: 'whatsapp',
      lastMessage: 'عايز أعرف مواعيد العمل',
      lastMessageTime: '2026-04-03T22:30:00Z',
      status: 'pending',
      unread: 1
    },
    {
      id: '7',
      contact: { name: 'لبنى محمود', phone: '+201556667778', avatar: null },
      channel: 'messenger',
      lastMessage: 'هل فيه خصم للعملاء الجدد؟',
      lastMessageTime: '2026-04-03T18:45:00Z',
      status: 'active',
      unread: 0
    },
    {
      id: '8',
      contact: { name: 'عمر سعيد', phone: '+201667778889', avatar: null },
      channel: 'instagram',
      lastMessage: 'المنتج رائع جداً! ⭐⭐⭐⭐⭐',
      lastMessageTime: '2026-04-03T15:00:00Z',
      status: 'resolved',
      unread: 0
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

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المحادثات</h1>
          <p className="text-gray-400 mt-1">إدارة جميع محادثاتك في مكان واحد</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-active px-3 py-1 text-sm">
            {mockConversations.filter(c => c.status === 'active').length} نشطة
          </span>
          <Link to="/channels" className="btn-primary">
            + توصيل قناة
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="ابحث في المحادثات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 focus:border-primary-500 outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة</option>
            <option value="pending">معلقة</option>
            <option value="resolved">محلولة</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.map((conv) => (
          <Link
            key={conv.id}
            to={`/conversations/${conv.id}`}
            className="card p-4 hover:border-primary-500/30 transition-colors block"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{ background: `${channelColors[conv.channel]}20` }}
              >
                {conv.contact.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold truncate">{conv.contact.name}</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm flex items-center gap-1"
                    style={{ color: channelColors[conv.channel] }}
                  >
                    {channelIcons[conv.channel]} {conv.channel}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{conv.contact.phone}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
              </div>

              {/* Status & Unread */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                  conv.status === 'active' ? 'status-active' :
                  conv.status === 'pending' ? 'status-pending' : 'status-resolved'
                }`}>
                  {conv.status === 'active' ? 'نشط' :
                   conv.status === 'pending' ? 'معلق' : 'محلول'}
                </span>
                {conv.unread > 0 && (
                  <span className="bg-primary-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">لا توجد نتائج</h2>
          <p className="text-gray-400">
            جرب تغيير البحث أو الفلتر
          </p>
        </div>
      )}
    </div>
  );
};

export default Conversations;