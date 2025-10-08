import React, { useState, useContext, useEffect } from 'react';
import { User, Phone, Mail, Save, AlertTriangle, Moon, Sun } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [redirectToAppointment, setRedirectToAppointment] = useState(false);

  useEffect(() => {
    // Check if redirected from appointment page
    if (window.location.hash.includes('from=appointment')) {
      setRedirectToAppointment(true);
    }

    if (user) {
      console.log('ProfileSettings - User Data:', JSON.stringify(user));
      
      // Initialize form with current user data
      setFormData({
        email: user.email || '',
        phone: user.phone || ''
      });
      
      // Make sure we have firstName and lastName
      if (!user.firstName && !user.lastName) {
        console.warn('User is missing both firstName and lastName', user);
      }
    }
  }, [user]);
  
  // Dark mode effect
  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Apply dark mode class to document root
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Format phone number for display
  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      return '';
    }
    
    let formatted = '';
    
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    return formatted;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const sanitizedValue = digitsOnly.slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Clear any previous error messages
      const errorContainer = document.querySelector('.profile-message.error');
      if (errorContainer) {
        errorContainer.remove();
      }
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        return;
      }

      // Extract names properly or use dummy values if they don't exist
      let firstName = "User";
      let lastName = "Account";
      
      // Only try to use fullName if it exists and contains at least one space
      if (user?.fullName && user.fullName.includes(" ")) {
        const nameParts = user.fullName.split(" ");
        firstName = nameParts[0] || "User";
        lastName = nameParts.slice(1).join(" ") || "Account"; // Join all remaining parts as lastName
      }
      
      // Log detailed submission data for debugging
      console.log('PROFILE UPDATE - Current user email:', user?.email);
      console.log('PROFILE UPDATE - New email to submit:', formData.email);
      console.log('PROFILE UPDATE - Email changed:', user?.email !== formData.email);
      console.log('PROFILE UPDATE - Using names:', firstName, lastName);
      console.log('Submitting profile update with data:', {
        phone: formData.phone, 
        email: formData.email,
        firstName: firstName,
        lastName: lastName
      });
      
      // Ensure email is properly trimmed and lowercase to avoid comparison issues
      const trimmedEmail = formData.email.trim().toLowerCase();
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone,
          email: trimmedEmail, // Use the trimmed email
          firstName: firstName,
          lastName: lastName
        })
      });

      const data = await response.json();
      
      // Debug the server response
      console.log('PROFILE UPDATE - Server response:', data);
      console.log('PROFILE UPDATE - Email updated flag:', data.emailUpdated);
      console.log('PROFILE UPDATE - Response user email:', data.data?.email);

      // Log detailed error information for debugging
      if (!response.ok) {
        console.error('Profile update failed:', data);
        
        // Handle specific errors with custom user-friendly messages
        if (data.error) {
          if (typeof data.error === 'string') {
            if (data.error.includes('name are required') || data.error.includes('name information')) {
              console.error('Name requirement error detected, but we sent dummy names');
              setMessage({
                type: 'error',
                text: 'Profile update failed. Please contact support if this problem persists.'
              });
              return;
            }
            
            if (data.error.includes('Email already in use')) {
              setMessage({
                type: 'error',
                text: 'This email is already in use by another account.'
              });
              return;
            }
          }
          
          // Handle validation errors from express-validator
          if (data.details && Array.isArray(data.details)) {
            const errorMessages = data.details.map(err => err.msg).join(', ');
            setMessage({
              type: 'error',
              text: `Validation failed: ${errorMessages}`
            });
            return;
          }
        }
      }
      
      if (response.ok) {
        // ALWAYS check if email was modified regardless of what the backend reports
        const isEmailModified = trimmedEmail.toLowerCase() !== (user?.email || '').toLowerCase();
        const isPhoneModified = formData.phone !== user?.phone;
        
        // If email was modified OR the backend reports it was updated, always force login
        if (isEmailModified || data.emailUpdated) {
          console.log('Email change detected! Forcing logout and redirect to login page');
          console.log(`From: ${user?.email} To: ${trimmedEmail}`);
          console.log('Backend emailUpdated flag:', data.emailUpdated);
          
          // Make sure the success message is shown
          setMessage({ 
            type: 'success', 
            text: 'Email updated successfully! You will be redirected to the login page in a few seconds.'
          });
          
          // Important: Store the new email in multiple places to ensure it persists
          sessionStorage.setItem('updatedEmail', trimmedEmail);
          localStorage.setItem('updatedEmail', trimmedEmail);
          
          // Store the timestamp of when the email was updated
          localStorage.setItem('emailUpdateTime', Date.now().toString());
          
          // Clear token to force re-login with the new email
          setTimeout(() => {
            localStorage.removeItem('userToken');
            // Use replaceState to ensure the URL parameters are set correctly
            window.history.replaceState({}, document.title, '/?newEmail=true');
            window.location.href = '/?newEmail=true&email=' + encodeURIComponent(trimmedEmail);
          }, 3000);
        } else if (isPhoneModified) {
          setMessage({ 
            type: 'success', 
            text: 'Phone number updated successfully! This information will be used for appointment notifications.'
          });
          
          // Regular profile update - just refresh
          setTimeout(() => {
            if (redirectToAppointment) {
              // Redirect back to appointment page
              window.location.hash = '#appointment';
            } else {
              window.location.reload();
            }
          }, 1500);
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Profile updated successfully!'
          });
          
          // Regular profile update - just refresh
          setTimeout(() => {
            if (redirectToAppointment) {
              // Redirect back to appointment page
              window.location.hash = '#appointment';
            } else {
              window.location.reload();
            }
          }, 1500);
        }
      }
      else {
        console.error('Profile update failed:', data);
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to update profile. Please try again.'
        });
      }
    } catch (error) {
      console.error('Profile update exception:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-header">
        <div className="header-content">
          <h2><User size={24} /> Profile Settings</h2>
          <p>Update your contact information for notifications and login</p>
        </div>
        <button 
          onClick={toggleDarkMode} 
          className="theme-toggle-button"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <div className="name-info-section">
        <User size={18} className="name-icon" />
        <div className="name-label">Name:</div>
        <div className="name-value">
          {user?.fullName || user?.email || 'Not available'}
        </div>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.type === 'error' ? (
            <AlertTriangle size={20} />
          ) : (
            <div className="success-icon">✓</div>
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* We don't need hidden fields for firstName and lastName as we're not updating them */}
        
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-grid">
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="field-help-text">This email will be used for login after changes.</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number <span className="highlight">(for SMS notifications)</span></label>
              <div className="input-container">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone ? formatPhoneNumber(formData.phone) : ''}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  disabled={isSubmitting}
                />
              </div>
              <p className="field-help-text">
                Enter your 10-digit phone number to receive SMS notifications about your appointments
              </p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
