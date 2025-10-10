import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiCreditCard, FiUser, FiEye, FiCopy, FiKey } from 'react-icons/fi';

const AdminWallets = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [wallets, setWallets] = useState(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const searchUsers = async (e) => {
    e.preventDefault();
    setError('');
    setUsers([]);
    setSelectedUser(null);
    setWallets(null);
    try {
      const res = await axios.get(`/api/wallets/admin/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search users');
    }
  };

  const fetchWallets = async (userId) => {
    setError('');
    setWallets(null);
    setSelectedUser(userId);
    try {
      const res = await axios.get(`/api/wallets/admin/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWallets(res.data.wallets);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch wallets');
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const UserCard = ({ user }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gold flex items-center">
            <FiUser className="w-4 h-4 mr-2" />
            {user.email}
          </h3>
          <p className="text-sm text-gray-400">({user.username})</p>
        </div>
        <button 
          onClick={() => fetchWallets(user._id)} 
          className="bg-gold text-black px-3 py-2 rounded text-sm font-medium hover:bg-yellow-400 transition-colors flex items-center"
        >
          <FiEye className="w-3 h-3 mr-1" />
          View
        </button>
      </div>
    </div>
  );

  const WalletCard = ({ chain, wallet }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gold uppercase flex items-center">
          <FiCreditCard className="w-4 h-4 mr-2" />
          {chain}
        </h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 font-medium">Address</label>
            <button 
              onClick={() => copyToClipboard(wallet.address, `${chain}-address`)}
              className="text-gold hover:text-yellow-400 transition-colors"
            >
              <FiCopy className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-gray-900 rounded p-2 break-all text-xs font-mono text-gold">
            {wallet.address}
          </div>
          {copied === `${chain}-address` && (
            <div className="text-xs text-green-400 mt-1">Copied!</div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 font-medium">Mnemonic</label>
            <button 
              onClick={() => copyToClipboard(wallet.mnemonic, `${chain}-mnemonic`)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <FiCopy className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-gray-900 rounded p-2 break-all text-xs font-mono text-yellow-400">
            {wallet.mnemonic}
          </div>
          {copied === `${chain}-mnemonic` && (
            <div className="text-xs text-green-400 mt-1">Copied!</div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 font-medium">Private Key</label>
            <button 
              onClick={() => copyToClipboard(wallet.privateKey, `${chain}-private`)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FiCopy className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-gray-900 rounded p-2 break-all text-xs font-mono text-gray-400">
            {wallet.privateKey}
          </div>
          {copied === `${chain}-private` && (
            <div className="text-xs text-green-400 mt-1">Copied!</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-full ${isMobile ? 'p-4' : 'sm:max-w-6xl p-2 sm:p-6'} w-full mx-auto`}>
      <div className="flex items-center space-x-3 mb-6">
        <FiCreditCard className="w-6 h-6 text-gold" />
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Admin: User Wallets</h1>
      </div>
      
      <form onSubmit={searchUsers} className={`mb-6 ${isMobile ? 'space-y-3' : 'flex gap-3'}`}>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-800 text-white border-gray-700 focus:border-gold outline-none text-sm"
            placeholder="Search by email, username, or user ID"
            required
          />
        </div>
        <button 
          type="submit" 
          className="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {users.length > 0 && (
        <div className="mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-4 flex items-center`}>
            <FiUser className="w-5 h-5 mr-2 text-gold" />
            Select a User
          </h2>
          {isMobile ? (
            <div className="space-y-3">
              {users.map(user => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-700">
                {users.map(user => (
                  <div key={user._id} className="p-4 flex justify-between items-center hover:bg-gray-750 transition-colors">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <span className="font-medium">{user.email}</span>
                        <span className="text-gray-400 ml-2">({user.username})</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => fetchWallets(user._id)} 
                      className="bg-gold text-black px-4 py-2 rounded font-medium hover:bg-yellow-400 transition-colors text-sm flex items-center"
                    >
                      <FiEye className="w-3 h-3 mr-1" />
                      View Wallets
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {wallets && (
        <div className="space-y-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold flex items-center`}>
            <FiKey className="w-5 h-5 mr-2 text-gold" />
            Wallet Details
          </h2>
          {isMobile ? (
            <div className="space-y-4">
              {Object.entries(wallets).map(([chain, wallet]) => (
                <WalletCard key={chain} chain={chain} wallet={wallet} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(wallets).map(([chain, wallet]) => (
                <WalletCard key={chain} chain={chain} wallet={wallet} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminWallets;
