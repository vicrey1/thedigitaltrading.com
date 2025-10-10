// src/pages/admin/Users.js
import React, { useState, useEffect } from 'react';
import UserTable from '../../components/admin/UserTable';
import UserDetail from '../../components/admin/UserDetail';
import { getUsers, updateUser, adjustUserAvailableBalance } from '../../services/adminAPI';
import { FiUsers, FiRefreshCw } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateUser = async (updatedUser) => {
    try {
      const userId = updatedUser.id || updatedUser._id;
      if (!userId) {
        console.warn('User ID is undefined in handleUpdateUser:', updatedUser);
        return;
      }
      const user = await updateUser(userId, updatedUser);
      setUsers(users.map(u => u.id === user.id ? user : u));
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleAdjustAvailableBalance = async ({ userId, amount, operation }) => {
    try {
      await adjustUserAvailableBalance(userId, amount, operation);
      // Optimistically update local state
      setUsers(prev => prev.map(u => {
        const id = u.id || u._id;
        if (id !== userId) return u;
        const prevBal = Number(u.availableBalance || 0);
        const delta = operation === 'add' ? Number(amount) : -Number(amount);
        const nextBal = parseFloat(Number(prevBal + delta).toFixed(2));
        return { ...u, availableBalance: nextBal };
      }));
    } catch (error) {
      console.error('Failed to adjust available balance:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-2 sm:p-4 md:p-6">
        <div className="max-w-full sm:max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="flex items-center space-x-3 text-gray-400">
              <FiRefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              <span className="text-sm sm:text-base">Loading users...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-full sm:max-w-6xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6 md:p-8 border-b border-gray-700">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gold bg-opacity-20 rounded-lg">
                <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gold" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  User Management
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1">
                  Manage and monitor user accounts
                </p>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-4 sm:p-6 md:p-8">
            <UserTable 
              users={users} 
              onSelectUser={setSelectedUser}
              onUpdateUser={handleAdjustAvailableBalance}
              isMobile={isMobile}
            />
          </div>
        </div>
        
        {selectedUser && (
          <UserDetail 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)}
            onUpdate={handleUpdateUser}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;