import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './UserLogin.css';

const UserLogin = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const { userLogin } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage(''); // Clear message when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate form
    if (!formData.email.trim() || !formData.password) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await userLogin(formData.email.trim().toLowerCase(), formData.password);

      if (result.success) {
        setMessage('Login successful! Welcome back.');
        setMessageType('success');
        
        // Close modal after a short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        setMessage(result.error || 'Login failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-login-container">
      <div className="user-login-card">
        <div className="user-login-header">
          <h2>Sign In</h2>
          <p>Access your appointments and account</p>
          {onClose && (
            <button className="close-button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-login-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="user-login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="user-login-footer">
          <p>
            Don't have an account?{' '}
            {onSwitchToRegister ? (
              <button 
                type="button" 
                className="link-button"
                onClick={onSwitchToRegister}
                disabled={isSubmitting}
              >
                Create Account
              </button>
            ) : (
              <span>Contact support to register</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
