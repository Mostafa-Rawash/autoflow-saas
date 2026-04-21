import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, MessageSquare, Users, Sparkles } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Conversations = () => {
  const { token } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = data.data || data.conversations || [];
      setConversations(items);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = useMemo(() => conversations.filter((conv) => {
    const name = conv.contact?.name || '';
    const phone = conv.contact?.phone || '';
    const lastMessage = conv.lastMessage?.content || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(query) || phone.toLowerCase().includes(query) || lastMessage.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [conversations, searchQuery, statusFilter]);

  const counts = conversations.reduce((acc, conv) => {
    acc.total += 1;
    acc[conv.status || 'active'] = (acc[conv.status || 'active'] || 0) + 1;
    return acc;
  }, { total: 0 });

  const formatTime = (dateString) => {
    if (!dateString) return '—';
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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-sm font-medium mb-3">
            <MessageSquare className="w-4 h-4" />
            Inbox
          </div>
          <h1 className="text-3xl font-bold">المحادثات</h1>
          <p className="text-slate-500 mt-1">إدارة محادثات واتس آب في مكان واحد</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-bold">{counts.total}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{counts.active || 0}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{counts.pending || 0}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-sky-600">{counts.resolved || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="ابحث في المحادثات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-2xl py-3 pr-10 pl-4 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-2xl py-3 px-4 focus:border-sky-500 outline-none"
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
          <Link key={conv._id} to={`/conversations/${conv._id}`} className="card p-4 hover:border-sky-300 transition-colors block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 bg-sky-50 text-sky-700">
                {(conv.contact?.name || 'U').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-3">
                  <div>
                    <h3 className="font-bold truncate">{conv.contact?.name || 'بدون اسم'}</h3>
                    <p className="text-sm text-slate-500">{conv.contact?.phone || '—'}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatTime(conv.lastMessage?.timestamp || conv.updatedAt || conv.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate">{conv.lastMessage?.content || 'لا توجد رسائل بعد'}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${conv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : conv.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                  {conv.status === 'active' ? 'نشط' : conv.status === 'pending' ? 'معلق' : 'محلول'}
                </span>
                <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  {conv.assignedAgentId ? 'Assigned' : 'Unassigned'}
                </div>
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
          <p className="text-slate-500">جرّب تغيير البحث أو الفلتر</p>
        </div>
      )}
    </div>
  );
};

export default Conversations;
