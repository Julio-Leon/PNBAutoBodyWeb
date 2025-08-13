import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, User, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import './UnifiedLogin.css';

const UnifiedLogin = ({ onClose, onSwitchToRegister }) => {
  const [loginType, setLoginType] = useState('customer'); // Default to customer login
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, userLogin, user, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    console.log('UnifiedLogin: User state:', user);
    console.log('UnifiedLogin: Auth loading:', authLoading);
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setCredentials({
      username: '',
      email: '',
      password: ''
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (loginType === 'admin') {
      if (!credentials.username.trim() || !credentials.password) {
        setError('Please fill in all fields');
        return false;
      }
    } else {
      if (!credentials.email.trim() || !credentials.password) {
        setError('Please fill in all fields');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (loginType === 'admin') {
        // Admin login
        result = await login(credentials.username, credentials.password);
      } else {
        // Customer login
        result = await userLogin(credentials.email.trim().toLowerCase(), credentials.password);
      }

      if (result.success) {
        setSuccess(`${loginType === 'admin' ? 'Admin' : 'Customer'} login successful! ${loginType === 'admin' ? 'Redirecting to dashboard...' : 'Welcome back.'}`);
        
        // Handle different close behaviors
        if (loginType === 'admin') {
          // Admin login - let the app handle the redirect
          // No onClose needed as the app will navigate to admin dashboard
        } else {
          // Customer login - close modal after delay
          setTimeout(() => {
            if (onClose) onClose();
          }, 1500);
        }
      } else {
        setError(result.error || `${loginType === 'admin' ? 'Admin' : 'Customer'} login failed`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-login">
      <motion.div 
        className="unified-login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Close button for modal mode */}
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}

        {/* Login type selector */}
        <motion.div 
          className="login-type-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            className={`type-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => handleLoginTypeChange('customer')}
            disabled={loading}
          >
            <User size={18} />
            Customer
          </button>
          <button 
            className={`type-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => handleLoginTypeChange('admin')}
            disabled={loading}
          >
            <Shield size={18} />
            Admin
          </button>
        </motion.div>

        <div className="unified-login-header">
          <motion.div 
            className={`login-icon ${loginType}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {loginType === 'admin' ? <Shield /> : <User />}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {loginType === 'admin' ? 'Admin Login' : 'Customer Login'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {loginType === 'admin' 
              ? 'Secure access to management dashboard' 
              : 'Access your appointments and account'
            }
          </motion.p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle size={18} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {loginType === 'admin' ? (
              <motion.div 
                key="admin-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="unified-input"
                    placeholder="Enter admin username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="customer-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="unified-input"
                    placeholder="Enter your email address"
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="unified-input"
                placeholder={`Enter ${loginType} password`}
                value={credentials.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className={`unified-login-btn ${loginType}`}
            disabled={loading || (loginType === 'admin' ? (!credentials.username || !credentials.password) : (!credentials.email || !credentials.password))}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading && <div className="loading-spinner" />}
            {loading ? 'Signing In...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Customer'}`}
          </motion.button>
        </form>

        {/* Footer only for customer login */}
        {loginType === 'customer' && (
          <motion.div 
            className="unified-login-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              Don't have a customer account?{' '}
              {onSwitchToRegister ? (
                <button 
                  type="button" 
                  className="link-button"
                  onClick={onSwitchToRegister}
                  disabled={loading}
                >
                  Create Account
                </button>
              ) : (
                <span>Contact support to register</span>
              )}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UnifiedLogin;
