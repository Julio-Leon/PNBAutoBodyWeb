import React, { useState } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';

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
    vehicleInfo: appointment.vehicleInfo || '',
    preferredDate: formatDateForInput(appointment.preferredDate),
    preferredTime: appointment.preferredTime || '',
    status: appointment.status || 'pending',
    message: appointment.description || appointment.message || '' // Check both fields
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(editData);
    } catch (error) {
      console.error('Error updating appointment:', error);
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
                  Service Type
                </label>
                {isEditing ? (
                  <select
                    name="serviceType"
                    value={editData.serviceType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select service type</option>
                    <option value="Collision Repair">Collision Repair</option>
                    <option value="Dent Repair">Dent Repair</option>
                    <option value="Paint Services">Paint Services</option>
                    <option value="Auto Detailing">Auto Detailing</option>
                    <option value="Insurance Claims">Insurance Claims</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="form-display">{appointment.serviceType || 'N/A'}</div>
                )}
              </div>
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
        )}
      </motion.div>
    </motion.div>
  );
};

export default AppointmentModal;
