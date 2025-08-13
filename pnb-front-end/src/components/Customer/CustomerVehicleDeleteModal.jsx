import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Car } from 'lucide-react';
import './CustomerVehicleDeleteModal.css';

const CustomerVehicleDeleteModal = ({ vehicle, isOpen, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!vehicle) return;
    
    setIsDeleting(true);
    const success = await onConfirm(vehicle.id);
    setIsDeleting(false);
    
    if (success) {
      onClose();
    }
  };

  if (!isOpen || !vehicle) return null;

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
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
            <h2>Delete Vehicle</h2>
            <p>Are you sure you want to delete this vehicle? This action cannot be undone.</p>

            <div className="vehicle-summary">
              <div className="summary-item">
                <Car size={16} />
                <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong>
              </div>
              {vehicle.color && (
                <div className="summary-item">
                  <span>Color: {vehicle.color}</span>
                </div>
              )}
              {vehicle.licensePlate && (
                <div className="summary-item">
                  <span>License Plate: {vehicle.licensePlate}</span>
                </div>
              )}
            </div>

            <div className="warning-text">
              <AlertTriangle size={16} />
              <span>This will permanently remove the vehicle from your account.</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="spinner-small"></div>
                  Deleting...
                </>
              ) : (
                'Delete Vehicle'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerVehicleDeleteModal;
