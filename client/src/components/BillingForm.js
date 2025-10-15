import React, { useState, useEffect, useCallback } from 'react';
import { confirmBillingPayment, getWithdrawalBillingStatus } from '../services/withdrawalAPI';
import './BillingForm.css';

const BillingForm = ({ withdrawalData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [billingStatus, setBillingStatus] = useState(null);

  const fetchBillingStatus = useCallback(async () => {
    try {
      const response = await getWithdrawalBillingStatus(withdrawalData.withdrawal.id);
      setBillingStatus(response.withdrawal);
    } catch (err) {
      console.error('Error fetching billing status:', err);
    }
  }, [withdrawalData.withdrawal.id]);

  useEffect(() => {
    if (withdrawalData?.withdrawal?.id) {
      fetchBillingStatus();
    }
  }, [withdrawalData, fetchBillingStatus]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await confirmBillingPayment(withdrawalData.withdrawal.id);
      setSuccess(response.message);
      
      // Call onSuccess callback to refresh parent component
      if (onSuccess) {
        onSuccess(response.withdrawal);
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!withdrawalData) {
    return null;
  }

  const { 
    billingFee, 
    billingWalletAddress, 
    feeReason, 
    cryptoDetails 
  } = withdrawalData;

  return (
    <div className="billing-form-overlay">
      <div className="billing-form-modal">
        <div className="billing-form-header">
          <h2>Network Processing Fee Required</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="billing-form-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="withdrawal-summary">
            <h3>Withdrawal Summary</h3>
            <div className="summary-item">
              <span>Amount:</span>
              <span>${withdrawalData.requestedAmount}</span>
            </div>
            <div className="summary-item">
              <span>Currency:</span>
              <span>{cryptoDetails?.currency} ({cryptoDetails?.network})</span>
            </div>
            <div className="summary-item">
              <span>Status:</span>
              <span className={`status ${billingStatus?.status || 'pending_billing'}`}>
                {billingStatus?.status === 'pending_billing' ? 'Awaiting Fee Payment' : 
                 billingStatus?.status === 'pending' ? 'Pending Admin Approval' :
                 billingStatus?.status || 'Pending Billing'}
              </span>
            </div>
          </div>

          <div className="fee-section">
            <h3>Network Processing Fee</h3>
            <div className="fee-amount">
              <span className="fee-label">Fee Amount:</span>
              <span className="fee-value">${billingFee}</span>
              <span className="fee-percentage">(20% of withdrawal amount)</span>
            </div>
            <div className="fee-reason">
              <p>{feeReason}</p>
            </div>
          </div>

          {billingWalletAddress && (
            <div className="payment-section">
              <h3>Payment Instructions</h3>
              <p>Send the exact fee amount to the following wallet address:</p>
              
              <div className="wallet-address-container">
                <label>Wallet Address ({cryptoDetails?.currency} - {cryptoDetails?.network}):</label>
                <div className="wallet-address">
                  <input 
                    type="text" 
                    value={billingWalletAddress} 
                    readOnly 
                    className="address-input"
                  />
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(billingWalletAddress)}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="payment-warning">
                <p><strong>Important:</strong></p>
                <ul>
                  <li>Send exactly <strong>${billingFee}</strong> to the address above</li>
                  <li>Use the same network ({cryptoDetails?.network}) as your withdrawal</li>
                  <li>After sending, click "I've Paid the Fee" below</li>
                  <li>Your withdrawal will be processed after admin approval</li>
                </ul>
              </div>
            </div>
          )}

          <div className="billing-form-actions">
            <button 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="confirm-payment-btn" 
              onClick={handleConfirmPayment}
              disabled={loading || billingStatus?.billingPaid}
            >
              {loading ? 'Processing...' : 
               billingStatus?.billingPaid ? 'Payment Confirmed' : 
               "I've Paid the Fee"}
            </button>
          </div>

          {billingStatus?.billingPaid && (
            <div className="payment-confirmed">
              <p>✅ Payment confirmed! Your withdrawal is now pending admin approval.</p>
              <p>You will be notified once the withdrawal is processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingForm;