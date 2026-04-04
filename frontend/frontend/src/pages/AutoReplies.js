import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const demoRules = [
  { _id: 'demo-1', name: 'مرحباً', keywords: ['مرحبا', 'السلام عليكم', 'hi'], response: 'أهلاً بك! كيف يمكنني مساعدتك؟', isActive: true, matchType: 'contains', usageCount: 45 },
  { _id: 'demo-2', name: 'أسعار', keywords: ['سعر', 'أسعار', 'باقة'], response: 'باقاتنا تبدأ من 2000 جنيه شهرياً وتشمل قناة واتس آب واحدة.', isActive: true, matchType: 'contains', usageCount: 32 },
  { _id: 'demo-3', name: 'تواصل', keywords: ['تواصل', 'رقم', 'اتصال'], response: 'يمكنك التواصل معنا على واتس آب: 01099129550', isActive: true, matchType: 'contains', usageCount: 28 }
];

const AutoReplies = () => {
  const { token } = useAuthStore();
  const [rules, setRules] = useState(demoRules);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    response: '',
    matchType: 'contains',
    priority: 0,
    isActive: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auto-replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(data.autoReplies || demoRules);
    } catch (error) {
      console.error('Error fetching auto-replies:', error);
      setRules(demoRules);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
      };

      if (editingRule) {
        await axios.put(`${API_URL}/auto-replies/${editingRule._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم تحديث القاعدة بنجاح');
      } else {
        await axios.post(`${API_URL}/auto-replies`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم إنشاء القاعدة بنجاح');
      }

      setShowModal(false);
      setEditingRule(null);
      setFormData({ name: '', keywords: '', response: '', matchType: 'contains', priority: 0, isActive: true });
      fetchRules();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;
    
    try {
      await axios.delete(`${API_URL}/auto-replies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم حذف القاعدة');
      fetchRules();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleToggle = async (rule) => {
    try {
      await axios.put(`${API_URL}/auto-replies/${rule._id}`, { isActive: !rule.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(rule.isActive ? 'تم تعطيل القاعدة' : 'تم تفعيل القاعدة');
      fetchRules();
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      keywords: rule.keywords.join(', '),
      response: rule.response,
      matchType: rule.matchType,
      priority: rule.priority || 0,
      isActive: rule.isActive
    });
    setShowModal(true);
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الردود التلقائية</h1>
          <p className="text-gray-400 mt-1">إدارة قواعد الرد التلقائي لواتس آب</p>
        </div>
        <button onClick={() => { setEditingRule(null); setFormData({ name: '', keywords: '', response: '', matchType: 'contains', priority: 0, isActive: true }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> قاعدة جديدة
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input type="text" placeholder="ابحث في القواعد..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 pr-10 pl-4" />
      </div>

      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div key={rule._id} className={`card p-4 ${!rule.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold">{rule.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {rule.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {rule.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-whatsapp/20 text-whatsapp text-xs rounded-full">{keyword}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-400">{rule.response}</p>
                <p className="text-xs text-gray-500 mt-2">النوع: {rule.matchType} • الاستخدام: {rule.usageCount || 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(rule)} className="p-2 rounded-lg hover:bg-white/5"><Power className={`w-5 h-5 ${rule.isActive ? 'text-green-400' : 'text-gray-500'}`} /></button>
                <button onClick={() => openEditModal(rule)} className="p-2 rounded-lg hover:bg-white/5"><Edit2 className="w-5 h-5 text-gray-400" /></button>
                <button onClick={() => handleDelete(rule._id)} className="p-2 rounded-lg hover:bg-white/5"><Trash2 className="w-5 h-5 text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingRule ? 'تعديل القاعدة' : 'قاعدة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم القاعدة</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الكلمات المفتاحية (مفصولة بفواصل)</label>
                <input type="text" value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} placeholder="مرحبا, hi, hello" className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الرد</label>
                <textarea value={formData.response} onChange={(e) => setFormData({ ...formData, response: e.target.value })} rows={3} className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">نوع المطابقة</label>
                <select value={formData.matchType} onChange={(e) => setFormData({ ...formData, matchType: e.target.value })} className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-4">
                  <option value="exact">مطابق تماماً</option>
                  <option value="contains">يحتوي على</option>
                  <option value="startsWith">يبدأ بـ</option>
                  <option value="regex">نمط منتظم</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="isActive">نشط</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingRule(null); }} className="btn-outline flex-1">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoReplies;