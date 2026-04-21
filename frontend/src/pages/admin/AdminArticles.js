import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [filter, setFilter] = useState({ lang: '', category: '', status: '' });

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    slug: '',
    excerpt: '',
    excerptEn: '',
    content: '',
    contentEn: '',
    category: 'تعليمي',
    image: '📱',
    keywords: [],
    status: 'draft',
    lang: 'ar'
  });

  const categories = [
    'تعليمي', 'مقارنات', 'تقني', 'مطاعم', 'عيادات', 
    'تجارة إلكترونية', 'عقارات', 'محاماة', 'خدمات', 
    'تعليم', 'مبيعات', 'تسويق', 'خدمة عملاء', 'رضا عملاء',
    'إحصائيات', 'أعمال', 'دراسات حالة', 'ريادة أعمال',
    'قوالب', 'لغة'
  ];

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.lang) params.append('lang', filter.lang);
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      
      const res = await api.get(`/admin/articles?${params}`);
      setArticles(res.data.articles || getMockArticles());
    } catch (err) {
      console.error('Error fetching articles:', err);
      setArticles(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const getMockArticles = () => [
    { id: 1, title: 'دليل أتمتة واتس آب الشامل', slug: 'whatsapp-automation-guide', category: 'تعليمي', status: 'published', lang: 'ar', views: 1234, date: '2026-04-05' },
    { id: 2, title: 'واتس آب بزنس vs واتس آب شخصي', slug: 'whatsapp-business-vs-personal', category: 'مقارنات', status: 'published', lang: 'ar', views: 856, date: '2026-04-04' },
    { id: 3, title: 'دليل المطاعم لزيادة الحجوزات', slug: 'restaurant-whatsapp-guide', category: 'مطاعم', status: 'published', lang: 'ar', views: 654, date: '2026-04-03' },
    { id: 4, title: 'زيادة المبيعات عبر واتس آب', slug: 'increase-sales-whatsapp', category: 'مبيعات', status: 'draft', lang: 'ar', views: 0, date: '2026-04-02' },
    { id: 5, title: 'Complete Guide to WhatsApp Automation', slug: 'whatsapp-automation-guide-en', category: 'Tutorial', status: 'published', lang: 'en', views: 456, date: '2026-04-05' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await api.put(`/admin/articles/${editingArticle.id}`, formData);
      } else {
        await api.post('/admin/articles', formData);
      }
      setShowModal(false);
      fetchArticles();
      resetForm();
    } catch (err) {
      console.error('Error saving article:', err);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      titleEn: article.titleEn || '',
      slug: article.slug,
      excerpt: article.excerpt || '',
      excerptEn: article.excerptEn || '',
      content: article.content || '',
      contentEn: article.contentEn || '',
      category: article.category,
      image: article.image || '📱',
      keywords: article.keywords || [],
      status: article.status,
      lang: article.lang
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      try {
        await api.delete(`/admin/articles/${id}`);
        fetchArticles();
      } catch (err) {
        console.error('Error deleting article:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', titleEn: '', slug: '', excerpt: '', excerptEn: '',
      content: '', contentEn: '', category: 'تعليمي', image: '📱',
      keywords: [], status: 'draft', lang: 'ar'
    });
    setEditingArticle(null);
  };

  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة المقالات</h1>
          <p className="text-gray-400 text-sm mt-1">إنشاء وتعديل وحذف المقالات</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-gradient px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          مقال جديد
        </button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={filter.lang}
            onChange={(e) => setFilter({ ...filter, lang: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          >
            <option value="">كل اللغات</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          >
            <option value="">كل التصنيفات</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          >
            <option value="">كل الحالات</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
          <button
            onClick={() => setFilter({ lang: '', category: '', status: '' })}
            className="text-gray-400 hover:text-white"
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">إجمالي المقالات</p>
          <p className="text-2xl font-bold">{articles.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">منشورة</p>
          <p className="text-2xl font-bold text-green-400">
            {articles.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">مسودات</p>
          <p className="text-2xl font-bold text-yellow-400">
            {articles.filter(a => a.status === 'draft').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">إجمالي المشاهدات</p>
          <p className="text-2xl font-bold">
            {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold">المقال</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">التصنيف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">اللغة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">المشاهدات</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-dark-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{article.image || '📄'}</span>
                      <div>
                        <p className="font-semibold">{article.title}</p>
                        <p className="text-xs text-gray-500">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary-500/20 text-primary-400">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${article.lang === 'ar' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {article.lang === 'ar' ? 'عربي' : 'EN'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      article.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {article.views?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {article.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold">
                {editingArticle ? 'تعديل المقال' : 'مقال جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Language Selector */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lang: 'ar' })}
                  className={`px-4 py-2 rounded-lg ${formData.lang === 'ar' ? 'btn-gradient' : 'bg-dark-800'}`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lang: 'en' })}
                  className={`px-4 py-2 rounded-lg ${formData.lang === 'en' ? 'btn-gradient' : 'bg-dark-800'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lang: 'both' })}
                  className={`px-4 py-2 rounded-lg ${formData.lang === 'both' ? 'btn-gradient' : 'bg-dark-800'}`}
                >
                  كلاهما
                </button>
              </div>

              {/* Arabic Content */}
              {(formData.lang === 'ar' || formData.lang === 'both') && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">المحتوى العربي</h3>
                  <div>
                    <label className="block text-sm mb-1">العنوان *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          title: e.target.value,
                          slug: editingArticle ? formData.slug : generateSlug(e.target.value)
                        });
                      }}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">الملخص</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">المحتوى</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 h-64 font-mono text-sm"
                      placeholder="يمكنك استخدام HTML"
                    />
                  </div>
                </div>
              )}

              {/* English Content */}
              {(formData.lang === 'en' || formData.lang === 'both') && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">English Content</h3>
                  <div>
                    <label className="block text-sm mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Excerpt</label>
                    <textarea
                      value={formData.excerptEn}
                      onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Content</label>
                    <textarea
                      value={formData.contentEn}
                      onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 h-64 font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">الـ Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">الأيقونة (emoji)</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    placeholder="📱"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">الكلمات المفتاحية (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  placeholder="واتس آب, أتمتة, ردود تلقائية"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 rounded-lg bg-dark-800 hover:bg-dark-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gradient px-6 py-2 rounded-lg font-semibold"
                >
                  {editingArticle ? 'حفظ التغييرات' : 'إنشاء المقال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;