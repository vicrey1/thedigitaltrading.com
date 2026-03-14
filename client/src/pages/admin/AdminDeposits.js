// src/pages/admin/AdminDeposits.js
import React, { useEffect, useState } from 'react';
import { getAdminDeposits, updateAdminDeposit } from '../../services/adminDepositsAPI';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiDollarSign, FiCreditCard, FiClock, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const AdminDeposits = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Redirect to login if no adminToken
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }
    fetchDeposits();
  }, [navigate]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await getAdminDeposits();
      setDeposits(res);
    } catch (err) {
      setError('Failed to fetch deposits');
    }
    setLoading(false);
  };

  const handleAction = async (id, status) => {
    setProcessingId(id);
    setActionStatus('');
    try {
      await updateAdminDeposit(id, { status });
      setActionStatus(`Deposit ${status} successfully`);
      fetchDeposits();
    } catch (err) {
      setActionStatus('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const DepositCard = ({ deposit, index }) => (
    <div className="glassmorphic p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiUser className="text-gold" size={16} />
          <span className="font-medium text-white text-sm">
            {deposit.user?.email || deposit.user?.username || deposit.user?.name || 'Unknown User'}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(deposit.status)}`}>
          {deposit.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-green-400" size={14} />
          <div>
            <p className="text-gray-400 text-xs">Amount</p>
            <p className="text-white font-medium">{deposit.amount} {deposit.currency}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <FiCreditCard className="text-blue-400" size={14} />
          <div>
            <p className="text-gray-400 text-xs">Method</p>
            <p className="text-white font-medium">{deposit.method}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <FiClock className="text-gray-400" size={14} />
        <div>
          <p className="text-gray-400 text-xs">Created</p>
          <p className="text-white">{new Date(deposit.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {deposit.status === 'pending' && (
        <div className="flex gap-2 pt-2">
          <button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            onClick={() => handleAction(deposit._id, 'confirmed')}
            disabled={processingId === deposit._id}
          >
            {processingId === deposit._id ? (
              <FiRefreshCw className="animate-spin" size={14} />
            ) : (
              <FiCheck size={14} />
            )}
            Approve
          </button>
          <button 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            onClick={() => handleAction(deposit._id, 'rejected')}
            disabled={processingId === deposit._id}
          >
            {processingId === deposit._id ? (
              <FiRefreshCw className="animate-spin" size={14} />
            ) : (
              <FiX size={14} />
            )}
            Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen max-w-full lg:max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gold">
          Admin: Deposits
        </h1>
        <button
          onClick={fetchDeposits}
          className="p-2 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold transition-colors"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
        </button>
      </div>

      {actionStatus && (
        <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
          actionStatus.includes('failed') 
            ? 'bg-red-900/20 text-red-400' 
            : 'bg-green-900/20 text-green-400'
        }`}>
          {actionStatus}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-white">
            <FiRefreshCw className="animate-spin" size={20} />
            <span>Loading deposits...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-400 font-semibold mb-4">{error}</div>
          <button
            onClick={fetchDeposits}
            className="px-4 py-2 bg-gold text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FiDollarSign className="mx-auto mb-4 text-4xl" />
          <p className="text-lg">No deposits found</p>
          <p className="text-sm mt-1">Deposits will appear here when users make them</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            // Mobile Card Layout
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                Total: {deposits.length} deposits | Pending: {deposits.filter(d => d.status === 'pending').length}
              </div>
              {deposits.map((deposit, index) => (
                <DepositCard key={deposit._id} deposit={deposit} index={index} />
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="glassmorphic rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="py-4 px-4 text-left font-semibold text-gold">User</th>
                      <th className="py-4 px-4 text-left font-semibold text-gold">Amount</th>
                      <th className="py-4 px-4 text-left font-semibold text-gold">Currency</th>
                      <th className="py-4 px-4 text-left font-semibold text-gold">Status</th>
                      <th className="py-4 px-4 text-left font-semibold text-gold">Method</th>
                      <th className="py-4 px-4 text-left font-semibold text-gold">Created</th>
                      <th className="py-4 px-4 text-center font-semibold text-gold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((dep, idx) => (
                      <tr key={dep._id} className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors`}>
                        <td className="py-4 px-4 text-white font-medium">
                          {dep.user?.email || dep.user?.username || dep.user?.name || 'Unknown User'}
                        </td>
                        <td className="py-4 px-4 text-white font-bold">{dep.amount}</td>
                        <td className="py-4 px-4 text-gray-300">{dep.currency}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(dep.status)}`}>
                            {dep.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{dep.method}</td>
                        <td className="py-4 px-4 text-gray-300">{new Date(dep.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          {dep.status === 'pending' && (
                            <div className="flex gap-2 justify-center">
                              <button 
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                onClick={() => handleAction(dep._id, 'confirmed')}
                                disabled={processingId === dep._id}
                              >
                                {processingId === dep._id ? (
                                  <FiRefreshCw className="animate-spin" size={14} />
                                ) : (
                                  <FiCheck size={14} />
                                )}
                                Approve
                              </button>
                              <button 
                                className="bg-red-600 hover:red-700 text-white px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                onClick={() => handleAction(dep._id, 'rejected')}
                                disabled={processingId === dep._id}
                              >
                                {processingId === dep._id ? (
                                  <FiRefreshCw className="animate-spin" size={14} />
                                ) : (
                                  <FiX size={14} />
                                )}
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDeposits;
