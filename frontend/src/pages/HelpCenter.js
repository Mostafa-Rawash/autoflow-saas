import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Trash2, Edit3, Eye, ThumbsUp, X, Globe } from 'lucide-react';
import { helpArticlesAPI } from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const defaultForm = { title: '', content: '', excerpt: '', category: 'عام', tags: '', isPublished: false, isFeatured: false };

export default function HelpCenter() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchArticles(); fetchCategories(); }, [page, search, filterCategory, filterPublished]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterPublished) params.published = filterPublished;
      const { data } = await helpArticlesAPI.getAll(params);
      setArticles(data.data?.articles || []);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) { toast.error('فشل في جلب المقالات'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await helpArticlesAPI.getCategories();
      setCategories(data.data || []);
    } catch (err) { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editArticle) {
        await helpArticlesAPI.update(editArticle._id, payload);
        toast.success('تم تحديث المقال');
      } else {
        await helpArticlesAPI.create(payload);
        toast.success('تم إنشاء المقال');
      }
      setShowModal(false);
      setForm(defaultForm);
      setEditArticle(null);
      fetchArticles();
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.error || 'فشل في حفظ المقال'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف المقال؟')) return;
    try {
      await helpArticlesAPI.delete(id);
      toast.success('تم حذف المقال');
      fetchArticles();
    } catch (err) { toast.error('فشل في حذف المقال'); }
  };

  const openEdit = (article) => {
    setEditArticle(article);
    setForm({
      title: article.title, content: article.content, excerpt: article.excerpt || '',
      category: article.category, tags: (article.tags || []).join(', '),
      isPublished: article.isPublished, isFeatured: article.isFeatured
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>مركز المساعدة</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إدارة مقالات المساعدة والأسئلة الشائعة</p>
        </div>
        <button onClick={() => { setForm(defaultForm); setEditArticle(null); setShowModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:shadow-lg">
          <Plus className="w-4 h-4 inline ml-1" /> مقال جديد
        </button>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-2xl p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input type="text" placeholder="بحث في المقالات..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl ${isDark ? 'bg-slate-900/50 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:border-teal-500`} />
          </div>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className={`px-3 py-2.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
            <option value="">كل التصنيفات</option>
            {categories.map(c => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
          </select>
          <select value={filterPublished} onChange={e => { setFilterPublished(e.target.value); setPage(1); }}
            className={`px-3 py-2.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
            <option value="">كل الحالات</option>
            <option value="true">منشور</option>
            <option value="false">مسودة</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div></div>
      ) : articles.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">لا توجد مقالات بعد</p>
          <p className="text-sm mt-1">أنشئ أول مقال لمركز المساعدة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article._id} className={`${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border rounded-xl p-4 transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{article.title}</h3>
                    {article.isPublished ? (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">منشور</span>
                    ) : (
                      <span className={`px-2 py-0.5 text-[10px] rounded-md ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>مسودة</span>
                    )}
                    {article.isFeatured && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/20">مميز</span>
                    )}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} line-clamp-2`}>{article.excerpt || article.content?.substring(0, 120) + '...'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{article.category}</span>
                    {(article.tags || []).map((tag, i) => (
                      <span key={i} className={`px-1.5 py-0.5 text-[10px] rounded ${isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>{tag}</span>
                    ))}
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}><Eye className="w-3 h-3 inline" /> {article.views}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}><ThumbsUp className="w-3 h-3 inline" /> {article.helpfulYes}</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(article)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(article._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-slate-800 text-slate-300 disabled:opacity-50' : 'bg-gray-100 text-gray-700 disabled:opacity-50'}`}>السابق</button>
          <span className={`px-3 py-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-slate-800 text-slate-300 disabled:opacity-50' : 'bg-gray-100 text-gray-700 disabled:opacity-50'}`}>التالي</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-inherit">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editArticle ? 'تعديل المقال' : 'مقال جديد'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>العنوان *</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>ملخص</label>
                <input type="text" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="ملخص قصير للمقال"
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>المحتوى *</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={10} required
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500 resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>التصنيف</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="عام"
                    className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>الوسوم (مفصولة بفاصلة)</label>
                  <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="شرح, حساب"
                    className={`w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:border-teal-500`} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>نشر المقال</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>مقال مميز</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md">
                  {editArticle ? 'تحديث' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditArticle(null); }} className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}