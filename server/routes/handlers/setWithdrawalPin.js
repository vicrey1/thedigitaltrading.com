const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Middleware to add debug logging
const debugLog = (req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  console.log('Request Body:', req.body);
  console.log('Auth Header:', req.headers.authorization);
  next();
};

// Set withdrawal PIN handler
const setWithdrawalPin = async (req, res) => {
  try {
    const { pin, confirmPin } = req.body;
    console.log('Setting withdrawal PIN for user:', req.user.id);
    
    // Validate PIN format
    if (!pin || !/^[0-9]{6}$/.test(pin)) {
      console.log('Invalid PIN format');
      return res.status(400).json({ 
        success: false, 
        msg: 'PIN must be exactly 6 digits and contain only numbers.' 
      });
    }
    
    // Validate PIN confirmation if provided
    if (confirmPin && pin !== confirmPin) {
      console.log('PIN confirmation mismatch');
      return res.status(400).json({ 
        success: false, 
        msg: 'PIN and confirmation PIN do not match.' 
      });
    }
    
    // Explicitly select withdrawalPin field
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      console.error('User not found for PIN set:', req.user.id);
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Check if PIN is being updated
    const isUpdate = user.withdrawalPin && user.withdrawalPin.length > 0;
    console.log('Is PIN update?', isUpdate);
    
    user.withdrawalPin = pin;
    await user.save();
    
    console.log('PIN set successfully');
    res.json({ 
      success: true, 
      msg: isUpdate ? 'Withdrawal PIN updated successfully.' : 'Withdrawal PIN set successfully.',
      isUpdate 
    });
  } catch (err) {
    console.error('Error setting withdrawal PIN:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
};

// Register route
router.post('/set-withdrawal-pin', [auth, debugLog], setWithdrawalPin);

module.exports = router;