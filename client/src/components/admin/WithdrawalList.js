// src/components/admin/WithdrawalList.js
import React, { useState, useEffect } from 'react';
import { FiDownload, FiUser, FiDollarSign, FiCalendar, FiCreditCard } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
  completed: 'bg-green-500 bg-opacity-20 text-green-400',
  rejected: 'bg-red-500 bg-opacity-20 text-red-400'
};

const WithdrawalList = ({ withdrawals = [], onSelect, onExport, isMobile }) => {
  const [internalIsMobile, setInternalIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActuallyMobile = isMobile !== undefined ? isMobile : internalIsMobile;

  // Mobile Card Component
  const WithdrawalCard = ({ withdrawal }) => (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-3 border border-gray-700 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3 flex-shrink-0">
            <FiUser className="text-gray-300" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm truncate">{withdrawal.userFullName || withdrawal.userId}</div>
            <div className="text-xs text-gray-400 truncate">{withdrawal.userEmail}</div>
            <div className="text-xs text-gray-500 font-mono">ID: {withdrawal.id}</div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColors[withdrawal.status]}`}>
            {withdrawal.status}
          </span>
          {withdrawal.type === 'roi' && (
            <span className="px-2 py-1 rounded bg-purple-700 text-white text-xs font-bold">ROI</span>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-xs">
            <FiDollarSign className="mr-1" size={12} />
            <span>Amount</span>
          </div>
          <div className="text-gold font-bold font-mono text-sm">
            {Number(withdrawal.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {withdrawal.currency}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-xs">
            <FiCreditCard className="mr-1" size={12} />
            <span>Network</span>
          </div>
          <div className="text-gray-300 text-xs uppercase">{withdrawal.network}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-xs">
            <FiCalendar className="mr-1" size={12} />
            <span>Date</span>
          </div>
          <div className="text-gray-300 text-xs">{new Date(withdrawal.createdAt).toLocaleDateString()}</div>
        </div>
        
        <div className="pt-1">
          <div className="text-gray-400 text-xs mb-1">Wallet Address:</div>
          <div className={`text-xs font-mono break-all ${withdrawal.walletAddress === 'DEFAULT_ADDRESS' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
            {withdrawal.walletAddress}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        {withdrawal.status === 'pending' ? (
          <button
            onClick={() => onSelect(withdrawal)}
            className="px-4 py-2 bg-gold text-black rounded-lg font-semibold shadow hover:bg-yellow-400 transition text-sm"
          >
            Review
          </button>
        ) : (
          <span className="text-gray-500 text-sm">-</span>
        )}
      </div>
    </div>
  );
  return (
    <div className="w-full p-2 sm:p-3 md:p-4 bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl shadow-2xl border border-gray-800">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gold tracking-tight">Withdrawals</h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gold text-black font-semibold rounded-lg shadow hover:bg-yellow-400 transition text-sm sm:text-base"
        >
          <FiDownload size={16} /> Export CSV
        </button>
      </div>
      
      {isActuallyMobile ? (
        // Mobile Card Layout
        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="text-base">No withdrawals found.</div>
            </div>
          ) : (
            withdrawals.map(wd => (
              <WithdrawalCard key={wd.id} withdrawal={wd} />
            ))
          )}
        </div>
      ) : (
        // Desktop Table Layout
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800 text-left">
                <th className="py-4 px-4 font-semibold text-gray-300">ID</th>
                <th className="py-4 px-4 font-semibold text-gray-300">User</th>
                <th className="py-4 px-4 font-semibold text-gray-300">Amount</th>
                <th className="py-4 px-4 font-semibold text-gray-300">Network</th>
                <th className="py-4 px-4 font-semibold text-gray-300">Wallet</th>
                <th className="py-4 px-4 font-semibold text-gray-300">Date</th>
                <th className="py-4 px-4 font-semibold text-gray-300">Status</th>
                <th className="py-4 px-4 font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-lg">No withdrawals found.</td>
                </tr>
              ) : (
                withdrawals.map(wd => (
                  <tr key={wd.id} className="border-b border-gray-800 hover:bg-gray-900 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500 max-w-[120px] truncate">{wd.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-100">{wd.userId}</div>
                      {wd.userFullName && (
                        <div className="text-xs text-gray-400">{wd.userFullName}</div>
                      )}
                      <div className="text-xs text-gray-400">{wd.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gold font-bold">
                      {Number(wd.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {wd.currency}
                      {wd.type === 'roi' && (
                        <span className="ml-2 px-2 py-1 rounded bg-purple-700 text-white text-xs font-bold">ROI</span>
                      )}
                    </td>
                    <td className="py-3 px-4 uppercase text-gray-300">{wd.network}</td>
                    <td className={`py-3 px-4 font-mono text-xs truncate max-w-xs ${wd.walletAddress === 'DEFAULT_ADDRESS' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{wd.walletAddress}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{new Date(wd.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[wd.status]}`}>{wd.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      {wd.status === 'pending' ? (
                        <button
                          onClick={() => onSelect(wd)}
                          className="px-4 py-1 bg-gold text-black rounded-lg font-semibold shadow hover:bg-yellow-400 transition"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithdrawalList;