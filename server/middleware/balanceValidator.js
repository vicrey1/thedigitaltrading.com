const { calculateAvailableBalance } = require('../utils/balanceCalculator');

const validateBalance = (balance) => {
  if (balance === undefined || balance === null) return 0;
  return parseFloat(Number(balance).toFixed(2));
};

const validateBalanceConsistency = async function(userId) {
  try {
    const calculatedBalance = await calculateAvailableBalance(userId);
    const currentBalance = this.availableBalance || 0;
    
    // Allow small floating point differences (up to 1 cent)
    const difference = Math.abs(calculatedBalance - currentBalance);
    
    if (difference > 0.01) {
      console.warn(`Balance inconsistency detected for user ${userId}:`, {
        stored: currentBalance,
        calculated: calculatedBalance,
        difference: difference
      });
      
      // Auto-correct the balance to the calculated value
      this.availableBalance = calculatedBalance;
      
      // Log this correction for audit purposes
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: userId,
        action: 'balance_auto_correction',
        details: {
          previousBalance: currentBalance,
          correctedBalance: calculatedBalance,
          difference: difference,
          timestamp: new Date()
        },
        performedBy: 'system'
      });
    }
  } catch (error) {
    console.error('Error validating balance consistency:', error);
  }
};

module.exports = async function(next) {
  if (this.isModified('balance')) {
    this.balance = validateBalance(this.balance);
  }
  
  if (this.isModified('availableBalance')) {
    this.availableBalance = validateBalance(this.availableBalance);
    
    // Perform consistency check if we have a user ID
    if (this._id || this.id) {
      await validateBalanceConsistency.call(this, this._id || this.id);
    }
  }
  
  next();
};