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
      window.location.href = '/login';
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
  connect: (data = {}) => api.post('/whatsapp/connect', data, {
    params: data?.resetSession ? { resetSession: true } : undefined
  }),
  disconnect: () => api.post('/whatsapp/disconnect'),
  getChats: () => api.get('/whatsapp/chats'),
  getMessages: (chatId, limit = 50) => api.get(`/whatsapp/chats/${chatId}/messages?limit=${limit}`),
  getContacts: () => api.get('/whatsapp/contacts'),
  send: (data) => api.post('/whatsapp/send', data),
  refreshQR: () => api.post('/whatsapp/refresh-qr')
};

// Telegram API (bot-based, minimal v1)
export const telegramAPI = {
  getHealth: () => api.get('/telegram/health'),
  getStatus: () => api.get('/telegram/status'),
  connect: () => api.post('/telegram/connect'),
  disconnect: () => api.post('/telegram/disconnect')
};

// Logs API (admin only)
export const logsAPI = {
  getAll: (params) => api.get('/tool-logs', { params }),
  getOne: (id) => api.get(`/logs/${id}`),
  getStats: (params) => api.get('/logs/stats', { params }),
  resolve: (id) => api.put(`/logs/${id}/resolve`),
  delete: (id) => api.delete(`/logs/${id}`),
  clear: (params) => api.delete('/logs', { params }),
  logFrontendError: (data) => api.post('/logs/frontend', data)
};

// Feedback API
export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  create: (data) => api.post('/feedback', data)
};

// AI Agent API
export const aiAgentAPI = {
  getAll: () => api.get('/ai-agents'),
  get: (id) => api.get(`/agents/${id}`),
  create: (data) => api.post('/ai-agents', data),
  update: (id, data) => api.put(`/ai-agents/${id}`, data),
  delete: (id) => api.delete(`/ai-agents/${id}`),
  test: (id, data) => api.post(`/ai-agents/${id}/test`, data),
  getDocuments: (agentId) => api.get(`/ai-agents/${agentId}/documents`),
  uploadDocument: (agentId, formData) => api.post(`/ai-agents/${agentId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocument: (agentId, docId) => api.get(`/ai-agents/${agentId}/documents/${docId}`),
  deleteDocument: (agentId, docId) => api.delete(`/ai-agents/${agentId}/documents/${docId}`),
  searchKnowledge: (agentId, query, options = {}) => api.post(`/ai-agents/${agentId}/search`, { query, ...options })
};

export default api;
