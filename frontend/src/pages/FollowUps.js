import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, Power, Search, FileText, Calendar, ArrowRight, MessageSquare, X, Sparkles, Zap } from 'lucide-react';
import { followUpsAPI, templatesAPI } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const triggerTypes = [
  { id: 'no_reply', name: 'لا رد', icon: Clock, desc: 'إرسال رسالة إذا لم يرد العميل خلال فترة محددة' },
  { id: 'new_conversation', name: 'محادثة جديدة', icon: MessageSquare, desc: 'إرسال رسالة ترحيبية عند بدء محادثة جديدة' },
  { id: 'status_change', name: 'تغيير الحالة', icon: ArrowRight, desc: 'إرسال رسالة عند تغيير حالة المحادثة' },
  { id: 'schedule', name: 'مجدول', icon: Calendar, desc: 'إرسال رسالة في وقت محدد' }
];

const statusOptions = [
  { value: 'active', label: 'نشط' },
  { value: 'pending', label: 'معلق' },
  { value: 'resolved', label: 'محلول' },
  { value: 'closed', label: 'مغلق' }
];

const channelOptions = [
  { value: 'whatsapp', label: 'واتس آب' },
  { value: 'telegram', label: 'تيليجرام' },
  { value: 'messenger', label: 'ماسنجر' },
  { value: 'instagram', label: 'إنستغرام' }
];

const getTriggerBadge = (type) => {
  const styles = {
    no_reply: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
    new_conversation: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
    status_change: 'bg-violet-500/15 text-violet-600 border-violet-500/20',
    schedule: 'bg-sky-500/15 text-sky-600 border-sky-500/20'
  };
  return styles[type] || 'bg-slate-500/15 text-slate-500 border-slate-500/20';
};

