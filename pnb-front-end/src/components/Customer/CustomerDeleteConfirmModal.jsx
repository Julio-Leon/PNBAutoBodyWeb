import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const CustomerDeleteConfirmModal = ({ appointment, isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !appointment) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content delete-confirm-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="delete-icon">
              <AlertTriangle size={48} color="#ef4444" />
            </div>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            <h2>Delete Appointment</h2>
            <p>Are you sure you want to delete this appointment?</p>
            
            <div className="appointment-summary">
              <div className="summary-item">
                <strong>Service:</strong> {appointment.serviceType || appointment.damageType || 'N/A'}
              </div>
              <div className="summary-item">
                <strong>Vehicle:</strong> {appointment.vehicleInfo || 'N/A'}
              </div>
              <div className="summary-item">
                <strong>Date:</strong> {appointment.preferredDate ? 
                  new Date(appointment.preferredDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className="warning-text">
              <AlertTriangle size={16} />
              This action cannot be undone.
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => onConfirm(appointment.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="spinner-small" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete Appointment
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerDeleteConfirmModal;
