// src/services/adminAPI.js
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
      // Don't automatically logout on 401 - let the component handle it
      console.warn('Admin API: 401 Unauthorized - Token may be expired');
    }
    return Promise.reject(error);
  }
);

export const getUsers = async () => {
  try {
    const response = await API.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch users';
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const response = await API.patch(`/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update user';
  }
};

// Adjust a user's available balance atomically on the server
export const adjustUserAvailableBalance = async (userId, amount, operation) => {
  try {
    const response = await API.patch(`/users/${userId}/available-balance`, { amount, operation });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to adjust available balance';
  }
};

export const approveKYC = async (userId) => {
  try {
    const response = await API.post(`/users/${userId}/kyc/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to approve KYC';
  }
};

export const rejectKYC = async (userId, reason) => {
  const response = await API.post(`/users/${userId}/kyc/reject`, { reason });
  return response.data;
};

export const updateUserTier = async (userId, tier) => {
  const response = await API.patch(`/users/${userId}/tier`, { tier });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await API.patch(`/users/${userId}/role`, { role });
  return response.data;
};

export const getUserKeys = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/keys`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user keys';
  }
};

export const sendAdminEmail = async ({ to, subject, html }) => {
  try {
    await API.post('/send-email', { to, subject, html });
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to send email';
  }
};

// Mirror user API functions
export const getUserPortfolio = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/portfolio`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user portfolio';
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user profile';
  }
};

export const getUserKYC = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/kyc`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user KYC';
  }
};

export const completeActiveInvestment = async (userId) => {
  try {
    const response = await API.post(`/users/${userId}/complete-active-investment`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to complete active investment';
  }
};

export const continueCompletedInvestment = async (userId) => {
  try {
    const response = await API.post(`/users/${userId}/continue-completed-investment`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to continue completed investment';
  }
};

// Add more admin API calls as needed