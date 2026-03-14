// server/routes/withdrawal.js
console.log('Withdrawal route loaded');

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const { getCryptoUSDPrices } = require('../utils/cryptoRates');

// Create withdrawal request
router.post('/', auth, async (req, res) => {
  try {
    console.log('[WITHDRAWAL API] Incoming request:', req.body);
    const { amount, currency, network, address, pin } = req.body;
    const userId = req.user.id;

    // Validate all required fields
    if (!amount || !currency || !network || !address || !pin) {
      return res.status(400).json({ 
        success: false,
        msg: 'Please provide all required fields including PIN' 
      });
    }

    // Parse and validate amount
    const requestedAmount = parseFloat(Number(amount).toFixed(2));
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid withdrawal amount' 
      });
    }

    // Get user with withdrawal PIN - explicitly select the PIN field
    const user = await User.findById(userId).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Debug log to check PIN values
    console.log('[WITHDRAWAL API] PIN Check:', {
      hasPin: !!user.withdrawalPin,
      suppliedPin: pin,
      matches: user.withdrawalPin === pin
    });

    // Verify PIN
    if (!user.withdrawalPin) {
      return res.status(400).json({ 
        success: false,
        msg: 'No withdrawal PIN set. Please set a PIN first.' 
      });
    }

    if (user.withdrawalPin !== pin) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid withdrawal PIN. Please check your PIN and try again.' 
      });
    }

    // Set initial values and calculate billing fee
    const requestedCurrency = 'USD';
    let cryptoCurrency = '';
    let cryptoAmount = 0;
    let conversionRate = 1;
    const billingFee = parseFloat((requestedAmount * 0.20).toFixed(2)); // 20% billing fee

    // Get conversion rates
    const rates = await getCryptoUSDPrices();

    // Validate currency and get conversion rate
    if (currency === 'BTC' || network === 'BTC') {
      conversionRate = rates.BTC;
      cryptoCurrency = 'BTC';
    } else if (currency === 'ETH' || network === 'ERC20') {
      conversionRate = rates.ETH;
      cryptoCurrency = 'ETH';
    } else if (currency === 'BNB' || network === 'BEP20') {
      conversionRate = rates.BNB;
      cryptoCurrency = 'BNB';
    } else if (currency === 'USDT' || network === 'USDT') {
      conversionRate = rates.USDT;
      cryptoCurrency = 'USDT';
    } else {
      return res.status(400).json({ 
        success: false,
        msg: 'Unsupported currency or network.' 
      });
    }

    // Calculate crypto amount with 8 decimal precision
    cryptoAmount = parseFloat((requestedAmount / conversionRate).toFixed(8));

    // Get current balance with 2 decimal precision
    const currentBalance = parseFloat((user.availableBalance || 0).toFixed(2));

    // Verify sufficient balance for withdrawal
    if (currentBalance < requestedAmount) {
      return res.status(400).json({ 
        success: false,
        msg: 'Insufficient balance for withdrawal.',
        needed: requestedAmount,
        available: currentBalance
      });
    }

    // STEP 1: Create withdrawal record first
    const newWithdrawal = new Withdrawal({
      userId: userId,
      amount: requestedAmount,
      currency: cryptoCurrency,
      network,
      walletAddress: address,
      status: 'pending_billing',
      billingFee: billingFee,
      billingPaid: false,
      fee: 0
    });

    try {
      // Save withdrawal record
      await newWithdrawal.save();
      
        // Deduct withdrawal amount from available balance immediately
        user.availableBalance = parseFloat((currentBalance - requestedAmount).toFixed(2));
        // Track billing fee that needs to be paid
        user.billingBalance = parseFloat(((user.billingBalance || 0) + billingFee).toFixed(2));
        await user.save();

      console.log('[WITHDRAWAL API] Withdrawal initiated:', {
        withdrawalId: newWithdrawal._id,
        userId: user._id,
        amount: requestedAmount,
        cryptoAmount,
        currency: cryptoCurrency,
        network,
        billingFee,
        previousBalance: currentBalance,
        newBalance: user.availableBalance
      });

      // Get appropriate wallet address for billing payment
      const getWalletKey = (currency, network) => {
        if (currency === 'USDT') {
          return network === 'ERC20' ? 'usdt_erc20' : 'usdt_trc20';
        } else if (currency === 'USDC') {
          return network === 'ERC20' ? 'usdc_erc20' : 'usdc_trc20';
        } else {
          return currency.toLowerCase();
        }
      };

      const walletKey = getWalletKey(cryptoCurrency, network);
      const billingWalletAddress = user.wallets[walletKey]?.address || '';

      // Return success response
      res.json({
        success: true,
        message: 'Withdrawal request created. Please pay the network processing fee to proceed.',
        withdrawal: newWithdrawal,
        requestedAmount,
        cryptoDetails: {
          currency: cryptoCurrency,
          network,
          rate: conversionRate,
          usdValue: requestedAmount,
          cryptoAmount: cryptoAmount.toFixed(8)
        },
        billingFee,
        billingRequired: true,
        billingWalletAddress,
        feeReason: 'Network Processing Fee - Required to cover blockchain transaction costs and network fees.',
        billingBalance: user.billingBalance
      });

    } catch (e) {
      // If balance update fails, roll back by deleting the withdrawal
      if (newWithdrawal._id) {
        await Withdrawal.findByIdAndDelete(newWithdrawal._id);
      }
      console.error('[WITHDRAWAL API] Error processing withdrawal:', e);
      return res.status(500).json({ 
        success: false,
        msg: 'Server error processing withdrawal request' 
      });
    }
  } catch (err) {
    console.error('[WITHDRAWAL API] Error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error',
      error: err.message 
    });
  }
});

