import React, { useState, useEffect } from 'react';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/logs');
      setLogs(res.data.logs || getMockLogs());
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
    return true;
  });

  const getTypeInfo = (type) => logTypes.find(t => t.key === type) || { name: type, color: 'gray', icon: '📄' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">سجل النشاط</h1>
          <p className="text-gray-400 text-sm mt-1">تتبع كل العمليات في النظام</p>
        </div>
        <button className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          تصدير
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {logTypes.map(type => (
          <div key={type.key} className="glass rounded-xl p-4 text-center">
            <span className="text-2xl">{type.icon}</span>
            <p className="text-2xl font-bold mt-2">
              {logs.filter(l => l.type === type.key).length}
            </p>
            <p className="text-xs text-gray-400">{type.name}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
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
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          />
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          />
          <button
            onClick={() => setFilter({ type: '', user: '', date: '' })}
            className="text-gray-400 hover:text-white"
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-800">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">المستخدم</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">الإجراء</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">التفاصيل</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">IP</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filteredLogs.map((log) => {
              const typeInfo = getTypeInfo(log.type);
              return (
                <tr key={log.id} className="hover:bg-dark-800/50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-${typeInfo.color}-500/20 text-${typeInfo.color}-400`}>
                      <span>{typeInfo.icon}</span>
                      {typeInfo.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{log.user}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{log.details}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">{log.ip}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{log.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-dark-800 hover:bg-dark-700">السابق</button>
          <button className="px-3 py-1 rounded btn-primary">1</button>
          <button className="px-3 py-1 rounded bg-dark-800 hover:bg-dark-700">2</button>
          <button className="px-3 py-1 rounded bg-dark-800 hover:bg-dark-700">التالي</button>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;