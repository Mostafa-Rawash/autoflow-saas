import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { outgoingWebhooksAPI } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, ExternalLink, ToggleLeft, ToggleRight, Zap, Send, RefreshCw } from 'lucide-react';

const AVAILABLE_EVENTS = [
  { value: 'message.received', label: 'Message Received' },
  { value: 'message.sent', label: 'Message Sent' },
  { value: 'conversation.created', label: 'Conversation Created' },
  { value: 'conversation.updated', label: 'Conversation Updated' },
  { value: 'conversation.status_changed', label: 'Conversation Status Changed' },
  { value: 'conversation.assigned', label: 'Conversation Assigned' },
  { value: 'conversation.resolved', label: 'Conversation Resolved' },
  { value: 'contact.created', label: 'Contact Created' },
  { value: 'contact.updated', label: 'Contact Updated' },
  { value: 'channel.connected', label: 'Channel Connected' },
  { value: 'channel.disconnected', label: 'Channel Disconnected' },
  { value: 'autoreply.matched', label: 'Auto-Reply Matched' },
  { value: 'ai.response_sent', label: 'AI Response Sent' },
  { value: 'workflow.triggered', label: 'Workflow Triggered' },
  { value: 'csat.submitted', label: 'CSAT Submitted' }
];

const OutgoingWebhooks = () => {
  const theme = useTheme();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    url: '',
    method: 'POST',
    events: [],
    secret: '',
    headers: {},
    retryCount: 3,
    retryDelayMs: 1000,
    isActive: true
  });
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  useEffect(() => { fetchWebhooks(); }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const { data } = await outgoingWebhooksAPI.getAll();
      setWebhooks(data?.webhooks || []);
    } catch (error) {
      toast.error('فشل في تحميل الويب هوكس');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await outgoingWebhooksAPI.update(editingId, form);
        toast.success('تم تحديث الويب هوك بنجاح');
      } else {
        await outgoingWebhooksAPI.create(form);
        toast.success('تم إنشاء الويب هوك بنجاح');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchWebhooks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في حفظ الويب هوك');
    }
  };

  const handleEdit = (webhook) => {
    setEditingId(webhook._id);
    setForm({
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      events: webhook.events,
      secret: webhook.secret || '',
      headers: webhook.headers instanceof Map ? Object.fromEntries(webhook.headers) : (webhook.headers || {}),
      retryCount: webhook.retryCount,
      retryDelayMs: webhook.retryDelayMs,
      isActive: webhook.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الويب هوك؟')) return;
    try {
      await outgoingWebhooksAPI.delete(id);
      toast.success('تم حذف الويب هوك');
      fetchWebhooks();
    } catch (error) {
      toast.error('فشل في حذف الويب هوك');
    }
  };

  const handleToggle = async (id) => {
    try {
      await outgoingWebhooksAPI.toggle(id);
      fetchWebhooks();
    } catch (error) {
      toast.error('فشل في تبديل حالة الويب هوك');
    }
  };

  const handleTest = async (id) => {
    try {
      setTestingId(id);
      const { data } = await outgoingWebhooksAPI.test(id);
      toast.success(data?.message || 'تم إرسال الاختبار بنجاح');
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في إرسال الاختبار');
    } finally {
      setTestingId(null);
    }
  };

  const resetForm = () => {
    setForm({ name: '', url: '', method: 'POST', events: [], secret: '', headers: {}, retryCount: 3, retryDelayMs: 1000, isActive: true });
    setHeaderKey('');
    setHeaderValue('');
  };

  const toggleEvent = (event) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const addHeader = () => {
    if (!headerKey || !headerValue) return;
    setForm(prev => ({
      ...prev,
      headers: { ...prev.headers, [headerKey]: headerValue }
    }));
    setHeaderKey('');
    setHeaderValue('');
  };

  const removeHeader = (key) => {
    setForm(prev => {
      const headers = { ...prev.headers };
      delete headers[key];
      return { ...prev, headers };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            الويب هوكس الصادرة
          </h1>
          <p className={`mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            إرسال أحداث المنصة تلقائياً إلى تطبيقات خارجية
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة ويب هوك
        </button>
      </div>

      {/* Webhook Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {editingId ? 'تعديل الويب هوك' : 'إنشاء ويب هوك جديد'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'}`}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الاسم</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: إشعار Slack"
                  required
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>

              {/* URL */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>عنوان URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/webhook"
                  required
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>

              {/* Method */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>طريقة الطلب</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm(prev => ({ ...prev, method: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              {/* Events */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الأحداث</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.events.includes(event.value)}
                        onChange={() => toggleEvent(event.value)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Secret */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  مفتاح التوقيع (اختياري)
                </label>
                <input
                  type="password"
                  value={form.secret}
                  onChange={(e) => setForm(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="يُستخدم لتوقيع HMAC-SHA256"
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
                <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  إذا تم تعيينه، سيتم إرسال توقيع في رأس X-AutoFlow-Signature
                </p>
              </div>

              {/* Custom Headers */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>رؤوس مخصصة</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                    placeholder="اسم الرأس"
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                  />
                  <input
                    type="text"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                    placeholder="القيمة"
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                  />
                  <button type="button" onClick={addHeader} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
                    إضافة
                  </button>
                </div>
                {Object.keys(form.headers).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(form.headers).map(([key, value]) => (
                      <div key={key} className={`flex items-center justify-between p-2 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-dark-700'}`}>
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{key}: {value}</span>
                        <button type="button" onClick={() => removeHeader(key)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Retry Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>عدد مرات إعادة المحاولة</label>
                  <input
                    type="number"
                    value={form.retryCount}
                    onChange={(e) => setForm(prev => ({ ...prev, retryCount: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="5"
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>تأخير إعادة المحاولة (مللي ثانية)</label>
                  <input
                    type="number"
                    value={form.retryDelayMs}
                    onChange={(e) => setForm(prev => ({ ...prev, retryDelayMs: parseInt(e.target.value) || 1000 }))}
                    min="500"
                    max="10000"
                    className={`w-full px-4 py-2 rounded-lg border text-sm ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-dark-700 border-dark-600 text-white'}`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 py-2.5">
                  {editingId ? 'تحديث' : 'إنشاء'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className={`px-4 py-2.5 rounded-lg ${theme === 'light' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-dark-700 text-slate-300 hover:bg-dark-600'}`}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="card p-12 text-center">
          <Zap className={`w-16 h-16 mx-auto mb-4 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>لا توجد ويب هوكس</h3>
          <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            أنشئ ويب هوك لإرسال الأحداث تلقائياً إلى تطبيقاتك الخارجية
          </p>
          <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" /> إنشاء ويب هوك
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div key={webhook._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{webhook.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      webhook.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 text-green-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400'
                    }`}>
                      {webhook.isActive ? 'نشط' : 'معطل'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                      {webhook.method}
                    </span>
                  </div>
                  <p className={`text-sm font-mono mb-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    {webhook.url}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {webhook.events.map(event => {
                      const label = AVAILABLE_EVENTS.find(e => e.value === event)?.label || event;
                      return (
                        <span key={event} className={`px-2 py-0.5 rounded text-xs ${theme === 'light' ? 'bg-teal-50 text-teal-700' : 'bg-teal-500/20 text-teal-400'}`}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  <div className={`flex gap-4 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>تم التسليم: {webhook.stats?.totalDelivered || 0}</span>
                    <span>فشل: {webhook.stats?.totalFailed || 0}</span>
                    {webhook.stats?.lastDeliveredAt && (
                      <span>آخر تسليم: {new Date(webhook.stats.lastDeliveredAt).toLocaleDateString('ar-EG')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(webhook._id)}
                    className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'}`}
                    title={webhook.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                  >
                    {webhook.isActive
                      ? <ToggleRight className="w-5 h-5 text-teal-500" />
                      : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => handleTest(webhook._id)}
                    disabled={testingId === webhook._id}
                    className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'} disabled:opacity-50`}
                    title="اختبار"
                  >
                    <Send className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleEdit(webhook)}
                    className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'}`}
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4 text-amber-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(webhook._id)}
                    className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'}`}
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutgoingWebhooks;