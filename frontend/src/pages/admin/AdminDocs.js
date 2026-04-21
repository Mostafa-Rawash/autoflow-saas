import React, { useState, useEffect } from 'react';

const AdminDocs = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [filter, setFilter] = useState({ section: '', lang: '', status: '' });

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    slug: '',
    content: '',
    contentEn: '',
    section: 'البدء السريع',
    readTime: '5 دقائق',
    status: 'draft',
    lang: 'ar',
    order: 0
  });

  const sections = [
    { key: 'quick-start', name: 'البدء السريع', nameEn: 'Quick Start', icon: '🚀' },
    { key: 'auto-replies', name: 'الردود التلقائية', nameEn: 'Auto-Replies', icon: '⚡' },
    { key: 'templates', name: 'القوالب والمتغيرات', nameEn: 'Templates & Variables', icon: '📝' },
    { key: 'conversations', name: 'المحادثات', nameEn: 'Conversations', icon: '💬' },
    { key: 'analytics', name: 'التحليلات', nameEn: 'Analytics', icon: '📊' },
    { key: 'team', name: 'الفريق والصلاحيات', nameEn: 'Team & Permissions', icon: '👥' },
    { key: 'channels', name: 'القنوات', nameEn: 'Channels', icon: '📱' },
    { key: 'billing', name: 'الاشتراك والفواتير', nameEn: 'Subscription & Billing', icon: '💳' },
    { key: 'settings', name: 'الإعدادات', nameEn: 'Settings', icon: '⚙️' },
    { key: 'security', name: 'الأمان والخصوصية', nameEn: 'Security & Privacy', icon: '🔒' },
    { key: 'integrations', name: 'التكاملات', nameEn: 'Integrations', icon: '🔗' },
    { key: 'troubleshooting', name: 'استكشاف الأخطاء', nameEn: 'Troubleshooting', icon: '❓' }
  ];

  useEffect(() => {
    fetchDocs();
  }, [filter]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/docs');
      setDocs(res.data.docs || getMockDocs());
    } catch (err) {
      console.error('Error fetching docs:', err);
      setDocs(getMockDocs());
    } finally {
      setLoading(false);
    }
  };

  const getMockDocs = () => [
    { id: 1, title: 'البدء مع AutoFlow', slug: 'getting-started', section: 'quick-start', status: 'published', lang: 'ar', readTime: '5 دقائق', order: 1 },
    { id: 2, title: 'إعداد الحساب', slug: 'account-setup', section: 'quick-start', status: 'published', lang: 'ar', readTime: '4 دقائق', order: 2 },
    { id: 3, title: 'أساسيات الردود التلقائية', slug: 'auto-reply-basics', section: 'auto-replies', status: 'published', lang: 'ar', readTime: '7 دقائق', order: 1 },
    { id: 4, title: 'أنواع المطابقة', slug: 'keyword-matching', section: 'auto-replies', status: 'published', lang: 'ar', readTime: '6 دقائق', order: 2 },
    { id: 5, title: 'خطط الأسعار', slug: 'pricing-plans', section: 'billing', status: 'published', lang: 'ar', readTime: '5 دقائق', order: 1 },
    { id: 6, title: 'Getting Started', slug: 'getting-started-en', section: 'quick-start', status: 'published', lang: 'en', readTime: '5 min', order: 1 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await api.put(`/admin/docs/${editingDoc.id}`, formData);
      } else {
        await api.post('/admin/docs', formData);
      }
      setShowModal(false);
      fetchDocs();
      resetForm();
    } catch (err) {
      console.error('Error saving doc:', err);
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      titleEn: doc.titleEn || '',
      slug: doc.slug,
      content: doc.content || '',
      contentEn: doc.contentEn || '',
      section: doc.section,
      readTime: doc.readTime,
      status: doc.status,
      lang: doc.lang,
      order: doc.order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدليل؟')) {
      try {
        await api.delete(`/admin/docs/${id}`);
        fetchDocs();
      } catch (err) {
        console.error('Error deleting doc:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', titleEn: '', slug: '', content: '', contentEn: '',
      section: 'quick-start', readTime: '5 دقائق', status: 'draft', lang: 'ar', order: 0
    });
    setEditingDoc(null);
  };

  // Group docs by section
  const groupedDocs = docs.reduce((acc, doc) => {
    if (!acc[doc.section]) acc[doc.section] = [];
    acc[doc.section].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة التوثيق</h1>
          <p className="text-gray-400 text-sm mt-1">إنشاء وتعديل أدلة الاستخدام</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-gradient px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          دليل جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">إجمالي الأدلة</p>
          <p className="text-2xl font-bold">{docs.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">الأقسام</p>
          <p className="text-2xl font-bold">{sections.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">منشورة</p>
          <p className="text-2xl font-bold text-green-400">
            {docs.filter(d => d.status === 'published').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">مسودات</p>
          <p className="text-2xl font-bold text-yellow-400">
            {docs.filter(d => d.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="glass rounded-xl p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setFilter({ ...filter, section: '' })}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${!filter.section ? 'btn-gradient' : 'bg-dark-800'}`}
          >
            الكل
          </button>
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setFilter({ ...filter, section: section.key })}
              className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                filter.section === section.key ? 'btn-gradient' : 'bg-dark-800'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Docs List */}
      {loading ? (
        <div className="glass rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedDocs)
            .filter(([section]) => !filter.section || filter.section === section)
            .map(([section, sectionDocs]) => {
              const sectionInfo = sections.find(s => s.key === section) || { name: section, icon: '📄' };
              return (
                <div key={section} className="glass rounded-xl overflow-hidden">
                  <div className="bg-dark-800 px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">{sectionInfo.icon}</span>
                    <h3 className="font-semibold">{sectionInfo.name}</h3>
                    <span className="text-gray-400 text-sm">({sectionDocs.length} دليل)</span>
                  </div>
                  <div className="divide-y divide-dark-700">
                    {sectionDocs
                      .sort((a, b) => a.order - b.order)
                      .map(doc => (
                      <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-dark-800/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{doc.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              doc.lang === 'ar' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {doc.lang === 'ar' ? 'عربي' : 'EN'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              doc.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {doc.status === 'published' ? 'منشور' : 'مسودة'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            /docs/{doc.slug} • {doc.readTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold">
                {editingDoc ? 'تعديل الدليل' : 'دليل جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">العنوان بالعربية *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

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
                  <label className="block text-sm mb-1">القسم</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  >
                    {sections.map(section => (
                      <option key={section.key} value={section.key}>
                        {section.icon} {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">المحتوى العربي (HTML)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 h-64 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">English Content (HTML)</label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 h-64 font-mono text-sm"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">وقت القراءة</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">الترتيب</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
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
                  {editingDoc ? 'حفظ التغييرات' : 'إنشاء الدليل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocs;