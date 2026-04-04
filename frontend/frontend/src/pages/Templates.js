import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Copy, Check, Star, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const demoTemplates = [
  { _id: 'demo-1', name: 'ترحيب جديد', category: 'greeting', content: 'أهلاً بك في {business_name}! كيف يمكنني مساعدتك؟', variables: ['business_name'], usageCount: 234, isFavorite: true },
  { _id: 'demo-2', name: 'ساعات العمل', category: 'info', content: 'ساعات العمل لدينا من {start_time} إلى {end_time}، كل يوم ما عدا {day_off}.', variables: ['start_time', 'end_time', 'day_off'], usageCount: 156, isFavorite: false },
  { _id: 'demo-3', name: 'تأكيد حجز', category: 'booking', content: 'تم تأكيد حجزك يوم {date} الساعة {time}. في انتظارك!', variables: ['date', 'time'], usageCount: 89, isFavorite: true },
  { _id: 'demo-4', name: 'شكر متابعة', category: 'followup', content: 'شكراً لتواصلك معنا! هل يمكنني مساعدتك بأي استفسار آخر؟', variables: [], usageCount: 67, isFavorite: false },
  { _id: 'demo-5', name: 'عرض خاص', category: 'promo', content: '🎉 عرض خاص! خصم {discount}% على جميع خدماتنا حتى {end_date}.', variables: ['discount', 'end_date'], usageCount: 45, isFavorite: false }
];

const categories = [
  { id: 'all', name: 'الكل', icon: '📋' },
  { id: 'greeting', name: 'ترحيب', icon: '👋' },
  { id: 'info', name: 'معلومات', icon: 'ℹ️' },
  { id: 'booking', name: 'حجز', icon: '📅' },
  { id: 'followup', name: 'متابعة', icon: '📞' },
  { id: 'promo', name: 'عروض', icon: '🎁' }
];

const Templates = () => {
  const { token } = useAuthStore();
  const [templates, setTemplates] = useState(demoTemplates);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'greeting',
    content: '',
    variables: []
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.log('Using demo templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Extract variables from content
    const variableMatches = formData.content.match(/\{(\w+)\}/g) || [];
    const variables = [...new Set(variableMatches.map(v => v.slice(1, -1)))];
    
    const payload = { ...formData, variables };

    try {
      if (editingTemplate) {
        await axios.put(`${API_URL}/templates/${editingTemplate._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم تحديث القالب بنجاح');
      } else {
        await axios.post(`${API_URL}/templates`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم إنشاء القالب بنجاح');
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', category: 'greeting', content: '', variables: [] });
      fetchTemplates();
    } catch (error) {
      // Demo mode - update locally
      if (editingTemplate) {
        setTemplates(prev => prev.map(t => t._id === editingTemplate._id ? { ...t, ...payload } : t));
        toast.success('تم تحديث القالب (وضع العرض)');
      } else {
        const newTemplate = { _id: `demo-${Date.now()}`, ...payload, usageCount: 0, isFavorite: false };
        setTemplates(prev => [...prev, newTemplate]);
        toast.success('تم إنشاء القالب (وضع العرض)');
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', category: 'greeting', content: '', variables: [] });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    
    try {
      await axios.delete(`${API_URL}/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم حذف القالب');
      fetchTemplates();
    } catch (error) {
      setTemplates(prev => prev.filter(t => t._id !== id));
      toast.success('تم حذف القالب (وضع العرض)');
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(content);
    toast.success('تم نسخ القالب');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = async (template) => {
    try {
      await axios.put(`${API_URL}/templates/${template._id}`, { isFavorite: !template.isFavorite }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (error) {
      setTemplates(prev => prev.map(t => t._id === template._id ? { ...t, isFavorite: !t.isFavorite } : t));
    }
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.usageCount - a.usageCount;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">قوالب الرسائل</h1>
          <p className="text-gray-400 mt-1">إنشاء وإدارة قوالب الردود السريعة</p>
        </div>
        <button onClick={() => { setEditingTemplate(null); setFormData({ name: '', category: 'greeting', content: '', variables: [] }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> قالب جديد
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" placeholder="ابحث في القوالب..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pr-10 pl-4" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${selectedCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTemplates.map(template => (
          <div key={template._id} className="card p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-bold">{template.name}</h3>
                  <span className="text-xs text-gray-500">{categories.find(c => c.id === template.category)?.name || template.category}</span>
                </div>
              </div>
              <button onClick={() => toggleFavorite(template)} className={`p-1.5 rounded-lg ${template.isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}>
                <Star className="w-5 h-5" fill={template.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.content}</p>
            
            {template.variables && template.variables.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {template.variables.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-full">{`{${v}}`}</span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-dark-600">
              <span className="text-xs text-gray-500">الاستخدام: {template.usageCount || 0}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => handleCopy(template.content)} className="p-2 rounded-lg hover:bg-white/5">
                  {copiedId === template.content ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={() => openEditModal(template)} className="p-2 rounded-lg hover:bg-white/5">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => handleDelete(template._id)} className="p-2 rounded-lg hover:bg-white/5">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedTemplates.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold mb-2">لا توجد قوالب</h2>
          <p className="text-gray-400">ابدأ بإنشاء أول قالب رسالة لك</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingTemplate ? 'تعديل القالب' : 'قالب جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم القالب</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4" placeholder="مثال: ترحيب جديد" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">التصنيف</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4">
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">المحتوى</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4 resize-none" placeholder="أهلاً بك في {business_name}! كيف يمكنني مساعدتك؟" required />
                <p className="text-xs text-gray-500 mt-1">استخدم {'{اسم_المتغير}'} لإضافة متغيرات قابلة للتخصيص</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingTemplate(null); }} className="btn-outline flex-1">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Banner */}
      <div className="card p-6 bg-whatsapp/10 border-whatsapp/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-whatsapp/20 flex items-center justify-center flex-shrink-0 text-2xl">💡</div>
          <div>
            <h3 className="font-bold mb-1">نصائح للقوالب</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• استخدم متغيرات مثل {'{business_name}'} و {'{date}'} لتخصيص الردود</li>
              <li>• اجعل الردود قصيرة ومباشرة</li>
              <li>• استخدم الأيقونات لإضافة لمسة شخصية 🎉</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;