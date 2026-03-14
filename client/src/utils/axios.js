
import axios from 'axios';

// Set base URL globally for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || '';

// Global Axios interceptor for 401 errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const path = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
      const isAdminRoute = path.startsWith('/admin');
      // In admin routes, do not trigger user login redirect here; admin services handle their own redirects
      if (!isAdminRoute) {
        // Remove user token and send to user login
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
