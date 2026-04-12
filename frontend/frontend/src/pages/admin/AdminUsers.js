import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState({ role: '', status: '', search: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'agent',
    status: 'active',
    password: '',
    businessName: '',
    businessType: ''
  });

  const roles = [
    { key: 'owner', name: 'مالك', color: 'red', permissions: ['all'] },
    { key: 'admin', name: 'مدير', color: 'purple', permissions: ['all'] },
    { key: 'manager', name: 'مشرف', color: 'blue', permissions: ['users', 'content', 'analytics', 'subscriptions'] },
    { key: 'agent', name: 'وكيل', color: 'green', permissions: ['conversations', 'templates', 'auto-replies'] },
    { key: 'viewer', name: 'مشاهد', color: 'gray', permissions: ['view'] }
  ];

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.users || getMockUsers());
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const getMockUsers = () => [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '01012345678', role: 'admin', status: 'active', businessName: 'مطعم السعادة', businessType: 'restaurant', conversations: 156, lastActive: '2026-04-05', createdAt: '2026-01-15' },
    { id: 2, name: 'سارة أحمد', email: 'sara@example.com', phone: '01098765432', role: 'manager', status: 'active', businessName: 'عيادة الشفاء', businessType: 'clinic', conversations: 89, lastActive: '2026-04-04', createdAt: '2026-02-10' },
    { id: 3, name: 'محمد علي', email: 'mohamed@example.com', phone: '01055556666', role: 'agent', status: 'active', businessName: 'متجر الأناقة', businessType: 'ecommerce', conversations: 234, lastActive: '2026-04-03', createdAt: '2026-03-01' },
    { id: 4, name: 'فاطمة حسن', email: 'fatma@example.com', phone: '01077778888', role: 'agent', status: 'active', businessName: 'مكتب المحاماة', businessType: 'lawyer', conversations: 67, lastActive: '2026-04-05', createdAt: '2026-02-20' },
    { id: 5, name: 'خالد عمر', email: 'khaled@example.com', phone: '01099990000', role: 'viewer', status: 'inactive', businessName: 'شركة العقار', businessType: 'realestate', conversations: 45, lastActive: '2026-03-15', createdAt: '2026-01-25' },
    { id: 6, name: 'Mostafa Rawash', email: 'mostafa@rawash.com', phone: '01099129550', role: 'owner', status: 'active', businessName: 'AutoFlow', businessType: 'service', conversations: 500, lastActive: '2026-04-05', createdAt: '2026-01-01' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      setShowModal(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      password: '',
      businessName: user.businessName,
      businessType: user.businessType
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/users/${user.id}`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', role: 'agent', status: 'active',
      password: '', businessName: '', businessType: ''
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => {
    if (filter.role && user.role !== filter.role) return false;
    if (filter.status && user.status !== filter.status) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return user.name.toLowerCase().includes(search) || 
             user.email.toLowerCase().includes(search) ||
             user.businessName?.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-gradient px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          مستخدم جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">نشطين</p>
          <p className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">غير نشطين</p>
          <p className="text-2xl font-bold text-red-400">
            {users.filter(u => u.status === 'inactive').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">مشرفين</p>
          <p className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.role === 'admin' || u.role === 'manager').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-gray-400 text-sm">محادثات</p>
          <p className="text-2xl font-bold">
            {users.reduce((sum, u) => sum + u.conversations, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="بحث..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          />
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          >
            <option value="">كل الأدوار</option>
            {roles.map(role => (
              <option key={role.key} value={role.key}>{role.name}</option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2"
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
          <button
            onClick={() => setFilter({ role: '', status: '', search: '' })}
            className="text-gray-400 hover:text-white"
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold">المستخدم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">النشاط</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الدور</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">المحادثات</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">آخر نشاط</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.map((user) => {
                const roleInfo = roles.find(r => r.key === user.role) || roles[3];
                return (
                  <tr key={user.id} className="hover:bg-dark-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{user.businessName}</p>
                      <p className="text-xs text-gray-500">{user.businessType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs bg-${roleInfo.color}-500/20 text-${roleInfo.color}-400`}>
                        {roleInfo.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.status === 'active' ? 'نشط' : 'غير نشط'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {user.conversations?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {user.lastActive}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <h2 className="text-xl font-bold">
                {editingUser ? 'تعديل المستخدم' : 'مستخدم جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">الاسم *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {editingUser ? 'كلمة مرور جديدة (اتركه فارغ للإبقاء)' : 'كلمة المرور *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">اسم النشاط</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">نوع النشاط</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  >
                    <option value="">اختر النوع</option>
                    <option value="restaurant">مطعم</option>
                    <option value="clinic">عيادة</option>
                    <option value="ecommerce">متجر إلكتروني</option>
                    <option value="realestate">عقارات</option>
                    <option value="lawyer">محاماة</option>
                    <option value="service">خدمات</option>
                    <option value="education">تعليم</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  >
                    {roles.map(role => (
                      <option key={role.key} value={role.key}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
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
                  {editingUser ? 'حفظ التغييرات' : 'إنشاء المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;