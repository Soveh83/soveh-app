import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp, role) => api.post('/auth/verify-otp', { phone, otp, role }),
  getMe: () => api.get('/auth/me')
};

// Products APIs
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data)
};

// Categories APIs
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data)
};

// Orders APIs
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (status) => api.get('/orders', { params: { status } }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, null, { params: { status } })
};

// Credit APIs
export const creditAPI = {
  getLedger: () => api.get('/credit/ledger'),
  getBalance: () => api.get('/credit/balance')
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  getPendingRetailers: () => api.get('/retailers/pending'),
  approveRetailer: (data) => api.post('/retailers/approve', data)
};

// Retailer APIs
export const retailerAPI = {
  onboard: (data) => api.post('/retailers/onboard', data),
  getProfile: () => api.get('/retailers/profile')
};

// Support APIs
export const supportAPI = {
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: () => api.get('/support/tickets')
};

export default api;
