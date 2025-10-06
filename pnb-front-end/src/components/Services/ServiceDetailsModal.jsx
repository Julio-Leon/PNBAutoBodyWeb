import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, Award } from 'lucide-react';
import './ServiceDetailsModal.css';

const ServiceDetailsModal = ({ service, isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="service-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <button className="modal-close-btn" onClick={onClose}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <div className="modal-icon">
                {service.icon}
              </div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </div>

            <div className="modal-content">
              {/* Features Section */}
              {service.features && service.features.length > 0 && (
                <div className="modal-section">
                  <h3>Features</h3>
                  <div className="feature-list">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <CheckCircle size={18} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included Section */}
              {service.included && service.included.length > 0 && (
                <div className="modal-section">
                  <h3>What's Included</h3>
                  <div className="feature-list">
                    {service.included.map((item, idx) => (
                      <div key={idx} className="feature-item">
                        <CheckCircle size={18} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Good For Section */}
              {service.goodFor && service.goodFor.length > 0 && (
                <div className="modal-section">
                  <h3>Good For</h3>
                  <div className="feature-list">
                    {service.goodFor.map((item, idx) => (
                      <div key={idx} className="feature-item">
                        <CheckCircle size={18} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Section */}
              {service.addon && service.addon.length > 0 && (
                <div className="modal-section">
                  <h3>Add-Ons</h3>
                  <div className="feature-list">
                    {service.addon.map((item, idx) => (
                      <div key={idx} className="feature-item">
                        <CheckCircle size={18} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration and Warranty */}
              <div className="modal-footer">
                <div className="modal-detail">
                  <Clock size={20} />
                  <div>
                    <span className="label">Duration</span>
                    <span className="value">{service.duration}</span>
                  </div>
                </div>
                <div className="modal-detail">
                  <Award size={20} />
                  <div>
                    <span className="label">Warranty</span>
                    <span className="value">{service.warranty}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ServiceDetailsModal;
