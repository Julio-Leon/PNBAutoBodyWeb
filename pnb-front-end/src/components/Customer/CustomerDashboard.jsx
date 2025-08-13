import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Car,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import CustomerAppointmentModal from './CustomerAppointmentModal';
import CustomerDeleteConfirmModal from './CustomerDeleteConfirmModal';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchUserAppointments();
    }
  }, [user]);

  const fetchUserAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      console.log('Fetching appointments with token:', token);
      
      if (!token) {
        setError('Please log in to view your appointments');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched appointments:', data);
        setAppointments(data.data || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch appointments:', errorData);
        setError(errorData.error || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleSaveAppointment = async (appointmentId, formData) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, error: 'Please log in to edit appointments' };
      }

      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the appointment in the list
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, ...data.data }
              : apt
          )
        );
        
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to update appointment' };
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const handleConfirmDelete = async (appointmentId) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to delete appointments');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove the appointment from the list
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        setShowDeleteModal(false);
        setSelectedAppointment(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Network error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    let date;
    
    // Handle different date formats
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateValue);
      }
    } else {
      return 'N/A';
    }
    
    if (!date || isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'completed':
        return <FileText size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#6366f1';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (!user || user.role !== 'customer') {
    return (
      <div className="customer-dashboard">
        <div className="dashboard-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <User size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--text-color)' }}>Please Log In</h2>
            <p style={{ color: 'var(--text-muted)' }}>You need to be logged in as a customer to view this page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="dashboard-title">
            <h1>My Appointments</h1>
            <p>Welcome back, {user.fullName || user.name || 'Customer'}</p>
          </div>
          <button
            className="refresh-btn"
            onClick={fetchUserAppointments}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </motion.div>

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="loading-spinner-large">
            <div className="spinner" />
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <motion.div
            className="no-appointments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="no-appointments-icon" />
            <h3>No appointments found</h3>
            <p>You haven't scheduled any appointments yet. Would you like to schedule one?</p>
            <button 
              className="schedule-btn"
              onClick={() => document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Schedule Appointment
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="appointments-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence>
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className="appointment-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  layout
                >
                  <div className="appointment-header">
                    <div className="appointment-id">#{appointment.id?.slice(-8) || 'N/A'}</div>
                    <div 
                      className={`status-badge ${appointment.status || 'pending'}`}
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {getStatusIcon(appointment.status)}
                      {(appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1)}
                    </div>
                  </div>

                  <div className="appointment-info">
                    <h3>{appointment.serviceType || appointment.damageType || 'Service Request'}</h3>
                    <div className="appointment-details">
                      <strong>Vehicle:</strong> {appointment.vehicleInfo || 'N/A'}<br />
                      {appointment.description && (
                        <>
                          <strong>Description:</strong> {appointment.description}<br />
                        </>
                      )}
                      <strong>Payment:</strong> {appointment.paymentMethod || 'N/A'}
                      {appointment.insuranceCompany && appointment.paymentMethod === 'insurance' && (
                        <> ({appointment.insuranceCompany})</>
                      )}
                    </div>
                  </div>

                  <div className="appointment-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Date: {formatDate(appointment.preferredDate)}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>Time: {formatTime(appointment.preferredTime)}</span>
                    </div>
                    <div className="meta-item">
                      <Mail size={14} />
                      <span>{appointment.email || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <Phone size={14} />
                      <span>{appointment.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditAppointment(appointment)}
                      title="Edit Appointment"
                      disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteAppointment(appointment)}
                      title="Delete Appointment"
                      disabled={appointment.status === 'completed'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {appointment.createdAt && (
                    <div className="appointment-footer">
                      <small>Requested on: {formatDate(appointment.createdAt)}</small>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <CustomerAppointmentModal
        appointment={selectedAppointment}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
        }}
        onSave={handleSaveAppointment}
      />

      {/* Delete Confirmation Modal */}
      <CustomerDeleteConfirmModal
        appointment={selectedAppointment}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CustomerDashboard;
