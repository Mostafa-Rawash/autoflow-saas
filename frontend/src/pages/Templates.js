import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, Filter, FileText, X, Sparkles } from 'lucide-react';
import { templatesAPI } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const categories = [
  { id: 'all', name: 'الكل', emoji: '📋' },
  { id: 'greeting', name: 'ترحيب', emoji: '👋' },
  { id: 'faq', name: 'أسئلة شائعة', emoji: '❓' },
  { id: 'promotion', name: 'عروض', emoji: '🎉' },
  { id: 'reminder', name: 'تذكير', emoji: '⏰' },
  { id: 'follow_up', name: 'متابعة', emoji: '🔄' },
  { id: 'custom', name: 'مخصص', emoji: '✨' }
];

const getCategoryBadge = (category) => {
  const styles = {
    greeting: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
    faq: 'bg-sky-500/15 text-sky-600 border-sky-500/20',
    promotion: 'bg-violet-500/15 text-violet-600 border-violet-500/20',
    reminder: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
    follow_up: 'bg-pink-500/15 text-pink-600 border-pink-500/20',
    custom: 'bg-slate-500/15 text-slate-500 border-slate-500/20'
  };
  return styles[category] || styles.custom;
};

const Templates = () => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await templatesAPI.getAll();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('فشل في تحميل القوالب');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await templatesAPI.create(formData);
      toast.success('تم إنشاء القالب بنجاح');
      setShowCreateModal(false);
      fetchTemplates();
    } catch (error) {
      toast.error('فشل في إنشاء القالب');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا القالب؟')) return;

    try {
      await templatesAPI.delete(id);
      toast.success('تم حذف القالب');
      fetchTemplates();
    } catch (error) {
      toast.error('فشل في حذف القالب');
    }
  };

  const handleCopy = (template) => {
    const text = template.content?.text || template.content;
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ القالب');
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.content?.text || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'إجمالي القوالب', value: templates.length, color: 'from-teal-500 to-emerald-600' },
    { label: 'ترحيب', value: templates.filter(t => t.category === 'greeting').length, color: 'from-emerald-500 to-green-600' },
    { label: 'أسئلة شائعة', value: templates.filter(t => t.category === 'faq').length, color: 'from-blue-500 to-indigo-600' },
    { label: 'عروض', value: templates.filter(t => t.category === 'promotion').length, color: 'from-violet-500 to-purple-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>قوالب الرسائل</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>إنشاء وإدارة قوالب الردود السريعة</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          قالب جديد
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
            placeholder="ابحث في القوالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass pr-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                categoryFilter === cat.id
                  ? 'bg-sky-500/15 text-sky-600 border border-sky-500/30'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800 border border-transparent'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span className="ml-1">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="glass rounded-xl p-5 hover:border-sky-500/30 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{template.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryBadge(template.category)}`}>
                      {categories.find(c => c.id === template.category)?.name || 'مخصص'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(template)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    title="نسخ"
                  >
                    <Copy className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    title="تعديل"
                  >
                    <Edit2 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>

              <p className={`text-sm line-clamp-3 mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {template.content?.text || template.content}
              </p>

              {template.content?.variables && template.content.variables.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {template.content.variables.map((variable, i) => (
                    <span key={i} className="text-xs bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded font-mono">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              )}

              <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  استخدام: {template.usageCount || 0} مرة
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {template.language === 'ar' ? 'عربي' : template.language === 'en' ? 'English' : 'مختلط'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>لا توجد قوالب</h2>
          <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ابدأ بإنشاء قوالب للردود السريعة على العملاء
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-auth inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إنشاء قالب جديد
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTemplateModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={() => { setEditingTemplate(null); fetchTemplates(); }}
        />
      )}
    </div>
  );
};

const CreateTemplateModal = ({ onClose, onSave }) => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    content: '',
    variables: []
  });
  const [variableInput, setVariableInput] = useState('');

  const handleAddVariable = () => {
    if (variableInput && !formData.variables.includes(variableInput)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput]
      });
      setVariableInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      variables: formData.variables
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>قالب جديد</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>اسم القالب</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-glass"
              placeholder="مثال: ترحيب بالعميل الجديد"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>التصنيف</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-glass"
            >
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>محتوى القالب</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-glass resize-none"
              rows={4}
              placeholder="مرحباً {{name}}! شكراً لتواصلك معنا..."
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>المتغيرات</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariable())}
                className="input-glass flex-1"
                placeholder="اسم المتغير (مثال: name)"
              />
              <button
                type="button"
                onClick={handleAddVariable}
                className="btn-secondary px-4"
              >
                إضافة
              </button>
            </div>
            {formData.variables.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.variables.map((v, i) => (
                  <span key={i} className="text-xs bg-sky-500/10 text-sky-500 px-2 py-1 rounded-md flex items-center gap-1 font-mono">
                    {`{{${v}}}`}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        variables: formData.variables.filter((_, idx) => idx !== i)
                      })}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-auth flex-1">
              إنشاء القالب
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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

const EditTemplateModal = ({ template, onClose, onSave }) => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: template.name,
    category: template.category,
    content: template.content?.text || template.content,
    variables: template.content?.variables || []
  });

  const handleSave = async () => {
    try {
      await templatesAPI.update(template._id, {
        ...formData,
        content: {
          text: formData.content,
          variables: formData.variables
        }
      });
      toast.success('تم تحديث القالب');
      onSave();
    } catch (error) {
      toast.error('فشل في تحديث القالب');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>تعديل القالب</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>اسم القالب</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-glass"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>التصنيف</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-glass"
            >
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>المحتوى</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-glass resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-auth flex-1">
              حفظ التغييرات
            </button>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;