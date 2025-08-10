import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, user, loading: authLoading } = useContext(AuthContext);

  // Debug log
  useEffect(() => {
    console.log('AdminLogin: User state:', user);
    console.log('AdminLogin: Auth loading:', authLoading);
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the AuthContext login function
      const result = await login(credentials.username, credentials.password);

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // The login was successful, React state will handle the navigation
        // No need for page refresh - let Header component handle the redirect
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <motion.div 
        className="admin-login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="admin-login-header">
          <motion.div 
            className="admin-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Shield />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Admin Login
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Secure access to management dashboard
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
          <motion.div 
            className="admin-form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="admin-input"
              placeholder="Enter admin username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div 
            className="admin-form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="admin-input"
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !credentials.username || !credentials.password}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading && <div className="loading-spinner" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
