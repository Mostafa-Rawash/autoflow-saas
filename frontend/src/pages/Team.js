import React, { useState } from 'react';
import { Users, UserPlus, Shield, Mail, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Team = () => {
  const { user } = useAuthStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  // Mock team members - in production this would come from API
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: user?.name || 'المالك',
      email: user?.email || 'owner@example.com',
      role: 'owner',
      status: 'active',
      lastActive: new Date().toISOString()
    }
  ]);

  const roles = [
    { id: 'owner', name: 'مالك', permissions: ['all'], color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'admin', name: 'مدير', permissions: ['manage_team', 'manage_channels', 'view_analytics'], color: 'bg-purple-500/20 text-purple-400' },
    { id: 'agent', name: 'وكيل', permissions: ['reply_conversations', 'view_templates'], color: 'bg-blue-500/20 text-blue-400' }
  ];

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('أدخل البريد الإلكتروني');
      return;
    }

    // Add to team (mock)
    setTeamMembers([
      ...teamMembers,
      {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        lastActive: null
      }
    ]);

    toast.success('تم إرسال الدعوة بنجاح');
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleRemove = (memberId) => {
    if (!window.confirm('هل تريد إزالة هذا العضو؟')) return;
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    toast.success('تم إزالة العضو');
  };

  const getRoleBadge = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || 'bg-gray-500/20 text-gray-400';
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الفريق</h1>
          <p className="text-gray-400 mt-1">إدارة أعضاء فريقك وصلاحياتهم</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          دعوة عضو
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{teamMembers.length}</p>
          <p className="text-sm text-gray-500">أعضاء الفريق</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {teamMembers.filter(m => m.status === 'active').length}
          </p>
          <p className="text-sm text-gray-500">نشط</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {teamMembers.filter(m => m.role === 'admin').length}
          </p>
          <p className="text-sm text-gray-500">مدراء</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {teamMembers.filter(m => m.role === 'agent').length}
          </p>
          <p className="text-sm text-gray-500">وكلاء</p>
        </div>
      </div>

      {/* Team List */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          أعضاء الفريق
        </h3>
        
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 bg-dark-800 rounded-lg hover:bg-dark-750 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-lg font-bold">
                {member.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{member.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs ${getRoleBadge(member.role)}`}>
                    {getRoleName(member.role)}
                  </span>
                  {member.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                      في الانتظار
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {member.email}
                </p>
              </div>

              {/* Actions */}
              {member.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          الأدوار والصلاحيات
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="p-4 bg-dark-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded text-sm ${role.color}`}>
                  {role.name}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                {role.permissions.map((perm, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {perm === 'all' ? 'جميع الصلاحيات' : perm.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">دعوة عضو جديد</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الدور</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
                >
                  <option value="admin">مدير</option>
                  <option value="agent">وكيل</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleInvite} className="btn-primary flex-1">
                  إرسال الدعوة
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary flex-1"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;