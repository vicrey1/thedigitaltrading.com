// src/pages/admin/RoiApprovals.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiDollarSign, FiUser, FiCalendar, FiRefreshCw } from 'react-icons/fi';

const RoiApprovals = () => {
  const [roiWithdrawals, setRoiWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Changed to lg breakpoint for better mobile experience
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchRoiWithdrawals();
  }, []);

  const fetchRoiWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/roi-withdrawals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setRoiWithdrawals(res.data);
    } catch (err) {
      setError('Failed to fetch ROI withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/admin/roi-withdrawals/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      fetchRoiWithdrawals();
    } catch (err) {
      setError('Failed to approve withdrawal');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/admin/roi-withdrawals/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      fetchRoiWithdrawals();
    } catch (err) {
      setError('Failed to reject withdrawal');
    }
  };

  const RoiCard = ({ withdrawal }) => (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-700 space-y-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gold flex items-center text-sm sm:text-base">
            <FiUser className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{withdrawal.userEmail}</span>
          </h3>
          <p className="text-xs text-gray-400 font-mono break-all mt-1 leading-relaxed">{withdrawal._id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${
          withdrawal.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
          withdrawal.status === 'approved' ? 'bg-green-900 text-green-300' :
          'bg-red-900 text-red-300'
        }`}>
          {withdrawal.status}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amount</p>
          <p className="font-semibold text-white flex items-center text-base">
            <FiDollarSign className="w-4 h-4 mr-1 text-green-400" />
            ${withdrawal.amount}
          </p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Date</p>
          <p className="font-semibold text-white flex items-center text-base">
            <FiCalendar className="w-4 h-4 mr-1 text-blue-400" />
            {new Date(withdrawal.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {withdrawal.status === 'pending' && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
            onClick={() => handleApprove(withdrawal._id)}
          >
            <FiCheck className="w-4 h-4 mr-2" />
            Approve
          </button>
          <button 
            className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
            onClick={() => handleReject(withdrawal._id)}
          >
            <FiX className="w-4 h-4 mr-2" />
            Reject
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <FiRefreshCw className="w-5 h-5 animate-spin text-gold" />
          <span className="text-gray-300">Loading ROI withdrawals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">ROI Approvals</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
               Total: <span className="font-semibold text-white">{roiWithdrawals.length}</span>
             </span>
             <span className="text-sm text-gray-400 bg-yellow-900 bg-opacity-50 px-3 py-1 rounded-full">
               Pending: <span className="font-semibold text-yellow-300">{roiWithdrawals.filter(w => w.status === 'pending').length}</span>
             </span>
          </div>
          <button 
            className="bg-gold text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm flex items-center justify-center"
            onClick={fetchRoiWithdrawals}
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {roiWithdrawals.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 bg-opacity-50 rounded-xl">
          <FiDollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No ROI withdrawals found</p>
          <p className="text-gray-500 text-sm mt-2">ROI withdrawal requests will appear here</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="space-y-4">
              {roiWithdrawals.map(withdrawal => (
                <RoiCard key={withdrawal._id} withdrawal={withdrawal} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900">
                      <th className="py-4 px-6 font-semibold text-left text-gray-300 uppercase tracking-wide text-xs">ID</th>
                      <th className="py-4 px-6 font-semibold text-left text-gray-300 uppercase tracking-wide text-xs">User Email</th>
                      <th className="py-4 px-6 font-semibold text-left text-gray-300 uppercase tracking-wide text-xs">Amount</th>
                      <th className="py-4 px-6 font-semibold text-left text-gray-300 uppercase tracking-wide text-xs">Status</th>
                      <th className="py-4 px-6 font-semibold text-left text-gray-300 uppercase tracking-wide text-xs">Date</th>
                      <th className="py-4 px-6 font-semibold text-left text-gray-300 uppercase tracking-wide text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {roiWithdrawals.map(withdrawal => (
                      <tr key={withdrawal._id} className="hover:bg-gray-750 transition-colors">
                        <td className="py-4 px-6 break-all font-mono text-xs text-gray-400 max-w-32">{withdrawal._id}</td>
                        <td className="py-4 px-6 font-medium text-white">{withdrawal.userEmail}</td>
                        <td className="py-4 px-6 font-semibold text-green-400 flex items-center">
                          <FiDollarSign className="w-4 h-4 mr-1" />
                          {withdrawal.amount}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            withdrawal.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                            withdrawal.status === 'approved' ? 'bg-green-900 text-green-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          {withdrawal.status === 'pending' && (
                            <div className="flex gap-2">
                              <button 
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium text-sm flex items-center transition-colors shadow-md hover:shadow-lg"
                                onClick={() => handleApprove(withdrawal._id)}
                              >
                                <FiCheck className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button 
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-medium text-sm flex items-center transition-colors shadow-md hover:shadow-lg"
                                onClick={() => handleReject(withdrawal._id)}
                              >
                                <FiX className="w-3 h-3 mr-1" />
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

export default RoiApprovals;
