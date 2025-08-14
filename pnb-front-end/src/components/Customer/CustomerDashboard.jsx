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
  History
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

      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      } else {
        const errorData = await response.json();
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
      </div>

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
              className="appointments-grid"
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
                      className="appointment-card history-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="appointment-header">
                        <div className="appointment-info">
                          <h3>{appointment.selectedServices ? appointment.selectedServices.join(', ') : appointment.damageType}</h3>
                          <span className="appointment-id">#{appointment.customAppointmentId}</span>
                        </div>
                        <div className="appointment-status completed">
                          <CheckCircle size={16} />
                          Completed
                        </div>
                      </div>

                      <div className="appointment-details">
                        <div className="detail-row">
                          <Calendar size={16} />
                          <span>Date: {new Date(appointment.preferredDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <Clock size={16} />
                          <span>Time: {appointment.preferredTime}</span>
                        </div>
                        <div className="detail-row">
                          <Car size={16} />
                          <span>Vehicle: {appointment.vehicleInfo}</span>
                        </div>
                        <div className="detail-row">
                          <User size={16} />
                          <span>Name: {appointment.name}</span>
                        </div>
                        {appointment.description && (
                          <div className="detail-row">
                            <FileText size={16} />
                            <span>Description: {appointment.description}</span>
                          </div>
                        )}
                      </div>

                      <div className="appointment-footer">
                        <small>Completed on: {new Date(appointment.updatedAt || appointment.createdAt).toLocaleDateString()}</small>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </>
      )}

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
