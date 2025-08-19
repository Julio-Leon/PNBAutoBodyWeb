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
  Image as ImageIcon,
  CreditCard,
  Shield
} from 'lucide-react';
import './AppointmentModal.css';

const AppointmentModal = ({ appointment, mode, onClose, onUpdate }) => {
  // Helper function to format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    let jsDate;
    
    // Handle Firestore Timestamp objects
    if (date && typeof date === 'object' && date.toDate) {
      jsDate = date.toDate();
    }
    // Handle JavaScript Date objects
    else if (date instanceof Date) {
      jsDate = date;
    }
    // Handle date strings
    else if (typeof date === 'string') {
      jsDate = new Date(date);
    }
    else {
      return '';
    }
    
    // Check if date is valid
    if (!jsDate || isNaN(jsDate.getTime())) return '';
    
    // Format date using local timezone to avoid offset issues
    // Use getFullYear, getMonth, getDate to get local date components
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const [editData, setEditData] = useState({
    customerName: appointment.customerName || '',
    email: appointment.email || '',
    phone: appointment.phone || '',
    serviceType: appointment.serviceType || '',
    selectedServices: appointment.selectedServices || [],
    vehicleInfo: appointment.vehicleInfo || '',
    preferredDate: formatDateForInput(appointment.preferredDate),
    preferredTime: appointment.preferredTime || '',
    paymentMethod: appointment.paymentMethod || 'insurance',
    insuranceCompany: appointment.insuranceCompany || '',
    status: appointment.status || 'pending',
    message: appointment.description || appointment.message || '' // Check both fields
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Service types
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
  
  // Insurance companies
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
  
  // Process appointment data on component mount
  useEffect(() => {
    // Handle legacy data vs new data structure for service type and selected services
    let mappedServiceType = appointment.serviceType || '';
    let mappedSelectedServices = appointment.selectedServices || [];
    
    // For backward compatibility, if there's a damageType but no serviceType/selectedServices
    // We'll map it to the body repair category
    if (!mappedServiceType && appointment.damageType) {
      mappedServiceType = 'body'; // Default to body repair if legacy damageType exists
      
      // Try to map the damage type to our new structure
      if (!mappedSelectedServices.length && appointment.damageType) {
        const damageTypes = appointment.damageType.split(',').map(type => type.trim());
        mappedSelectedServices = damageTypes.map(type => {
          // Map legacy damage types to new format
          const mapping = {
            'Collision Repair': 'Collision Damage',
            'Dent Repair': 'Dent Repair',
            'Scratch Repair': 'Scratch Repair',
            'Paint Touch-up': 'Paint Touch-up',
            'Bumper Repair': 'Bumper Repair',
            'Hail Damage': 'Hail Damage',
            'Paint Services': 'Paint Touch-up',
            'Auto Detailing': 'Other Body Damage',
            'Insurance Claims': 'Other Body Damage'
          };
          return mapping[type] || 'Other Body Damage';
        });
      }
    }

    // Update editData with the mapped values
    setEditData(prev => ({
      ...prev,
      serviceType: mappedServiceType,
      selectedServices: mappedSelectedServices
    }));
  }, [appointment]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle radio buttons and checkboxes
    if (type === 'checkbox') {
      // This is handled separately in the JSX for service selection
      return;
    } else if (type === 'radio') {
      // For radio buttons, just use the value
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // If changing from insurance to self-pay, clear insurance company
      if (name === 'paymentMethod' && value === 'self') {
        setEditData(prev => ({
          ...prev,
          insuranceCompany: ''
        }));
      }
    } else {
      // For regular inputs
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!editData.customerName || !editData.email || !editData.phone || !editData.preferredDate) {
        throw new Error('Please fill out all required fields');
      }
      
      // If service type is selected but no services are selected
      if (editData.serviceType && (!editData.selectedServices || editData.selectedServices.length === 0)) {
        throw new Error('Please select at least one service');
      }
      
      // If payment method is insurance but no company is selected
      if (editData.paymentMethod === 'insurance' && !editData.insuranceCompany) {
        throw new Error('Please select an insurance company');
      }
      
      // Prepare data for submission - maintain backward compatibility
      const updatedData = {
        ...editData
      };
      
      // Add damageType field for backward compatibility
      if (editData.selectedServices && editData.selectedServices.length > 0) {
        updatedData.damageType = editData.selectedServices.join(', ');
      }
      
      console.log('AppointmentModal - Sending update data:', JSON.stringify(updatedData, null, 2));
      console.log('Selected services:', editData.selectedServices);
      console.log('Service type:', editData.serviceType);
      
      await onUpdate(updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError(error.message || 'An error occurred while updating the appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEditing = mode === 'edit';

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content appointment-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {isEditing ? 'Edit Appointment' : 'Appointment Details'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="appointment-form">
            <div className="form-section">
              <h3>Customer Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="customerName"
                      value={editData.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <div className="form-display">{appointment.customerName || 'N/A'}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="form-display">{appointment.phone || 'N/A'}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="form-display">{appointment.email || 'N/A'}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Service Details</h3>
              <div className="form-group">
                <label>
                  <Car size={16} />
                  Vehicle Information
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="vehicleInfo"
                    value={editData.vehicleInfo}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020 Honda Civic"
                  />
                ) : (
                  <div className="form-display">{appointment.vehicleInfo || 'N/A'}</div>
                )}
              </div>
              
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>
                      <Car size={16} />
                      Service Type
                    </label>
                    <div className="service-type-selection">
                      {serviceTypes.map(type => (
                        <div 
                          key={type.value}
                          className={`service-type-option ${editData.serviceType === type.value ? 'selected' : ''}`}
                          onClick={() => setEditData(prev => ({
                            ...prev,
                            serviceType: type.value
                          }))}
                        >
                          {type.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {editData.serviceType && (
                    <div className="form-group">
                      <label>
                        <Car size={16} />
                        Select Services Needed
                      </label>
                      <div className="service-options">
                        {serviceOptions[editData.serviceType]?.map(service => (
                          <div className="service-checkbox" key={service}>
                            <input
                              type="checkbox"
                              id={`service-${service}`}
                              checked={editData.selectedServices.includes(service)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setEditData(prev => ({
                                  ...prev,
                                  selectedServices: isChecked
                                    ? [...prev.selectedServices, service]
                                    : prev.selectedServices.filter(s => s !== service)
                                }));
                              }}
                            />
                            <label htmlFor={`service-${service}`}>{service}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>
                      <Car size={16} />
                      Service Type
                    </label>
                    <div className="form-display">
                      {serviceTypes.find(t => t.value === appointment.serviceType)?.label || appointment.serviceType || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <Car size={16} />
                      Selected Services
                    </label>
                    <div className="form-display">
                      {appointment.selectedServices && appointment.selectedServices.length > 0
                        ? appointment.selectedServices.join(', ')
                        : appointment.damageType || 'N/A'}
                    </div>
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>
                  <CreditCard size={16} />
                  Payment Method
                </label>
                {isEditing ? (
                  <div className="payment-options">
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="payment-insurance"
                        name="paymentMethod"
                        value="insurance"
                        checked={editData.paymentMethod === 'insurance'}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="payment-insurance">Insurance</label>
                    </div>
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="payment-self"
                        name="paymentMethod"
                        value="self"
                        checked={editData.paymentMethod === 'self'}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="payment-self">Self-Pay</label>
                    </div>
                  </div>
                ) : (
                  <div className="form-display">
                    {appointment.paymentMethod === 'insurance' ? 'Insurance' : 
                     appointment.paymentMethod === 'self' ? 'Self-Pay' : 
                     appointment.paymentMethod || 'N/A'}
                  </div>
                )}
              </div>
              
              {(isEditing && editData.paymentMethod === 'insurance') && (
                <div className="form-group">
                  <label>
                    <Shield size={16} />
                    Insurance Company
                  </label>
                  <select
                    name="insuranceCompany"
                    value={editData.insuranceCompany}
                    onChange={handleInputChange}
                  >
                    <option value="">Select insurance company</option>
                    {insuranceCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {(!isEditing && appointment.paymentMethod === 'insurance' && appointment.insuranceCompany) && (
                <div className="form-group">
                  <label>
                    <Shield size={16} />
                    Insurance Company
                  </label>
                  <div className="form-display">
                    {appointment.insuranceCompany}
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Appointment Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Preferred Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="preferredDate"
                      value={editData.preferredDate}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="form-display">{formatDate(appointment.preferredDate)}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Preferred Time
                  </label>
                  {isEditing ? (
                    <select
                      name="preferredTime"
                      value={editData.preferredTime}
                      onChange={handleInputChange}
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
                  ) : (
                    <div className="form-display">{appointment.preferredTime || 'N/A'}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div className={`status-badge ${appointment.status || 'pending'}`}>
                    {appointment.status || 'pending'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label>
                  <FileText size={16} />
                  Message/Description
                </label>
                {isEditing ? (
                  <textarea
                    name="message"
                    value={editData.message}
                    onChange={handleInputChange}
                    placeholder="Additional details about the service needed..."
                    rows="4"
                  />
                ) : (
                  <div className="form-display message-display">
                    {appointment.description || appointment.message || 'No additional message provided.'}
                  </div>
                )}
              </div>
            </div>

            {appointment.photoUrls && appointment.photoUrls.length > 0 && (
              <div className="form-section">
                <h3>
                  <ImageIcon size={16} />
                  Uploaded Photos
                </h3>
                <div className="photo-gallery">
                  {appointment.photoUrls.map((url, index) => (
                    <div key={index} className="photo-item">
                      <img src={url} alt={`Damage photo ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="appointment-metadata">
              <p><strong>Appointment ID:</strong> {appointment.id}</p>
              <p><strong>Created:</strong> {appointment.createdAt ? formatDate(appointment.createdAt) : 'N/A'}</p>
              {appointment.updatedAt && (
                <p><strong>Last Updated:</strong> {formatDate(appointment.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="modal-footer">
            {error && <div className="error-message">{error}</div>}
            <div className="button-group">
              <button
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AppointmentModal;
