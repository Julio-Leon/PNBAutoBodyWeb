import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Mail, Car, FileText, CheckCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, getAuthToken } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      } else {
        console.error('Failed to fetch appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not scheduled';
    
    let date;
    
    // Handle different date formats
    if (typeof dateValue === 'string') {
      // For date-only strings (YYYY-MM-DD), create a local date to avoid timezone issues
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        date = new Date(year, month - 1, day); // Month is 0-indexed
      } else {
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'Invalid date';
    }
    
    if (!date || isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" size={20} />;
      case 'confirmed':
        return <ClockIcon className="status-icon confirmed" size={20} />;
      case 'pending':
      default:
        return <AlertCircle className="status-icon pending" size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="customer-dashboard">
        <div className="dashboard-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading your appointments...</p>
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
          <div className="welcome-section">
            <h1>Welcome back, {user?.fullName}!</h1>
            <p>Manage your auto body repair appointments</p>
          </div>
          
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{appointments.length}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {appointments.filter(apt => apt.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {appointments.filter(apt => apt.status === 'completed').length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="appointments-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>Your Appointments</h2>
          
          {appointments.length === 0 ? (
            <div className="no-appointments">
              <Calendar size={64} className="no-appointments-icon" />
              <h3>No appointments yet</h3>
              <p>You haven't scheduled any appointments with us yet. Book your first appointment to get started!</p>
              <button 
                className="book-appointment-btn"
                onClick={() => {
                  const appointmentSection = document.getElementById('appointment');
                  if (appointmentSection) {
                    appointmentSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  className={`appointment-card ${getStatusClass(appointment.status)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                  <div className="appointment-header">
                    <div className="appointment-status">
                      {getStatusIcon(appointment.status)}
                      <span className="status-text">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                    </div>
                    <div className="appointment-id">#{appointment.id.slice(-8)}</div>
                  </div>
                  
                  <div className="appointment-content">
                    <div className="appointment-detail">
                      <Calendar size={16} />
                      <span>{formatDate(appointment.preferredDate)}</span>
                    </div>
                    
                    {appointment.preferredTime && (
                      <div className="appointment-detail">
                        <Clock size={16} />
                        <span>{appointment.preferredTime}</span>
                      </div>
                    )}
                    
                    <div className="appointment-detail">
                      <Car size={16} />
                      <span>{appointment.vehicleInfo}</span>
                    </div>
                    
                    <div className="appointment-detail">
                      <FileText size={16} />
                      <span>{appointment.serviceType}</span>
                    </div>
                    
                    {appointment.description && (
                      <div className="appointment-description">
                        <strong>Details:</strong>
                        <p>{appointment.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="appointment-footer">
                    <div className="appointment-dates">
                      <small>Created: {formatDate(appointment.createdAt)}</small>
                      {appointment.updatedAt !== appointment.createdAt && (
                        <small>Updated: {formatDate(appointment.updatedAt)}</small>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
