const { initializeFirebase, getDb } = require('../config/firebase');
const storageService = require('../services/storageService');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize Firebase
initializeFirebase();
const db = getDb();
const appointmentsCollection = db.collection('appointments');

/**
 * @desc    Get all appointments
 * @route   GET /api/appointments
 * @access  Private (Staff/Admin)
 */
const getAppointments = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      serviceType,
      startDate,
      endDate,
      search
    } = req.query;

    let query = appointmentsCollection;

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }

    if (serviceType) {
      query = query.where('serviceType', '==', serviceType);
    }

    if (startDate && endDate) {
      query = query
        .where('appointmentDate', '>=', new Date(startDate))
        .where('appointmentDate', '<=', new Date(endDate));
    }

    // Order by creation date
    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    let appointments = [];

    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        appointmentDate: doc.data().appointmentDate?.toDate()
      });
    });

    // Apply text search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter(appointment =>
        appointment.customerName?.toLowerCase().includes(searchLower) ||
        appointment.email?.toLowerCase().includes(searchLower) ||
        appointment.phone?.includes(search) ||
        appointment.vehicleInfo?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = appointments.length;
    const paginatedAppointments = appointments.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedAppointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments'
    });
  }
});

/**
 * @desc    Get single appointment
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await appointmentsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const appointment = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      appointmentDate: doc.data().appointmentDate?.toDate()
    };

    // Check if user can access this appointment
    if (req.user.role === 'customer' && appointment.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointment'
    });
  }
});

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Public/Private
 */
