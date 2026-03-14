import { useState, useEffect, useContext, createContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  console.log('UserProvider rendered');
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState('pending');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const fetchKYCStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/api/auth/kyc/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKycStatus(res.data.kyc.status || 'pending');
      setIsEmailVerified(res.data.isEmailVerified || false);
    } catch (err) {
      console.error('Error fetching KYC status:', err);
      setKycStatus('pending');
      setIsEmailVerified(false);
    }
  };

  // Initial load and token check
  useEffect(() => {
    // Skip API calls if we're in admin mode (admin routes)
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token is expired, clear it
          localStorage.removeItem('token');
          setUser(null);
          setKycStatus('pending');
          setIsEmailVerified(false);
          return;
        }
        
        setUser(decoded.user);
        // Initial KYC status fetch
        fetchKYCStatus();
      } catch {
        // Invalid token, clear it
        localStorage.removeItem('token');
        setUser(null);
        setKycStatus('pending');
        setIsEmailVerified(false);
      }
    } else {
      setUser(null);
      setKycStatus('pending');
      setIsEmailVerified(false);
    }
  }, []);

  const login = (token) => {
    // Skip API calls if we're in admin mode (admin routes)
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        // Token is expired, don't store it
        setUser(null);
        setKycStatus('pending');
        setIsEmailVerified(false);
        return;
      }
      
      localStorage.setItem('token', token);
      setUser(decoded.user);
      
      // Skip KYC API call if in admin mode
      if (isAdminRoute) {
        return;
      }
      
      // Fetch KYC and email verification status after login
      axios.get('/api/auth/kyc/status', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setKycStatus(res.data.kyc.status || 'pending');
        setIsEmailVerified(res.data.isEmailVerified || false);
      }).catch(() => {
        setKycStatus('pending');
        setIsEmailVerified(false);
      });
    } catch {
      // Invalid token
      setUser(null);
      setKycStatus('pending');
      setIsEmailVerified(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setKycStatus('pending');
    setIsEmailVerified(false);
  };

  // Method to force refresh all user context data
  const refreshUserContext = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      // Fetch dashboard data
      const dashboardRes = await axios.get('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dashboardRes.data?.userInfo) {
        setIsEmailVerified(!!dashboardRes.data.userInfo.isEmailVerified);
      }

      // Fetch fresh KYC status
      await fetchKYCStatus();
    } catch (err) {
      console.error('Error refreshing user context:', err);
      setIsEmailVerified(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, kycStatus, isEmailVerified, refreshUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
