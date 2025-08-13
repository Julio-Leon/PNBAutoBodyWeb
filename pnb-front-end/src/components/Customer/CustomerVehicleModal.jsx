import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Car, 
  Save,
  Calendar,
  Palette,
  FileText,
  Hash
} from 'lucide-react';
import './CustomerVehicleModal.css';

const CustomerVehicleModal = ({ vehicle, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    licensePlate: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const carMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
    'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
    'Infiniti', 'Acura', 'Jeep', 'RAM', 'GMC', 'Cadillac', 'Buick',
    'Lincoln', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Tesla',
    'Mitsubishi', 'Chrysler', 'Dodge', 'Fiat', 'Mini', 'Genesis', 'Other'
  ];

  const colors = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
    'Orange', 'Brown', 'Purple', 'Gold', 'Beige', 'Maroon', 'Navy',
    'Teal', 'Pink', 'Burgundy', 'Charcoal', 'Other'
  ];

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        color: vehicle.color || '',
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        notes: vehicle.notes || ''
      });
    } else {
      // Reset form for new vehicle
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        vin: '',
        licensePlate: '',
        notes: ''
      });
    }
    setError('');
  }, [vehicle, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!formData.make || !formData.model || !formData.year) {
      setError('Make, Model, and Year are required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await onSave(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save vehicle');
      }
    } catch (error) {
      setError('An error occurred while saving the vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          className="modal-content vehicle-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="vehicle-form">
            <div className="form-section">
              <h3><Car size={20} /> Vehicle Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="make">Make *</label>
                  <select
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Make</option>
                    {carMakes.map((make) => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., Camry, Civic, F-150"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Color</option>
                    {colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><FileText size={20} /> Additional Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vin">VIN</label>
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    placeholder="17-character VIN"
                    maxLength="17"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="licensePlate">License Plate</label>
                  <input
                    type="text"
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    placeholder="License plate number"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional notes about this vehicle..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner-small"></div>
                ) : (
                  <>
                    <Save size={16} />
                    {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerVehicleModal;
