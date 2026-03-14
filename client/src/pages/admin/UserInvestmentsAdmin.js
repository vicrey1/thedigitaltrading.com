// src/pages/admin/UserInvestmentsAdmin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiCheck, FiX, FiDollarSign, FiTrendingUp, FiTrendingDown, FiSearch } from 'react-icons/fi';

const UserInvestmentsAdmin = () => {
  const [userId, setUserId] = useState('');
  const [investments, setInvestments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [gainLossAmount, setGainLossAmount] = useState('');
  const [gainLossType, setGainLossType] = useState('gain');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchInvestments = async () => {
    const res = await axios.get(`/api/admin/user-investments/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setInvestments(res.data);
  };

  const handleEdit = (inv) => {
    setEditing(inv._id);
    setEditForm({ ...inv });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`/api/admin/user-investments/${editing}`, editForm, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setEditing(null);
    fetchInvestments();
  };

  const handleSetGainLoss = async (id) => {
    if (!gainLossAmount || isNaN(gainLossAmount)) return;
    await axios.post(`/api/admin/investment/${id}/set-gain-loss`, {
      amount: parseFloat(gainLossAmount),
      type: gainLossType
    }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    setGainLossAmount('');
    fetchInvestments();
  };

  const handleComplete = async (id) => {
    await axios.post(`/api/admin/user-investments/${id}/complete`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    fetchInvestments();
  };

  const InvestmentCard = ({ inv }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gold truncate">{inv.planName}</h3>
          <p className="text-xs text-gray-400 font-mono break-all">{inv._id}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          inv.status === 'active' ? 'bg-green-900 text-green-300' :
          inv.status === 'completed' ? 'bg-blue-900 text-blue-300' :
          'bg-red-900 text-red-300'
        }`}>
          {inv.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400">Amount</p>
          <p className="font-medium flex items-center">
            <FiDollarSign className="w-3 h-3 mr-1" />
            {inv.amount}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Current Value</p>
          <p className="font-medium flex items-center">
            <FiDollarSign className="w-3 h-3 mr-1" />
            {inv.currentValue}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input 
            className="flex-1 p-2 border rounded text-sm bg-gray-700 text-white border-gray-600 focus:border-gold outline-none" 
            type="number" 
            placeholder="Gain/Loss $" 
            value={gainLossAmount} 
            onChange={e => setGainLossAmount(e.target.value)} 
          />
          <select 
            className="p-2 border rounded text-sm bg-gray-700 text-white border-gray-600 focus:border-gold outline-none" 
            value={gainLossType} 
            onChange={e => setGainLossType(e.target.value)}
          >
            <option value="gain">Gain</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            onClick={() => handleEdit(inv)}
          >
            <FiEdit className="w-3 h-3 mr-1" />
            Edit
          </button>
          <button 
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            onClick={() => handleComplete(inv._id)}
          >
            <FiCheck className="w-3 h-3 mr-1" />
            Complete
          </button>
          <button 
            className="bg-gold text-black px-3 py-2 rounded text-sm font-medium hover:bg-yellow-400 transition-colors flex items-center justify-center"
            onClick={() => handleSetGainLoss(inv._id)}
          >
            {gainLossType === 'gain' ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-full ${isMobile ? 'p-4' : 'sm:max-w-6xl p-2 sm:p-6'} w-full mx-auto`}>
      <div className="flex items-center space-x-3 mb-6">
        <FiDollarSign className="w-6 h-6 text-gold" />
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>User Investments Admin</h1>
      </div>
      
      <div className={`mb-6 ${isMobile ? 'space-y-3' : 'flex gap-3'}`}>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-800 text-white border-gray-700 focus:border-gold outline-none text-sm" 
            placeholder="Enter User ID" 
            value={userId} 
            onChange={e => setUserId(e.target.value)} 
          />
        </div>
        <button 
          className="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
          onClick={fetchInvestments}
        >
          Fetch Investments
        </button>
      </div>

      {investments.length > 0 && (
        <>
          {isMobile ? (
            <div className="space-y-4">
              {investments.map(inv => (
                <InvestmentCard key={inv._id} inv={inv} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900 text-left">
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">Plan</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Current Value</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => (
                    <tr key={inv._id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-3 px-4 break-all font-mono text-xs">{inv._id}</td>
                      <td className="py-3 px-4 font-medium">{inv.planName}</td>
                      <td className="py-3 px-4">${inv.amount}</td>
                      <td className="py-3 px-4">${inv.currentValue}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inv.status === 'active' ? 'bg-green-900 text-green-300' :
                          inv.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          <button 
                            className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center"
                            onClick={() => handleEdit(inv)}
                          >
                            <FiEdit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button 
                            className="text-green-400 hover:text-green-300 font-medium text-sm flex items-center"
                            onClick={() => handleComplete(inv._id)}
                          >
                            <FiCheck className="w-3 h-3 mr-1" />
                            Complete
                          </button>
                          <div className="flex gap-1">
                            <input 
                              className="p-1 border rounded w-20 bg-gray-700 text-white border-gray-600 focus:border-gold outline-none text-xs" 
                              type="number" 
                              placeholder="Amount" 
                              value={gainLossAmount} 
                              onChange={e => setGainLossAmount(e.target.value)} 
                            />
                            <select 
                              className="p-1 border rounded bg-gray-700 text-white border-gray-600 focus:border-gold outline-none text-xs" 
                              value={gainLossType} 
                              onChange={e => setGainLossType(e.target.value)}
                            >
                              <option value="gain">Gain</option>
                              <option value="loss">Loss</option>
                            </select>
                            <button 
                              className="text-gold hover:text-yellow-400 font-medium text-sm p-1"
                              onClick={() => handleSetGainLoss(inv._id)}
                            >
                              {gainLossType === 'gain' ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-xl ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'} p-6`}>
            <h2 className="text-lg font-bold text-gold mb-4 flex items-center">
              <FiEdit className="w-5 h-5 mr-2" />
              Edit Investment
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                <input 
                  className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600 focus:border-gold outline-none" 
                  type="number" 
                  value={editForm.amount} 
                  onChange={e => setEditForm({ ...editForm, amount: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Value</label>
                <input 
                  className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600 focus:border-gold outline-none" 
                  type="number" 
                  value={editForm.currentValue} 
                  onChange={e => setEditForm({ ...editForm, currentValue: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select 
                  className="w-full p-3 border rounded-lg bg-gray-700 text-white border-gray-600 focus:border-gold outline-none" 
                  value={editForm.status} 
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
                <button 
                  className="flex-1 bg-gold text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors" 
                  type="submit"
                >
                  Save Changes
                </button>
                <button 
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors" 
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInvestmentsAdmin;