const createAppointment = asyncHandler(async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    
    const {
      name,
      email,
      phone,
      vehicleInfo,
      vehicleId, // New field for selected vehicle
      damageType,
      description,
      preferredDate,
      preferredTime,
      paymentMethod,
      insuranceCompany,
      isUrgent = false
    } = req.body;

    // Handle file uploads if any
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await storageService.uploadFiles(req.files, 'appointments');
    }

    const appointmentData = {
      customerName: name, // Store as customerName in database for admin display
      email,
      phone,
      vehicleInfo: vehicleInfo || 'N/A', // Default if not provided
      vehicleId: vehicleId || null, // Store reference to selected vehicle
      serviceType: damageType, // Store as serviceType in database - this maps damageType from frontend
      description: description || null,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      preferredTime: preferredTime || null,
      paymentMethod,
      insuranceCompany: insuranceCompany || null,
      isUrgent,
      status: 'pending',
      images: uploadedImages,
      userId: req.user?.uid || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Processed appointment data:', appointmentData);

    // Filter out undefined values to avoid Firestore errors
    const cleanedAppointmentData = Object.fromEntries(
      Object.entries(appointmentData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await appointmentsCollection.add(cleanedAppointmentData);

    // Prepare response data with the document ID
    const responseData = {
      id: docRef.id,
      ...cleanedAppointmentData
    };

    console.log('🔍 User authentication check:', {
      hasUser: !!req.user,
      userId: req.user?.uid,
      userRole: req.user?.role,
      authHeader: !!req.headers.authorization
    });

    // Send email and SMS notifications only if user is logged in
    if (req.user?.uid) {
      console.log('📧 Sending appointment confirmation email for logged-in user:', req.user.uid);
      console.log('📧 Email recipient:', responseData.email);
      
      // Send email confirmation
      try {
        const emailResult = await emailService.sendAppointmentConfirmation({
          ...responseData,
          // Ensure we have all needed fields for email
          selectedServices: appointmentData.selectedServices || [],
          damageType: appointmentData.damageType
        });
        
        if (emailResult.success) {
          console.log('✅ Appointment confirmation email sent successfully:', emailResult.messageId);
        } else {
          console.warn('❌ Failed to send appointment confirmation email:', emailResult.error);
          // Don't fail the appointment creation if email fails
        }
      } catch (emailError) {
        console.error('💥 Error sending appointment confirmation email:', emailError);
        // Don't fail the appointment creation if email fails
      }
      
      // Send SMS confirmation if phone number is provided
      if (responseData.phone) {
        // Validate phone number has at least 10 digits
        const digitsOnly = responseData.phone.replace(/\D/g, '');
        if (digitsOnly.length >= 10) {
          console.log('📱 Sending SMS confirmation to user\'s phone');
          try {
            // Add appointment ID to the response data for reference in SMS
            const appointmentWithId = {
              ...responseData,
              // Ensure we have all needed fields for SMS
              selectedServices: appointmentData.selectedServices || [],
              damageType: appointmentData.damageType
            };
            
            // Send the SMS via our service
            const smsResult = await smsService.sendAppointmentConfirmation(appointmentWithId);
            
            if (smsResult.success) {
              console.log('✅ SMS confirmation sent successfully:', smsResult.messageSid);
              
              // Update the appointment with the message SID for reference
              await appointmentsCollection.doc(docRef.id).update({
                smsSent: true,
                smsMessageSid: smsResult.messageSid,
                smsStatus: smsResult.status || 'queued',
                updatedAt: new Date()
              });
            } else {
              console.warn('❌ Failed to send SMS confirmation:', smsResult.error);
              // Don't fail the appointment creation if SMS fails
            }
          } catch (smsError) {
            console.error('💥 Error sending SMS confirmation:', smsError);
            // Don't fail the appointment creation if SMS fails
          }
        } else {
          console.log(`⚠️ Phone number format invalid: ${responseData.phone} (${digitsOnly.length} digits)`);
        }
      } else {
        console.log('⏭️ Skipping SMS notification - no phone number provided');
      }
    } else {
      console.log('⏭️ Skipping notifications - user not logged in');
    }

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
});

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
const updateAppointment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get existing appointment
    const doc = await appointmentsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const existingAppointment = doc.data();

    // Enhanced logging for debugging
    console.log(`===== APPOINTMENT UPDATE DEBUG =====`);
    console.log(`User attempting to update appointment - Role: ${req.user.role}, User ID: ${req.user.uid}`);
    console.log(`User object:`, JSON.stringify(req.user, null, 2));
    console.log(`Authorization header:`, req.headers.authorization ? 'Present' : 'Missing');
    console.log(`Appointment ID: ${id}`);
    console.log(`Existing appointment userId: ${existingAppointment.userId}`);
    
    // MOST DIRECT FIX: Check for admin access using multiple possible indicators
    const isAdmin = (
      req.user.role === 'admin' || 
      req.user.type === 'admin' || 
      req.user.username === 'PNBAdmin' ||
      req.user.uid === 'admin-001'
    );
    
    const isStaff = req.user.role === 'staff';
    const isCustomer = req.user.role === 'customer';
    
    console.log(`Permission check - isAdmin: ${isAdmin}, isStaff: ${isStaff}, isCustomer: ${isCustomer}`);
    
    if (isAdmin || isStaff) {
      console.log(`✅ ADMIN/STAFF ACCESS GRANTED - ${isAdmin ? 'Admin' : 'Staff'} can edit any appointment`);
      // Admin and staff can edit any appointment - continue with update
    } 
    else if (isCustomer) {
      if (existingAppointment.userId !== req.user.uid) {
        console.log(`❌ ACCESS DENIED - Customer ${req.user.uid} cannot edit appointment owned by ${existingAppointment.userId}`);
        return res.status(403).json({
          success: false,
          error: 'You can only edit your own appointments'
        });
      }
      console.log(`✅ CUSTOMER ACCESS GRANTED - Customer owns this appointment`);
    } 
    else {
      console.log(`❌ ACCESS DENIED - Unrecognized user role/type: ${JSON.stringify(req.user)}`);
      return res.status(403).json({
        success: false,
        error: 'Invalid permissions - unrecognized user role'
      });
    }
    
    console.log(`===== PROCEEDING WITH APPOINTMENT UPDATE =====`);

    // Handle new file uploads
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await storageService.uploadFiles(req.files, 'appointments');
    }

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle date conversion
    if (updates.preferredDate) {
      updateData.preferredDate = new Date(updates.preferredDate);
    }
    if (updates.appointmentDate) {
      updateData.appointmentDate = new Date(updates.appointmentDate);
    }

    // Merge new images with existing ones
    if (newImages.length > 0) {
      updateData.images = [...(existingAppointment.images || []), ...newImages];
    }

    await appointmentsCollection.doc(id).update(updateData);

    // Get updated appointment
    const updatedDoc = await appointmentsCollection.doc(id).get();
    const updatedAppointment = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate(),
      updatedAt: updatedDoc.data().updatedAt?.toDate(),
      appointmentDate: updatedDoc.data().appointmentDate?.toDate(),
      preferredDate: updatedDoc.data().preferredDate?.toDate()
    };

    res.status(200).json({
      success: true,
      data: updatedAppointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
});

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Staff/Admin)
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Get appointment to check if it exists and get image references
    const doc = await appointmentsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const appointmentData = doc.data();

    // Delete associated images from storage
    if (appointmentData.images && appointmentData.images.length > 0) {
      try {
        const fileNames = appointmentData.images.map(img => img.fileName);
        await storageService.deleteFiles(fileNames);
      } catch (storageError) {
        console.error('Error deleting images:', storageError);
        // Continue with appointment deletion even if image deletion fails
      }
    }

    // Delete appointment document
    await appointmentsCollection.doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment'
    });
  }
});

