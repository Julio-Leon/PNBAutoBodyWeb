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
  Shield
} from 'lucide-react';

const CustomerAppointmentModal = ({ appointment, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    paymentMethod: 'insurance',
    insuranceCompany: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const damageTypes = [
    'Collision Repair',
    'Dent Repair',
    'Scratch Repair',
    'Paint Touch-up',
    'Bumper Repair',
    'Hail Damage',
    'Other'
  ];

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

      setFormData({
        customerName: appointment.customerName || '',
        email: appointment.email || '',
        phone: appointment.phone || '',
        vehicleInfo: appointment.vehicleInfo || '',
        serviceType: appointment.serviceType || appointment.damageType || '',
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await onSave(appointment.id, formData);
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
                  <label htmlFor="serviceType">Service Type *</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Service Type</option>
                    {damageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please describe the damage or service needed"
                  rows="3"
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
                  <label htmlFor="preferredTime">Preferred Time</label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
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
              <h3><CreditCard size={20} /> Payment Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method *</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="insurance">Insurance</option>
                    <option value="personal">Personal Payment</option>
                  </select>
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
                      <option value="">Select Insurance Company</option>
                      {insuranceCompanies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
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
