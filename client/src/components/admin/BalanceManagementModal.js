import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const BalanceManagementModal = ({ user, onClose, onUpdate }) => {
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    // Check if subtracting more than available balance
    if (operation === 'subtract') {
      const availableBalance = Number(user.availableBalance || 0);
      if (numAmount > availableBalance) {
        setError(`Cannot subtract more than the available balance ($${availableBalance.toFixed(2)})`);
        return;
      }
    }

    setLoading(true);
    try {
      await onUpdate({
        userId: user._id || user.id,
        amount: numAmount,
        operation
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1500); // Close after showing success message
    } catch (err) {
      setError(err.message || 'Failed to update balance');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto relative">
      <button 
        onClick={onClose}
        className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
      >
        <FiX size={20} className="sm:w-6 sm:h-6" />
      </button>
      
      <h2 className="text-lg sm:text-xl font-semibold mb-4 pr-10 sm:pr-12">
        Manage Balance: <span className="text-gold">{user.name}</span>
      </h2>
      
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-300 mb-1">Available Balance:</p>
        <p className="text-xl sm:text-2xl font-semibold text-gold">
          ${Number(user.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 text-red-400 px-3 sm:px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {success && (
          <div className="bg-green-500 bg-opacity-10 text-green-400 px-3 sm:px-4 py-2 rounded-lg text-sm">
            Balance updated successfully!
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-3">Operation</label>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <label className="flex items-center justify-center p-3 sm:p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="operation"
                value="add"
                checked={operation === 'add'}
                onChange={(e) => setOperation(e.target.value)}
                disabled={loading}
                className="mr-2 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm sm:text-base">Add Funds</span>
            </label>
            <label className="flex items-center justify-center p-3 sm:p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="operation"
                value="subtract"
                checked={operation === 'subtract'}
                onChange={(e) => setOperation(e.target.value)}
                disabled={loading}
                className="mr-2 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm sm:text-base">Subtract Funds</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 sm:py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-base sm:text-sm border border-gray-600"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className={`w-full px-4 py-3 sm:py-2 rounded-lg transition-colors font-medium text-base sm:text-sm ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed'
              : operation === 'add'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </div>
          ) : operation === 'add' ? 'Add Funds' : 'Subtract Funds'}
        </button>
      </form>
    </div>
  );
};

export default BalanceManagementModal;