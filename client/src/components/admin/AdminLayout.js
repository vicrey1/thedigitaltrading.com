// src/components/admin/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiDownload, FiSettings, FiHome, FiBell, FiChevronLeft, FiChevronRight, FiMenu, FiX, FiCreditCard, FiLayers, FiPieChart, FiMail, FiShield, FiLogOut, FiTruck } from 'react-icons/fi';
import { useAdminAuth } from '../../auth/AdminAuthProvider';

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile
  const darkMode = true; // Always keep admin pages in dark mode
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile and adjust sidebar behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={
      `flex h-screen font-sans text-base relative transition-colors duration-300 ${darkMode ? 'bg-black text-gray-100' : 'bg-white text-gray-900'}`
    }>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-gray-900 bg-opacity-90 p-3 rounded-lg text-gold hover:bg-gray-800 transition-all shadow-lg"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}



      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-30" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'static'} 
          top-0 left-0 h-full 
          ${sidebarOpen ? (isMobile ? 'w-80' : 'w-64') : (isMobile ? 'w-0' : 'w-16')} 
          ${darkMode ? 'bg-gradient-to-b from-gray-950 to-gray-900 border-gray-800' : 'bg-gradient-to-b from-gray-100 to-white border-gray-200'} 
          border-r shadow-lg z-40 
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : (isMobile ? '-translate-x-full' : 'translate-x-0')}
          flex flex-col
        `}
      >
        <div className={`flex-shrink-0 flex items-center h-16 md:h-20 px-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          {sidebarOpen && (
            <span className={`text-xl md:text-2xl font-extrabold tracking-widest ${darkMode ? 'text-gold' : 'text-yellow-700'} transition-all duration-300`}>
              TDT
            </span>
          )}
          {!isMobile && (
            <button 
              className="ml-auto text-gray-400 hover:text-gold p-2 rounded-lg hover:bg-gray-800 transition-all" 
              onClick={toggleSidebar} 
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
          )}
        </div>

        <nav className={`flex-1 py-4 md:py-8 ${sidebarOpen ? 'px-4' : 'px-2'} space-y-1 md:space-y-2 overflow-y-auto min-h-0`}>
          <Link 
            to="/admin" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiHome className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Dashboard</span>}
          </Link>
          
          <Link 
            to="/admin/users" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiUsers className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Users</span>}
          </Link>
          
          <Link 
            to="/admin/cars" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiTruck className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Car Shop</span>}
          </Link>
          

          
          <Link 
            to="/admin/deposits" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiCreditCard className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Deposits</span>}
          </Link>
          
          <Link 
            to="/admin/withdrawals" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiDownload className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Withdrawals</span>}
          </Link>
          
          <Link 
            to="/admin/announcements" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiBell className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Announcements</span>}
          </Link>
          
          <a 
            href="https://www.smartsupp.com/app/" 
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiBell className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Live Chat (Smartsupp)</span>}
          </a>
          
          <Link 
            to="/admin/mirror" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiUsers className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Mirror User</span>}
          </Link>
          
          <Link 
            to="/admin/roi-approvals" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiSettings className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">ROI Approvals</span>}
          </Link>
          
          <Link 
            to="/admin/plans" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiLayers className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Admin Plans</span>}
          </Link>
          
          <Link 
            to="/admin/user-investments" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiPieChart className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">User Investments</span>}
          </Link>
          
          <Link 
            to="/admin/send-email" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiMail className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Send Email</span>}
          </Link>
          
          <Link 
            to="/admin/cold-wallet" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiShield className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Cold Wallet</span>}
          </Link>
          
          <Link 
            to="/admin/settings" 
            className={`flex items-center px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all hover:bg-gray-800 text-gray-200 hover:text-gold font-medium min-h-[48px] ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
            onClick={closeSidebar}
          >
            <FiSettings className={`text-lg md:text-xl ${sidebarOpen || isMobile ? 'mr-3' : ''}`} />
            {(sidebarOpen || isMobile) && <span className="text-sm md:text-base">Admin Settings</span>}
          </Link>
        </nav>

        {/* Admin Profile Section */}
        <div className={`flex-shrink-0 px-4 py-4 md:py-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${!sidebarOpen && !isMobile ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${!sidebarOpen && !isMobile ? 'flex-col' : ''}`}>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${darkMode ? 'bg-gray-700 text-gold' : 'bg-gray-200 text-yellow-700'} flex items-center justify-center text-lg font-bold ${!sidebarOpen && !isMobile ? 'mb-2' : 'mr-3'}`}>
              {admin?.name?.charAt(0) || 'A'}
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-base font-medium text-white truncate">{admin?.name || 'Admin'}</div>
                <div className="text-xs md:text-sm text-gray-400 truncate">{admin?.email}</div>
                <button 
                  onClick={logout}
                  className="text-xs md:text-sm text-red-400 hover:text-red-300 transition-colors mt-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-0' : 'ml-0')}`}>
        <div className={`p-4 md:p-6 lg:p-8 ${isMobile ? 'pt-20' : 'pt-6'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;