/**
 * @desc    Get appointments by user
 * @route   GET /api/appointments/user/:userId
 * @access  Private
 */
const getUserAppointments = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can access these appointments
    if (req.user.role === 'customer' && req.user.uid !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const snapshot = await appointmentsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        appointmentDate: doc.data().appointmentDate?.toDate(),
        preferredDate: doc.data().preferredDate?.toDate()
      });
    });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user appointments'
    });
  }
});

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Staff/Admin)
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const doc = await appointmentsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.statusNotes = notes;
    }

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await appointmentsCollection.doc(id).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status'
    });
  }
});

/**
 * @desc    Get user's completed appointment history
 * @route   GET /api/appointments/history
 * @access  Private (Customer)
 */
const getUserAppointmentHistory = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log('Fetching appointment history for user:', userEmail);

    const snapshot = await appointmentsCollection
      .where('email', '==', userEmail)
      .where('status', '==', 'completed')
      .orderBy('updatedAt', 'desc')
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching user appointment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment history'
    });
  }
});

/**
 * @desc    Get all completed appointment history (Admin)
 * @route   GET /api/appointments/admin/history
 * @access  Private (Admin)
 */
const getAdminAppointmentHistory = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching admin appointment history');

    const snapshot = await appointmentsCollection
      .where('status', '==', 'completed')
      .orderBy('updatedAt', 'desc')
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching admin appointment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment history'
    });
  }
});

/**
 * @desc    Send/Resend SMS notification for an appointment
 * @route   POST /api/appointments/:id/send-sms
 * @access  Private (Admin/Staff)
 */
const sendAppointmentSMS = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { customMessage } = req.body; // Optional custom message
    
    // Get the appointment
    const doc = await appointmentsCollection.doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    const appointmentData = {
      id: doc.id,
      ...doc.data()
    };
    
    // Validate appointment has a phone number
    if (!appointmentData.phone) {
      return res.status(400).json({
        success: false,
        error: 'Appointment does not have a phone number'
      });
    }
    
    // If there's a custom message, add it to the appointment data
    if (customMessage) {
      appointmentData.customMessage = customMessage;
    }
    
    // Send the SMS
    const smsResult = await smsService.sendAppointmentConfirmation(appointmentData);
    
    if (smsResult.success) {
      // Update appointment with SMS information
      await appointmentsCollection.doc(id).update({
        smsSent: true,
        smsMessageSid: smsResult.messageSid,
        smsStatus: smsResult.status || 'queued',
        lastSmsSentAt: new Date(),
        updatedAt: new Date()
      });
      
      return res.status(200).json({
        success: true,
        message: 'SMS notification sent successfully',
        smsResult
      });
    } else {
      return res.status(400).json({
        success: false,
        error: smsResult.error || 'Failed to send SMS notification',
        details: smsResult
      });
    }
  } catch (error) {
    console.error('Send appointment SMS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS notification',
      details: error.message
    });
  }
});

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  getUserAppointmentHistory,
  getAdminAppointmentHistory,
  sendAppointmentSMS
};
