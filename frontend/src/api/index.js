import axios from 'axios';

// Use environment variable or default to port 5000 (matching backend default)
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
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // For refresh requests, use refresh token
    if (config.url === '/auth/refresh') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // If response contains new tokens, store them
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not a refresh request
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        originalRequest.url !== '/auth/refresh' &&
        originalRequest.url !== '/auth/login') {
      
      // Check if it's a token expired error
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        
        if (isRefreshing) {
          // Add to queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: {
              'x-refresh-token': refreshToken
            }
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token'); // Legacy
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    // Handle other 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserPlan: (id, data) => api.put(`/admin/users/${id}/plan`, data),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getWhatsAppStatus: () => api.get('/admin/whatsapp/status'),
  cleanupWhatsApp: () => api.post('/admin/whatsapp/cleanup'),
  getConfig: () => api.get('/admin/config')
};

export default api;