import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock } from 'lucide-react';

const mockConversations = [
  {
    id: '1',
    contact: { name: 'أحمد محمد', phone: '+201012345678' },
    channel: 'whatsapp',
    lastMessage: 'مرحباً، عايز أعرف أسعار الباقات الجديدة',
    lastMessageTime: '2026-04-04T14:30:00Z',
    status: 'active',
    unread: 2
  },
  {
    id: '2',
    contact: { name: 'سارة علي', phone: '+201098765432' },
    channel: 'whatsapp',
    lastMessage: 'شكراً على المساعدة السريعة! 🙏',
    lastMessageTime: '2026-04-04T13:45:00Z',
    status: 'resolved',
    unread: 0
  },
  {
    id: '3',
    contact: { name: 'محمد خالد', phone: '+201112223334' },
    channel: 'whatsapp',
    lastMessage: 'هل عندكم فرع في الإسكندرية؟',
    lastMessageTime: '2026-04-04T12:20:00Z',
    status: 'pending',
    unread: 1
  },
  {
    id: '4',
    contact: { name: 'فاطمة أحمد', phone: '+201223334445' },
    channel: 'whatsapp',
    lastMessage: 'عايز أطلب حجز للعيادة بكرة',
    lastMessageTime: '2026-04-04T11:00:00Z',
    status: 'active',
    unread: 3
  }
];

const Conversations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المحادثات</h1>
          <p className="text-slate-500 mt-1">إدارة محادثات واتس آب فقط في مكان واحد</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-sm">{mockConversations.filter(c => c.status === 'active').length} نشطة</span>
          <Link to="/channels" className="btn-primary">+ توصيل واتس آب</Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="ابحث في المحادثات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-lg py-3 pr-10 pl-4 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 border border-slate-300 rounded-lg py-3 px-4 focus:border-sky-500 outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة</option>
            <option value="pending">معلقة</option>
            <option value="resolved">محلولة</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredConversations.map((conv) => (
          <Link key={conv.id} to={`/conversations/${conv.id}`} className="card p-4 hover:border-sky-300 transition-colors block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 bg-emerald-50">📱</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold truncate">{conv.contact.name}</h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-sky-700 flex items-center gap-1">📱 whatsapp</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sm text-slate-500">{conv.contact.phone}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${conv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : conv.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                  {conv.status === 'active' ? 'نشط' : conv.status === 'pending' ? 'معلق' : 'محلول'}
                </span>
                {conv.unread > 0 && (
                  <span className="bg-sky-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">لا توجد نتائج</h2>
          <p className="text-slate-500">جرب تغيير البحث أو الفلتر</p>
        </div>
      )}
    </div>
  );
};

export default Conversations;
