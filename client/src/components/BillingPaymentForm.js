import React, { useState, useEffect } from 'react';
import { getBillingStatus, payBillingFee, payAllBillingFees } from '../services/withdrawalAPI';
import './BillingPaymentForm.css';

const BillingPaymentForm = ({ onPaymentSuccess, onClose }) => {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [paymentMode, setPaymentMode] = useState('individual'); // 'individual' or 'bulk'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBillingStatus();
  }, []);

  const fetchBillingStatus = async () => {
    try {
      setLoading(true);
      const response = await getBillingStatus();
      setBillingData(response);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch billing status');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualPayment = async (withdrawalId) => {
    if (!pin || pin.length !== 6) {
      setError('Please enter a valid 6-digit PIN');
      return;
    }

    try {
      setPaymentLoading(true);
      setError('');
      const response = await payBillingFee(withdrawalId, pin);
      setSuccess(response.msg);
      setPin('');
      
      // Refresh billing status
      await fetchBillingStatus();
      
      if (onPaymentSuccess) {
        onPaymentSuccess(response);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBulkPayment = async () => {
    if (!pin || pin.length !== 6) {
      setError('Please enter a valid 6-digit PIN');
      return;
    }

    try {
      setPaymentLoading(true);
      setError('');
      const response = await payAllBillingFees(pin);
      setSuccess(response.msg);
      setPin('');
      
      // Refresh billing status
      await fetchBillingStatus();
      
      if (onPaymentSuccess) {
        onPaymentSuccess(response);
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalBillingFee = billingData?.pendingBillingWithdrawals?.reduce(
    (sum, withdrawal) => sum + withdrawal.billingFee, 0
  ) || 0;

  if (loading) {
    return (
      <div className="billing-payment-form">
        <div className="billing-header">
          <h3>Withdrawal Billing</h3>
          {onClose && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!billingData?.pendingBillingWithdrawals?.length) {
    return (
      <div className="billing-payment-form">
        <div className="billing-header">
          <h3>Withdrawal Billing</h3>
          {onClose && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>
        <div className="no-billing">
          <div className="no-billing-icon">✅</div>
          <h4>No Pending Billing Fees</h4>
          <p>You have no outstanding withdrawal billing fees to pay.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-payment-form">
      <div className="billing-header">
        <h3>Withdrawal Billing Payment</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      <div className="billing-summary">
        <div className="summary-item">
          <span className="label">Available Balance:</span>
          <span className="value">{formatCurrency(billingData.availableBalance)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Billing Balance:</span>
          <span className="value billing-amount">{formatCurrency(billingData.billingBalance)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Pending Withdrawals:</span>
          <span className="value">{billingData.pendingBillingWithdrawals.length}</span>
        </div>
      </div>

      <div className="payment-mode-selector">
        <button
          className={`mode-btn ${paymentMode === 'individual' ? 'active' : ''}`}
          onClick={() => setPaymentMode('individual')}
        >
          Pay Individual
        </button>
        <button
          className={`mode-btn ${paymentMode === 'bulk' ? 'active' : ''}`}
          onClick={() => setPaymentMode('bulk')}
        >
          Pay All ({formatCurrency(totalBillingFee)})
        </button>
      </div>

      {paymentMode === 'individual' && (
        <div className="individual-payments">
          <h4>Select Withdrawal to Pay</h4>
          <div className="withdrawals-list">
            {billingData.pendingBillingWithdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="withdrawal-item">
                <div className="withdrawal-info">
                  <div className="withdrawal-amount">
                    {formatCurrency(withdrawal.amount)} {withdrawal.currency}
                  </div>
                  <div className="withdrawal-details">
                    <span className="network">{withdrawal.network}</span>
                    <span className="date">{formatDate(withdrawal.createdAt)}</span>
                  </div>
                  <div className="billing-fee">
                    Billing Fee: {formatCurrency(withdrawal.billingFee)}
                  </div>
                </div>
                <button
                  className="pay-btn"
                  onClick={() => handleIndividualPayment(withdrawal._id)}
                  disabled={paymentLoading || billingData.availableBalance < withdrawal.billingFee}
                >
                  {paymentLoading ? 'Processing...' : 'Pay Fee'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {paymentMode === 'bulk' && (
        <div className="bulk-payment">
          <h4>Pay All Billing Fees</h4>
          <div className="bulk-summary">
            <p>
              You are about to pay billing fees for {billingData.pendingBillingWithdrawals.length} withdrawals
              totaling {formatCurrency(totalBillingFee)}.
            </p>
            <div className="bulk-withdrawals">
              {billingData.pendingBillingWithdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="bulk-withdrawal-item">
                  <span>{formatCurrency(withdrawal.amount)} {withdrawal.currency}</span>
                  <span>{formatCurrency(withdrawal.billingFee)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pin-section">
        <label htmlFor="billing-pin">Enter Withdrawal PIN</label>
        <input
          id="billing-pin"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit PIN"
          maxLength="6"
          className="pin-input"
        />
      </div>

      {paymentMode === 'bulk' && (
        <div className="payment-actions">
          <button
            className="pay-all-btn"
            onClick={handleBulkPayment}
            disabled={
              paymentLoading || 
              !pin || 
              pin.length !== 6 || 
              billingData.availableBalance < totalBillingFee
            }
          >
            {paymentLoading ? 'Processing Payment...' : `Pay All Fees (${formatCurrency(totalBillingFee)})`}
          </button>
          {billingData.availableBalance < totalBillingFee && (
            <p className="insufficient-balance">
              Insufficient balance. You need {formatCurrency(totalBillingFee - billingData.availableBalance)} more.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingPaymentForm;