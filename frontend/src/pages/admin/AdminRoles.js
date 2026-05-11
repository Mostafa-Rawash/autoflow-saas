import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';
import { Shield, Users, Edit3, ChevronDown, ChevronUp, Crown, Check, X, Search } from 'lucide-react';

const PERMISSION_CATEGORIES = [
  {
    key: 'conversations',
    label: 'المحادثات',
    icon: '💬',
    permissions: [
      { key: 'viewConversations', label: 'عرض المحادثات' },
      { key: 'replyConversations', label: 'الرد على المحادثات' },
      { key: 'assignConversations', label: 'تخصيص المحادثات' },
      { key: 'closeConversations', label: 'إغلاق المحادثات' },
      { key: 'deleteConversations', label: 'حذف المحادثات' },
    ]
  },
  {
    key: 'templates',
    label: 'القوالب',
    icon: '📄',
    permissions: [
      { key: 'viewTemplates', label: 'عرض القوالب' },
      { key: 'createTemplates', label: 'إنشاء قوالب' },
      { key: 'editTemplates', label: 'تعديل القوالب' },
      { key: 'deleteTemplates', label: 'حذف القوالب' },
    ]
  },
  {
    key: 'channels',
    label: 'القنوات',
    icon: '📱',
    permissions: [
      { key: 'viewChannels', label: 'عرض القنوات' },
      { key: 'connectChannels', label: 'ربط القنوات' },
      { key: 'disconnectChannels', label: 'فصل القنوات' },
      { key: 'configureChannels', label: 'إعداد القنوات' },
    ]
  },
  {
    key: 'analytics',
    label: 'التحليلات',
    icon: '📊',
    permissions: [
      { key: 'viewAnalytics', label: 'عرض التحليلات' },
      { key: 'exportAnalytics', label: 'تصدير التحليلات' },
    ]
  },
  {
    key: 'team',
    label: 'الفريق',
    icon: '👨‍💼',
    permissions: [
      { key: 'viewTeam', label: 'عرض الفريق' },
      { key: 'inviteMembers', label: 'دعوة أعضاء' },
      { key: 'removeMembers', label: 'إزالة أعضاء' },
      { key: 'changeRoles', label: 'تغيير الأدوار' },
    ]
  },
  {
    key: 'settings',
    label: 'الإعدادات',
    icon: '⚙️',
    permissions: [
      { key: 'viewSettings', label: 'عرض الإعدادات' },
      { key: 'editSettings', label: 'تعديل الإعدادات' },
    ]
  },
  {
    key: 'billing',
    label: 'الفواتير',
    icon: '💳',
    permissions: [
      { key: 'viewBilling', label: 'عرض الفواتير' },
      { key: 'manageBilling', label: 'إدارة الفواتير' },
    ]
  },
  {
    key: 'api',
    label: 'API',
    icon: '🔗',
    permissions: [
      { key: 'viewApiKeys', label: 'عرض مفاتيح API' },
      { key: 'createApiKeys', label: 'إنشاء مفاتيح API' },
      { key: 'revokeApiKeys', label: 'إلغاء مفاتيح API' },
    ]
  },
  {
    key: 'webhooks',
    label: 'Webhooks',
    icon: '🪝',
    permissions: [
      { key: 'viewWebhooks', label: 'عرض Webhooks' },
      { key: 'createWebhooks', label: 'إنشاء Webhooks' },
      { key: 'deleteWebhooks', label: 'حذف Webhooks' },
    ]
  },
];

const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(cat => cat.permissions.map(p => p.key));

