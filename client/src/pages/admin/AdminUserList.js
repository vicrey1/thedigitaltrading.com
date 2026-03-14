import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiEye } from 'react-icons/fi';

const AdminUserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setUsers(res.data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const UserCard = ({ user }) => (
    <div className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700 hover:border-gold transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 text-gold">
          <FiUser className="w-4 h-4" />
          <span className="font-semibold text-sm">User Details</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <FiMail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300 break-all">{user.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiUser className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{user.name}</span>
        </div>
      </div>
      
      <button 
        className="w-full bg-gold px-4 py-2 rounded-lg text-black font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
        onClick={() => onSelectUser(user._id)}
      >
        <FiEye className="w-4 h-4" />
        <span>Mirror User</span>
      </button>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-full sm:max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">All Users</h1>
        <div className="relative">
          <input
            className="w-full p-3 sm:p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-gold outline-none text-sm sm:text-base"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading users...</div>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No users found matching your search.
                </div>
              ) : (
                filtered.map(user => (
                  <UserCard key={user._id} user={user} />
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800">
                    <th className="py-4 px-4 text-left font-semibold text-gold">
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-gold">
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4" />
                        <span>Name</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-semibold text-gold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 px-4 text-center text-gray-400">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(user => (
                      <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                        <td className="py-4 px-4 text-gray-300 break-all">{user.email}</td>
                        <td className="py-4 px-4 text-gray-300">{user.name}</td>
                        <td className="py-4 px-4">
                          <button 
                            className="bg-gold px-4 py-2 rounded-lg text-black font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                            onClick={() => onSelectUser(user._id)}
                          >
                            <FiEye className="w-4 h-4" />
                            <span>Mirror</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUserList;