// Pay billing fee endpoint
router.post('/pay-billing/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Find the withdrawal that needs billing payment
    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      userId: req.user.id,
      status: 'pending_billing',
      billingPaid: false
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        msg: 'Withdrawal not found or billing already paid'
      });
    }

    // Mark billing as paid
    withdrawal.billingPaid = true;
    withdrawal.billingPaidAt = new Date();
    withdrawal.status = 'pending'; // Ready for admin processing
    await withdrawal.save();

    // Update billing balance tracking
    user.billingBalance = Math.max(0, (user.billingBalance || 0) - withdrawal.billingFee);
    await user.save();

    res.json({
      success: true,
  msg: 'Billing fee payment confirmed. Status: Withdrawal Pending.',
      withdrawal,
    });
  } catch (err) {
    console.error('[PAY BILLING] Error:', err);
    res.status(500).json({ success: false, msg: 'Failed to confirm billing payment' });
  }
});
router.post('/confirm/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { pin } = req.body;

    // Validate PIN
    if (!pin || !/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({ 
        success: false,
        msg: 'PIN must be exactly 6 digits' 
      });
    }

    // Get user with withdrawal PIN
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    if (!user.withdrawalPin || user.withdrawalPin !== pin) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid withdrawal PIN' 
      });
    }

    // Find the pending withdrawal
    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      userId: req.user.id,
      status: 'pending_billing',
      billingPaid: false
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        msg: 'Withdrawal not found or already confirmed'
      });
    }

    // Get current balance with 2 decimal precision
    const currentBalance = parseFloat((user.availableBalance || 0).toFixed(2));

    // Verify sufficient balance
    if (currentBalance < withdrawal.amount) {
      return res.status(400).json({ 
        success: false,
        msg: 'Insufficient balance for withdrawal.',
        needed: withdrawal.amount,
        available: currentBalance
      });
    }

    // Deduct withdrawal amount from available balance
    user.availableBalance = parseFloat((currentBalance - withdrawal.amount).toFixed(2));
    
    // Update withdrawal status
    withdrawal.status = 'pending_billing';  // Proceed to billing step
    
    console.log('[WITHDRAWAL API] Withdrawal confirmed:', {
      withdrawalId: withdrawal._id,
      userId: user._id,
      amount: withdrawal.amount,
      previousBalance: currentBalance,
      newBalance: user.availableBalance
    });

    await Promise.all([
      withdrawal.save(),
      user.save()
    ]);

    res.json({
      success: true,
      msg: 'Withdrawal confirmed. Please proceed with billing payment.',
      withdrawal,
      remainingBalance: user.availableBalance,
      billingFee: withdrawal.billingFee
    });

  } catch (err) {
    console.error('[WITHDRAWAL API] Error confirming withdrawal:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Server error',
      error: err.message 
    });
  }
});

