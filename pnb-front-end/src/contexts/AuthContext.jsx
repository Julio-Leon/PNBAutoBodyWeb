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
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken');
      
      if (adminToken) {
        // Check admin authentication
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // Ensure admin role is set properly
          const adminUser = data.data;
          if (adminUser && !adminUser.role) {
            adminUser.role = 'admin';
          }
          setUser(adminUser); // Admin user data is directly in data.data
          console.log('Admin user authenticated:', adminUser);
        } else {
          localStorage.removeItem('adminToken');
          setUser(null);
        }
      } else if (userToken) {
        // Check user authentication
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem('userToken');
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
          localStorage.removeItem('userToken');
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
        console.log('Admin login response:', data);
        
        // Fix: The token is in data.data.token, not data.token
        const adminToken = data.data?.token || data.token;
        const adminUser = data.data?.user || data.data;
        
        localStorage.setItem('adminToken', adminToken);
        
        // Ensure admin role is set properly
        if (adminUser && !adminUser.role) {
          adminUser.role = 'admin';
        }
        
        setUser(adminUser);
        console.log('Admin logged in:', adminUser);
        console.log('Admin token stored:', adminToken);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const userLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userToken', data.data.token);
        setUser(data.data.user);
        return { success: true, data: data.data };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const forceReset = () => {
    // Clear all potential auth-related data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    setUser(null);
    setLoading(false);
  };

  const updateUserProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, error: 'Authentication error. Please log in again.' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        // Update the local user state with the new data
        setUser(prevUser => ({
          ...prevUser,
          ...data.user
        }));
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to update profile' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };
  
  // Refresh user data from server
  const refreshUser = async () => {
    try {
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to refresh user data' };
    }
  };

  const value = {
    user,
    login,
    userLogin,
    logout,
    forceReset,
    loading,
    updateUserProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
