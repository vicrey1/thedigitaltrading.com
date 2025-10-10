// src/pages/admin/Withdrawals.js
import React, { useState, useEffect } from 'react';
import WithdrawalList from '../../components/admin/WithdrawalList';
import WithdrawalDetail from '../../components/admin/WithdrawalDetail';
import { getWithdrawals, updateWithdrawal } from '../../services/withdrawalAPI';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    currency: 'all',
    dateRange: '7days'
  });

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
    const fetchWithdrawals = async () => {
      setLoading(true);
      try {
        const data = await getWithdrawals(filters);
        setWithdrawals(data);
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, [filters]);

  const handleUpdateWithdrawal = async (id, status, notes, destination = 'available') => {
    try {
      const updated = await updateWithdrawal(id, { status, adminNotes: notes, destination });
      setWithdrawals(withdrawals.map(w => w.id === updated.id ? updated : w));
      setSelectedWithdrawal(null);
    } catch (error) {
      console.error('Failed to update withdrawal:', error);
    }
  };

  const refreshWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await getWithdrawals(filters);
      setWithdrawals(data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 max-w-full lg:max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-white">
            <FiRefreshCw className="animate-spin" size={20} />
            <span>Loading withdrawals...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-full lg:max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gold">
            Withdrawal Management
          </h1>
          <button
            onClick={refreshWithdrawals}
            className="p-2 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <FiFilter className="text-gray-400" size={16} />
          <span className="text-gray-400">
            Showing: <span className="text-gold font-medium">
              {withdrawals.filter(w => w.status === 'pending').length}
            </span> pending
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="glassmorphic rounded-xl p-3 sm:p-4 md:p-6 w-full">
        <WithdrawalList 
          withdrawals={withdrawals} 
          filters={filters}
          onFilterChange={setFilters}
          onSelect={setSelectedWithdrawal}
          onBulkUpdate={(ids, status) => ids.forEach(id => handleUpdateWithdrawal(id, status, 'Bulk action'))}
          isMobile={isMobile}
        />
      </div>

      {/* Withdrawal Detail Modal */}
      {selectedWithdrawal && (
        <WithdrawalDetail 
          withdrawal={selectedWithdrawal}
          onApprove={(notes, destination) => handleUpdateWithdrawal(selectedWithdrawal.id, 'completed', notes, destination)}
          onReject={notes => handleUpdateWithdrawal(selectedWithdrawal.id, 'rejected', notes)}
          onClose={() => setSelectedWithdrawal(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default AdminWithdrawals;