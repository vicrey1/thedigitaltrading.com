// src/pages/admin/Funds.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiDownload, FiTrendingUp, FiLoader } from 'react-icons/fi';
import FundList from '../../components/admin/FundList';
import FundEditor from '../../components/admin/FundEditor';
import { getFunds, updateFund, deleteFund } from '../../services/fundAPI';

const AdminFunds = () => {
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
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
    const fetchFunds = async () => {
      setLoading(true);
      try {
        const data = await getFunds();
        setFunds(data);
      } catch (error) {
        console.error('Failed to fetch funds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  const handleUpdateFund = async (id, updates) => {
    try {
      const updated = await updateFund(id, updates);
      setFunds(funds.map(f => f._id === id ? updated : f));
    } catch (error) {
      console.error('Failed to update fund:', error);
    }
  };

  const handleDeleteFund = async (id) => {
    try {
      await deleteFund(id);
      setFunds(funds.filter(f => f._id !== id));
    } catch (error) {
      console.error('Failed to delete fund:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${isMobile ? 'p-4' : 'p-6'} flex items-center justify-center min-h-64`}>
        <div className="flex items-center space-x-3">
          <FiLoader className="w-6 h-6 animate-spin text-gold" />
          <span className="text-lg">Loading funds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-full ${isMobile ? 'p-4' : 'sm:max-w-6xl p-2 sm:p-6'} w-full mx-auto`}>
      <div className="space-y-6">
        {/* Header */}
        <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'}`}>
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="w-6 h-6 text-gold" />
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Fund Management</h1>
          </div>
          <button
            onClick={() => {
              setSelectedFund(null);
              setIsEditing(true);
            }}
            className={`${isMobile ? 'w-full' : ''} flex items-center justify-center px-4 py-3 bg-gold text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm`}
          >
            <FiPlus className="mr-2 w-4 h-4" /> New Fund
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center gap-4'}`}>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search funds..."
              className="w-full pl-4 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-gold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center space-x-3'}`}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`${isMobile ? 'w-full' : ''} bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gold text-sm`}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <button className={`${isMobile ? 'w-full' : ''} flex items-center justify-center px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm`}>
              <FiDownload className="mr-2 w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Fund List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <FundList 
            funds={funds} 
            onEdit={fund => { setSelectedFund(fund); setIsEditing(true); }}
            onDelete={handleDeleteFund}
            isMobile={isMobile}
            searchTerm={searchTerm}
            filter={filter}
          />
        </div>

        {/* Fund Editor Modal */}
        {isEditing && (
          <FundEditor 
            fund={selectedFund}
            onSave={(updates) => { 
              if (selectedFund) {
                handleUpdateFund(selectedFund._id, updates);
              }
              setIsEditing(false); 
            }}
            onClose={() => setIsEditing(false)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default AdminFunds;