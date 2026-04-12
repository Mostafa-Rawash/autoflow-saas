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
  connect: () => api.post('/whatsapp/connect'),
  disconnect: () => api.post('/whatsapp/disconnect'),
  getChats: () => api.get('/whatsapp/chats'),
  getMessages: (chatId, limit = 50) => api.get(`/whatsapp/chats/${chatId}/messages?limit=${limit}`),
  getContacts: () => api.get('/whatsapp/contacts'),
  send: (data) => api.post('/whatsapp/send', data),
  refreshQR: () => api.post('/whatsapp/refresh-qr')
};

export default api;