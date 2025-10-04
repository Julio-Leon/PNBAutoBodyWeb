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
  Edit2,
  Trash2,
  Plus,
  Settings,
  History,
  Eye,
  Check,
  CheckCheck
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import CustomerAppointmentModal from './CustomerAppointmentModal';
import CustomerDeleteConfirmModal from './CustomerDeleteConfirmModal';
import CustomerVehicleModal from './CustomerVehicleModal';
import CustomerVehicleDeleteModal from './CustomerVehicleDeleteModal';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showVehicleDeleteModal, setShowVehicleDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [activeSection, setActiveSection] = useState('appointments');

  const { user } = useContext(AuthContext);
  
  // Function to navigate to profile settings
  const goToProfileSettings = () => {
    // This assumes you have some way to navigate between views, similar to App.jsx
    // You might need to adjust this depending on your routing setup
    if (typeof window !== 'undefined') {
      // If using window location
      window.location.href = '#profile';
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAppointments();
      fetchUserVehicles();
    }
  }, [user]);

  // Update appointment history whenever appointments change
  useEffect(() => {
    const completedAppointments = appointments.filter(appointment => 
      appointment.status === 'completed'
    );
    setAppointmentHistory(completedAppointments);
  }, [appointments]);

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

      // First, try with the user-appointments endpoint
      const response = await fetch(`${API_BASE_URL}/appointments/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched appointments:', data);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setAppointments(data);
        } else if (data.data && Array.isArray(data.data)) {
          setAppointments(data.data);
        } else if (data.success && data.data && Array.isArray(data.data)) {
          setAppointments(data.data);
        } else {
          console.error('Unexpected data format:', data);
          setAppointments([]);
        }
      } else if (response.status === 404) {
        // If my-appointments endpoint doesn't exist, try the legacy endpoint
        console.log('my-appointments endpoint not found, trying legacy endpoint');
        const legacyResponse = await fetch(`${API_BASE_URL}/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (legacyResponse.ok) {
          const data = await legacyResponse.json();
          console.log('Fetched appointments from legacy endpoint:', data);
          
          // Handle different response formats
          if (Array.isArray(data)) {
            setAppointments(data);
          } else if (data.data && Array.isArray(data.data)) {
            setAppointments(data.data);
          } else if (data.success && data.data && Array.isArray(data.data)) {
            setAppointments(data.data);
          } else {
            console.error('Unexpected data format from legacy endpoint:', data);
            setAppointments([]);
          }
        } else {
          const errorData = await legacyResponse.json().catch(() => ({}));
          console.error('Failed to fetch appointments from legacy endpoint:', errorData);
          setError(errorData.error || 'Failed to fetch appointments');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
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

  const fetchAppointmentHistory = () => {
    // This function is now just for compatibility - history is auto-updated via useEffect
    const completedAppointments = appointments.filter(appointment => 
      appointment.status === 'completed'
    );
    console.log('Filtered appointment history:', completedAppointments);
    setAppointmentHistory(completedAppointments);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true); // For now, use the same modal for viewing as editing
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

  // Vehicle Management Functions
  const fetchUserVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to view your vehicles');
        return;
      }

      // Try the my-vehicles endpoint first
      const response = await fetch(`${API_BASE_URL}/vehicles/my-vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setVehicles(data);
        } else if (data.data && Array.isArray(data.data)) {
          setVehicles(data.data);
        } else if (data.success && data.data && Array.isArray(data.data)) {
          setVehicles(data.data);
        } else {
          console.error('Unexpected vehicle data format:', data);
          setVehicles([]);
        }
      } else if (response.status === 404) {
        // Fallback to legacy endpoint
        console.log('my-vehicles endpoint not found, trying legacy endpoint');
        const legacyResponse = await fetch(`${API_BASE_URL}/vehicles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (legacyResponse.ok) {
          const data = await legacyResponse.json();
          
          // Handle different response formats
          if (Array.isArray(data)) {
            setVehicles(data);
          } else if (data.data && Array.isArray(data.data)) {
            setVehicles(data.data);
          } else if (data.success && data.data && Array.isArray(data.data)) {
            setVehicles(data.data);
          } else {
            console.error('Unexpected vehicle data format from legacy endpoint:', data);
            setVehicles([]);
          }
        } else {
          const errorData = await legacyResponse.json().catch(() => ({}));
          console.error('Failed to fetch vehicles from legacy endpoint:', errorData);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch vehicles:', errorData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDeleteModal(true);
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, error: 'Please log in to manage vehicles' };
      }

      const url = selectedVehicle 
        ? `${API_BASE_URL}/vehicles/${selectedVehicle.id}`
        : `${API_BASE_URL}/vehicles`;
      
      const method = selectedVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        await fetchUserVehicles();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to save vehicle' };
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const handleConfirmDeleteVehicle = async (vehicleId) => {
    setIsDeletingVehicle(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to delete vehicles');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUserVehicles();
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete vehicle');
        return false;
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setError('Network error occurred');
      return false;
    } finally {
      setIsDeletingVehicle(false);
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

  // Helper functions for displaying appointment data (matching Admin Dashboard format)
  const getVehicleInfo = (appointment) => {
    // Check if we have vehicleInfo field first (this is the primary field in the new data structure)
    if (appointment.vehicleInfo && appointment.vehicleInfo !== 'N/A') {
      return appointment.vehicleInfo;
    }
    
    // Fallback to individual fields if available
    const year = appointment.vehicleYear || '';
    const make = appointment.vehicleMake || '';
    const model = appointment.vehicleModel || '';
    
    const combined = `${year} ${make} ${model}`.trim();
    return combined || 'Vehicle information not specified';
  };

  const getCustomerName = (appointment) => {
    // Check if we have customerName field first (this is the primary field in the new data structure)
    if (appointment.customerName) {
      return appointment.customerName;
    }
    
    // Fallback to individual fields if available
    const firstName = appointment.firstName || '';
    const lastName = appointment.lastName || '';
    
    const combined = `${firstName} ${lastName}`.trim();
    return combined || user?.name || 'Unknown Customer';
  };

  const getPhoneNumber = (appointment) => {
    return appointment.phone || appointment.phoneNumber || 'Not specified';
  };

  const getServiceInfo = (appointment, isCompleted = false) => {
    // Check serviceType first (this is the primary field in the new data structure)
    if (appointment.serviceType) {
      return (
        <span className={`service-tag ${isCompleted ? 'completed' : ''}`}>
          {appointment.serviceType}
        </span>
      );
    }
    
    // Fallback to serviceDetails array if available
    if (appointment.serviceDetails?.length > 0) {
      return appointment.serviceDetails.map((service, index) => (
        <span key={index} className={`service-tag ${isCompleted ? 'completed' : ''}`}>
          {service}
        </span>
      ));
    }
    
    // Check description field as another fallback
    if (appointment.description) {
      return (
        <span className={`service-tag ${isCompleted ? 'completed' : ''}`}>
          {appointment.description}
        </span>
      );
    }
    
    return 'No services specified';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="status-icon pending" />;
      case 'confirmed':
        return <CheckCircle className="status-icon confirmed" />;
      case 'completed':
        return <Check className="status-icon completed" />;
      case 'cancelled':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <AlertCircle className="status-icon" />;
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
            <h1>Dashboard</h1>
            <p>Welcome back, {user.fullName || user.name || 'Customer'}</p>
          </div>
          <div className="dashboard-actions">
            <div className="section-tabs">
              <button 
                className={`tab-btn ${activeSection === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveSection('appointments')}
              >
                <Calendar size={16} />
                My Appointments
              </button>
              <button 
                className={`tab-btn ${activeSection === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveSection('vehicles')}
              >
                <Car size={16} />
                My Vehicles
              </button>
              <button 
                className={`tab-btn ${activeSection === 'history' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('history');
                }}
              >
                <History size={16} />
                History
              </button>
            </div>
            <button
              className="refresh-btn"
              onClick={() => {
                if (activeSection === 'appointments') fetchUserAppointments();
                else if (activeSection === 'vehicles') fetchUserVehicles();
                else if (activeSection === 'history') fetchUserAppointments(); // Refresh appointments to update history
              }}
              disabled={loading || vehiclesLoading}
            >
              <RefreshCw size={18} className={loading || vehiclesLoading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
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

        {/* Appointments Section */}
        {activeSection === 'appointments' && (
          <>
            {loading ? (
              <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="loading-spinner-large">
                  <div className="spinner" />
                  <p>Loading your appointments...</p>
                </div>
              </motion.div>
            ) : appointments.filter(appointment => appointment.status !== 'completed').length === 0 ? (
          <motion.div
            className="no-appointments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="no-appointments-icon" />
            <h3>No active appointments found</h3>
            <p>You don't have any pending or confirmed appointments. Check your History tab for completed appointments.</p>
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
              {appointments.filter(appointment => 
                appointment.status !== 'completed'
              ).map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className={`appointment-card status-${appointment.status}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  layout
                  whileHover={{ y: -5 }}
                >
                  <div className="card-header">
                    <div className="customer-info">
                      <User className="customer-icon" />
                      <div>
                        <h3>{getCustomerName(appointment)}</h3>
                        <div className="contact-info">
                          <span><Phone className="contact-icon" />{getPhoneNumber(appointment)}</span>
                          <span><Mail className="contact-icon" />{appointment.email || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="status-badge">
                      {getStatusIcon(appointment.status)}
                      <span className={`status-text ${appointment.status}`}>
                        {(appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="appointment-details">
                      <div className="detail-row">
                        <Calendar className="detail-icon" />
                        <span>
                          {formatDate(appointment.preferredDate || appointment.appointmentDate)} at {formatTime(appointment.preferredTime || appointment.appointmentTime)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <Car className="detail-icon" />
                        <span>{getVehicleInfo(appointment)}</span>
                      </div>
                      <div className="detail-row">
                        <FileText className="detail-icon" />
                        <span className="services">
                          {getServiceInfo(appointment)}
                        </span>
                      </div>
                      {appointment.paymentMethod && (
                        <div className="detail-row">
                          <span className="payment-method">
                            Payment: {appointment.paymentMethod}
                            {appointment.insuranceCompany && appointment.paymentMethod === 'insurance' && (
                              <> ({appointment.insuranceCompany})</>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => handleViewAppointment(appointment)}
                      className="action-btn view"
                      title="View Details"
                    >
                      <Eye className="btn-icon" />
                    </button>
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="action-btn edit"
                      title="Edit Appointment"
                      disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                    >
                      <Edit className="btn-icon" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment)}
                      className="action-btn delete"
                      title="Delete Appointment"
                      disabled={appointment.status === 'completed'}
                    >
                      <Trash2 className="btn-icon" />
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
          </>
        )}

        {/* Vehicles Section */}
        {activeSection === 'vehicles' && (
          <>
            {vehiclesLoading ? (
              <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="loading-spinner-large">
                  <div className="spinner" />
                  <p>Loading your vehicles...</p>
                </div>
              </motion.div>
            ) : vehicles.length === 0 ? (
              <motion.div
                className="no-appointments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Car className="no-appointments-icon" />
                <h3>No vehicles found</h3>
                <p>You haven't added any vehicles yet. Would you like to add one?</p>
                <button 
                  className="primary-button"
                  onClick={handleAddVehicle}
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={18} />
                  Add Vehicle
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="appointments-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="appointments-header">
                  <h3>Your Vehicles ({vehicles.length})</h3>
                  <button 
                    className="add-appointment-btn"
                    onClick={handleAddVehicle}
                  >
                    <Plus size={18} />
                    Add Vehicle
                  </button>
                </div>
                <AnimatePresence mode="popLayout">
                  {vehicles.map((vehicle) => (
                    <motion.div
                      key={vehicle.id}
                      className="appointment-card"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="appointment-header">
                        <div>
                          <h4>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                          {vehicle.color && <span className="service-type">{vehicle.color}</span>}
                        </div>
                        <div className="appointment-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditVehicle(vehicle)}
                            title="Edit Vehicle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteVehicle(vehicle)}
                            title="Delete Vehicle"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="appointment-details">
                        {vehicle.vin && (
                          <div className="detail-row">
                            <strong>VIN:</strong> {vehicle.vin}
                          </div>
                        )}
                        {vehicle.licensePlate && (
                          <div className="detail-row">
                            <strong>License Plate:</strong> {vehicle.licensePlate}
                          </div>
                        )}
                        {vehicle.otherDetails && (
                          <div className="detail-row">
                            <strong>Other Details:</strong> {vehicle.otherDetails}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      

      {/* History Section */}
      {activeSection === 'history' && (
        <>
          {loading ? (
            <div className="loading-spinner">
              <RefreshCw className="spin" size={24} />
              <p>Loading appointments...</p>
            </div>
          ) : (
            <motion.div 
              className="history-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {appointmentHistory.length === 0 ? (
                <div className="empty-state">
                  <History size={64} />
                  <h3>No Appointment History</h3>
                  <p>You don't have any completed appointments yet.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {appointmentHistory.map((appointment, index) => (
                    <motion.div
                      key={appointment.id || appointment._id}
                      className="appointment-card history-card status-completed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="card-header">
                        <div className="customer-info">
                          <User className="customer-icon" />
                          <div>
                            <h3>{getCustomerName(appointment)}</h3>
                            <div className="contact-info">
                              <span><Phone className="contact-icon" />{getPhoneNumber(appointment)}</span>
                              <span><Mail className="contact-icon" />{appointment.email || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="completion-badge">
                          <CheckCheck className="completion-icon" />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="appointment-details">
                          <div className="detail-row">
                            <Calendar className="detail-icon" />
                            <span>
                              {formatDate(appointment.preferredDate || appointment.appointmentDate)} at {formatTime(appointment.preferredTime || appointment.appointmentTime)}
                            </span>
                          </div>
                          <div className="detail-row">
                            <Car className="detail-icon" />
                            <span>{getVehicleInfo(appointment)}</span>
                          </div>
                          <div className="detail-row">
                            <FileText className="detail-icon" />
                            <span className="services">
                              {getServiceInfo(appointment, true)}
                            </span>
                          </div>
                          {appointment.paymentMethod && (
                            <div className="detail-row">
                              <span className="payment-method">
                                Payment: {appointment.paymentMethod}
                                {appointment.insuranceCompany && appointment.paymentMethod === 'insurance' && (
                                  <> ({appointment.insuranceCompany})</>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => handleViewAppointment(appointment)}
                          className="action-btn view"
                          title="View Details"
                        >
                          <Eye className="btn-icon" />
                        </button>
                      </div>

                      <div className="appointment-footer">
                        <small>Completed on: {formatDate(appointment.updatedAt || appointment.completedAt || appointment.createdAt)}</small>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </>
      )}
      </div>

      {/* Vehicle Modals */}
      <CustomerVehicleModal
        vehicle={selectedVehicle}
        isOpen={showVehicleModal}
        onClose={() => {
          setShowVehicleModal(false);
          setSelectedVehicle(null);
        }}
        onSave={handleSaveVehicle}
      />

      <CustomerVehicleDeleteModal
        vehicle={selectedVehicle}
        isOpen={showVehicleDeleteModal}
        onClose={() => {
          setShowVehicleDeleteModal(false);
          setSelectedVehicle(null);
        }}
        onConfirm={handleConfirmDeleteVehicle}
        isDeleting={isDeletingVehicle}
      />

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
