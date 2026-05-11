import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, MessageCircle, Phone, Mail, User, Send, MessageSquare, Image, Code, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { conversationsAPI } from '../api';

const ChannelIcon = ({ channel, size = 20 }) => {
  const props = { size, className: 'flex-shrink-0' };
  switch (channel) {
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="white" className="flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.377l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    case 'telegram':
      return <Send {...props} />;
    case 'messenger':
      return <MessageSquare {...props} />;
    case 'instagram':
      return <Image {...props} />;
    case 'livechat':
      return <MessageCircle {...props} />;
    case 'email':
      return <Mail {...props} />;
    case 'sms':
      return <Phone {...props} />;
    case 'api':
      return <Code {...props} />;
    default:
      return <Radio {...props} />;
  }
};

const channelConfig = {
  whatsapp: { name: 'واتس آب', color: '#25D366' },
  telegram: { name: 'تيليجرام', color: '#0088cc' },
  messenger: { name: 'ماسنجر', color: '#0084FF' },
  instagram: { name: 'إنستجرام', color: '#E4405F' },
  livechat: { name: 'دردشة مباشرة', color: '#7C3AED' },
  email: { name: 'بريد إلكتروني', color: '#EA4335' },
  sms: { name: 'SMS', color: '#6B7280' },
  api: { name: 'API', color: '#F59E0B' }
};

const statusConfig = {
  active: { name: 'نشط', color: 'emerald' },
  pending: { name: 'معلق', color: 'amber' },
  resolved: { name: 'محلول', color: 'sky' },
  closed: { name: 'مغلق', color: 'slate' }
};

