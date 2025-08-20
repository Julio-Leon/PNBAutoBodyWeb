import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Car,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  BarChart3,
  Check,
  CheckCheck,
  History
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import AppointmentModal from './AppointmentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import './Management.css';

const Management = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit'
  const [activeSection, setActiveSection] = useState('appointments');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      calculateStats(appointments);
      // Filter completed appointments for history
      const completedAppointments = appointments.filter(apt => apt.status === 'completed');
      setAppointmentHistory(completedAppointments);
    }
  }, [appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      console.log('Fetching appointments with token:', token ? 'Token present' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch appointments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const appointmentsData = data.data || [];
        console.log('Fetched appointments:', appointmentsData);
        
        // Debug: Log the first appointment to see its structure
        if (appointmentsData.length > 0) {
          console.log('Sample appointment structure:', appointmentsData[0]);
          console.log('Available fields:', Object.keys(appointmentsData[0]));
        }
        
        setAppointments(appointmentsData);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch appointments:', errorData);
        alert(`Failed to fetch appointments: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Error fetching appointments. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentHistory = () => {
    // Use the existing appointments array and filter for completed ones
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    console.log('Filtered completed appointments:', completedAppointments);
    
    // Debug: Log the first appointment to see its structure
    if (completedAppointments.length > 0) {
      console.log('Sample completed appointment structure:', completedAppointments[0]);
      console.log('Available fields:', Object.keys(completedAppointments[0]));
    }
    
    setAppointmentHistory(completedAppointments);
  };

  const calculateStats = (appointmentsData) => {
    const stats = {
      total: appointmentsData.length,
      pending: appointmentsData.filter(apt => apt.status === 'pending').length,
      confirmed: appointmentsData.filter(apt => apt.status === 'confirmed').length,
      completed: appointmentsData.filter(apt => apt.status === 'completed').length
    };
    setStats(stats);
  };

  const handleDelete = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleUpdateAppointment = async (updatedData) => {
    try {
      // ALWAYS prioritize the admin token in the Management dashboard
      const adminToken = localStorage.getItem('adminToken');
      // Only use userToken as fallback if no admin token exists
      const userToken = localStorage.getItem('userToken');
      const token = adminToken || userToken;
      
      console.log('Using token for update:', adminToken ? 'Admin token' : userToken ? 'User token' : 'No token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Add logging to help debug token issues
      console.log('Token prefix:', token.substring(0, 10) + '...');
      
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Update response:', responseData);
        
        // Refresh appointments to get the latest data
        fetchAppointments();
        if (activeSection === 'history') {
          fetchAppointmentHistory();
        }
        
        // Close the modal
        setShowModal(false);
        setSelectedAppointment(null);
        
        console.log(`Appointment ${selectedAppointment.id} updated successfully`);
      } else {
        const errorData = await response.json();
        console.error('Failed to update appointment:', errorData);
        
        // Check if it's a permissions error
        if (errorData.error === 'You can only edit your own appointments') {
          console.error('Permission error detected. User role may not be properly set.');
          
          // Try to refresh the auth token and try again with admin token
          await refreshAndRetryUpdate(updatedData);
        } else {
          throw new Error(errorData.error || 'Failed to update appointment');
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(`Error updating appointment: ${error.message}`);
      throw error; // Re-throw so the modal can handle it
    }
  };

  // Helper function to refresh auth token and retry update
  const refreshAndRetryUpdate = async (updatedData) => {
    try {
      // Force using just the admin token (not user token)
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('No admin token available. Please try logging in again.');
      }
      
      console.log('Retrying with admin token only');
      
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!adminToken) {
        throw new Error('No admin token available. Please try logging in again.');
      }
      
      console.log('Retrying with admin token only');
      
      const retryResponse = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (retryResponse.ok) {
        const responseData = await retryResponse.json();
        console.log('Update retry successful:', responseData);
        
        // Refresh appointments
        fetchAppointments();
        if (activeSection === 'history') {
          fetchAppointmentHistory();
        }
        
        // Close the modal
        setShowModal(false);
        setSelectedAppointment(null);
      } else {
        const errorData = await retryResponse.json();
        console.error('Retry failed:', errorData);
        throw new Error(errorData.error || 'Failed to update appointment on retry');
      }
    } catch (error) {
      console.error('Error in retry update:', error);
      alert(`Failed to update appointment. Error: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Delete response:', responseData);
        
        // Remove from local state
        setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
        setShowDeleteModal(false);
        setSelectedAppointment(null);
        
        console.log(`Appointment ${selectedAppointment.id} deleted successfully`);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete appointment:', errorData);
        alert(`Failed to delete appointment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment. Please try again.');
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      console.log(`Updating appointment ${appointmentId} status to ${newStatus}`);
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      console.log('Token present:', token ? 'Yes' : 'No');
      
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('Status update response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Status update response:', responseData);
        
        // Update the local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
        
        // Refresh history if status changes to/from completed
        if (newStatus === 'completed' || appointments.find(apt => apt.id === appointmentId)?.status === 'completed') {
          fetchAppointmentHistory();
        }
        
        console.log(`Appointment ${appointmentId} status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to update appointment status:', errorData);
        alert(`Failed to update appointment status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Error updating appointment status. Please try again.');
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    
    try {
      let date;
      
      // Handle Firestore Timestamp objects
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      } 
      // Handle Firestore Timestamp objects with toDate method
      else if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        date = dateValue.toDate();
      }
      // Handle JavaScript Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle date strings
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // Handle timestamp numbers
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      else {
        console.warn('Unrecognized date format:', dateValue);
        return 'Invalid date';
      }
      
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date created from:', dateValue);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    
    try {
      // Handle different time formats
      if (typeof timeString === 'string') {
        // If it's already in a readable format, return as is
        if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
          return timeString;
        }
        
        // Handle HH:MM format
        const [hours, minutes] = timeString.split(':');
        if (hours && minutes) {
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes));
          
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || 'Not specified';
    }
  };

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
    return combined || 'Unknown Customer';
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

  const renderAppointments = () => (
    <div className="appointments-section">
      <div className="section-header">
        <div className="header-content">
          <div className="header-left">
            <Calendar className="section-icon" />
            <h2>Appointments Management</h2>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <BarChart3 />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card confirmed">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.confirmed}</span>
              <span className="stat-label">Confirmed</span>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">
              <Check />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="appointments-list">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="loading-spinner" />
            <p>Loading appointments...</p>
          </div>
        ) : appointments.filter(apt => apt.status !== 'completed').length === 0 ? (
          <div className="empty-state">
            <Calendar className="empty-icon" />
            <p>No appointments found</p>
            <span>No active appointments at this time</span>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.filter(apt => apt.status !== 'completed').map((appointment) => (
              <motion.div
                key={appointment.id}
                className={`appointment-card status-${appointment.status}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
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
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleViewAppointment(appointment)}
                    className="action-btn view"
                    title="View Details"
                  >
                    <Eye className="btn-icon" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="action-btn edit"
                    title="Edit Appointment"
                  >
                    <Edit className="btn-icon" />
                    Edit
                  </button>
                  
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      className="action-btn confirm"
                      title="Confirm Appointment"
                    >
                      <CheckCircle className="btn-icon" />
                      Confirm
                    </button>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      className="action-btn complete"
                      title="Mark as Completed"
                    >
                      <Check className="btn-icon" />
                      Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteAppointment(appointment)}
                    className="action-btn delete"
                    title="Delete Appointment"
                  >
                    <Trash2 className="btn-icon" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="history-section">
      <div className="section-header">
        <div className="header-content">
          <div className="header-left">
            <History className="section-icon" />
            <h2>Appointment History</h2>
            <span className="section-subtitle">Completed appointments</span>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchAppointmentHistory}
              className="refresh-btn"
              title="Refresh History"
            >
              <RefreshCw className="btn-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="history-list">
        {console.log('History rendering - Appointment history:', appointmentHistory)}
        {historyLoading ? (
          <div className="loading-state">
            <RefreshCw className="loading-spinner" />
            <p>Loading appointment history...</p>
          </div>
        ) : appointmentHistory.length === 0 ? (
          <div className="empty-state">
            <History className="empty-icon" />
            <p>No completed appointments yet</p>
            <span>Completed appointments will appear here</span>
            <button onClick={fetchAppointmentHistory} className="retry-btn">
              <RefreshCw size={16} /> Retry Loading History
            </button>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointmentHistory.map((appointment) => (
              <motion.div
                key={appointment.id}
                className="appointment-card history-card status-completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleViewAppointment(appointment)}
                    className="action-btn view"
                    title="View Details"
                  >
                    <Eye className="btn-icon" />
                    View Details
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                    className="action-btn confirm"
                    title="Reopen as Confirmed"
                  >
                    <CheckCircle className="btn-icon" />
                    Reopen
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      className="management-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="management-header">
        <div className="header-content">
          <div className="header-left">
            <Shield className="header-icon" />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage appointments and view system analytics</p>
            </div>
          </div>
        </div>

        <div className="section-tabs">
          <button
            className={`tab-btn ${activeSection === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveSection('appointments')}
          >
            <Calendar className="tab-icon" />
            Active Appointments
          </button>
          <button
            className={`tab-btn ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('history');
              fetchAppointmentHistory(); // Explicitly fetch history when the tab is clicked
            }}
          >
            <History className="tab-icon" />
            History
          </button>
        </div>
      </div>

      <div className="management-content">
        <AnimatePresence mode="wait">
          {activeSection === 'appointments' ? (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderAppointments()}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderHistory()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <AppointmentModal
            appointment={selectedAppointment}
            mode={modalMode}
            onClose={() => {
              setShowModal(false);
              setSelectedAppointment(null);
            }}
            onUpdate={handleUpdateAppointment}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            appointment={selectedAppointment}
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedAppointment(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Management;
