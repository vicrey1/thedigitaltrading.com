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