import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Calendar, CreditCard, Shield, Phone, Mail, User, Camera, FileText } from 'lucide-react';
import './Appointment.css';
import { API_BASE_URL } from '../../config/api';

const Appointment = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    damageType: '',
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

  const damageTypes = [
    'Collision Damage',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      // Create JSON payload instead of FormData for better backend compatibility
      const appointmentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicleInfo: formData.vehicleInfo,
        damageType: formData.damageType,
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        insuranceCompany: formData.paymentMethod === 'insurance' ? formData.insuranceCompany : null,
        isUrgent: false
      };

      console.log('Sending appointment data:', appointmentData);

      // Submit to backend
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('Thank you! Your appointment request has been submitted successfully. We will contact you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          vehicleInfo: '',
          damageType: '',
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
              <div className="form-group">
                <label htmlFor="vehicleInfo">Vehicle Information</label>
                <input
                  type="text"
                  id="vehicleInfo"
                  name="vehicleInfo"
                  value={formData.vehicleInfo}
                  onChange={handleInputChange}
                  placeholder="Year, Make, Model (e.g., 2020 Honda Civic)"
                />
              </div>
            </div>
          </div>

          {/* Damage Information */}
          <div className="form-section">
            <h3><FileText size={20} /> Damage Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="damageType">Type of Damage *</label>
                <select
                  id="damageType"
                  name="damageType"
                  value={formData.damageType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select damage type</option>
                  {damageTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label htmlFor="description">Damage Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Please describe the damage in detail..."
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
