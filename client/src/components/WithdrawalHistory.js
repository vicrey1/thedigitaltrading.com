// src/components/WithdrawalHistory.js
import React from 'react';
import { FiCheck, FiClock, FiX, FiDollarSign, FiAlertTriangle, FiLoader } from 'react-icons/fi';

const statusIcons = {
  pending_billing: <FiAlertTriangle className="text-orange-500" />,
  pending: <FiClock className="text-yellow-500" />,
  processing: <FiLoader className="text-blue-500" />,
  confirmed: <FiCheck className="text-green-500" />,
  completed: <FiCheck className="text-green-500" />,
  rejected: <FiX className="text-red-500" />,
  failed: <FiX className="text-red-500" />,
  cancelled: <FiX className="text-gray-500" />
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending_billing': return 'text-orange-500';
    case 'pending': return 'text-yellow-500';
    case 'processing': return 'text-blue-500';
    case 'confirmed':
    case 'completed': return 'text-green-500';
    case 'rejected':
    case 'failed': return 'text-red-500';
    case 'cancelled': return 'text-gray-500';
    default: return 'text-yellow-500';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'pending_billing': return 'Awaiting Fee Payment';
    case 'pending': return 'Pending Approval';
    case 'processing': return 'Processing';
    case 'confirmed': return 'Confirmed';
    case 'completed': return 'Completed';
    case 'rejected': return 'Rejected';
    case 'failed': return 'Failed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const WithdrawalHistory = ({ withdrawals }) => {
  // Normalize the prop to an array to avoid runtime errors when the server
  // returns undefined, null, or a single object.
  const list = Array.isArray(withdrawals) ? withdrawals : [];

  return (
    <div className="glassmorphic p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">Recent Withdrawals</h3>
      {list.length === 0 ? (
        <p className="text-gray-400">No withdrawal history</p>
      ) : (
        <div className="space-y-4">
          {list.map((withdrawal) => (
            <div key={withdrawal.id || withdrawal._id || Math.random()} className="flex justify-between items-start p-3 border-b border-gray-800">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <FiDollarSign className="text-gold" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">${Math.abs(withdrawal.amount || 0).toFixed(2)}</p>
                  <p className={`text-sm ${withdrawal.type === 'roi' ? 'text-purple-500 font-semibold' : 'text-gray-400'}`}>
                    {withdrawal.type === 'roi' ? 'ROI Withdrawal' : `Withdrawal to ${withdrawal.walletAddress || 'DEFAULT_ADDRESS'}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {withdrawal.date ? new Date(withdrawal.date).toLocaleDateString() : 
                     withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString() : ''} • {withdrawal.network || withdrawal.currency || ''}
                  </p>
                  {withdrawal.billingFee && withdrawal.billingFee > 0 && (
                    <p className="text-xs text-orange-400 mt-1">
                      Network Fee: ${withdrawal.billingFee.toFixed(2)} 
                      {withdrawal.billingPaid ? ' (Paid)' : ' (Pending)'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-1">
                  <span className="mr-2">{statusIcons[withdrawal.status] || statusIcons.pending}</span>
                  <span className={`text-sm ${getStatusColor(withdrawal.status)}`}>
                    {getStatusText(withdrawal.status)}
                  </span>
                </div>
                {withdrawal.status === 'pending_billing' && (
                  <span className="text-xs text-orange-400">Pay fee to continue</span>
                )}
              </div>
            </div>
          ))}
          <button className="text-gold text-sm font-medium mt-2 hover:underline">
            View full history →
          </button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;