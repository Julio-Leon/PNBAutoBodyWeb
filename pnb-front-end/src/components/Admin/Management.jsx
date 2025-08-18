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
  Search,
  Filter,
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
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
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
    filterAndSearchAppointments();
  }, [appointments, filter, searchTerm]);

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
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const appointmentsData = data.data || [];
        setAppointments(appointmentsData);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentHistory = () => {
    // Use the existing appointments array and filter for completed ones
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    setAppointmentHistory(completedAppointments);
    console.log('Filtered completed appointments:', completedAppointments);
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

  const filterAndSearchAppointments = () => {
    // Start with appointments and filter out completed ones for the active appointments tab
    let filtered = appointments.filter(apt => apt.status !== 'completed');
    
    // Apply additional filter if not showing all
    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.status === filter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.phoneNumber.includes(searchTerm)
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
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

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
        setShowDeleteModal(false);
        setSelectedAppointment(null);
      } else {
        console.error('Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
        
        if (newStatus === 'completed') {
          fetchAppointmentHistory();
        }
      } else {
        console.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    
    try {
      let date;
      
      if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        return 'Invalid date';
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
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
          <div className="header-actions">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Active</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => {
                fetchAppointments();
              }}
              className="refresh-btn"
              title="Refresh"
            >
              <RefreshCw className="btn-icon" />
            </button>
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
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar className="empty-icon" />
            <p>No appointments found</p>
            <span>Try adjusting your search or filter criteria</span>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
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
                      <h3>{appointment.firstName} {appointment.lastName}</h3>
                      <div className="contact-info">
                        <span><Phone className="contact-icon" />{appointment.phoneNumber}</span>
                        <span><Mail className="contact-icon" />{appointment.email}</span>
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
                        {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Car className="detail-icon" />
                      <span>{appointment.vehicleYear} {appointment.vehicleMake} {appointment.vehicleModel}</span>
                    </div>
                    <div className="detail-row">
                      <FileText className="detail-icon" />
                      <span className="services">
                        {appointment.serviceDetails?.map((service, index) => (
                          <span key={index} className="service-tag">{service}</span>
                        )) || 'No services specified'}
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
                      <h3>{appointment.firstName} {appointment.lastName}</h3>
                      <div className="contact-info">
                        <span><Phone className="contact-icon" />{appointment.phoneNumber}</span>
                        <span><Mail className="contact-icon" />{appointment.email}</span>
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
                        {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <Car className="detail-icon" />
                      <span>{appointment.vehicleYear} {appointment.vehicleMake} {appointment.vehicleModel}</span>
                    </div>
                    <div className="detail-row">
                      <FileText className="detail-icon" />
                      <span className="services">
                        {appointment.serviceDetails?.map((service, index) => (
                          <span key={index} className="service-tag completed">{service}</span>
                        )) || 'No services specified'}
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
            onUpdate={() => {
              fetchAppointments();
              if (activeSection === 'history') fetchAppointmentHistory();
            }}
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
