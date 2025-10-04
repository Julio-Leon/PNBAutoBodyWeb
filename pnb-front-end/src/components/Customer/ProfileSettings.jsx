import React, { useState, useContext, useEffect } from 'react';
import { User, Phone, Mail, Save, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [redirectToAppointment, setRedirectToAppointment] = useState(false);

  useEffect(() => {
    // Check if redirected from appointment page
    if (window.location.hash.includes('from=appointment')) {
      setRedirectToAppointment(true);
    }

    if (user) {
      // Initialize form with current user data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully! Your information will be used for appointments and notifications.'
        });
        
        // Update local storage with new user data if needed
        // This depends on how your auth system works
        
        // Refresh the page after a delay to update context
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
          type: 'error', 
          text: data.error || 'Failed to update profile. Please try again.'
        });
      }
    } catch (error) {
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
        <h2><User size={24} /> Profile Settings</h2>
        <p>Update your personal information and notification preferences</p>
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
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Your first name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Your last name"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="readonly-input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <p className="field-help-text">Email cannot be changed. Contact support if needed.</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number <span className="highlight">(for SMS notifications)</span></label>
              <div className="input-container">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  pattern="^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"
                  disabled={isSubmitting}
                />
              </div>
              <p className="field-help-text">
                Add your phone number to receive SMS notifications for appointments
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