const Conversations = () => {
  const theme = useTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await conversationsAPI.getAll(params);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations
    .filter(conv => {
      if (channelFilter !== 'all' && conv.channel !== channelFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        conv.contact?.name?.toLowerCase().includes(q) ||
        conv.lastMessage?.content?.toLowerCase().includes(q) ||
        conv.contact?.phone?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      return 0;
    });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} د`;
    if (diffHours < 24) return `منذ ${diffHours} س`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    pending: conversations.filter(c => c.status === 'pending').length,
    unresolved: conversations.filter(c => c.status === 'active' || c.status === 'pending').length
  };

  const activeChannels = [...new Set(conversations.map(c => c.channel))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>المحادثات</h1>
        <p className={`mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>إدارة جميع محادثاتك في مكان واحد</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي', value: stats.total, icon: MessageCircle, color: 'sky' },
          { label: 'نشطة', value: stats.active, icon: User, color: 'emerald' },
          { label: 'معلقة', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'بحاجة لرد', value: stats.unresolved, icon: Phone, color: 'rose' }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`card p-4 flex items-center gap-3 ${theme === 'light' ? '' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              color === 'sky' ? (theme === 'light' ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/20 text-sky-400') :
              color === 'emerald' ? (theme === 'light' ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400') :
              color === 'amber' ? (theme === 'light' ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/20 text-amber-400') :
              (theme === 'light' ? 'bg-rose-50 text-rose-600' : 'bg-rose-500/20 text-rose-400')
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
              <p className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className={`card p-4`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="بحث بالاسم، الرقم، أو محتوى الرسالة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition ${theme === 'light' ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-dark-800 border border-dark-600 text-white'}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                showFilters
                  ? 'bg-primary-500 text-white'
                  : theme === 'light' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              تصفية
              {(statusFilter !== 'all' || channelFilter !== 'all') && (
                <span className="w-5 h-5 rounded-full bg-white text-primary-500 text-xs flex items-center justify-center font-bold">
                  {(statusFilter !== 'all' ? 1 : 0) + (channelFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`rounded-xl py-2.5 px-3 text-sm outline-none ${theme === 'light' ? 'bg-slate-100 border border-slate-200 text-slate-700' : 'bg-dark-800 border border-dark-600 text-white'}`}
            >
              <option value="recent">الأحدث</option>
            </select>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className={`mt-3 pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>حالة المحادثة</label>
                <div className="flex flex-wrap gap-2">
                  {[{ key: 'all', label: 'الكل' }, ...Object.entries(statusConfig).map(([k, v]) => ({ key: k, label: v.name }))].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        statusFilter === key
                          ? 'bg-primary-500 text-white'
                          : theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
                      }`}
                    >
                      {label}
                      {key !== 'all' && key === 'active' && stats.active > 0 && (
                        <span className="mr-1 text-[10px]">({stats.active})</span>
                      )}
                      {key !== 'all' && key === 'pending' && stats.pending > 0 && (
                        <span className="mr-1 text-[10px]">({stats.pending})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>القناة</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setChannelFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      channelFilter === 'all'
                        ? 'bg-primary-500 text-white'
                        : theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
                    }`}
                  >
                    الكل
                  </button>
                  {activeChannels.map(ch => {
                    const cfg = channelConfig[ch] || { name: ch, color: '#6B7280' };
                    return (
                      <button
                        key={ch}
                        onClick={() => setChannelFilter(ch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                          channelFilter === ch
                            ? 'bg-primary-500 text-white'
                            : theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
                        }`}
                      >
                        <ChannelIcon channel={ch} size={14} />
                        {cfg.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className={`card p-12 text-center ${theme === 'light' ? '' : ''}`}>
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
            <MessageCircle className={`w-10 h-10 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {conversations.length === 0 ? 'لا توجد محادثات بعد' : 'لا توجد نتائج'}
          </h2>
          <p className={`mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {conversations.length === 0
              ? 'عند استلام رسائل من واتس آب أو تيليجرام، ستظهر المحادثات هنا'
              : 'جرب تغيير البحث أو الفلتر'}
          </p>
          {(statusFilter !== 'all' || channelFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setStatusFilter('all'); setChannelFilter('all'); setSearchQuery(''); }}
              className="btn-primary px-4 py-2 rounded-lg text-sm"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conv) => {
            const ch = channelConfig[conv.channel] || { name: conv.channel, color: '#6B7280', icon: '📡' };
            const st = statusConfig[conv.status] || statusConfig.active;
            const hasUnread = (conv.unreadCount || 0) > 0;

            return (
              <Link
                key={conv._id}
                to={`/conversations/${conv._id}`}
                className={`card p-4 flex items-center gap-4 transition-all duration-200 group ${
                  theme === 'light' ? 'hover:border-sky-300 hover:shadow-sm' : 'hover:border-sky-600'
                } ${hasUnread ? (theme === 'light' ? 'border-sky-200 bg-sky-50/30' : 'border-sky-500/30 bg-sky-500/5') : ''}`}
              >
                {/* Channel Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: ch.color }}
                >
                  <ChannelIcon channel={conv.channel} size={24} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {conv.contact?.name || conv.contact?.phone || 'مجهول'}
                    </span>
                    {conv.contact?.phone && conv.contact?.name && (
                      <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {conv.contact.phone}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${hasUnread ? (theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-200 font-medium') : (theme === 'light' ? 'text-slate-500' : 'text-slate-400')}`}>
                    {conv.lastMessage?.content || '—'}
                  </p>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    st.color === 'emerald' ? (theme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400') :
                    st.color === 'amber' ? (theme === 'light' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/20 text-amber-400') :
                    st.color === 'sky' ? (theme === 'light' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-sky-500/20 text-sky-400') :
                    (theme === 'light' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-500/20 text-slate-400')
                  }`}>
                    {st.name}
                  </span>

                  {/* Time & Unread */}
                  <div className="flex items-center gap-2">
                    {hasUnread && (
                      <span className="bg-primary-500 text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                        {conv.unreadCount}
                      </span>
                    )}
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatTime(conv.lastMessage?.timestamp || conv.updatedAt)}
                    </span>
                  </div>

                  {/* Channel Tag */}
                  <span className={`text-[10px] flex items-center gap-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <ChannelIcon channel={conv.channel} size={10} />
                    {ch.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Conversations;