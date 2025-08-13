import React, { useState, useContext } from 'react';
import { API_BASE_URL } from '../../config/api';
import { AuthContext } from '../../contexts/AuthContext';
import './Register.css';

const Register = ({ onSwitchToLogin, onClose }) => {
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

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
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
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
      const registrationData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        password: formData.password
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Account created successfully! Logging you in...');
        setMessageType('success');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        
        // Automatically log the user in
        try {
          const loginResult = await loginUser(registrationData.email, registrationData.password);
          if (loginResult.success) {
            setMessage('Registration successful! Welcome!');
            // Close modal or redirect to home after a delay
            setTimeout(() => {
              if (onClose) onClose();
            }, 1500);
          } else {
            setMessage('Account created successfully! Please log in to continue.');
            setTimeout(() => {
              if (onSwitchToLogin) onSwitchToLogin();
            }, 2000);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          setMessage('Account created successfully! Please log in to continue.');
          setTimeout(() => {
            if (onSwitchToLogin) onSwitchToLogin();
          }, 2000);
        }
      } else {
        setMessage(result.error || 'Failed to create account. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join PNJ Auto Body for appointment management</p>
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

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Enter your full name"
            />
          </div>

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
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter your phone number"
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
              placeholder="Password must be at least 6 characters"
            />
            <small className="password-hint">Password must be at least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Re-enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button 
                type="button" 
                className="link-button"
                onClick={onSwitchToLogin}
                disabled={isSubmitting}
              >
                Sign In
              </button>
            ) : (
              <span>Please contact support</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