// Pay all pending billing fees
router.post('/pay-all-billing', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    // Verify PIN
    if (!/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        msg: 'PIN must be exactly 6 digits.'
      });
    }

    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    if (!user.withdrawalPin || user.withdrawalPin !== pin) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid withdrawal PIN'
      });
    }

    // Get all pending billing withdrawals
    const pendingBillingWithdrawals = await Withdrawal.find({
      userId: req.user.id,
      status: 'pending_billing',
      billingPaid: false
    });

    if (pendingBillingWithdrawals.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'No pending billing fees to pay'
      });
    }

    // Calculate total billing fees
    const totalBillingFee = pendingBillingWithdrawals.reduce((sum, w) => sum + w.billingFee, 0);

    // Update billing balance tracking
    user.billingBalance = Math.max(0, (user.billingBalance || 0) - totalBillingFee);
    await user.save();

    // Mark all withdrawals as paid
    const updatePromises = pendingBillingWithdrawals.map(withdrawal => {
      withdrawal.billingPaid = true;
      withdrawal.billingPaidAt = new Date();
      withdrawal.status = 'pending';
      return withdrawal.save();
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
  msg: `All billing fees paid successfully. ${pendingBillingWithdrawals.length} withdrawals are now Withdrawal Pending.`,
      paidWithdrawals: pendingBillingWithdrawals.length,
      totalPaid: totalBillingFee,
      remainingBillingBalance: user.billingBalance,
      remainingAvailableBalance: user.availableBalance
    });

  } catch (err) {
    console.error('[WITHDRAWAL API] Error processing bulk billing payment:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get billing status for a specific withdrawal
router.get('/billing-status/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const userId = req.user.id;

    const withdrawal = await Withdrawal.findOne({ 
      _id: withdrawalId, 
      userId: userId 
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    // Get billing wallet address if available
    const user = await User.findById(userId);
    const getWalletKey = (currency, network) => {
      if (currency === 'USDT') {
        return network === 'ERC20' ? 'usdt_erc20' : 'usdt_trc20';
      } else if (currency === 'USDC') {
        return network === 'ERC20' ? 'usdc_erc20' : 'usdc_trc20';
      } else {
        return currency.toLowerCase();
      }
    };

    let billingWalletAddress = '';
    try {
      const walletKey = getWalletKey(withdrawal.currency, withdrawal.network);
      billingWalletAddress = user?.wallets?.[walletKey]?.address || '';
    } catch (e) {
      billingWalletAddress = '';
    }

    res.json({
      success: true,
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        network: withdrawal.network,
        status: withdrawal.status,
        billingFee: withdrawal.billingFee,
        billingPaid: withdrawal.billingPaid,
        billingPaidAt: withdrawal.billingPaidAt,
        billingWalletAddress,
        createdAt: withdrawal.createdAt
      }
    });

  } catch (err) {
    console.error('[WITHDRAWAL API] Error getting billing status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Verify withdrawal PIN endpoint
router.post('/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;
    
    // Validate PIN format
    if (!pin || !/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'PIN must be exactly 6 digits' 
      });
    }
    
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    // Check if user has set a PIN
    if (!user.withdrawalPin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'No withdrawal PIN set. Please set a PIN first.',
        requiresPinSetup: true 
      });
    }
    
    // Debug log to check PIN values
    console.log('[WITHDRAWAL API] Verify PIN:', {
      hasPin: !!user.withdrawalPin,
      suppliedPin: pin,
      matches: user.withdrawalPin === pin
    });
    
    // Verify PIN
    if (user.withdrawalPin !== pin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid withdrawal PIN. Please check your PIN and try again.' 
      });
    }
    
    res.json({
      success: true,
      msg: 'PIN verified successfully.'
    });
  } catch (err) {
    console.error('Error verifying withdrawal PIN:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Set withdrawal PIN endpoint
router.post('/set-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    // Validate PIN format
    if (!pin || !/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        msg: 'PIN must be exactly 6 digits'
      });
    }

    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    // Set the new PIN
    user.withdrawalPin = pin;
    await user.save();

    res.json({
      success: true,
      msg: 'Withdrawal PIN set successfully.'
    });
  } catch (err) {
    console.error('Error setting withdrawal PIN:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Get PIN status endpoint
router.get('/pin-status', auth, async (req, res) => {
  try {
    console.log('[WITHDRAWAL API] Checking PIN status for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      console.log('[WITHDRAWAL API] User not found during PIN status check:', req.user.id);
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    const hasPinSet = !!user.withdrawalPin;
    console.log('[WITHDRAWAL API] PIN status result:', {
      userId: req.user.id,
      hasPinSet
    });
    
    res.json({ 
      success: true, 
      hasPinSet,
      msg: hasPinSet ? 'Withdrawal PIN is set' : 'No withdrawal PIN set'
    });
  } catch (err) {
    console.error('[WITHDRAWAL API] Error checking PIN status:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Reset withdrawal PIN using security question
router.post('/reset-pin', auth, async (req, res) => {
  try {
    const { securityAnswer, newPin } = req.body;

    if (!securityAnswer || !newPin) {
      return res.status(400).json({
        success: false,
        msg: 'Security answer and new PIN are required'
      });
    }

    // Validate PIN format
    if (!/^[0-9]{6}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        msg: 'PIN must be exactly 6 digits'
      });
    }

    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    // Verify security answer
    if (user.securityAnswer !== securityAnswer) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid security answer'
      });
    }

    // Set new PIN
    user.withdrawalPin = newPin;
    await user.save();

    res.json({
      success: true,
      msg: 'Withdrawal PIN reset successfully'
    });
  } catch (err) {
    console.error('[WITHDRAWAL API] Error resetting withdrawal PIN:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

// Request email-based PIN reset
router.post('/request-pin-reset', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset code
    user.pinResetCode = resetCode;
    user.pinResetExpiry = resetExpiry;
    await user.save();

    // Send reset code via email
    await sendMail({
      to: user.email,
      subject: 'Withdrawal PIN Reset Code',
      text: `Your withdrawal PIN reset code is: ${resetCode}. This code will expire in 10 minutes.`
    });

    res.json({
      success: true,
      msg: 'PIN reset code sent to your email'
    });
  } catch (err) {
    console.error('[WITHDRAWAL API] Error requesting PIN reset:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;