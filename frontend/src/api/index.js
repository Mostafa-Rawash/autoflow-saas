import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Use React Router navigation instead of hard redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  invite: (data) => api.post('/users/invite', data)
};

// Conversations API
export const conversationsAPI = {
  getAll: (params) => api.get('/conversations', { params }),
  getOne: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  update: (id, data) => api.put(`/conversations/${id}`, data),
  sendMessage: (id, data) => api.post(`/conversations/${id}/messages`, data),
  getStats: () => api.get('/conversations/stats/overview')
};

// Channels API
export const channelsAPI = {
  getAll: () => api.get('/channels'),
  connect: (data) => api.post('/channels/connect', data),
  update: (id, data) => api.put(`/channels/${id}`, data),
  disconnect: (id) => api.delete(`/channels/${id}`),
  test: (id) => api.post(`/channels/${id}/test`)
};

// Templates API
export const templatesAPI = {
  getAll: (params) => api.get('/templates', { params }),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getChannels: () => api.get('/analytics/channels'),
  getTimeline: (params) => api.get('/analytics/timeline', { params }),
  export: (params) => api.get('/analytics/export', { params })
};

// Subscriptions API
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  upgrade: (data) => api.post('/subscriptions/upgrade', data),
  cancel: () => api.post('/subscriptions/cancel'),
  getInvoices: () => api.get('/subscriptions/invoices')
};

// WhatsApp API (unified with backend)
export const whatsappAPI = {
  getQR: () => api.get('/whatsapp/qr'),
  getStatus: () => api.get('/whatsapp/status'),
  connect: () => api.post('/whatsapp/connect'),
  disconnect: () => api.post('/whatsapp/disconnect'),
  getChats: () => api.get('/whatsapp/chats'),
  getMessages: (chatId, limit = 50) => api.get(`/whatsapp/chats/${chatId}/messages?limit=${limit}`),
  getContacts: () => api.get('/whatsapp/contacts'),
  send: (data) => api.post('/whatsapp/send', data),
  refreshQR: () => api.post('/whatsapp/refresh-qr'),
  getMode: () => api.get('/whatsapp/mode'),
  setMode: (mode) => api.put('/whatsapp/mode', { mode })
};

// WhatsApp Business API
export const whatsappBusinessAPI = {
  connect: (data) => api.post('/whatsapp-business/connect', data),
  disconnect: () => api.post('/whatsapp-business/disconnect'),
  getStatus: () => api.get('/whatsapp-business/status'),
  send: (data) => api.post('/whatsapp-business/send', data),
  sendTemplate: (data) => api.post('/whatsapp-business/send-template', data),
  sendInteractive: (data) => api.post('/whatsapp-business/send-interactive', data),
  sendMedia: (data) => api.post('/whatsapp-business/send-media', data),
  healthCheck: () => api.get('/whatsapp-business/health')
};

// Telegram API (bot-based)
export const telegramAPI = {
  getHealth: () => api.get('/telegram/health'),
  getStatus: () => api.get('/telegram/status'),
  connect: (data) => api.post('/telegram/connect', data),
  disconnect: () => api.post('/telegram/disconnect'),
  send: (data) => api.post('/telegram/send', data)
};

// Logs API (admin only)
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getOne: (id) => api.get(`/logs/${id}`),
  getStats: (params) => api.get('/logs/stats', { params }),
  resolve: (id) => api.put(`/logs/${id}/resolve`),
  delete: (id) => api.delete(`/logs/${id}`),
  clear: (params) => api.delete('/logs', { params }),
  logFrontendError: (data) => api.post('/logs/frontend', data)
};

// Follow-ups API
export const followUpsAPI = {
  getAll: (params) => api.get('/follow-ups', { params }),
  create: (data) => api.post('/follow-ups', data),
  update: (id, data) => api.put(`/follow-ups/${id}`, data),
  delete: (id) => api.delete(`/follow-ups/${id}`),
  getExecutions: (id, params) => api.get(`/follow-ups/${id}/executions`, { params }),
  cancelExecution: (id, eid) => api.post(`/follow-ups/${id}/executions/${eid}/cancel`)
};

// Auto-replies API
export const autoRepliesAPI = {
  getAll: () => api.get('/auto-replies'),
  create: (data) => api.post('/auto-replies', data),
  update: (id, data) => api.put(`/auto-replies/${id}`, data),
  delete: (id) => api.delete(`/auto-replies/${id}`)
};

