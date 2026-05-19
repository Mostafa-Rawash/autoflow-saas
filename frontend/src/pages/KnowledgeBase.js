import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, RefreshCw, ChevronDown, ChevronUp, Database, AlertCircle, CheckCircle, Clock, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { documentsAPI } from '../api';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  uploading: { label: 'جاري الرفع', color: 'bg-blue-100 text-blue-700', icon: Clock },
  processing: { label: 'جاري المعالجة', color: 'bg-amber-100 text-amber-700', icon: Clock },
  ready: { label: 'جاهز', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  failed: { label: 'فشل', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

const FILE_TYPES = {
  pdf: { label: 'PDF', color: 'bg-red-500' },
  docx: { label: 'DOCX', color: 'bg-blue-500' },
  txt: { label: 'TXT', color: 'bg-slate-500' },
  md: { label: 'MD', color: 'bg-purple-500' },
  csv: { label: 'CSV', color: 'bg-green-500' },
  html: { label: 'HTML', color: 'bg-orange-500' }
};

const KnowledgeBase = () => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const hasProcessing = documents.some(d => d.status === 'processing' || d.status === 'uploading');
      if (hasProcessing) {
        fetchDocuments();
        fetchStats();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [documents]);

  const fetchDocuments = async (page = 1) => {
    try {
      const res = await documentsAPI.getAll({ page, limit: 20 });
      setDocuments(res.data.documents);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('فشل في تحميل المستندات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await documentsAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      // Stats are optional, don't show error
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const allowedExts = ['.pdf', '.txt', '.md', '.csv', '.docx', '.html'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExts.includes(ext)) {
      toast.error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedExts.join(', ')}`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('حجم الملف يتجاوز 20 ميجابايت');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', file.name);

    try {
      await documentsAPI.upload(formData);
      toast.success('تم رفع المستند بنجاح. جاري المعالجة...');
      fetchDocuments();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.error || 'فشل في رفع المستند';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

    try {
      await documentsAPI.delete(id);
      toast.success('تم حذف المستند');
      fetchDocuments();
      fetchStats();
      if (expandedDoc === id) setExpandedDoc(null);
    } catch (err) {
      toast.error('فشل في حذف المستند');
    }
  };

  const handleReprocess = async (id) => {
    try {
      await documentsAPI.reprocess(id);
      toast.success('جاري إعادة المعالجة...');
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في إعادة المعالجة');
    }
  };

  const toggleChunks = async (docId) => {
    if (expandedDoc === docId) {
      setExpandedDoc(null);
      return;
    }

    setExpandedDoc(docId);
    setChunksLoading(true);
    try {
      const res = await documentsAPI.getChunks(docId, { limit: 50 });
      setChunks(res.data.chunks);
    } catch (err) {
      toast.error('فشل في تحميل القطع');
    } finally {
      setChunksLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            قاعدة المعرفة
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ارفع المستندات وابحث فيها باستخدام الذكاء الاصطناعي
          </p>
        </div>
        <button
          onClick={() => navigate('/ai-chat')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
        >
          <Link2 className="w-4 h-4" />
          المحادثة الذكية
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'إجمالي المستندات', value: stats.documents.total, color: 'from-teal-500 to-emerald-600' },
            { label: 'جاهز', value: stats.documents.ready, color: 'from-emerald-500 to-green-600' },
            { label: 'قيد المعالجة', value: stats.documents.processing, color: 'from-amber-500 to-orange-600' },
            { label: 'القطع', value: stats.chunks.embedded, color: 'from-blue-500 to-indigo-600' }
          ].map((stat) => (
            <div key={stat.label} className={`glass p-4 rounded-xl ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`glass p-6 rounded-xl mb-6 border-2 border-dashed cursor-pointer transition-all duration-200 ${
          dragOver
            ? isDark ? 'border-teal-400 bg-teal-500/10' : 'border-teal-400 bg-teal-50'
            : isDark
              ? 'border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/5'
              : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50/50'
        } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.csv,.docx,.html"
          onChange={(e) => handleUpload(e.target.files[0])}
          className="hidden"
        />
        <div className="text-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500 mx-auto mb-3"></div>
              <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>جاري الرفع...</p>
            </>
          ) : (
            <>
              <Upload className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
              <p className={`font-medium mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                ارفع مستندات هنا
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                PDF, DOCX, TXT, MD, CSV, HTML — حتى 20 ميجابايت
              </p>
            </>
          )}
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className={`glass p-12 rounded-xl text-center ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
          <Database className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`text-lg font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            لا توجد مستندات بعد
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            ارفع مستندات لبدء البناء عن قاعدة المعرفة
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.failed;
            const fileType = FILE_TYPES[doc.fileType] || { label: doc.fileType?.toUpperCase(), color: 'bg-slate-500' };
            const StatusIcon = statusConfig.icon;

            return (
              <div key={doc._id} className={`glass rounded-xl overflow-hidden ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {/* File type badge */}
                    <div className={`w-10 h-10 rounded-lg ${fileType.color} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{fileType.label}</span>
                    </div>

                    {/* Doc info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {doc.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatFileSize(doc.fileSize)}
                        {doc.chunkCount > 0 && ` • ${doc.chunkCount} قطعة`}
                        {' • '}{new Date(doc.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                      {doc.processingError && (
                        <p className="text-xs text-red-500 mt-1">{doc.processingError}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {doc.status === 'ready' && (
                        <button
                          onClick={() => toggleChunks(doc._id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                          title="عرض القطع"
                        >
                          {expandedDoc === doc._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                      {doc.status === 'failed' && (
                        <button
                          onClick={() => handleReprocess(doc._id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`}
                          title="إعادة المعالجة"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-rose-400' : 'hover:bg-rose-50 text-rose-500'}`}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded chunks */}
                {expandedDoc === doc._id && (
                  <div className={`border-t ${isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}`}>
                    {chunksLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                      </div>
                    ) : chunks.length > 0 ? (
                      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                        {chunks.map((chunk) => (
                          <div
                            key={chunk._id}
                            className={`p-3 rounded-lg text-sm ${isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-white text-slate-700'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                                قطعة {chunk.index + 1}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {chunk.tokenCount} رمز
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {chunk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`p-4 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        لا توجد قطع
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchDocuments(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            السابق
          </button>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            صفحة {pagination.page} من {pagination.pages}
          </span>
          <button
            onClick={() => fetchDocuments(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;