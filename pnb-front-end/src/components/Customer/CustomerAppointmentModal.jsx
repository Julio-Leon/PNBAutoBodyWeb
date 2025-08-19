import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Car, 
  FileText, 
  Save,
  CreditCard,
  Shield,
  Upload,
  Camera
} from 'lucide-react';
import './CustomerAppointmentModal.css';

const CustomerAppointmentModal = ({ appointment, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    serviceType: '',
    selectedServices: [],
    description: '',
    preferredDate: '',
    preferredTime: '',
    paymentMethod: 'insurance',
    insuranceCompany: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Service types that match the main appointment form
  const serviceTypes = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'mechanical', label: 'Mechanical Repairs' },
    { value: 'body', label: 'Body Repairs' }
  ];

  // Service options by type
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

  useEffect(() => {
    if (appointment) {
      // Format date for input field
      const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        
        let date;
        if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
          date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          date = new Date(dateValue);
        }
        
        if (!date || isNaN(date.getTime())) {
          return '';
        }
        
        return date.toISOString().split('T')[0];
      };

      // Handle legacy data vs new data structure
      const serviceType = appointment.serviceType || '';
      const selectedServices = appointment.selectedServices || [];
      
      // For backward compatibility, if there's a damageType but no serviceType/selectedServices
      // We'll map it to the body repair category
      let mappedServiceType = serviceType;
      let mappedSelectedServices = [...selectedServices];
      
      if (!serviceType && appointment.damageType) {
        mappedServiceType = 'body'; // Default to body repair if legacy damageType exists
        
        // Try to map the damage type to our new structure
        if (!selectedServices.length && appointment.damageType) {
          const damageTypes = appointment.damageType.split(',').map(type => type.trim());
          mappedSelectedServices = damageTypes.map(type => {
            // Map legacy damage types to new format
            const mapping = {
              'Collision Repair': 'Collision Damage',
              'Dent Repair': 'Dent Repair',
              'Scratch Repair': 'Scratch Repair',
              'Paint Touch-up': 'Paint Touch-up',
              'Bumper Repair': 'Bumper Repair',
              'Hail Damage': 'Hail Damage'
            };
            return mapping[type] || 'Other Body Damage';
          });
        }
      }

      setFormData({
        customerName: appointment.customerName || '',
        email: appointment.email || '',
        phone: appointment.phone || '',
        vehicleInfo: appointment.vehicleInfo || '',
        serviceType: mappedServiceType,
        selectedServices: mappedSelectedServices,
        description: appointment.description || '',
        preferredDate: formatDateForInput(appointment.preferredDate),
        preferredTime: appointment.preferredTime || '',
        paymentMethod: appointment.paymentMethod || 'insurance',
        insuranceCompany: appointment.insuranceCompany || ''
      });
    }
  }, [appointment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Form validation
      if (!formData.serviceType) {
        setError('Please select a service type.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.selectedServices || formData.selectedServices.length === 0) {
        setError('Please select at least one service.');
        setIsSubmitting(false);
        return;
      }
      
      // Create appointment data with new structure
      const appointmentData = {
        ...formData,
        // For backward compatibility
        damageType: formData.selectedServices.join(', ')
      };
      
      const result = await onSave(appointment.id, appointmentData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content appointment-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Edit Appointment</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-section">
              <h3><User size={20} /> Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="customerName">Full Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="readonly-field"
                    title="Personal information cannot be edited here. Update your account settings to change this."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="readonly-field"
                    title="Personal information cannot be edited here. Update your account settings to change this."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="readonly-field"
                    title="Personal information cannot be edited here. Update your account settings to change this."
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><Car size={20} /> Vehicle & Service Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vehicleInfo">Vehicle Information *</label>
                  <input
                    type="text"
                    id="vehicleInfo"
                    name="vehicleInfo"
                    value={formData.vehicleInfo}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020 Honda Civic"
                    required
                  />
                </div>
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
              </div>
              
              {formData.serviceType && (
                <div className="form-group full-width">
                  <label>Services Needed * (Select all that apply)</label>
                  <div className="service-options">
                    {serviceOptions[formData.serviceType]?.map((service) => (
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

            <div className="form-section">
              <h3><Calendar size={20} /> Scheduling</h3>
              <div className="form-grid">
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
                    <option value="">Select Time</option>
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

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-small" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerAppointmentModal;
