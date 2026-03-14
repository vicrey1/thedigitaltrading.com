// src/services/withdrawalAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: (process.env.REACT_APP_API_BASE_URL || '') + '/api/admin/withdrawals',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  // Admin pages store admin JWT in `adminToken`
  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export const getWithdrawals = async (filters = {}) => {
  try {
    const response = await API.get('/', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch withdrawals';
  }
};

export const getWithdrawalById = async (id) => {
  try {
    const response = await API.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch withdrawal';
  }
};

export const updateWithdrawal = async (id, updates) => {
  try {
    const response = await API.patch(`/${id}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update withdrawal';
  }
};

export const bulkUpdateWithdrawals = async (ids, updates) => {
  try {
    const response = await API.patch('/bulk', { ids, updates });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to bulk update withdrawals';
  }
};

// User withdrawal endpoints (not admin)
const userAPI = axios.create({
  baseURL: (process.env.REACT_APP_API_BASE_URL || '') + '/api/withdrawal',
});
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add setWithdrawalPin API
export const setWithdrawalPin = async (pin, confirmPin) => {
  try {
    console.log('Setting withdrawal PIN...');
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await userAPI.post('/set-withdrawal-pin', { 
      pin, 
      confirmPin 
    });

    console.log('PIN setup response:', response.data);
    return response.data;
  } catch (error) {
    console.error('PIN setup error:', error);
    const errorMsg = error.response?.data?.msg || error.message || 'Failed to set PIN';
    throw errorMsg;
  }
};

export const submitWithdrawal = async (data) => {
  const response = await userAPI.post('/', data);
  return response.data;
};

export const requestPinReset = async () => {
  const response = await userAPI.post('/request-pin-reset');
  return response.data;
};

export const resetPin = async (code, newPin) => {
  const response = await userAPI.post('/reset-pin', { code, newPin });
  return response.data;
};

export const verifyWithdrawalPin = async (pin) => {
  const response = await userAPI.post('/verify-pin', { pin });
  return response.data;
};

export const checkPinStatus = async () => {
  try {
    console.log('Checking withdrawal PIN status...');
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found for PIN status check');
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await userAPI.get('/pin-status');
    console.log('PIN status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('PIN status check error:', error);
    throw error.response?.data?.msg || error.message || 'Failed to check PIN status';
  }
};

// Billing-related API functions
export const getBillingStatus = async () => {
  const response = await userAPI.get('/billing-status');
  return response.data;
};

export const getWithdrawalBillingStatus = async (withdrawalId) => {
  const response = await userAPI.get(`/billing-status/${withdrawalId}`);
  return response.data;
};

export const confirmBillingPayment = async (withdrawalId) => {
  const response = await userAPI.post(`/confirm-billing/${withdrawalId}`);
  return response.data;
};

export const payBillingFee = async (withdrawalId, pin) => {
  const response = await userAPI.post(`/pay-billing/${withdrawalId}`, { pin });
  return response.data;
};

export const payAllBillingFees = async (pin) => {
  const response = await userAPI.post('/pay-all-billing', { pin });
  return response.data;
};