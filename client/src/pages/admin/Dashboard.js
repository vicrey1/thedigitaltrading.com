// src/pages/admin/Dashboard.js
import React, { useEffect, useState } from 'react';
import { FiUsers, FiDollarSign, FiDownload, FiActivity, FiSettings, FiMessageCircle, FiCopy, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminCard from '../../components/admin/AdminCard';
import { getAdminStats } from '../../services/adminStatsAPI';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [copiedStat, setCopiedStat] = useState(null);
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '...', icon: <FiUsers />, change: '' },
    { title: 'Active Investments', value: '...', icon: <FiDollarSign />, change: '' },
    { title: 'Pending Withdrawals', value: '...', icon: <FiDownload />, change: '' },
    { title: "Today's ROI", value: '...', icon: <FiActivity />, change: '' }
  ]);

  useEffect(() => {
    getAdminStats().then(data => {
      setStats([
        { title: 'Total Users', value: data.totalUsers, icon: <FiUsers />, change: '' },
        { title: 'Active Investments', value: data.totalInvestments, icon: <FiDollarSign />, change: '' },
        { title: 'Pending Withdrawals', value: data.totalWithdrawals, icon: <FiDownload />, change: '' },
        { title: "Today's ROI", value: data.todayROI + '%', icon: <FiActivity />, change: '' }
      ]);
    });
  }, []);

  // Copy to clipboard function
  const copyToClipboard = async (text, statIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStat(statIndex);
      setTimeout(() => setCopiedStat(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Navigation handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'investments':
        navigate('/admin/user-investments');
        break;
      case 'withdrawals':
        navigate('/admin/withdrawals');
        break;
      case 'roi':
        navigate('/admin/roi-approvals');
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-sans text-base text-gray-100 bg-black">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-400">Monitor and manage your platform</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="relative group">
              <AdminCard 
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
              />
              {/* Copy Button Overlay */}
              <button
                onClick={() => copyToClipboard(stat.value, index)}
                className="absolute top-3 right-3 p-2 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-600 hover:border-gold"
                title={`Copy ${stat.title}`}
              >
                {copiedStat === index ? (
                  <FiCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <FiCopy className="w-4 h-4 text-gray-400 hover:text-gold" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Recent Activity */}
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-800 shadow-lg">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center">
              <FiActivity className="mr-2 text-gold" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {/* Activity items */}
              <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiUsers className="text-blue-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">New user registered</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiDollarSign className="text-green-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Investment completed</p>
                    <p className="text-xs text-gray-400">5 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiDownload className="text-yellow-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Withdrawal request</p>
                    <p className="text-xs text-gray-400">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-800">
              <button className="w-full text-center text-sm text-gold hover:text-yellow-400 transition-colors">
                View all activity
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-800 shadow-lg">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center">
              <FiSettings className="mr-2 text-gold" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => handleQuickAction('users')}
                className="flex items-center justify-center p-4 bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg hover:bg-opacity-30 hover:border-opacity-50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 group transform hover:scale-105"
              >
                <FiUsers className="mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-300 group-hover:text-blue-200">Manage Users</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('investments')}
                className="flex items-center justify-center p-4 bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg hover:bg-opacity-30 hover:border-opacity-50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200 group transform hover:scale-105"
              >
                <FiDollarSign className="mr-2 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-300 group-hover:text-green-200">View Investments</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('withdrawals')}
                className="flex items-center justify-center p-4 bg-yellow-600 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-lg hover:bg-opacity-30 hover:border-opacity-50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-200 group transform hover:scale-105"
              >
                <FiDownload className="mr-2 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-yellow-300 group-hover:text-yellow-200">Withdrawals</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('roi')}
                className="flex items-center justify-center p-4 bg-purple-600 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-lg hover:bg-opacity-30 hover:border-opacity-50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 group transform hover:scale-105"
              >
                <FiActivity className="mr-2 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-300 group-hover:text-purple-200">ROI Approvals</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Chat Support Panel */}
        <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 rounded-xl p-4 md:p-6 border border-yellow-600 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg md:text-xl font-bold mb-2 text-yellow-100 flex items-center gap-2">
                <FiMessageCircle className="text-yellow-300" />
                Live Chat Support 
                <span className="text-sm md:text-base font-normal text-yellow-300">(Smartsupp)</span>
              </h2>
              <p className="text-sm md:text-base text-yellow-200">Manage customer conversations through Smartsupp dashboard.</p>
            </div>
            <a 
              href="https://www.smartsupp.com/app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-yellow-400 text-yellow-900 font-bold px-4 md:px-6 py-2 md:py-3 rounded-lg shadow hover:bg-yellow-300 transition-all text-sm md:text-base min-w-[140px] whitespace-nowrap"
            >
              Open Smartsupp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;