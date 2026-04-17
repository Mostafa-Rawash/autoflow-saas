import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, Filter, FileText, Sparkles } from 'lucide-react';
import { templatesAPI } from '../api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { user } = useAuthStore();

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'greeting', name: 'ترحيب' },
    { id: 'faq', name: 'أسئلة شائعة' },
    { id: 'promotion', name: 'عروض' },
    { id: 'reminder', name: 'تذكير' },
    { id: 'follow_up', name: 'متابعة' },
    { id: 'custom', name: 'مخصص' }
  ];

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

  const getCategoryBadge = (category) => {
    const styles = {
      greeting: 'bg-green-500/20 text-green-400',
      faq: 'bg-blue-500/20 text-blue-400',
      promotion: 'bg-purple-500/20 text-purple-400',
      reminder: 'bg-yellow-500/20 text-yellow-400',
      follow_up: 'bg-pink-500/20 text-pink-400',
      custom: 'bg-gray-500/20 text-gray-400'
    };
    return styles[category] || styles.custom;
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold">قوالب الرسائل</h1>
          <p className="text-gray-400 mt-1">إنشاء وإدارة قوالب الردود السريعة</p>
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
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{templates.length}</p>
          <p className="text-sm text-gray-500">إجمالي القوالب</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {templates.filter(t => t.category === 'greeting').length}
          </p>
          <p className="text-sm text-gray-500">ترحيب</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {templates.filter(t => t.category === 'faq').length}
          </p>
          <p className="text-sm text-gray-500">أسئلة شائعة</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {templates.filter(t => t.category === 'promotion').length}
          </p>
          <p className="text-sm text-gray-500">عروض</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="ابحث في القوالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pr-10 pl-4 focus:border-primary-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 focus:border-primary-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="card p-5 hover:border-primary-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">{template.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadge(template.category)}`}>
                      {categories.find(c => c.id === template.category)?.name || 'مخصص'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(template)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="نسخ"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                {template.content?.text || template.content}
              </p>
              
              {template.content?.variables && template.content.variables.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.content.variables.map((variable, i) => (
                    <span key={i} className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-600">
                <span className="text-xs text-gray-500">
                  استخدام: {template.usageCount || 0} مرة
                </span>
                <span className="text-xs text-gray-500">
                  {template.language === 'ar' ? 'عربي' : template.language === 'en' ? 'English' : 'مختلط'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold mb-2">لا توجد قوالب</h2>
          <p className="text-gray-400 mb-4">
            ابدأ بإنشاء قوالب للردود السريعة على العملاء
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إنشاء قالب جديد
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
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

// Create Template Modal
const CreateTemplateModal = ({ onClose, onSave }) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">قالب جديد</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم القالب</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
              placeholder="مثال: ترحيب بالعميل الجديد"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">التصنيف</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
            >
              <option value="greeting">ترحيب</option>
              <option value="faq">أسئلة شائعة</option>
              <option value="promotion">عروض</option>
              <option value="reminder">تذكير</option>
              <option value="follow_up">متابعة</option>
              <option value="custom">مخصص</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">محتوى القالب</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 resize-none"
              rows={4}
              placeholder="مرحباً {{name}}! شكراً لتواصلك معنا..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المتغيرات</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                className="flex-1 bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
                placeholder="اسم المتغير (مثال: name)"
              />
              <button
                type="button"
                onClick={handleAddVariable}
                className="btn-secondary"
              >
                إضافة
              </button>
            </div>
            {formData.variables.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.variables.map((v, i) => (
                  <span
                    key={i}
                    className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {`{{${v}}}`}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        variables: formData.variables.filter((_, idx) => idx !== i)
                      })}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              إنشاء القالب
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Template Modal
const EditTemplateModal = ({ template, onClose, onSave }) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">تعديل القالب</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم القالب</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">التصنيف</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
            >
              <option value="greeting">ترحيب</option>
              <option value="faq">أسئلة شائعة</option>
              <option value="promotion">عروض</option>
              <option value="reminder">تذكير</option>
              <option value="follow_up">متابعة</option>
              <option value="custom">مخصص</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المحتوى</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="btn-primary flex-1">
              حفظ التغييرات
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;