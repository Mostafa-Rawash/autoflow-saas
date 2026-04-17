import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Bug, Info, AlertCircle, Check, X, Filter, 
  RefreshCw, Trash2, Eye, Clock, User, Server, Globe,
  ChevronLeft, ChevronRight, Search, Calendar
} from 'lucide-react';
import { logsAPI } from '../api';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    resolved: '',
    search: '',
    page: 1,
    limit: 20
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await logsAPI.getAll(filters);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('فشل في تحميل السجلات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await logsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await logsAPI.resolve(id);
      toast.success('تم تحديد السجل كمحلول');
      fetchLogs();
      fetchStats();
    } catch (error) {
      toast.error('فشل في تحديث السجل');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    
    try {
      await logsAPI.delete(id);
      toast.success('تم حذف السجل');
      fetchLogs();
      fetchStats();
    } catch (error) {
      toast.error('فشل في حذف السجل');
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug': return <Bug className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warn': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'debug': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'frontend': return <Globe className="w-4 h-4" />;
      case 'backend': return <Server className="w-4 h-4" />;
      case 'api': return <Globe className="w-4 h-4" />;
      case 'auth': return <User className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">سجل النظام</h1>
          <p className="text-gray-400 mt-1">عرض وإدارة سجلات الأخطاء والأحداث</p>
        </div>
        <button 
          onClick={() => { fetchLogs(); fetchStats(); }}
          className="btn-secondary py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byLevel.error || 0}</p>
                <p className="text-xs text-gray-400">أخطاء</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byLevel.warn || 0}</p>
                <p className="text-xs text-gray-400">تحذيرات</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.byLevel.info || 0}</p>
                <p className="text-xs text-gray-400">معلومات</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.unresolvedErrors || 0}</p>
                <p className="text-xs text-gray-400">أخطاء غير محلولة</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          
          {/* Level Filter */}
          <select 
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">كل المستويات</option>
            <option value="error">أخطاء</option>
            <option value="warn">تحذيرات</option>
            <option value="info">معلومات</option>
            <option value="debug">تصحيح</option>
          </select>
          
          {/* Source Filter */}
          <select 
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value, page: 1 })}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">كل المصادر</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="api">API</option>
            <option value="auth">Auth</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          
          {/* Resolved Filter */}
          <select 
            value={filters.resolved}
            onChange={(e) => setFilters({ ...filters, resolved: e.target.value, page: 1 })}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">كل الحالات</option>
            <option value="false">غير محلول</option>
            <option value="true">محلول</option>
          </select>
          
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="بحث في السجلات..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 pr-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Check className="w-12 h-12 mb-2 text-green-400" />
            <p>لا توجد سجلات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">المستوى</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">الرسالة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">المصدر</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">المستخدم</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">الوقت</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm truncate max-w-md">{log.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                        {getSourceIcon(log.source)}
                        {log.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {log.user?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {log.resolved ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          محلول
                        </span>
                      ) : log.level === 'error' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          غير محلول
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        {log.level === 'error' && !log.resolved && (
                          <button 
                            onClick={() => handleResolve(log._id)}
                            className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                            title="تحديد كمحلول"
                          >
                            <Check className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(log._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
            <p className="text-sm text-gray-400">
              عرض {((pagination.page - 1) * filters.limit) + 1} - {Math.min(pagination.page * filters.limit, pagination.total)} من {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">
                {pagination.page} / {pagination.pages}
              </span>
              <button 
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                {getLevelIcon(selectedLog.level)}
                تفاصيل السجل
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-lg hover:bg-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">المستوى</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${getLevelColor(selectedLog.level)}`}>
                    {getLevelIcon(selectedLog.level)}
                    {selectedLog.level}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">المصدر</p>
                  <span className="text-sm">{selectedLog.source}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">الوقت</p>
                  <span className="text-sm">{formatDate(selectedLog.timestamp)}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">الحالة</p>
                  <span className={`text-sm ${selectedLog.resolved ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedLog.resolved ? 'محلول' : 'غير محلول'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-gray-400 mb-1">الرسالة</p>
                <p className="bg-dark-700 p-3 rounded-lg text-sm">{selectedLog.message}</p>
              </div>

              {/* Error Details */}
              {selectedLog.error && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">تفاصيل الخطأ</p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-2">
                    {selectedLog.error.name && (
                      <p className="text-sm"><span className="text-red-400">Name:</span> {selectedLog.error.name}</p>
                    )}
                    {selectedLog.error.message && (
                      <p className="text-sm"><span className="text-red-400">Message:</span> {selectedLog.error.message}</p>
                    )}
                    {selectedLog.error.code && (
                      <p className="text-sm"><span className="text-red-400">Code:</span> {selectedLog.error.code}</p>
                    )}
                    {selectedLog.error.stack && (
                      <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                        {selectedLog.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Request Details */}
              {selectedLog.request && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">تفاصيل الطلب</p>
                  <div className="bg-dark-700 rounded-lg p-3 text-sm space-y-1">
                    {selectedLog.request.method && (
                      <p><span className="text-gray-400">Method:</span> {selectedLog.request.method}</p>
                    )}
                    {selectedLog.request.url && (
                      <p><span className="text-gray-400">URL:</span> {selectedLog.request.url}</p>
                    )}
                    {selectedLog.request.ip && (
                      <p><span className="text-gray-400">IP:</span> {selectedLog.request.ip}</p>
                    )}
                  </div>
                </div>
              )}

              {/* User Details */}
              {selectedLog.user && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">المستخدم</p>
                  <div className="bg-dark-700 rounded-lg p-3 text-sm space-y-1">
                    <p><span className="text-gray-400">Name:</span> {selectedLog.user.name}</p>
                    <p><span className="text-gray-400">Email:</span> {selectedLog.user.email}</p>
                    <p><span className="text-gray-400">Role:</span> {selectedLog.user.role}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">بيانات إضافية</p>
                  <pre className="bg-dark-700 rounded-lg p-3 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-dark-700 flex justify-end gap-2">
              {selectedLog.level === 'error' && !selectedLog.resolved && (
                <button 
                  onClick={() => handleResolve(selectedLog._id)}
                  className="btn-secondary py-2 px-4 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  تحديد كمحلول
                </button>
              )}
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;