const ROLE_COLORS = {
  owner:  { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', solid: 'bg-red-500' },
  admin:  { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', solid: 'bg-purple-500' },
  manager: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', solid: 'bg-blue-500' },
  agent:  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', solid: 'bg-emerald-500' },
  viewer: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', solid: 'bg-slate-500' },
};

const ROLE_COLORS_LIGHT = {
  owner:  { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  admin:  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  manager: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  agent:  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  viewer: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

const DEFAULT_ROLES = [
  { name: 'owner', displayName: 'مالك الحساب', description: 'صلاحيات كاملة على الحساب', level: 100, isDefault: false, permissions: Object.fromEntries(ALL_PERMISSIONS.map(k => [k, true])) },
  { name: 'admin', displayName: 'مدير', description: 'صلاحيات إدارية شاملة', level: 80, isDefault: false, permissions: { viewDashboard: true, viewConversations: true, replyConversations: true, assignConversations: true, closeConversations: true, deleteConversations: false, viewTemplates: true, createTemplates: true, editTemplates: true, deleteTemplates: true, viewChannels: true, connectChannels: true, disconnectChannels: true, configureChannels: true, viewAnalytics: true, exportAnalytics: true, viewTeam: true, inviteMembers: true, removeMembers: true, changeRoles: false, viewSettings: true, editSettings: true, viewBilling: true, manageBilling: false, viewApiKeys: true, createApiKeys: true, revokeApiKeys: true, viewWebhooks: true, createWebhooks: true, deleteWebhooks: true } },
  { name: 'manager', displayName: 'مشرف', description: 'صلاحيات إشرافية', level: 60, isDefault: false, permissions: { viewDashboard: true, viewConversations: true, replyConversations: true, assignConversations: true, closeConversations: true, deleteConversations: false, viewTemplates: true, createTemplates: true, editTemplates: true, deleteTemplates: false, viewChannels: true, connectChannels: false, disconnectChannels: false, configureChannels: true, viewAnalytics: true, exportAnalytics: true, viewTeam: true, inviteMembers: true, removeMembers: false, changeRoles: false, viewSettings: true, editSettings: true, viewBilling: false, manageBilling: false, viewApiKeys: true, createApiKeys: false, revokeApiKeys: false, viewWebhooks: true, createWebhooks: false, deleteWebhooks: false } },
  { name: 'agent', displayName: 'وكيل', description: 'صلاحيات خدمة العملاء', level: 40, isDefault: true, permissions: { viewDashboard: true, viewConversations: true, replyConversations: true, assignConversations: false, closeConversations: true, deleteConversations: false, viewTemplates: true, createTemplates: false, editTemplates: false, deleteTemplates: false, viewChannels: true, connectChannels: false, disconnectChannels: false, configureChannels: false, viewAnalytics: true, exportAnalytics: false, viewTeam: false, inviteMembers: false, removeMembers: false, changeRoles: false, viewSettings: true, editSettings: false, viewBilling: false, manageBilling: false, viewApiKeys: false, createApiKeys: false, revokeApiKeys: false, viewWebhooks: false, createWebhooks: false, deleteWebhooks: false } },
  { name: 'viewer', displayName: 'مشاهد', description: 'صلاحيات قراءة فقط', level: 20, isDefault: false, permissions: { viewDashboard: true, viewConversations: true, replyConversations: false, assignConversations: false, closeConversations: false, deleteConversations: false, viewTemplates: true, createTemplates: false, editTemplates: false, deleteTemplates: false, viewChannels: true, connectChannels: false, disconnectChannels: false, configureChannels: false, viewAnalytics: true, exportAnalytics: false, viewTeam: false, inviteMembers: false, removeMembers: false, changeRoles: false, viewSettings: true, editSettings: false, viewBilling: false, manageBilling: false, viewApiKeys: false, createApiKeys: false, revokeApiKeys: false, viewWebhooks: false, createWebhooks: false, deleteWebhooks: false } },
];

const AdminRoles = () => {
  const theme = useTheme();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // cards | matrix
  const [editingRole, setEditingRole] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchPerm, setSearchPerm] = useState('');

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/roles');
      if (res.data?.success && res.data.roles?.length) {
        setRoles(res.data.roles);
      } else {
        setRoles(DEFAULT_ROLES);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles(DEFAULT_ROLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleEdit = (role) => {
    setEditingRole({ ...role });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingRole) return;
    try {
      await api.put(`/admin/roles/${editingRole.name}`, {
        permissions: editingRole.permissions,
        description: editingRole.description
      });
      setShowEditModal(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
      setRoles(prev => prev.map(r => r.name === editingRole.name ? editingRole : r));
      setShowEditModal(false);
      setEditingRole(null);
    }
  };

  const togglePermission = (permKey) => {
    if (!editingRole) return;
    const updated = { ...editingRole };
    updated.permissions = { ...updated.permissions, [permKey]: !updated.permissions[permKey] };
    setEditingRole(updated);
  };

  const toggleCategory = (catKey) => {
    if (!editingRole) return;
    const cat = PERMISSION_CATEGORIES.find(c => c.key === catKey);
    if (!cat) return;
    const allEnabled = cat.permissions.every(p => editingRole.permissions[p.key]);
    const updated = { ...editingRole };
    updated.permissions = { ...updated.permissions };
    cat.permissions.forEach(p => { updated.permissions[p.key] = !allEnabled; });
    setEditingRole(updated);
  };

  const countEnabled = (role, catKey) => {
    const cat = PERMISSION_CATEGORIES.find(c => c.key === catKey);
    if (!cat) return 0;
    return cat.permissions.filter(p => role.permissions?.[p.key]).length;
  };

  const totalEnabled = (role) => {
    return ALL_PERMISSIONS.filter(k => role.permissions?.[k]).length;
  };

  const getRoleColor = (roleName, type) => {
    const isDark = theme === 'dark';
    const colors = isDark ? ROLE_COLORS : ROLE_COLORS_LIGHT;
    return colors[roleName]?.[type] || colors.viewer[type];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            إدارة الأدوار والصلاحيات
          </h1>
          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
            تحديد الأدوار وصلاحيات الوصول لكل مستوى
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'cards'
                ? 'btn-primary'
                : theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            <Shield className="w-4 h-4 inline ml-1" />
            بطاقات
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'matrix'
                ? 'btn-primary'
                : theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            <Users className="w-4 h-4 inline ml-1" />
            جدول
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {roles.map(role => (
          <div
            key={role.name}
            className={`rounded-xl p-4 border ${getRoleColor(role.name, 'border')} ${
              theme === 'light' ? 'bg-white' : 'bg-dark-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${ROLE_COLORS[role.name]?.solid || 'bg-slate-400'}`} />
              <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {role.displayName}
              </span>
            </div>
            <p className={`text-2xl font-black ${getRoleColor(role.name, 'text')}`}>
              {totalEnabled(role)}
            </p>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              صلاحية من {ALL_PERMISSIONS.length}
            </p>
          </div>
        ))}
      </div>

      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div
              key={role.name}
              className={`rounded-xl border overflow-hidden ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-dark-800 border-dark-700'
              }`}
            >
              {/* Role Header */}
              <div className={`p-4 border-b ${theme === 'light' ? 'border-slate-100' : 'border-dark-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getRoleColor(role.name, 'bg')} ${getRoleColor(role.name, 'text')} flex items-center justify-center`}>
                      {role.name === 'owner' ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {role.displayName}
                      </h3>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>
                        {role.name} · مستوى {role.level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {role.isDefault && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'light' ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        افتراضي
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(role.name, 'bg')} ${getRoleColor(role.name, 'text')}`}>
                      {role.usersCount ?? 0} مستخدم
                    </span>
                  </div>
                </div>
                <p className={`text-sm mt-2 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  {role.description}
                </p>
              </div>

              {/* Permission Categories */}
              <div className="p-4 space-y-2">
                {PERMISSION_CATEGORIES.map(cat => {
                  const enabled = countEnabled(role, cat.key);
                  const total = cat.permissions.length;
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between py-1">
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          {cat.icon} {cat.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`w-20 h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-dark-600'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${ROLE_COLORS[role.name]?.solid || 'bg-slate-400'}`}
                              style={{ width: `${(enabled / total) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs tabular-nums ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>
                            {enabled}/{total}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className={`px-4 py-3 border-t ${theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-dark-700 bg-dark-900/50'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${getRoleColor(role.name, 'text')}`}>
                    {totalEnabled(role)} من {ALL_PERMISSIONS.length} صلاحية
                  </span>
                  {role.name !== 'owner' && (
                    <button
                      onClick={() => handleEdit(role)}
                      className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      aria-label={`تعديل دور ${role.displayName}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      تعديل
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Matrix View */
        <div className={`rounded-xl border overflow-x-auto ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-dark-800 border-dark-700'}`}>
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className={theme === 'light' ? 'bg-slate-50' : 'bg-dark-900'}>
                <th className={`px-4 py-3 text-right text-sm font-semibold sticky left-0 ${theme === 'light' ? 'bg-slate-50' : 'bg-dark-900'}`}>
                  الصلاحية
                </th>
                {roles.map(role => (
                  <th key={role.name} className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs font-bold ${getRoleColor(role.name, 'text')}`}>
                        {role.displayName}
                      </span>
                      <span className={`text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>
                        مستوى {role.level}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-100' : 'divide-dark-700'}`}>
              {PERMISSION_CATEGORIES.map(cat => (
                <React.Fragment key={cat.key}>
                  <tr className={theme === 'light' ? 'bg-slate-50/50' : 'bg-dark-900/30'}>
                    <td colSpan={roles.length + 1} className={`px-4 py-2 text-sm font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      {cat.icon} {cat.label}
                    </td>
                  </tr>
                  {cat.permissions.map(perm => (
                    <tr key={perm.key} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-dark-700/50'}>
                      <td className={`px-4 py-2 text-sm sticky left-0 ${theme === 'light' ? 'bg-white text-slate-600' : 'bg-dark-800 text-gray-300'}`}>
                        {perm.label}
                      </td>
                      {roles.map(role => {
                        const enabled = role.permissions?.[perm.key];
                        return (
                          <td key={role.name} className="px-3 py-2 text-center">
                            {enabled ? (
                              <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <X className={`w-4 h-4 mx-auto ${theme === 'light' ? 'text-slate-300' : 'text-dark-600'}`} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permission Categories Reference */}
      <div className={`rounded-xl p-6 border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-dark-800 border-dark-700'}`}>
        <h2 className={`text-lg font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          دليل الصلاحيات
        </h2>
        <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
          {ALL_PERMISSIONS.length} صلاحية موزعة على {PERMISSION_CATEGORIES.length} فئات
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {PERMISSION_CATEGORIES.map(cat => (
            <div key={cat.key} className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-dark-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cat.icon}</span>
                <span className={`font-semibold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {cat.label}
                </span>
                <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>
                  ({cat.permissions.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {cat.permissions.map(p => (
                  <span
                    key={p.key}
                    className={`text-xs px-2 py-0.5 rounded ${theme === 'light' ? 'bg-white text-slate-500 border border-slate-200' : 'bg-dark-800 text-gray-400 border border-dark-600'}`}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingRole && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => { setShowEditModal(false); setEditingRole(null); }}
        >
          <div
            className={`${theme === 'light' ? 'bg-white' : 'bg-dark-800'} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'} shadow-2xl`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${getRoleColor(editingRole.name, 'bg')} ${getRoleColor(editingRole.name, 'text')} flex items-center justify-center`}>
                  {editingRole.name === 'owner' ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    تعديل صلاحيات {editingRole.displayName}
                  </h2>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                    مستوى {editingRole.level} · {totalEnabled(editingRole)} من {ALL_PERMISSIONS.length} صلاحية
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingRole(null); }}
                className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-dark-700'}`}
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className={`block text-sm mb-1 font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  الوصف
                </label>
                <input
                  type="text"
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2 ${theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="بحث في الصلاحيات..."
                  value={searchPerm}
                  onChange={(e) => setSearchPerm(e.target.value)}
                  className={`w-full border rounded-lg pr-10 pl-4 py-2 ${theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-dark-700 border-dark-600 text-white'}`}
                />
              </div>

              {/* Permission Categories */}
              <div className="space-y-3">
                {PERMISSION_CATEGORIES.map(cat => {
                  const enabled = countEnabled(editingRole, cat.key);
                  const total = cat.permissions.length;
                  const filteredPerms = cat.permissions.filter(p =>
                    !searchPerm || p.label.includes(searchPerm) || p.key.toLowerCase().includes(searchPerm.toLowerCase())
                  );
                  if (filteredPerms.length === 0 && searchPerm) return null;

                  return (
                    <div
                      key={cat.key}
                      className={`rounded-lg border ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'}`}
                    >
                      <button
                        className="w-full flex items-center justify-between p-3"
                        onClick={() => setExpandedCategory(expandedCategory === cat.key ? null : cat.key)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className={`font-semibold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {cat.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(editingRole.name, 'bg')} ${getRoleColor(editingRole.name, 'text')}`}>
                            {enabled}/{total}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleCategory(cat.key); }}
                            className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-dark-700 hover:bg-dark-600 text-gray-400'}`}
                          >
                            {enabled === total ? 'إلغاء الكل' : 'تحديد الكل'}
                          </button>
                          {expandedCategory === cat.key ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {(expandedCategory === cat.key || searchPerm) && (
                        <div className={`px-3 pb-3 grid grid-cols-2 gap-2 ${theme === 'light' ? 'border-t border-slate-100' : 'border-t border-dark-700'}`}>
                          {filteredPerms.map(perm => {
                            const isEnabled = editingRole.permissions?.[perm.key];
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                  isEnabled
                                    ? theme === 'light' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'
                                    : theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-dark-700 border border-dark-600'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                                  isEnabled ? 'bg-emerald-500 text-white' : theme === 'light' ? 'bg-slate-200' : 'bg-dark-600'
                                }`}>
                                  {isEnabled && <Check className="w-3 h-3" />}
                                </div>
                                <span className={`text-sm ${isEnabled ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-500' : 'text-gray-400')}`}>
                                  {perm.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t flex justify-end gap-3 ${theme === 'light' ? 'border-slate-200' : 'border-dark-600'}`}>
              <button
                onClick={() => { setShowEditModal(false); setEditingRole(null); }}
                className={`px-6 py-2 rounded-lg ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-dark-700 hover:bg-dark-600'}`}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="btn-primary px-6 py-2 rounded-lg font-semibold"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;