import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase,
  Plus,
  Wrench,
  Clock,
  DollarSign,
  User,
  Car,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import CreateJobModal from './CreateJobModal';
import './JobDashboard.css';

const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    pending: 0,
    completed: 0
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      calculateStats(jobs);
    }
  }, [jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      
      // For now, we'll show an empty state since the API endpoint doesn't exist yet
      // When the backend is ready, uncomment this:
      /*
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
      */
      
      // Temporary: Set empty array
      setJobs([]);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobsData) => {
    const stats = {
      total: jobsData.length,
      inProgress: jobsData.filter(job => job.status === 'in-progress').length,
      pending: jobsData.filter(job => job.status === 'pending').length,
      completed: jobsData.filter(job => job.status === 'completed').length
    };
    setStats(stats);
  };

  const handleCreateJob = async (jobData) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
      
      // When backend is ready, uncomment this:
      /*
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(prev => [data.data, ...prev]);
        setShowCreateModal(false);
      }
      */
      
      // Temporary: Just close modal and show success
      console.log('Job data to create:', jobData);
      setShowCreateModal(false);
      alert('Job creation will be enabled once the backend API is ready.');
      
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job. Please try again.');
    }
  };

  const renderEmptyState = () => (
    <motion.div 
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="empty-icon">
        <Briefcase size={64} />
      </div>
      <h3>No Jobs Yet</h3>
      <p>Get started by creating your first job.</p>
      <button 
        className="create-job-button-large"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus size={20} />
        Create First Job
      </button>
    </motion.div>
  );

  const renderJobsList = () => (
    <div className="jobs-list">
      {/* Jobs will be rendered here when they exist */}
      <p className="coming-soon-text">Job list will appear here once jobs are created.</p>
    </div>
  );

  return (
    <div className="job-dashboard">
      <div className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <Briefcase className="dashboard-icon" />
            <div className="header-text">
              <h1>Job Dashboard</h1>
              <p>Manage all active jobs at the shop</p>
            </div>
          </div>
          <button 
            className="create-job-button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Create Job
          </button>
        </div>

        <div className="stats-container">
          <div className="stat-card total">
            <div className="stat-icon">
              <Briefcase />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
          </div>

          <div className="stat-card in-progress">
            <div className="stat-icon">
              <Wrench />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
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

          <div className="stat-card completed">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={48} />
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          renderEmptyState()
        ) : (
          renderJobsList()
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateJobModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateJob}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobDashboard;
