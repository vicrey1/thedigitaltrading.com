import { useState, useEffect, useContext, createContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  console.log('UserProvider rendered');
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState('pending');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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
        // Fetch KYC and email verification status from backend
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

  // Add a method to force refresh user context from /api/user/dashboard
  const refreshUserContext = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.userInfo) {
        setIsEmailVerified(!!res.data.userInfo.isEmailVerified);
      }
    } catch {
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
