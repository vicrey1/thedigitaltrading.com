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
      setIsMobile(window.innerWidth < 768);
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
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gold flex items-center">
            <FiUser className="w-4 h-4 mr-2" />
            {withdrawal.userEmail}
          </h3>
          <p className="text-xs text-gray-400 font-mono break-all">{withdrawal._id}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          withdrawal.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
          withdrawal.status === 'approved' ? 'bg-green-900 text-green-300' :
          'bg-red-900 text-red-300'
        }`}>
          {withdrawal.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400">Amount</p>
          <p className="font-medium flex items-center">
            <FiDollarSign className="w-3 h-3 mr-1" />
            ${withdrawal.amount}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Date</p>
          <p className="font-medium flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {new Date(withdrawal.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {withdrawal.status === 'pending' && (
        <div className="flex gap-2 pt-2">
          <button 
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            onClick={() => handleApprove(withdrawal._id)}
          >
            <FiCheck className="w-3 h-3 mr-1" />
            Approve
          </button>
          <button 
            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
            onClick={() => handleReject(withdrawal._id)}
          >
            <FiX className="w-3 h-3 mr-1" />
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
    <div className={`max-w-full ${isMobile ? 'p-4' : 'sm:max-w-6xl p-2 sm:p-6'} w-full mx-auto`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FiDollarSign className="w-6 h-6 text-gold" />
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>ROI Approvals</h1>
        </div>
        <button 
          className="bg-gold text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm flex items-center"
          onClick={fetchRoiWithdrawals}
        >
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {roiWithdrawals.length === 0 ? (
        <div className="text-center py-12">
          <FiDollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No ROI withdrawals found</p>
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
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900 text-left">
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">User Email</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roiWithdrawals.map(withdrawal => (
                    <tr key={withdrawal._id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-3 px-4 break-all font-mono text-xs">{withdrawal._id}</td>
                      <td className="py-3 px-4 font-medium">{withdrawal.userEmail}</td>
                      <td className="py-3 px-4 font-medium">${withdrawal.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          withdrawal.status === 'approved' ? 'bg-green-900 text-green-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              className="text-green-400 hover:text-green-300 font-medium text-sm flex items-center"
                              onClick={() => handleApprove(withdrawal._id)}
                            >
                              <FiCheck className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center"
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
          )}
        </>
      )}
    </div>
  );
};

export default RoiApprovals;
