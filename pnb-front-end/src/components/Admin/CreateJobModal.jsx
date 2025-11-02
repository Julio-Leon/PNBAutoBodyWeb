import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Car, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  DollarSign,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import './CreateJobModal.css';

const CreateJobModal = ({ onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleInfo: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleVin: '',
    serviceType: '',
    description: '',
    estimatedCost: '',
    estimatedDuration: '',
    priority: 'normal',
    status: 'pending'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Customer Information validation
      if (!formData.customerName.trim()) {
        newErrors.customerName = 'Customer name is required';
      }
      if (!formData.customerPhone.trim()) {
        newErrors.customerPhone = 'Phone number is required';
      }
    } else if (step === 2) {
      // Vehicle Information validation
      if (!formData.vehicleInfo.trim() && (!formData.vehicleMake || !formData.vehicleModel)) {
        newErrors.vehicleInfo = 'Vehicle information is required';
      }
    } else if (step === 3) {
      // Job Details validation
      if (!formData.serviceType.trim()) {
        newErrors.serviceType = 'Service type is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Job description is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }

    if (!formData.vehicleInfo.trim() && (!formData.vehicleMake || !formData.vehicleModel)) {
      newErrors.vehicleInfo = 'Vehicle information is required';
    }

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Combine vehicle info if individual fields are used
      const jobData = {
        ...formData,
        vehicleInfo: formData.vehicleInfo || 
          `${formData.vehicleYear} ${formData.vehicleMake} ${formData.vehicleModel}`.trim()
      };
      
      onSubmit(jobData);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map((step) => (
        <div key={step} className="step-item">
          <div className={`step-circle ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
            {currentStep > step ? '✓' : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Customer'}
            {step === 2 && 'Vehicle'}
            {step === 3 && 'Job Details'}
          </div>
          {step < 3 && <div className={`step-line ${currentStep > step ? 'completed' : ''}`} />}
        </div>
      ))}
    </div>
  );

  const renderCustomerStep = () => (
    <motion.div
      key="customer-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="form-step"
    >
      <div className="form-section">
        <h3 className="section-title">
          <User size={20} />
          Customer Information
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customerName">
              Customer Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="John Doe"
              className={errors.customerName ? 'error' : ''}
              autoFocus
            />
            {errors.customerName && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.customerName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className={errors.customerPhone ? 'error' : ''}
            />
            {errors.customerPhone && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.customerPhone}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="customerEmail">Email Address</label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="john.doe@example.com"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderVehicleStep = () => (
    <motion.div
      key="vehicle-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="form-step"
    >
      <div className="form-section">
        <h3 className="section-title">
          <Car size={20} />
          Vehicle Information
        </h3>
        
        <div className="form-group">
          <label htmlFor="vehicleInfo">
            Vehicle Description <span className="required">*</span>
          </label>
          <input
            type="text"
            id="vehicleInfo"
            name="vehicleInfo"
            value={formData.vehicleInfo}
            onChange={handleChange}
            placeholder="e.g., 2020 Toyota Camry"
            className={errors.vehicleInfo ? 'error' : ''}
            autoFocus
          />
          {errors.vehicleInfo && (
            <span className="error-message">
              <AlertCircle size={14} />
              {errors.vehicleInfo}
            </span>
          )}
          <span className="helper-text">Or fill in the details below</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vehicleYear">Year</label>
            <input
              type="text"
              id="vehicleYear"
              name="vehicleYear"
              value={formData.vehicleYear}
              onChange={handleChange}
              placeholder="2020"
              maxLength="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleMake">Make</label>
            <input
              type="text"
              id="vehicleMake"
              name="vehicleMake"
              value={formData.vehicleMake}
              onChange={handleChange}
              placeholder="Toyota"
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleModel">Model</label>
            <input
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleChange}
              placeholder="Camry"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="vehicleVin">VIN (Optional)</label>
          <input
            type="text"
            id="vehicleVin"
            name="vehicleVin"
            value={formData.vehicleVin}
            onChange={handleChange}
            placeholder="1HGBH41JXMN109186"
            maxLength="17"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderJobDetailsStep = () => (
    <motion.div
      key="job-details-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="form-step"
    >
      <div className="form-section">
        <h3 className="section-title">
          <FileText size={20} />
          Job Details
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="serviceType">
              Service Type <span className="required">*</span>
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={errors.serviceType ? 'error' : ''}
              autoFocus
            >
              <option value="">Select service type</option>
              <option value="collision-repair">Collision Repair</option>
              <option value="dent-removal">Dent Removal</option>
              <option value="painting">Painting</option>
              <option value="frame-straightening">Frame Straightening</option>
              <option value="glass-repair">Glass Repair</option>
              <option value="detailing">Detailing</option>
              <option value="other">Other</option>
            </select>
            {errors.serviceType && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.serviceType}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Job Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the work that needs to be done..."
            rows="4"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && (
            <span className="error-message">
              <AlertCircle size={14} />
              {errors.description}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estimatedCost">
              <DollarSign size={16} />
              Estimated Cost
            </label>
            <input
              type="number"
              id="estimatedCost"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estimatedDuration">
              <Clock size={16} />
              Estimated Duration (days)
            </label>
            <input
              type="number"
              id="estimatedDuration"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="create-job-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="header-content">
            <FileText className="header-icon" />
            <h2>Create New Job</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="modal-form">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderCustomerStep()}
            {currentStep === 2 && renderVehicleStep()}
            {currentStep === 3 && renderJobDetailsStep()}
          </AnimatePresence>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            
            <div className="step-buttons">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn-nav btn-previous" 
                  onClick={handlePrevious}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button 
                  type="button" 
                  className="btn-nav btn-next" 
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" className="submit-button">
                  Create Job
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateJobModal;
