import React, { useState } from 'react';
import { SendIcon, RefreshCcw } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';
import './SendSmsModal.css';

/**
 * Modal component for sending/resending SMS notifications for appointments
 * @param {Object} props - Component props
 * @param {Object} props.appointment - The appointment object
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSuccess - Function to call on successful SMS sending
 */
const SendSmsModal = ({ appointment, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendSms = async (e) => {
    e.preventDefault();
    
    if (!appointment?.id) {
      setResult({
        success: false,
        error: 'Invalid appointment data'
      });
      return;
    }

    setIsSending(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setResult({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/appointments/${appointment.id}/send-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          customMessage: message.trim() || undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: 'SMS sent successfully',
          details: data
        });
        
        // Call onSuccess callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(data);
        }
        
        // Clear form
        setMessage('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to send SMS',
          details: data
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="sms-modal-overlay">
      <div className="sms-modal">
        <div className="sms-modal-header">
          <h3>Send SMS Notification</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="sms-modal-body">
          <div className="appointment-details">
            <p><strong>Customer:</strong> {appointment?.customerName}</p>
            <p><strong>Phone:</strong> {appointment?.phone}</p>
            <p><strong>Service:</strong> {appointment?.serviceType}</p>
          </div>
          
          <form onSubmit={handleSendSms}>
            <div className="form-group">
              <label htmlFor="custom-message">Custom Message (Optional)</label>
              <textarea
                id="custom-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter an optional custom message to include with the SMS notification"
                rows={4}
              />
              <p className="help-text">
                If left empty, the standard appointment confirmation message will be sent.
              </p>
            </div>
            
            {result && (
              <div className={`result-message ${result.success ? 'success' : 'error'}`}>
                {result.success ? (
                  <>
                    <span className="success-icon">✓</span>
                    {result.message}
                  </>
                ) : (
                  <>
                    <span className="error-icon">⚠</span>
                    {result.error}
                  </>
                )}
              </div>
            )}
            
            <div className="button-group">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                disabled={isSending}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="send-button" 
                disabled={isSending || !appointment?.phone}
              >
                {isSending ? (
                  <>
                    <RefreshCcw className="icon spinning" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendIcon className="icon" />
                    Send SMS
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendSmsModal;
