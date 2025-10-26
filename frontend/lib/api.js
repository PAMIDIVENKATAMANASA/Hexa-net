import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';// Redirect to home page
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/me', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// Requests API
export const requestsAPI = {
  create: (requestData) => api.post('/requests', requestData),
  getAll: () => api.get('/requests'),
  getById: (id) => api.get(`/requests/${id}`),
  assign: (id, assignmentData) => api.put(`/requests/${id}/assign`, assignmentData),
  updateStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getDevices: (params = {}) => api.get('/admin/devices', { params }),
  getDevice: (id) => api.get(`/admin/devices/${id}`),
  createDevice: (deviceData) => api.post('/admin/devices', deviceData),
  updateDevice: (id, deviceData) => api.put(`/admin/devices/${id}`, deviceData),
  deleteDevice: (id) => api.delete(`/admin/devices/${id}`),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getStats: () => api.get('/admin/stats'),
};

// Designs API
export const designsAPI = {
  generate: (requestId) => api.post(`/designs/generate/${requestId}`),
  getById: (id) => api.get(`/designs/${id}`),
  getByRequest: (requestId) => api.get(`/designs/request/${requestId}`),
  approve: (id, notes) => api.put(`/designs/${id}/approve`, { designNotes: notes }),
};

export default api;
