import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false); // Prevent concurrent auth checks

  useEffect(() => {
    // Delay initial auth check slightly to ensure API is ready
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous auth checks
    if (isChecking) {
      return;
    }

    setIsChecking(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Increase timeout and add better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem('adminToken');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Don't clear token on timeout - it might just be a network hiccup during fast refresh
      } else {
        // Only clear auth on actual auth failures, not network issues
        if (error.message && error.message.includes('401')) {
          localStorage.removeItem('adminToken');
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.data.token);
        setUser(data.data.user);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  const forceReset = () => {
    // Clear all potential auth-related data
    localStorage.removeItem('adminToken');
    sessionStorage.clear();
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    login,
    logout,
    forceReset,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
