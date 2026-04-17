import React, { useState, useEffect } from 'react';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    key: '',
    description: '',
    color: 'gray',
    permissions: []
  });

  const allPermissions = [
    { key: 'all', name: 'كل الصلاحيات', icon: '👑', critical: true },
    { key: 'users', name: 'إدارة المستخدمين', icon: '👥' },
    { key: 'roles', name: 'إدارة الأدوار', icon: '🔑' },
    { key: 'content', name: 'إدارة المحتوى', icon: '📝', children: ['articles', 'docs'] },
    { key: 'articles', name: 'المقالات', icon: '📰' },
    { key: 'docs', name: 'التوثيق', icon: '📚' },
    { key: 'subscriptions', name: 'الاشتراكات', icon: '💳' },
    { key: 'billing', name: 'الفواتير', icon: '🧾' },
    { key: 'analytics', name: 'التحليلات', icon: '📊' },
    { key: 'conversations', name: 'المحادثات', icon: '💬' },
    { key: 'templates', name: 'القوالب', icon: '📄' },
    { key: 'auto-replies', name: 'الردود التلقائية', icon: '⚡' },
    { key: 'channels', name: 'القنوات', icon: '📱' },
    { key: 'team', name: 'الفريق', icon: '👨‍💼' },
    { key: 'settings', name: 'الإعدادات', icon: '⚙️' },
    { key: 'integrations', name: 'التكاملات', icon: '🔗' },
    { key: 'logs', name: 'سجل النشاط', icon: '📋' }
  ];

  const colors = [
    { key: 'red', name: 'أحمر', bg: 'bg-rose-50', text: 'text-rose-600' },
    { key: 'purple', name: 'بنفسجي', bg: 'bg-sky-50', text: 'text-sky-700' },
    { key: 'blue', name: 'أزرق', bg: 'bg-sky-50', text: 'text-sky-600' },
    { key: 'green', name: 'أخضر', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { key: 'yellow', name: 'أصفر', bg: 'bg-amber-50', text: 'text-amber-600' },
    { key: 'gray', name: 'رمادي', bg: 'bg-slate-100', text: 'text-slate-500' }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/roles');
      setRoles(res.data.roles || getDefaultRoles());
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles(getDefaultRoles());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRoles = () => [
    { id: 1, name: 'مالك الحساب', nameEn: 'Owner', key: 'owner', description: 'صلاحيات كاملة على الحساب', color: 'red', permissions: ['all'], usersCount: 1 },
    { id: 2, name: 'مدير النظام', nameEn: 'Admin', key: 'admin', description: 'صلاحيات إدارية شاملة', color: 'purple', permissions: ['all'], usersCount: 2 },
    { id: 3, name: 'مشرف', nameEn: 'Manager', key: 'manager', description: 'إدارة المحتوى والمستخدمين', color: 'blue', permissions: ['users', 'content', 'analytics', 'subscriptions'], usersCount: 1 },
    { id: 4, name: 'وكيل', nameEn: 'Agent', key: 'agent', description: 'الرد على المحادثات والقوالب', color: 'green', permissions: ['conversations', 'templates', 'auto-replies'], usersCount: 3 },
    { id: 5, name: 'مشاهد', nameEn: 'Viewer', key: 'viewer', description: 'صلاحيات قراءة فقط', color: 'gray', permissions: ['view'], usersCount: 50 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, formData);
      } else {
        await api.post('/admin/roles', formData);
      }
      setShowModal(false);
      fetchRoles();
      resetForm();
    } catch (err) {
      console.error('Error saving role:', err);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      nameEn: role.nameEn,
      key: role.key,
      description: role.description,
      color: role.color,
      permissions: role.permissions || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      try {
        await api.delete(`/admin/roles/${id}`);
        fetchRoles();
      } catch (err) {
        console.error('Error deleting role:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', nameEn: '', key: '', description: '', color: 'gray', permissions: []
    });
    setEditingRole(null);
  };

  const togglePermission = (permKey) => {
    const hasAll = formData.permissions.includes('all');
    
    if (permKey === 'all') {
      setFormData({ ...formData, permissions: hasAll ? [] : ['all'] });
    } else {
      let newPerms = formData.permissions.filter(p => p !== 'all');
      if (newPerms.includes(permKey)) {
        newPerms = newPerms.filter(p => p !== permKey);
      } else {
        newPerms.push(permKey);
      }
      setFormData({ ...formData, permissions: newPerms });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الأدوار والصلاحيات</h1>
          <p className="text-slate-500 text-sm mt-1">تحديد الأدوار وصلاحيات الوصول</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          دور جديد
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(role => {
          const colorInfo = colors.find(c => c.key === role.color) || colors[5];
          const hasAll = role.permissions?.includes('all');
          
          return (
            <div key={role.id} className="card p-5 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorInfo.bg} ${colorInfo.text} flex items-center justify-center text-2xl`}>
                  {hasAll ? '👑' : '🔑'}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!['admin', 'user'].includes(role.key) && (
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-1.5 hover:bg-rose-50 rounded text-slate-500 hover:text-rose-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-lg">{role.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{role.nameEn}</p>
              <p className="text-sm text-slate-500 mb-4">{role.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {role.permissions?.slice(0, 5).map(perm => (
                  <span key={perm} className="text-xs px-2 py-0.5 rounded bg-slate-100">
                    {allPermissions.find(p => p.key === perm)?.name || perm}
                  </span>
                ))}
                {role.permissions?.length > 5 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100">
                    +{role.permissions.length - 5}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{role.usersCount || 0} مستخدم</span>
                <span className={`px-2 py-0.5 rounded text-xs ${colorInfo.bg} ${colorInfo.text}`}>
                  {role.key}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Reference */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">الصلاحيات المتاحة</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {allPermissions.map(perm => (
            <div key={perm.key} className="flex items-center gap-2 p-2 rounded bg-slate-50">
              <span className="text-xl">{perm.icon}</span>
              <div>
                <p className="font-semibold text-sm">{perm.name}</p>
                <p className="text-xs text-slate-400">{perm.key}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">
                {editingRole ? 'تعديل الدور' : 'دور جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">المفتاح (key) *</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">اللون</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700"
                  >
                    {colors.map(color => (
                      <option key={color.key} value={color.key}>{color.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700 h-20"
                />
              </div>

              <div>
                <label className="block text-sm mb-3">الصلاحيات</label>
                <div className="grid md:grid-cols-2 gap-2">
                  {allPermissions.map(perm => (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.permissions.includes(perm.key) || formData.permissions.includes('all')
                          ? 'bg-sky-50 border border-sky-200'
                          : 'bg-slate-100 border border-slate-200 hover:border-slate-300'
                      } ${perm.critical ? 'border-red-500/50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.key) || formData.permissions.includes('all')}
                        onChange={() => togglePermission(perm.key)}
                        disabled={formData.permissions.includes('all') && perm.key !== 'all'}
                        className="sr-only"
                      />
                      <span className="text-xl">{perm.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{perm.name}</p>
                        <p className="text-xs text-slate-400">{perm.key}</p>
                      </div>
                      {formData.permissions.includes(perm.key) && (
                        <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2 rounded-lg font-semibold"
                >
                  {editingRole ? 'حفظ التغييرات' : 'إنشاء الدور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;