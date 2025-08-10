import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ appointment, onClose, onConfirm }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content delete-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <AlertTriangle className="warning-icon" size={48} />
            <h3>Are you sure you want to delete this appointment?</h3>
            <p>This action cannot be undone. The appointment will be permanently removed from the system.</p>
          </div>

          <div className="appointment-summary">
            <div className="summary-item">
              <strong>Customer:</strong> {appointment.customerName || 'N/A'}
            </div>
            <div className="summary-item">
              <strong>Service:</strong> {appointment.serviceType || 'N/A'}
            </div>
            <div className="summary-item">
              <strong>Date:</strong> {appointment.preferredDate ? new Date(appointment.preferredDate).toLocaleDateString() : 'N/A'}
            </div>
            <div className="summary-item">
              <strong>ID:</strong> #{appointment.id?.slice(-8) || 'N/A'}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={onConfirm}
          >
            Delete Appointment
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmModal;
