// src/services/adminAuthAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + '/api/admin',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      console.warn('Admin Auth API: 401 Unauthorized -', error.response?.data?.message || 'Token may be expired');
      
      // Handle specific token expiration errors
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'AUTH_FAILED') {
        console.log('Removing expired/invalid admin token');
        localStorage.removeItem('adminToken');
        // Redirect to admin login if not already there
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const adminLogin = async (email, password) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const verifyAdminToken = async () => {
  try {
    const response = await API.get('/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Session verification failed';
  }
};

export const adminLogout = async () => {
  try {
    await API.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const updateAdminProfile = async (profile) => {
  const response = await API.patch('/profile', profile);
  return response.data;
};

export const changeAdminPassword = async (currentPassword, newPassword) => {
  const response = await API.post('/change-password', { currentPassword, newPassword });
  return response.data;
};

export const updateAdminNotificationPrefs = async (prefs) => {
  const response = await API.patch('/notification-preferences', prefs);
  return response.data;
};