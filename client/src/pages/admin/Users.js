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
      <div className="p-3 sm:p-4 md:p-6 max-w-full sm:max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-gray-400">
            <FiRefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-full ${isMobile ? 'p-3' : 'sm:max-w-6xl p-4 md:p-8 lg:p-16 xl:p-20 2xl:p-24'} w-full mx-auto font-sans text-base text-gray-100 bg-black rounded-xl shadow-lg`}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <FiUsers className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">User Management</h1>
        </div>
        
        <UserTable 
          users={users} 
          onSelectUser={setSelectedUser}
          onUpdateUser={handleAdjustAvailableBalance}
          isMobile={isMobile}
        />
        
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