const FollowUps = () => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [followUps, setFollowUps] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const { data } = await followUpsAPI.getAll();
      setFollowUps(data.followUps || []);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      toast.error('فشل في تحميل المتابعات');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await templatesAPI.getAll();
      setTemplates(data.templates || []);
    } catch {
      // Templates are optional
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذه المتابعة؟')) return;
    try {
      await followUpsAPI.delete(id);
      toast.success('تم حذف المتابعة');
      fetchFollowUps();
    } catch {
      toast.error('فشل في حذف المتابعة');
    }
  };

  const handleToggleActive = async (followUp) => {
    try {
      await followUpsAPI.update(followUp._id, { isActive: !followUp.isActive });
      toast.success(followUp.isActive ? 'تم إيقاف المتابعة' : 'تم تفعيل المتابعة');
      fetchFollowUps();
    } catch {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const filteredFollowUps = followUps.filter(fu => {
    const matchesSearch = fu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fu.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || fu.triggerType === filterType;
    return matchesSearch && matchesType;
  });

  const stats = [
    { label: 'إجمالي المتابعات', value: followUps.length, color: 'from-teal-500 to-emerald-600' },
    { label: 'نشطة', value: followUps.filter(f => f.isActive).length, color: 'from-emerald-500 to-green-600' },
    { label: 'لا رد', value: followUps.filter(f => f.triggerType === 'no_reply').length, color: 'from-amber-500 to-orange-600' },
    { label: 'مجدولة', value: followUps.filter(f => f.triggerType === 'schedule').length, color: 'from-sky-500 to-blue-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>المتابعات التلقائية</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>إرسال رسائل تلقائية بناءً على الشروط والمواعيد</p>
        </div>
        <button onClick={() => { fetchTemplates(); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          متابعة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">{stat.value}</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="ابحث في المتابعات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass pr-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterType === 'all' ? 'bg-teal-500/15 text-teal-600 border border-teal-500/30' : isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800 border border-transparent' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
            }`}
          >
            الكل
          </button>
          {triggerTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === type.id ? 'bg-teal-500/15 text-teal-600 border border-teal-500/30' : isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800 border border-transparent' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-ups Grid */}
      {filteredFollowUps.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFollowUps.map((fu) => {
            const triggerInfo = triggerTypes.find(t => t.id === fu.triggerType);
            const TriggerIcon = triggerInfo?.icon || Clock;
            return (
              <div key={fu._id} className="glass rounded-xl p-5 hover:border-teal-500/30 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTriggerBadge(fu.triggerType).split(' ')[0]} flex items-center justify-center`}>
                      <TriggerIcon className={`w-5 h-5 ${getTriggerBadge(fu.triggerType).split(' ')[1]}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fu.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getTriggerBadge(fu.triggerType)}`}>
                        {triggerInfo?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleToggleActive(fu)} className={`p-1.5 rounded-lg transition-colors ${fu.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : isDark ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => { fetchTemplates(); setEditingFollowUp(fu); }} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      <Edit2 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                    <button onClick={() => handleDelete(fu._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </div>

                <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {fu.content || (fu.templateId?.name ? `قالب: ${fu.templateId.name}` : '—')}
                </p>

                <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
                  <div className="flex items-center gap-3">
                    {fu.triggerType === 'no_reply' && (
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        بعد {fu.delayMinutes} دقيقة
                      </span>
                    )}
                    {fu.triggerType === 'status_change' && (
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {statusOptions.find(s => s.value === fu.fromStatus)?.label || '—'} ← {statusOptions.find(s => s.value === fu.toStatus)?.label || '—'}
                      </span>
                    )}
                    {fu.triggerType === 'schedule' && fu.scheduleConfig && (
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {fu.scheduleConfig.type === 'daily' ? 'يومي' : fu.scheduleConfig.type === 'weekly' ? 'أسبوعي' : fu.scheduleConfig.type === 'monthly' ? 'شهري' : 'مرة واحدة'}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md ${fu.isActive ? 'bg-emerald-500/15 text-emerald-600' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {fu.isActive ? 'نشط' : 'متوقف'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>لا توجد متابعات</h2>
          <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ابدأ بإنشاء متابعات تلقائية للرد على العملاء
          </p>
          <button onClick={() => { fetchTemplates(); setShowCreateModal(true); }} className="btn-auth inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إنشاء متابعة جديدة
          </button>
        </div>
      )}

      {showCreateModal && (
        <FollowUpModal
          onClose={() => { setShowCreateModal(false); fetchFollowUps(); }}
          templates={templates}
          token={token}
        />
      )}

      {editingFollowUp && (
        <FollowUpModal
          followUp={editingFollowUp}
          onClose={() => { setEditingFollowUp(null); fetchFollowUps(); }}
          templates={templates}
          token={token}
        />
      )}
    </div>
  );
};

const FollowUpModal = ({ followUp, onClose, templates }) => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const isEditing = !!followUp;

  const [formData, setFormData] = useState({
    name: followUp?.name || '',
    triggerType: followUp?.triggerType || 'no_reply',
    delayMinutes: followUp?.delayMinutes || 30,
    scheduleConfig: followUp?.scheduleConfig || { type: 'daily', hour: 9, minute: 0 },
    fromStatus: followUp?.fromStatus || 'active',
    toStatus: followUp?.toStatus || 'resolved',
    channel: followUp?.channel || 'all',
    content: followUp?.content || '',
    templateId: followUp?.templateId?._id || followUp?.templateId || '',
    channels: followUp?.channels || [],
    maxAttempts: followUp?.maxAttempts || 1,
    stopOnReply: followUp?.stopOnReply !== undefined ? followUp.stopOnReply : true,
    priority: followUp?.priority || 2,
    isActive: followUp?.isActive !== undefined ? followUp.isActive : true
  });

  const [useTemplate, setUseTemplate] = useState(!!(followUp?.templateId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (useTemplate && payload.templateId) {
      delete payload.content;
    } else {
      delete payload.templateId;
    }

    // Clean triggerType-specific fields
    if (payload.triggerType !== 'no_reply') delete payload.delayMinutes;
    if (payload.triggerType !== 'schedule') delete payload.scheduleConfig;
    if (payload.triggerType !== 'status_change') { delete payload.fromStatus; delete payload.toStatus; }
    if (payload.triggerType !== 'new_conversation') delete payload.channel;

    try {
      if (isEditing) {
        await followUpsAPI.update(followUp._id, payload);
        toast.success('تم تحديث المتابعة');
      } else {
        await followUpsAPI.create(payload);
        toast.success('تم إنشاء المتابعة بنجاح');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في حفظ المتابعة');
    }
  };

  const selectedTrigger = triggerTypes.find(t => t.id === formData.triggerType);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isEditing ? 'تعديل المتابعة' : 'متابعة جديدة'}
            </h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>اسم المتابعة</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-glass"
              placeholder="مثال: تذكير بعد 30 دقيقة"
              required
            />
          </div>

          {/* Trigger Type */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>نوع المشغل</label>
            <div className="grid grid-cols-2 gap-2">
              {triggerTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, triggerType: type.id })}
                  className={`p-3 rounded-xl text-right transition-all duration-200 border ${
                    formData.triggerType === type.id
                      ? 'border-teal-500 bg-teal-500/10'
                      : isDark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <type.icon className={`w-5 h-5 mb-1 ${formData.triggerType === type.id ? 'text-teal-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <p className={`text-sm font-medium ${formData.triggerType === type.id ? 'text-teal-600' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{type.name}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* No Reply - Delay */}
          {formData.triggerType === 'no_reply' && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>بعد كم دقيقة؟</label>
              <input
                type="number"
                min="1"
                value={formData.delayMinutes}
                onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 30 })}
                className="input-glass"
                placeholder="30"
                required
              />
            </div>
          )}

          {/* Status Change */}
          {formData.triggerType === 'status_change' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>من حالة</label>
                <select value={formData.fromStatus} onChange={(e) => setFormData({ ...formData, fromStatus: e.target.value })} className="input-glass">
                  {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>إلى حالة</label>
                <select value={formData.toStatus} onChange={(e) => setFormData({ ...formData, toStatus: e.target.value })} className="input-glass">
                  {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Schedule Config */}
          {formData.triggerType === 'schedule' && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>التكرار</label>
              <select
                value={formData.scheduleConfig.type}
                onChange={(e) => setFormData({ ...formData, scheduleConfig: { ...formData.scheduleConfig, type: e.target.value } })}
                className="input-glass"
              >
                <option value="once">مرة واحدة</option>
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
              </select>
            </div>
          )}

          {/* New Conversation - Channel */}
          {formData.triggerType === 'new_conversation' && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>القناة</label>
              <select value={formData.channel} onChange={(e) => setFormData({ ...formData, channel: e.target.value })} className="input-glass">
                <option value="all">جميع القنوات</option>
                {channelOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          )}

          {/* Content */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>محتوى الرسالة</label>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setUseTemplate(false)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${!useTemplate ? 'bg-teal-500/15 text-teal-600 border border-teal-500/30' : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                نص مباشر
              </button>
              <button
                type="button"
                onClick={() => setUseTemplate(true)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${useTemplate ? 'bg-teal-500/15 text-teal-600 border border-teal-500/30' : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                اختيار قالب
              </button>
            </div>

            {useTemplate ? (
              <select
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                className="input-glass"
              >
                <option value="">اختر قالب...</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.category})</option>
                ))}
              </select>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-glass resize-none"
                rows={3}
                placeholder="مرحباً {{name}}! شكراً لتواصلك معنا..."
                required={!useTemplate}
              />
            )}
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              المتغيرات: {'{{name}}'}, {'{{phone}}'}, {'{{email}}'}, {'{{channel}}'}
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>أقصى عدد مرات</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                className="input-glass"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>الأولوية</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} className="input-glass">
                <option value={1}>عالية</option>
                <option value={2}>عادية</option>
                <option value={3}>منخفضة</option>
              </select>
            </div>
          </div>

          {/* Stop on reply toggle */}
          <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
            <input
              type="checkbox"
              checked={formData.stopOnReply}
              onChange={(e) => setFormData({ ...formData, stopOnReply: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>إيقاف عند الرد</p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>إلغاء المتابعة إذا رد العميل</p>
            </div>
          </label>

          {/* Active toggle */}
          <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>تفعيل المتابعة</p>
            </div>
          </label>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-auth flex-1">
              {isEditing ? 'حفظ التغييرات' : 'إنشاء المتابعة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUps;