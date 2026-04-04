const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'agent', 'viewer'],
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: String,
  
  // Permissions
  permissions: {
    // Dashboard
    viewDashboard: { type: Boolean, default: true },
    
    // Conversations
    viewConversations: { type: Boolean, default: true },
    replyConversations: { type: Boolean, default: false },
    assignConversations: { type: Boolean, default: false },
    closeConversations: { type: Boolean, default: false },
    deleteConversations: { type: Boolean, default: false },
    
    // Templates
    viewTemplates: { type: Boolean, default: true },
    createTemplates: { type: Boolean, default: false },
    editTemplates: { type: Boolean, default: false },
    deleteTemplates: { type: Boolean, default: false },
    
    // Channels
    viewChannels: { type: Boolean, default: true },
    connectChannels: { type: Boolean, default: false },
    disconnectChannels: { type: Boolean, default: false },
    configureChannels: { type: Boolean, default: false },
    
    // Analytics
    viewAnalytics: { type: Boolean, default: true },
    exportAnalytics: { type: Boolean, default: false },
    
    // Team
    viewTeam: { type: Boolean, default: true },
    inviteMembers: { type: Boolean, default: false },
    removeMembers: { type: Boolean, default: false },
    changeRoles: { type: Boolean, default: false },
    
    // Settings
    viewSettings: { type: Boolean, default: true },
    editSettings: { type: Boolean, default: false },
    
    // Billing
    viewBilling: { type: Boolean, default: false },
    manageBilling: { type: Boolean, default: false },
    
    // API
    viewApiKeys: { type: Boolean, default: false },
    createApiKeys: { type: Boolean, default: false },
    revokeApiKeys: { type: Boolean, default: false },
    
    // Webhooks
    viewWebhooks: { type: Boolean, default: false },
    createWebhooks: { type: Boolean, default: false },
    deleteWebhooks: { type: Boolean, default: false }
  },
  
  // Hierarchy level (higher = more permissions)
  level: {
    type: Number,
    default: 1
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define role hierarchy
RoleSchema.statics.getRoleHierarchy = function() {
  return {
    owner: 100,
    admin: 80,
    manager: 60,
    agent: 40,
    viewer: 20
  };
};

// Check if role has permission
RoleSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Default roles
const defaultRoles = [
  {
    name: 'owner',
    displayName: 'مالك الحساب',
    description: 'صلاحيات كاملة على الحساب',
    level: 100,
    isDefault: false,
    permissions: {
      viewDashboard: true,
      viewConversations: true, replyConversations: true, assignConversations: true,
      closeConversations: true, deleteConversations: true,
      viewTemplates: true, createTemplates: true, editTemplates: true, deleteTemplates: true,
      viewChannels: true, connectChannels: true, disconnectChannels: true, configureChannels: true,
      viewAnalytics: true, exportAnalytics: true,
      viewTeam: true, inviteMembers: true, removeMembers: true, changeRoles: true,
      viewSettings: true, editSettings: true,
      viewBilling: true, manageBilling: true,
      viewApiKeys: true, createApiKeys: true, revokeApiKeys: true,
      viewWebhooks: true, createWebhooks: true, deleteWebhooks: true
    }
  },
  {
    name: 'admin',
    displayName: 'مدير',
    description: 'صلاحيات إدارية شاملة',
    level: 80,
    isDefault: false,
    permissions: {
      viewDashboard: true,
      viewConversations: true, replyConversations: true, assignConversations: true,
      closeConversations: true, deleteConversations: false,
      viewTemplates: true, createTemplates: true, editTemplates: true, deleteTemplates: true,
      viewChannels: true, connectChannels: true, disconnectChannels: true, configureChannels: true,
      viewAnalytics: true, exportAnalytics: true,
      viewTeam: true, inviteMembers: true, removeMembers: true, changeRoles: false,
      viewSettings: true, editSettings: true,
      viewBilling: true, manageBilling: false,
      viewApiKeys: true, createApiKeys: true, revokeApiKeys: true,
      viewWebhooks: true, createWebhooks: true, deleteWebhooks: true
    }
  },
  {
    name: 'manager',
    displayName: 'مشرف',
    description: 'صلاحيات إشرافية',
    level: 60,
    isDefault: false,
    permissions: {
      viewDashboard: true,
      viewConversations: true, replyConversations: true, assignConversations: true,
      closeConversations: true, deleteConversations: false,
      viewTemplates: true, createTemplates: true, editTemplates: true, deleteTemplates: false,
      viewChannels: true, connectChannels: false, disconnectChannels: false, configureChannels: true,
      viewAnalytics: true, exportAnalytics: true,
      viewTeam: true, inviteMembers: true, removeMembers: false, changeRoles: false,
      viewSettings: true, editSettings: true,
      viewBilling: false, manageBilling: false,
      viewApiKeys: true, createApiKeys: false, revokeApiKeys: false,
      viewWebhooks: true, createWebhooks: false, deleteWebhooks: false
    }
  },
  {
    name: 'agent',
    displayName: 'وكيل',
    description: 'صلاحيات خدمة العملاء',
    level: 40,
    isDefault: true,
    permissions: {
      viewDashboard: true,
      viewConversations: true, replyConversations: true, assignConversations: false,
      closeConversations: true, deleteConversations: false,
      viewTemplates: true, createTemplates: false, editTemplates: false, deleteTemplates: false,
      viewChannels: true, connectChannels: false, disconnectChannels: false, configureChannels: false,
      viewAnalytics: true, exportAnalytics: false,
      viewTeam: false, inviteMembers: false, removeMembers: false, changeRoles: false,
      viewSettings: true, editSettings: false,
      viewBilling: false, manageBilling: false,
      viewApiKeys: false, createApiKeys: false, revokeApiKeys: false,
      viewWebhooks: false, createWebhooks: false, deleteWebhooks: false
    }
  },
  {
    name: 'viewer',
    displayName: 'مشاهد',
    description: 'صلاحيات قراءة فقط',
    level: 20,
    isDefault: false,
    permissions: {
      viewDashboard: true,
      viewConversations: true, replyConversations: false, assignConversations: false,
      closeConversations: false, deleteConversations: false,
      viewTemplates: true, createTemplates: false, editTemplates: false, deleteTemplates: false,
      viewChannels: true, connectChannels: false, disconnectChannels: false, configureChannels: false,
      viewAnalytics: true, exportAnalytics: false,
      viewTeam: false, inviteMembers: false, removeMembers: false, changeRoles: false,
      viewSettings: false, editSettings: false,
      viewBilling: false, manageBilling: false,
      viewApiKeys: false, createApiKeys: false, revokeApiKeys: false,
      viewWebhooks: false, createWebhooks: false, deleteWebhooks: false
    }
  }
];

// Seed default roles
RoleSchema.statics.seedDefaults = async function() {
  for (const roleData of defaultRoles) {
    await this.findOneAndUpdate(
      { name: roleData.name },
      roleData,
      { upsert: true, new: true }
    );
  }
  console.log('✅ Default roles seeded');
};

module.exports = mongoose.model('Role', RoleSchema);