// Documents API (Knowledge Base)
export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getOne: (id) => api.get(`/documents/${id}`),
  getChunks: (id, params) => api.get(`/documents/${id}/chunks`, { params }),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/documents/${id}`),
  reprocess: (id) => api.post(`/documents/${id}/reprocess`),
  getStats: () => api.get('/documents/stats')
};

// Chat API (RAG)
export const chatAPI = {
  ask: (data) => api.post('/chat', data),
  search: (data) => api.post('/chat/search', data)
};

// Settings API
export const settingsAPI = {
  getAIConfig: () => api.get('/settings/ai'),
  testAI: () => api.post('/settings/ai/test'),
  getAIAutoReplyConfig: () => api.get('/settings/ai-auto-reply'),
  updateAIAutoReplyConfig: (data) => api.put('/settings/ai-auto-reply', data)
};

// Contacts API
export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  getConversations: (id) => api.get(`/contacts/${id}/conversations`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  merge: (primaryId, secondaryId) => api.post(`/contacts/${primaryId}/merge/${secondaryId}`)
};

// Departments API
export const departmentsAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getOne: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  addAgent: (id, agentId) => api.post(`/departments/${id}/agents`, { agentId }),
  removeAgent: (id, agentId) => api.delete(`/departments/${id}/agents/${agentId}`),
  assignLead: (id, agentId) => api.put(`/departments/${id}/lead`, { agentId }),
  assignNext: (id, channel) => api.post(`/departments/${id}/assign?channel=${channel}`)
};

// Workflows API
export const workflowsAPI = {
  getAll: (params) => api.get('/workflows', { params }),
  getOne: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
  toggle: (id) => api.post(`/workflows/${id}/toggle`)
};

// LiveChat API
export const livechatAPI = {
  getConfig: () => api.get('/livechat/config'),
  updateConfig: (data) => api.put('/livechat/config', data),
  getWidgetConfig: (userId) => api.get(`/livechat/widget/${userId}`),
  initiateChat: (userId, data) => api.post(`/livechat/widget/${userId}/initiate`, data),
  sendMessage: (conversationId, data) => api.post(`/livechat/widget/message/${conversationId}`, data)
};

// CSAT API
export const csatAPI = {
  submit: (conversationId, data) => api.post(`/conversations/${conversationId}/csat`, data),
  getTimeline: (conversationId) => api.get(`/conversations/${conversationId}/timeline`)
};

// Help Articles API
export const helpArticlesAPI = {
  getAll: (params) => api.get('/help-articles', { params }),
  getOne: (id) => api.get(`/help-articles/${id}`),
  getCategories: () => api.get('/help-articles/categories'),
  create: (data) => api.post('/help-articles', data),
  update: (id, data) => api.put(`/help-articles/${id}`, data),
  delete: (id) => api.delete(`/help-articles/${id}`),
  voteHelpful: (id, isHelpful) => api.post(`/help-articles/${id}/helpful`, { isHelpful })
};

// Email API
export const emailAPI = {
  getConfig: () => api.get('/email/config'),
  saveConfig: (data) => api.put('/email/config', data),
  testConnection: () => api.post('/email/test'),
  deleteConfig: () => api.delete('/email/config')
};

// Outgoing Webhooks API
export const outgoingWebhooksAPI = {
  getAll: (params) => api.get('/outgoing-webhooks', { params }),
  getOne: (id) => api.get(`/outgoing-webhooks/${id}`),
  create: (data) => api.post('/outgoing-webhooks', data),
  update: (id, data) => api.put(`/outgoing-webhooks/${id}`, data),
  delete: (id) => api.delete(`/outgoing-webhooks/${id}`),
  toggle: (id) => api.post(`/outgoing-webhooks/${id}/toggle`),
  test: (id) => api.post(`/outgoing-webhooks/${id}/test`),
  getLogs: (id, params) => api.get(`/outgoing-webhooks/${id}/logs`, { params })
};

// Instagram API
export const instagramAPI = {
  connect: (data) => api.post('/instagram/connect', data),
  disconnect: () => api.post('/instagram/disconnect'),
  getStatus: () => api.get('/instagram/status'),
  send: (data) => api.post('/instagram/send', data)
};

// Messenger API
export const messengerAPI = {
  connect: (data) => api.post('/messenger/connect', data),
  disconnect: () => api.post('/messenger/disconnect'),
  getStatus: () => api.get('/messenger/status'),
  send: (data) => api.post('/messenger/send', data)
};

export default api;