// src/auth/AdminAuthProvider.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAdminToken, adminLogin } from '../services/adminAuthAPI';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  console.log('AdminAuthProvider rendered');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Check if token is expired before making API call
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          if (payload.exp < currentTime) {
            console.log('Admin token expired, removing from storage');
            localStorage.removeItem('adminToken');
            setAdmin(null);
            setLoading(false);
            return;
          }
        } catch (tokenParseError) {
          console.error('Failed to parse admin token:', tokenParseError);
          localStorage.removeItem('adminToken');
          setAdmin(null);
          setLoading(false);
          return;
        }
        
        const adminData = await verifyAdminToken();
        setAdmin(adminData);
      } catch (error) {
        // Improved error logging
        console.error('Admin auth verification failed:', error);
        // Remove token on any authentication error
        localStorage.removeItem('adminToken');
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { token, admin: adminData } = await adminLogin(email, password);
      localStorage.setItem('adminToken', token);
      setAdmin(adminData);
      navigate('/admin');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};