// src/components/admin/UserTable.js
import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiDollarSign, FiDownload } from 'react-icons/fi';
import BalanceManagementModal from './BalanceManagementModal';

const UserTable = ({ users, onSelectUser, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForBalance, setSelectedUserForBalance] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBalanceUpdate = async ({ userId, amount, operation }) => {
    if (onUpdateUser) {
      await onUpdateUser({ userId, amount, operation });
    }
  };

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Ensure all users have an 'id' property for consistency
  const normalizedUsers = filteredUsers.map(user => ({ ...user, id: user.id || user._id }));
  // Remove duplicate users by id
  const uniqueUsers = Array.from(new Map(normalizedUsers.map(u => [u.id, u])).values());

  // Enhanced Mobile Card Component
  const UserCard = ({ user }) => (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 sm:p-5 mb-4 border border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gold">
      {/* User Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-lg">
            <span className="text-lg sm:text-xl font-bold text-black">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate text-base sm:text-lg mb-1">
              {user.name || 'Unknown User'}
            </div>
            <div className="text-sm sm:text-base text-gray-300 truncate mb-1">
              {user.email}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              ID: {user.id}
            </div>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
          user.tier === 'VIP' ? 'bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500' :
          user.tier === 'Gold' ? 'bg-gold bg-opacity-20 text-gold border border-gold' :
          'bg-gray-600 bg-opacity-50 text-gray-300 border border-gray-500'
        }`}>
          {user.tier || 'Basic'} Tier
        </span>
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
          user.kycStatus === 'verified' ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500' :
          user.kycStatus === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500' :
          'bg-red-500 bg-opacity-20 text-red-300 border border-red-500'
        }`}>
          KYC: {user.kycStatus || 'Not Started'}
        </span>
      </div>
      
      {/* Balance and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 mb-1">Available Balance</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white">
            {typeof user.availableBalance === 'number'
              ? `$${Number(user.availableBalance).toLocaleString()}`
              : '$0.00'}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onSelectUser(user)}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md active:scale-95"
            title="View Details"
          >
            <FiEye size={16} className="text-white" />
          </button>
          <button 
            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-md active:scale-95"
            title="Edit User"
          >
            <FiEdit2 size={16} className="text-white" />
          </button>
          <button 
            onClick={() => setSelectedUserForBalance(user)}
            className="p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors shadow-md active:scale-95"
            title="Manage Balance"
          >
            <FiDollarSign size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gray-900 p-3 sm:p-6 border-b border-gray-700">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={isMobile ? 16 : 18} />
            <input
              type="text"
              placeholder={isMobile ? "Search users..." : "Search users by name or email..."}
              className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-white placeholder-gray-400 text-sm sm:text-base border border-gray-600 hover:border-gray-500 transition-colors ${isMobile ? 'min-h-[48px]' : ''}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row gap-4'}`}>
            <button className={`flex items-center justify-center px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-sm sm:text-base font-medium border border-gray-600 hover:border-gray-500 ${isMobile ? 'min-h-[48px] w-full' : ''}`}>
              <FiFilter className="mr-2" size={16} /> 
              {isMobile ? 'Filter Users' : 'Filters'}
            </button>
            <button className={`flex items-center justify-center px-4 py-3 bg-gold hover:bg-yellow-500 text-black rounded-xl transition-colors text-sm sm:text-base font-medium ${isMobile ? 'min-h-[48px] w-full' : ''}`}>
              <FiDownload className="mr-2" size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Users Display */}
      <div className="p-4 sm:p-6">
        {isMobile ? (
          // Mobile Card Layout
          <div className="space-y-4">
            {uniqueUsers.length > 0 ? (
              <>
                <div className="text-sm text-gray-400 mb-4">
                  Showing {uniqueUsers.length} user{uniqueUsers.length !== 1 ? 's' : ''}
                </div>
                {uniqueUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No users found</h3>
                <p className="text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        ) : (
          // Desktop Table Layout
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">KYC Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uniqueUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center mr-3">
                          <span className="font-bold text-black">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-400 font-mono">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.tier === 'VIP' ? 'bg-purple-500 bg-opacity-20 text-purple-400 border border-purple-500' :
                        user.tier === 'Gold' ? 'bg-gold bg-opacity-20 text-gold border border-gold' :
                        'bg-gray-600 bg-opacity-50 text-gray-300 border border-gray-500'
                      }`}>
                        {user.tier || 'Basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.kycStatus === 'verified' ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500' :
                        user.kycStatus === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500' :
                        'bg-red-500 bg-opacity-20 text-red-400 border border-red-500'
                      }`}>
                        {user.kycStatus || 'Not Started'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-white font-semibold">{
                      typeof user.availableBalance === 'number'
                        ? `$${Number(user.availableBalance).toLocaleString()}`
                        : '$0.00'
                    }</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onSelectUser(user)}
                          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye size={16} className="text-white" />
                        </button>
                        <button 
                          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <FiEdit2 size={16} className="text-white" />
                        </button>
                        <button 
                          onClick={() => setSelectedUserForBalance(user)}
                          className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                          title="Manage Balance"
                        >
                          <FiDollarSign size={16} className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Management Modal */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <BalanceManagementModal
            user={selectedUserForBalance}
            onClose={() => setSelectedUserForBalance(null)}
            onUpdate={handleBalanceUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default UserTable;