import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, Power, Users, UserCheck, UserX, Shield } from 'lucide-react';

const AdminUsers = () => {
  const theme = useTheme();
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
    password: ''
  });

  const roles = [
    { key: 'owner', name: 'مالك', color: 'red' },
    { key: 'admin', name: 'مدير', color: 'purple' },
    { key: 'manager', name: 'مشرف', color: 'blue' },
    { key: 'agent', name: 'وكيل', color: 'green' },
    { key: 'viewer', name: 'مشاهد', color: 'gray' }
  ];

  const roleColorClasses = {
    red: theme === 'light' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-rose-500/20 text-rose-400',
    purple: theme === 'light' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-purple-500/20 text-purple-400',
    blue: theme === 'light' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-sky-500/20 text-sky-400',
    green: theme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400',
    gray: theme === 'light' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-500/20 text-slate-400'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.search) params.search = filter.search;
      if (filter.status) params.status = filter.status;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        delete updateData.password; // Don't send empty password
        if (formData.password) updateData.password = formData.password;
        await api.put(`/admin/users/${editingUser._id}/role`, { role: formData.role });
        if (formData.phone) await api.put(`/users/${editingUser._id}`, { name: formData.name, phone: formData.phone });
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        await api.post('/auth/register', formData);
        toast.success('تم إنشاء المستخدم بنجاح');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في حفظ المستخدم');
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newActive = !user.isActive;
      await api.put(`/admin/users/${user._id}/status`, { isActive: newActive });
      toast.success(newActive ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم');
      fetchUsers();
    } catch (err) {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'agent',
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: 'agent', password: '' });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => {
    if (filter.role && user.role !== filter.role) return false;
    if (filter.status === 'active' && !user.isActive) return false;
    if (filter.status === 'inactive' && user.isActive) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const formatRole = (roleKey) => roles.find(r => r.key === roleKey)?.name || roleKey;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('ar-EG') : '—';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>إدارة المستخدمين</h1>
          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> مستخدم جديد
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Users className={`w-8 h-8 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`} />
          <div>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>إجمالي</p>
            <p className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{users.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-emerald-500" />
          <div>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>نشطين</p>
            <p className="text-2xl font-bold text-emerald-600">{users.filter(u => u.isActive).length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <UserX className="w-8 h-8 text-rose-500" />
          <div>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>غير نشطين</p>
            <p className="text-2xl font-bold text-rose-600">{users.filter(u => !u.isActive).length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-sky-500" />
          <div>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>مشرفين</p>
            <p className="text-2xl font-bold text-sky-600">{users.filter(u => u.role === 'admin' || u.role === 'owner' || u.role === 'manager').length}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
            <input type="text" placeholder="بحث بالاسم أو البريد..." value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className={`w-full rounded-lg py-2 pr-10 pl-4 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'}`}
            />
          </div>
          <select value={filter.role} onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            className={`rounded-lg py-2 px-4 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'}`}>
            <option value="">كل الأدوار</option>
            {roles.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
          </select>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className={`rounded-lg py-2 px-4 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-800 border border-dark-600'}`}>
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className={`w-12 h-12 mx-auto mb-3 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
            <p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'light' ? 'bg-slate-50' : 'bg-dark-700'}>
                <tr>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>المستخدم</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الدور</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الحالة</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الباقة</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>آخر دخول</th>
                  <th className={`px-4 py-3 text-center text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>إجراءات</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-dark-600'}`}>
                {filteredUsers.map((user) => {
                  const roleInfo = roles.find(r => r.key === user.role) || roles[3];
                  return (
                    <tr key={user._id} className={`${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-dark-700/50'} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${theme === 'light' ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/20 text-sky-400'}`}>
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{user.name}</p>
                            <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColorClasses[roleInfo.color] || roleColorClasses.gray}`}>
                          {roleInfo.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleStatusToggle(user)}
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${user.isActive ? (theme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-400') : (theme === 'light' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-rose-500/20 text-rose-400')}`}>
                          {user.isActive ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${theme === 'light' ? 'bg-sky-50 text-sky-700' : 'bg-sky-500/20 text-sky-400'}`}>
                          {user.subscription?.plan || 'free'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(user)} className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-dark-600 text-slate-400'}`}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusToggle(user)} className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-dark-600 text-slate-400'}`}>
                            <Power className={`w-4 h-4 ${user.isActive ? 'text-emerald-500' : 'text-rose-500'}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme === 'light' ? 'bg-white' : 'bg-dark-800'}`}>
            <div className={`p-6 border-b ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'}`}>
              <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {editingUser ? 'تعديل المستخدم' : 'مستخدم جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الاسم *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-lg px-4 py-2 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-700 border border-dark-600'}`} required />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>البريد الإلكتروني *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full rounded-lg px-4 py-2 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-700 border border-dark-600'}`}
                    required disabled={!!editingUser} />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الهاتف</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full rounded-lg px-4 py-2 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-700 border border-dark-600'}`} placeholder="01xxxxxxxxx" />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    {editingUser ? 'كلمة مرور جديدة (اتركه فارغ للإبقاء)' : 'كلمة المرور *'}
                  </label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full rounded-lg px-4 py-2 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-700 border border-dark-600'}`}
                    required={!editingUser} />
                </div>
              </div>
              <div>
                <label className={`block text-sm mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>الدور</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full rounded-lg px-4 py-2 ${theme === 'light' ? 'bg-slate-50 border border-slate-300' : 'bg-dark-700 border border-dark-600'}`}>
                  {roles.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
              </div>
              <div className={`flex justify-end gap-3 pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'}`}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className={`px-6 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-dark-700 hover:bg-dark-600'}`}>
                  إلغاء
                </button>
                <button type="submit" className="btn-primary px-6 py-2 rounded-lg font-semibold">
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