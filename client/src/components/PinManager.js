import React, { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiShield, FiRefreshCw } from 'react-icons/fi';
import { setWithdrawalPin, checkPinStatus, requestPinReset, resetPin } from '../services/withdrawalAPI';
import './PinManager.css';

const PinManager = ({ onPinSet, showTitle = true }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasPinSet, setHasPinSet] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    checkCurrentPinStatus();
  }, []);

  const checkCurrentPinStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await checkPinStatus();
      setHasPinSet(response.hasPinSet);
    } catch (err) {
      console.error('Error checking PIN status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const validatePin = (pinValue) => {
    if (!pinValue || pinValue.length !== 6) {
      return 'PIN must be exactly 6 digits';
    }
    if (!/^[0-9]{6}$/.test(pinValue)) {
      return 'PIN must contain only numbers';
    }
    const weakPins = ['000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '123456', '654321'];
    if (weakPins.includes(pinValue)) {
      return 'Please choose a stronger PIN. Avoid sequential or repeated numbers';
    }
    return null;
  };

  const handleSetPin = async () => {
    setMessage('');
    setError('');

    // Validate PIN
    const pinError = validatePin(pin);
    if (pinError) {
      setError(pinError);
      return;
    }

    // Check confirmation
    if (pin !== confirmPin) {
      setError('PIN and confirmation PIN do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await setWithdrawalPin(pin, confirmPin);
      
      if (response.success) {
        setMessage(response.msg);
        setPin('');
        setConfirmPin('');
        setHasPinSet(true);
        
        if (onPinSet) {
          onPinSet(response);
        }
      } else {
        setError(response.msg || 'Failed to set PIN');
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    try {
      setResetLoading(true);
      setResetError('');
      setResetMessage('');
      
      await requestPinReset();
      setResetMessage('Reset code sent to your email');
      setResetStep(2);
    } catch (err) {
      setResetError(err.response?.data?.msg || err.message || 'Failed to send reset code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPin = async () => {
    setResetError('');
    setResetMessage('');

    // Validate new PIN
    const pinError = validatePin(newPin);
    if (pinError) {
      setResetError(pinError);
      return;
    }

    // Check confirmation
    if (newPin !== confirmNewPin) {
      setResetError('PIN and confirmation PIN do not match');
      return;
    }

    if (!resetCode || resetCode.length !== 6) {
      setResetError('Please enter the 6-digit reset code');
      return;
    }

    try {
      setResetLoading(true);
      const response = await resetPin(resetCode, newPin);
      
      if (response.success) {
        setResetMessage(response.msg);
        setShowResetModal(false);
        setResetStep(1);
        setResetCode('');
        setNewPin('');
        setConfirmNewPin('');
        setHasPinSet(true);
        setMessage('PIN reset successfully!');
      } else {
        setResetError(response.msg || 'Failed to reset PIN');
      }
    } catch (err) {
      setResetError(err.response?.data?.msg || err.message || 'Failed to reset PIN');
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setResetCode('');
    setNewPin('');
    setConfirmNewPin('');
    setResetMessage('');
    setResetError('');
  };

  if (checkingStatus) {
    return (
      <div className="pin-manager">
        <div className="pin-status-check">
          <FiRefreshCw className="animate-spin" />
          <span>Checking PIN status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pin-manager">
      {showTitle && (
        <div className="pin-manager-header">
          <FiShield className="pin-icon" />
          <h3>Withdrawal PIN Management</h3>
        </div>
      )}

      <div className="pin-status">
        <div className={`status-indicator ${hasPinSet ? 'set' : 'not-set'}`}>
          {hasPinSet ? (
            <>
              <FiCheck className="status-icon" />
              <span>Withdrawal PIN is set</span>
            </>
          ) : (
            <>
              <FiX className="status-icon" />
              <span>No withdrawal PIN set</span>
            </>
          )}
        </div>
      </div>

      <div className="pin-form">
        <div className="form-group">
          <label htmlFor="pin">
            {hasPinSet ? 'Update Withdrawal PIN' : 'Set Withdrawal PIN'}
          </label>
          <div className="pin-input-container">
            <input
              id="pin"
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit PIN"
              maxLength="6"
              className="pin-input"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPin">Confirm PIN</label>
          <div className="pin-input-container">
            <input
              id="confirmPin"
              type={showConfirmPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Confirm 6-digit PIN"
              maxLength="6"
              className="pin-input"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowConfirmPin(!showConfirmPin)}
            >
              {showConfirmPin ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="pin-strength-info">
          <h4>PIN Requirements:</h4>
          <ul>
            <li className={pin.length === 6 ? 'valid' : ''}>
              <FiCheck className="check-icon" />
              Exactly 6 digits
            </li>
            <li className={/^[0-9]+$/.test(pin) && pin.length > 0 ? 'valid' : ''}>
              <FiCheck className="check-icon" />
              Numbers only
            </li>
            <li className={pin && !['000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '123456', '654321'].includes(pin) ? 'valid' : ''}>
              <FiCheck className="check-icon" />
              No sequential or repeated numbers
            </li>
            <li className={pin === confirmPin && pin.length === 6 ? 'valid' : ''}>
              <FiCheck className="check-icon" />
              Confirmation matches
            </li>
          </ul>
        </div>

        <div className="pin-actions">
          <button
            className="set-pin-btn"
            onClick={handleSetPin}
            disabled={loading || pin.length !== 6 || confirmPin.length !== 6}
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin" />
                {hasPinSet ? 'Updating...' : 'Setting...'}
              </>
            ) : (
              <>
                <FiLock />
                {hasPinSet ? 'Update PIN' : 'Set PIN'}
              </>
            )}
          </button>

          {hasPinSet && (
            <button
              className="reset-pin-btn"
              onClick={() => setShowResetModal(true)}
            >
              <FiRefreshCw />
              Reset PIN
            </button>
          )}
        </div>

        {message && (
          <div className="message success">
            <FiCheck />
            {message}
          </div>
        )}

        {error && (
          <div className="message error">
            <FiX />
            {error}
          </div>
        )}
      </div>

      {/* Reset PIN Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="reset-modal">
            <div className="modal-header">
              <h3>Reset Withdrawal PIN</h3>
              <button className="close-btn" onClick={closeResetModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              {resetStep === 1 && (
                <div className="reset-step">
                  <p>A reset code will be sent to your registered email address.</p>
                  <button
                    className="request-code-btn"
                    onClick={handleRequestReset}
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>
                </div>
              )}

              {resetStep === 2 && (
                <div className="reset-step">
                  <div className="form-group">
                    <label htmlFor="resetCode">Reset Code</label>
                    <input
                      id="resetCode"
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      className="reset-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPin">New PIN</label>
                    <input
                      id="newPin"
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter new 6-digit PIN"
                      maxLength="6"
                      className="reset-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmNewPin">Confirm New PIN</label>
                    <input
                      id="confirmNewPin"
                      type="password"
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Confirm new 6-digit PIN"
                      maxLength="6"
                      className="reset-input"
                    />
                  </div>

                  <button
                    className="reset-submit-btn"
                    onClick={handleResetPin}
                    disabled={resetLoading || resetCode.length !== 6 || newPin.length !== 6 || confirmNewPin.length !== 6}
                  >
                    {resetLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset PIN'
                    )}
                  </button>
                </div>
              )}

              {resetMessage && (
                <div className="message success">
                  <FiCheck />
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="message error">
                  <FiX />
                  {resetError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PinManager;