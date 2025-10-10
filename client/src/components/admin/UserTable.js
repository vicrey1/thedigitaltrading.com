// src/components/admin/UserTable.js
import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiDollarSign } from 'react-icons/fi';
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

  // Mobile Card Component
  const UserCard = ({ user }) => (
    <div className="bg-gray-700 rounded-lg p-3 sm:p-4 mb-3 border border-gray-600 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <span className="text-sm sm:text-lg font-semibold">{user.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate text-sm sm:text-base">{user.name}</div>
            <div className="text-xs sm:text-sm text-gray-400 truncate">{user.email}</div>
            <div className="text-xs text-gray-500">ID: {user.id}</div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
            user.tier === 'VIP' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
            user.tier === 'Gold' ? 'bg-gold bg-opacity-20 text-gold' :
            'bg-gray-600 text-gray-300'
          }`}>
            {user.tier || 'Basic'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
            user.kycStatus === 'verified' ? 'bg-green-500 bg-opacity-20 text-green-400' :
            user.kycStatus === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
            'bg-red-500 bg-opacity-20 text-red-400'
          }`}>
            {user.kycStatus || 'Not Started'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-base sm:text-lg font-mono text-white font-semibold">
          {typeof user.availableBalance === 'number'
            ? `$${Number(user.availableBalance).toLocaleString()}`
            : '$0.00'}
        </div>
        <div className="flex space-x-1 sm:space-x-2">
          <button 
            onClick={() => onSelectUser(user)}
            className="p-1.5 sm:p-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
            title="View Details"
          >
            <FiEye size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            className="p-1.5 sm:p-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
            title="Edit User"
          >
            <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={() => setSelectedUserForBalance(user)}
            className="p-1.5 sm:p-2 bg-gray-600 rounded-lg hover:bg-green-600 transition-colors"
            title="Manage Balance"
          >
            <FiDollarSign size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-white placeholder-gray-400 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
            <FiFilter className="mr-2" size={16} /> Filters
          </button>
          <select className="bg-gray-700 rounded-lg px-3 sm:px-4 py-2 focus:outline-none text-white text-sm sm:text-base">
            <option>Export</option>
            <option>CSV</option>
            <option>PDF</option>
          </select>
        </div>
      </div>

      {/* Users Display */}
      {isMobile ? (
        // Mobile Card Layout
        <div className="space-y-4">
          {uniqueUsers.length > 0 ? (
            uniqueUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No users found
            </div>
          )}
        </div>
      ) : (
        // Desktop Table Layout
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="pb-4 text-gray-300">User</th>
                <th className="pb-4 text-gray-300">Email</th>
                <th className="pb-4 text-gray-300">Tier</th>
                <th className="pb-4 text-gray-300">KYC Status</th>
                <th className="pb-4 text-gray-300">Balance</th>
                <th className="pb-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uniqueUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-white">{user.email}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.tier === 'VIP' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
                      user.tier === 'Gold' ? 'bg-gold bg-opacity-20 text-gold' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {user.tier || 'Basic'}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.kycStatus === 'verified' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                      user.kycStatus === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                      'bg-red-500 bg-opacity-20 text-red-400'
                    }`}>
                      {user.kycStatus || 'Not Started'}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-white">{
                    typeof user.availableBalance === 'number'
                      ? `$${Number(user.availableBalance).toLocaleString()}`
                      : '$0.00'
                  }</td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onSelectUser(user)}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button 
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        title="Edit User"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => setSelectedUserForBalance(user)}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-green-600 transition-colors"
                        title="Manage Balance"
                      >
                        <FiDollarSign />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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