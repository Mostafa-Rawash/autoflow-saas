import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Phone, Mail, Clock, RefreshCw, MessageSquare } from 'lucide-react';
import { conversationsAPI } from '../api';
import toast from 'react-hot-toast';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  const fetchConversations = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      };
      
      const { data } = await conversationsAPI.getAll(params);
      setConversations(data.conversations || []);
      setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('فشل في تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchConversations(1);
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

  const formatTime = (dateString) => {
    if (!dateString) return 'غير محدد';
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

  const activeCount = conversations.filter(c => c.status === 'active').length;

  if (loading && conversations.length === 0) {
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
          <h1 className="text-2xl font-bold">المحادثات</h1>
          <p className="text-gray-400 mt-1">إدارة جميع محادثاتك في مكان واحد</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-active px-3 py-1 text-sm">
            {activeCount} نشطة
          </span>
          <button
            onClick={() => fetchConversations(pagination.page)}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <Link to="/channels" className="btn-primary">
            + توصيل قناة
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="ابحث في المحادثات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 outline-none transition"
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
          <button type="submit" className="btn-secondary">
            بحث
          </button>
        </div>
      </form>

      {/* Conversations List */}
      {conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Link
              key={conv._id}
              to={`/conversations/${conv._id}`}
              className="card p-4 hover:border-primary-500/30 transition-colors block"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{ background: `${channelColors[conv.channel] || '#00D4AA'}20` }}
                >
                  {conv.contact?.name?.charAt(0) || conv.contact?.phone?.slice(-2) || '؟'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold truncate">
                      {conv.contact?.name || conv.contact?.phone || 'مستخدم غير معروف'}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(conv.lastMessage?.timestamp || conv.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm flex items-center gap-1"
                      style={{ color: channelColors[conv.channel] || '#00D4AA' }}
                    >
                      {channelIcons[conv.channel] || '📱'} {conv.channel}
                    </span>
                    {conv.contact?.phone && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{conv.contact.phone}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {conv.lastMessage?.content || 'لا توجد رسائل'}
                  </p>
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
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchConversations(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-gray-500">
                صفحة {pagination.page} من {pagination.pages}
              </span>
              <button
                onClick={() => fetchConversations(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-bold mb-2">لا توجد محادثات</h2>
          <p className="text-gray-400 mb-4">
            ابدأ بتوصيل قناة للتواصل مع عملائك
          </p>
          <Link to="/channels" className="btn-primary inline-flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            توصيل قناة
          </Link>
        </div>
      )}
    </div>
  );
};

export default Conversations;