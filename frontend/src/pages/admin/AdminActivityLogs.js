import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';

const logColorClasses = {
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  green: 'bg-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  primary: 'bg-primary-500/20 text-primary-400',
  red: 'bg-red-500/20 text-red-400',
  gray: 'bg-gray-500/20 text-gray-400'
};

const AdminActivityLogs = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ type: '', user: '', date: '' });

  const logTypes = [
    { key: 'auth', name: 'تسجيل دخول', color: 'blue', icon: '🔐' },
    { key: 'user', name: 'مستخدم', color: 'purple', icon: '👤' },
    { key: 'content', name: 'محتوى', color: 'green', icon: '📝' },
    { key: 'subscription', name: 'اشتراك', color: 'yellow', icon: '💳' },
    { key: 'conversation', name: 'محادثة', color: 'primary', icon: '💬' },
    { key: 'system', name: 'نظام', color: 'red', icon: '⚙️' }
  ];

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter.type) params.type = filter.type;
      if (filter.user) params.search = filter.user;
      const res = await api.get('/admin/logs', { params });
      if (res.data?.success) {
        setLogs(res.data.logs || getMockLogs());
        setTotalPages(res.data.pagination?.pages || 1);
      } else {
        setLogs(getMockLogs());
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setLogs(getMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const getMockLogs = () => [
    { id: 1, type: 'auth', user: 'أحمد محمد', action: 'تسجيل دخول', details: 'IP: 192.168.1.1', date: '2026-04-05 12:30', ip: '192.168.1.1' },
    { id: 2, type: 'user', user: 'Admin', action: 'إنشاء مستخدم جديد', details: 'تم إنشاء مستخدم: سارة أحمد', date: '2026-04-05 11:45', ip: '192.168.1.100' },
    { id: 3, type: 'content', user: 'Admin', action: 'نشر مقال', details: 'دليل أتمتة واتس آب الشامل', date: '2026-04-05 10:30', ip: '192.168.1.100' },
    { id: 4, type: 'subscription', user: 'محمد علي', action: 'تجديد الاشتراك', details: 'خطة احترافية - 4000 ج.م', date: '2026-04-04 23:15', ip: '10.0.0.55' },
    { id: 5, type: 'conversation', user: 'نظام', action: 'رسالة تلقائية', details: 'تم إرسال 500 رسالة تلقائية', date: '2026-04-04 20:00', ip: '-' },
    { id: 6, type: 'system', user: 'نظام', action: 'نسخ احتياطي', details: 'تم إنشاء نسخة احتياطية', date: '2026-04-04 03:00', ip: '-' },
    { id: 7, type: 'auth', user: 'سارة أحمد', action: 'تسجيل خروج', details: 'جلسة انتهت', date: '2026-04-04 18:30', ip: '192.168.1.50' },
    { id: 8, type: 'user', user: 'Admin', action: 'تعديل صلاحيات', details: 'تم تعديل دور: مشرف', date: '2026-04-04 15:20', ip: '192.168.1.100' },
  ];

  const filteredLogs = logs.filter(log => {
    if (filter.type && log.type !== filter.type) return false;
    if (filter.user && !log.user.toLowerCase().includes(filter.user.toLowerCase())) return false;
    if (filter.date && log.date && !log.date.startsWith(filter.date)) return false;
    return true;
  });

  const getTypeInfo = (type) => logTypes.find(t => t.key === type) || { name: type, color: 'gray', icon: '📄' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">سجل النشاط</h1>
          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>تتبع كل العمليات في النظام</p>
        </div>
        <button className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2" aria-label="تصدير السجلات">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          تصدير
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {logTypes.map(type => (
          <div key={type.key} className={`glass rounded-xl p-4 text-center`}>
            <span className="text-2xl">{type.icon}</span>
            <p className="text-2xl font-bold mt-2">
              {logs.filter(l => l.type === type.key).length}
            </p>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{type.name}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-600'} border rounded-lg px-3 py-2`}
          >
            <option value="">كل الأنواع</option>
            {logTypes.map(type => (
              <option key={type.key} value={type.key}>{type.icon} {type.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="بحث بالمستخدم..."
            value={filter.user}
            onChange={(e) => setFilter({ ...filter, user: e.target.value })}
            className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-600'} border rounded-lg px-3 py-2`}
          />
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-600'} border rounded-lg px-3 py-2`}
          />
          <button
            onClick={() => setFilter({ type: '', user: '', date: '' })}
            className={`text-sm ${theme === 'light' ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-white'}`}
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className={theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}>
            <tr>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>النوع</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>المستخدم</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الإجراء</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>التفاصيل</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>IP</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>التاريخ</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-700'}`}>
            {filteredLogs.map((log) => {
              const typeInfo = getTypeInfo(log.type);
              return (
                <tr key={log.id} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${logColorClasses[typeInfo.color] || logColorClasses.gray}`}>
                      <span>{typeInfo.icon}</span>
                      {typeInfo.name}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{log.user}</td>
                  <td className={`px-4 py-3 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{log.action}</td>
                  <td className={`px-4 py-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{log.details}</td>
                  <td className={`px-4 py-3 text-sm font-mono ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>{log.ip}</td>
                  <td className={`px-4 py-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{log.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'} ${page === 1 ? 'opacity-50' : ''}`}
          >
            السابق
          </button>
          <span className={`px-3 py-1 rounded btn-primary`}>{page}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'} ${page >= totalPages ? 'opacity-50' : ''}`}
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;