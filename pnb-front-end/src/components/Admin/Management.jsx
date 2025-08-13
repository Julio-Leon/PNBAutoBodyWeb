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
  CheckCheck
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import AppointmentModal from './AppointmentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import './Management.css';

const Management = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit'
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
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
        calculateStats(data.data || []);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentData) => {
    const newStats = {
      total: appointmentData.length,
      pending: appointmentData.filter(apt => apt.status === 'pending').length,
      confirmed: appointmentData.filter(apt => apt.status === 'confirmed').length,
      completed: appointmentData.filter(apt => apt.status === 'completed').length
    };
    setStats(newStats);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.phone?.includes(searchTerm) ||
        apt.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
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
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const handleUpdateAppointment = async (updatedData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(prev => 
          prev.map(apt => apt.id === selectedAppointment.id ? data.data : apt)
        );
        setShowModal(false);
        setSelectedAppointment(null);
      } else {
        console.error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the appointment in state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );
        
        // Refresh to get accurate stats
        fetchAppointments();
      } else {
        console.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    let date;
    
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      date = dateValue.toDate();
    }
    // Handle JavaScript Date objects
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // Handle ISO date strings from API
    else if (typeof dateValue === 'string') {
      // For date-only strings (YYYY-MM-DD), create a local date to avoid timezone issues
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        date = new Date(year, month - 1, day); // Month is 0-indexed
      } else {
        date = new Date(dateValue);
      }
    }
    else {
      return 'N/A';
    }
    
    // Check if date is valid
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="management-dashboard">
        <div className="management-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Shield size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--text-color)' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)' }}>Admin access required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="management-dashboard">
      <div className="management-container">
        <motion.div
          className="management-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="management-title">
            <h1>Management Dashboard</h1>
            <div className="admin-badge">
              <Shield size={16} />
              Admin Panel
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="management-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon total">
                <BarChart3 />
              </div>
            </div>
            <h3 className="stat-number">{stats.total}</h3>
            <p className="stat-label">Total Appointments</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon pending">
                <Clock />
              </div>
            </div>
            <h3 className="stat-number">{stats.pending}</h3>
            <p className="stat-label">Pending</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon confirmed">
                <CheckCircle />
              </div>
            </div>
            <h3 className="stat-number">{stats.confirmed}</h3>
            <p className="stat-label">Confirmed</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon completed">
                <FileText />
              </div>
            </div>
            <h3 className="stat-number">{stats.completed}</h3>
            <p className="stat-label">Completed</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="management-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="search-filter-group">
            <input
              type="text"
              placeholder="Search appointments..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            className="refresh-btn"
            onClick={fetchAppointments}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </motion.div>

        {/* Appointments Grid */}
        {loading ? (
          <div className="loading-spinner-large">
            <div className="spinner" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div
            className="no-appointments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="no-appointments-icon" />
            <h3>No appointments found</h3>
            <p>There are no appointments matching your current filters.</p>
          </motion.div>
        ) : (
          <motion.div
            className="appointments-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredAppointments.map((appointment, index) => (
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
                    <div className={`status-badge ${appointment.status || 'pending'}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status || 'pending'}
                    </div>
                  </div>

                  <div className="appointment-info">
                    <h3>{appointment.customerName || 'N/A'}</h3>
                    <div className="appointment-details">
                      <strong>Service:</strong> {appointment.serviceType || 'N/A'}<br />
                      <strong>Vehicle:</strong> {appointment.vehicleInfo || 'N/A'}
                    </div>
                  </div>

                  <div className="appointment-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      {formatDate(appointment.preferredDate)}
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      {formatTime(appointment.preferredTime)}
                    </div>
                    <div className="meta-item">
                      <Mail size={14} />
                      {appointment.email || 'N/A'}
                    </div>
                  </div>

                  <div className="appointment-actions">
                    {/* Status Action Buttons */}
                    {appointment.status === 'pending' && (
                      <button
                        className="action-btn confirm"
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        title="Confirm Appointment"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <button
                        className="action-btn complete"
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        title="Mark as Completed"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}

                    {/* Standard Action Buttons */}
                    <button
                      className="action-btn view"
                      onClick={() => handleViewAppointment(appointment)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditAppointment(appointment)}
                      title="Edit Appointment"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteAppointment(appointment)}
                      title="Delete Appointment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && selectedAppointment && (
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

        {showDeleteModal && selectedAppointment && (
          <DeleteConfirmModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedAppointment(null);
            }}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Management;
