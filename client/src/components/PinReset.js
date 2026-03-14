import React, { useState } from 'react';
import { FiLock, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { requestPinReset, resetPin } from '../services/withdrawalAPI';
import './PinManager.css';

const PinReset = () => {
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

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
        setResetStep(1);
        setResetCode('');
        setNewPin('');
        setConfirmNewPin('');
      } else {
        setResetError(response.msg || 'Failed to reset PIN');
      }
    } catch (err) {
      setResetError(err.response?.data?.msg || err.message || 'Failed to reset PIN');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="pin-manager">
      <div className="pin-form">
        {resetStep === 1 ? (
          <div className="reset-step">
            <p className="mb-4 text-gray-400">If you've forgotten your PIN, we can help you reset it. A reset code will be sent to your registered email address.</p>
            <button
              className="reset-pin-btn w-full"
              onClick={handleRequestReset}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Sending Reset Code...
                </>
              ) : (
                <>
                  <FiLock />
                  Reset Withdrawal PIN
                </>
              )}
            </button>
          </div>
        ) : (
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
              className="set-pin-btn w-full"
              onClick={handleResetPin}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Resetting PIN...
                </>
              ) : (
                'Reset PIN'
              )}
            </button>

            <button
              className="reset-pin-btn mt-2"
              onClick={() => {
                setResetStep(1);
                setResetCode('');
                setNewPin('');
                setConfirmNewPin('');
                setResetMessage('');
                setResetError('');
              }}
            >
              Back
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
  );
};

export default PinReset;