import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Calendar, CreditCard, Shield, Phone, Mail, User, Camera, FileText, Car } from 'lucide-react';
import './Appointment.css';
import './phone-warning.css';
import { API_BASE_URL } from '../../config/api';
import { AuthContext } from '../../contexts/AuthContext';

const Appointment = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    vehicleId: '', // New field for selected vehicle ID
    serviceType: '',
    selectedServices: [],
    description: '',
    paymentMethod: 'insurance',
    insuranceCompany: '',
    preferredDate: '',
    preferredTime: '',
    photos: []
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [userVehicles, setUserVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // State for phone number notification
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);

  // Auto-fill user information when user is logged in
  useEffect(() => {
    if (user && user.role === 'customer') {
      // Log user data to help with debugging
      console.log('User data for appointment form:', {
        fullName: user.fullName,
        name: user.name,
        customerName: user.customerName,
        email: user.email,
        phone: user.phone,
        hasPhone: !!user.phone
      });
      
      // Check if the user has a phone number
      if (!user.phone) {
        setShowPhoneWarning(true);
      } else {
        setShowPhoneWarning(false);
      }
      
      setFormData(prev => ({
        ...prev,
        name: user.fullName || user.name || user.customerName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
      // Fetch user vehicles for logged-in customers
      fetchUserVehicles();
    }
  }, [user]);

  const fetchUserVehicles = async () => {
    if (!user || user.role !== 'customer') {
      return;
    }
    
    setVehiclesLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserVehicles(data.data || []);
      } else {
        console.error('Failed to fetch vehicles, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const serviceTypes = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'mechanical', label: 'Mechanical Repairs' },
    { value: 'body', label: 'Body Repairs' }
  ];

  const serviceOptions = {
    maintenance: [
      'Tune-up',
      'Tires',
      'Oil Change',
      'Inspections'
    ],
    mechanical: [
      'Engine Problems',
      'Transmission Issues',
      'Brake System',
      'Electrical Problems',
      'Cooling System',
      'Exhaust System',
      'Suspension & Steering',
      'Air Conditioning',
      'Battery & Charging',
      'Other Mechanical'
    ],
    body: [
      'Collision Damage',
      'Dent Repair',
      'Scratch Repair',
      'Paint Touch-up',
      'Bumper Repair',
      'Hail Damage',
      'Other Body Damage'
    ]
  };

  const insuranceCompanies = [
    'State Farm',
    'Geico',
    'Progressive',
    'Allstate',
    'USAA',
    'Farmers',
    'Liberty Mutual',
    'Nationwide',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If vehicle is selected from dropdown, update both vehicleId and vehicleInfo
    if (name === 'vehicleId' && value) {
      const selectedVehicle = userVehicles.find(vehicle => vehicle.id === value);
      if (selectedVehicle) {
        setFormData(prev => ({
          ...prev,
          vehicleId: value,
          vehicleInfo: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
        }));
        return;
      }
    }
    
    // If vehicleId is cleared (empty option selected), clear vehicleInfo too
    if (name === 'vehicleId' && !value) {
      setFormData(prev => ({
        ...prev,
        vehicleId: '',
        vehicleInfo: ''
      }));
      return;
    }
    
    // Handle service type change - reset selected services when service type changes
    if (name === 'serviceType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        selectedServices: []
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceSelection = (service) => {
    setFormData(prev => {
      const currentServices = prev.selectedServices || [];
      const isSelected = currentServices.includes(service);
      
      if (isSelected) {
        // Remove service if already selected
        return {
          ...prev,
          selectedServices: currentServices.filter(s => s !== service)
        };
      } else {
        // Add service if not selected
        return {
          ...prev,
          selectedServices: [...currentServices, service]
        };
      }
    });
  };

  const handleFileUpload = (files) => {
    const newPhotos = Array.from(files).slice(0, 5); // Limit to 5 photos
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 5)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Validate that logged-in customers must select a vehicle
      if (user && user.role === 'customer') {
        if (!formData.vehicleId || !formData.vehicleInfo) {
          setSubmitMessage('Please select a vehicle from your garage before submitting.');
          setIsSubmitting(false);
          return;
        }
        
        if (userVehicles.length === 0) {
          setSubmitMessage('You must add vehicles to your account before booking an appointment. Please go to your Dashboard → Vehicles tab to add a vehicle first.');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate service selection
      if (!formData.serviceType) {
        setSubmitMessage('Please select a service type.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.selectedServices || formData.selectedServices.length === 0) {
        setSubmitMessage('Please select at least one service.');
        setIsSubmitting(false);
        return;
      }

      // Create JSON payload instead of FormData for better backend compatibility
      const appointmentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicleInfo: formData.vehicleInfo,
        vehicleId: formData.vehicleId || null, // Include selected vehicle ID
        serviceType: formData.serviceType,
        selectedServices: formData.selectedServices,
        damageType: formData.selectedServices.join(', '), // For backward compatibility
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        insuranceCompany: formData.paymentMethod === 'insurance' ? formData.insuranceCompany : null,
        isUrgent: false
      };

      console.log('Sending appointment data:', appointmentData);

      // Get user token if available
      const userToken = localStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      // Submit to backend
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (response.ok) {
        const smsMessage = user?.uid ? ' You will receive a confirmation via email and SMS shortly.' : '';
        setSubmitMessage(`Thank you! Your appointment request has been submitted successfully.${smsMessage} We will contact you soon.`);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicleInfo: '',
          vehicleId: '', // Reset selected vehicle
          serviceType: '',
          selectedServices: [],
          description: '',
          paymentMethod: 'insurance',
          insuranceCompany: '',
          preferredDate: '',
          preferredTime: '',
          photos: []
        });
      } else {
        setSubmitMessage(result.error || 'Failed to submit appointment. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="appointment-section" id="appointment">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2>Schedule Your Repair</h2>
          <p>Get a free estimate and book your appointment today</p>
        </motion.div>

        <motion.form 
          className="appointment-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Contact Information */}
          <div className="form-section">
            <h3><User size={20} /> Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  readOnly={user && user.role === 'customer'}
                  className={user && user.role === 'customer' ? 'readonly-field' : ''}
                  title={user && user.role === 'customer' ? 'This field is auto-filled from your account' : ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  readOnly={user && user.role === 'customer'}
                  className={user && user.role === 'customer' ? 'readonly-field' : ''}
                  title={user && user.role === 'customer' ? 'This field is auto-filled from your account' : ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number * <small>(for appointment updates via SMS)</small></label>
                <div className="phone-field-container">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                    pattern="^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"
                    required
                    readOnly={user && user.role === 'customer'}
                    className={user && user.role === 'customer' ? 'readonly-field' : ''}
                    title={user && user.role === 'customer' ? 'This field is auto-filled from your account' : 'Enter a valid phone number for SMS appointment updates'}
                  />
                  {user && user.role === 'customer' && !formData.phone && (
                    <div className="missing-phone-warning">
                      <span className="warning-icon">⚠️</span>
                      <span>
                        Add a phone number to your profile to receive SMS notifications.
                        <button 
                          type="button" 
                          className="profile-link-button" 
                          onClick={() => window.location.hash = '#profile-settings?from=appointment'}
                        >
                          Update Profile
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="vehicleInfo">Vehicle Information *</label>
                {user && user.role === 'customer' ? (
                  <div>
                    {vehiclesLoading ? (
                      <div style={{ 
                        color: '#666', 
                        fontSize: '14px', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Car size={14} />
                        Loading your vehicles...
                      </div>
                    ) : userVehicles.length === 0 ? (
                      <div style={{ 
                        color: '#dc3545', 
                        fontSize: '14px', 
                        marginBottom: '8px',
                        padding: '12px',
                        backgroundColor: '#f8d7da',
                        borderRadius: '6px',
                        border: '1px solid #dc3545',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Car size={14} />
                        <strong>You must add vehicles to your account first!</strong> Go to your Dashboard → Vehicles tab → Add Vehicle to continue.
                      </div>
                    ) : null}
                    
                    {userVehicles.length > 0 ? (
                      <select
                        id="vehicleId"
                        name="vehicleId"
                        value={formData.vehicleId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a vehicle from your garage *</option>
                        {userVehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                            {vehicle.licensePlate ? ` (${vehicle.licensePlate})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select disabled>
                        <option>No vehicles available - Add vehicles first</option>
                      </select>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    id="vehicleInfo"
                    name="vehicleInfo"
                    value={formData.vehicleInfo}
                    onChange={handleInputChange}
                    placeholder="Year, Make, Model (e.g., 2020 Honda Civic)"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="form-section">
            <h3><FileText size={20} /> Service Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="serviceType">Type of Service *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              {formData.serviceType && (
                <div className="form-group full-width">
                  <label>Services Needed * (Select all that apply)</label>
                  <div className="service-options">
                    {serviceOptions[formData.serviceType].map((service) => (
                      <label 
                        key={service} 
                        className={`service-option ${formData.selectedServices.includes(service) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedServices.includes(service)}
                          onChange={() => handleServiceSelection(service)}
                        />
                        <span className="checkmark"></span>
                        {service}
                      </label>
                    ))}
                  </div>
                  {formData.selectedServices.length === 0 && (
                    <small className="service-hint">Please select at least one service</small>
                  )}
                </div>
              )}
              
              <div className="form-group full-width">
                <label htmlFor="description">
                  {formData.serviceType === 'maintenance' ? 'Additional Details' : 
                   formData.serviceType === 'mechanical' ? 'Problem Description' : 
                   'Damage Description'}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={
                    formData.serviceType === 'maintenance' ? 'Any specific maintenance needs or concerns...' : 
                    formData.serviceType === 'mechanical' ? 'Please describe the mechanical problem in detail...' : 
                    'Please describe the damage in detail...'
                  }
                />
              </div>
            </div>
          </div>

          {/* Photo Upload - Temporarily disabled while using JSON submission */}
          {false && (
          <div className="form-section">
            <h3><Camera size={20} /> Upload Photos</h3>
            <div 
              className={`photo-upload ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                hidden
              />
              <label htmlFor="photos" className="upload-area">
                <Upload size={32} />
                <h4>Upload Damage Photos</h4>
                <p>Drag & drop photos here or click to browse</p>
                <span>Up to 5 photos, JPG or PNG</span>
              </label>
              
              {formData.photos.length > 0 && (
                <div className="photo-preview">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Damage photo ${index + 1}`} 
                      />
                      <button 
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="remove-photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Payment Method */}
          <div className="form-section">
            <h3><CreditCard size={20} /> Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="insurance"
                  checked={formData.paymentMethod === 'insurance'}
                  onChange={handleInputChange}
                />
                <div className="option-content">
                  <Shield size={20} />
                  <span>Insurance Claim</span>
                </div>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="outofpocket"
                  checked={formData.paymentMethod === 'outofpocket'}
                  onChange={handleInputChange}
                />
                <div className="option-content">
                  <CreditCard size={20} />
                  <span>Out of Pocket</span>
                </div>
              </label>
            </div>

            {formData.paymentMethod === 'insurance' && (
              <div className="form-group">
                <label htmlFor="insuranceCompany">Insurance Company</label>
                <select
                  id="insuranceCompany"
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleInputChange}
                >
                  <option value="">Select your insurance company</option>
                  {insuranceCompanies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Preferred Date & Time */}
          <div className="form-section">
            <h3><Calendar size={20} /> Preferred Appointment Date & Time</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredDate">Preferred Date *</label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time *</label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select time</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <motion.div
              className={`submit-message ${submitMessage.includes('Thank you') ? 'success' : 'error'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {submitMessage}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? 'Submitting...' : 'Request Free Estimate'}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

export default Appointment;
