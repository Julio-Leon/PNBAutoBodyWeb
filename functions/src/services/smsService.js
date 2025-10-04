const twilio = require('twilio');
const functions = require('firebase-functions');

// Load environment variables for local development
if (process.env.FUNCTIONS_EMULATOR) {
  require('dotenv').config();
}

class SMSService {
  constructor() {
    // Initialize Twilio with API credentials from environment variables
    // Try multiple sources: .env file, Firebase config, process.env
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 
                      (functions.config().twilio ? functions.config().twilio.account_sid : null);
    const authToken = process.env.TWILIO_AUTH_TOKEN || 
                      (functions.config().twilio ? functions.config().twilio.auth_token : null);
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || 
                        (functions.config().twilio ? functions.config().twilio.phone_number : null);
    
    // Check if we have the required credentials
    this.isConfigured = !!(accountSid && authToken && phoneNumber);
    
    if (this.isConfigured) {
      // Initialize the Twilio client with credentials
      this.client = twilio(accountSid, authToken, {
        logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        autoRetry: true,
        maxRetries: 3
      });
      this.twilioPhoneNumber = phoneNumber;
      console.log('✅ Twilio initialized successfully');
    } else {
      console.warn('⚠️ Twilio API credentials not configured. SMS notifications will be disabled.');
      console.log('Environment check:', {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Found' : 'Not found',
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Found' : 'Not found',
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? 'Found' : 'Not found',
        functions_config_twilio: functions.config().twilio ? 'Found' : 'Not found',
        FUNCTIONS_EMULATOR: process.env.FUNCTIONS_EMULATOR
      });
    }
  }

  /**
   * Send SMS appointment confirmation to customer
   * @param {Object} appointmentData - The appointment data
   * @returns {Promise<Object>} - Success status and message ID or error
   */
  async sendAppointmentConfirmation(appointmentData) {
    // Check if Twilio is properly configured
    if (!this.isConfigured) {
      console.warn('⚠️ SMS notification skipped: Twilio not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const {
        customerName,
        phone,
        serviceType,
        vehicleInfo,
        preferredDate,
        preferredTime,
        id
      } = appointmentData;

      // Check if phone number is valid
      if (!phone) {
        console.warn('⚠️ SMS notification skipped: Phone number not provided');
        return { success: false, error: 'Phone number not provided' };
      }
      
      // Format the date and time for display
      const formattedDate = preferredDate 
        ? new Date(preferredDate).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'long', 
            day: 'numeric' 
          })
        : 'To be scheduled';
      
      // Create a personalized SMS message with appointment details
      const message = [
        `Hi ${customerName.split(' ')[0]},`,
        `Your appointment at P&N Auto Body has been confirmed!`,
        ``,
        `Service: ${serviceType}`,
        `Vehicle: ${vehicleInfo || 'Not specified'}`,
        `Date: ${formattedDate}`,
        `Time: ${preferredTime || 'To be confirmed'}`,
        `Ref #: ${id.substring(0, 8)}`,
        ``,
        `Need to reschedule? Call us at (555) 123-4567.`,
        `Thank you for choosing P&N Auto Body!`
      ].join('\n');
      
      // Format phone number to E.164 format for Twilio
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Log the attempt
      console.log(`📱 Sending appointment confirmation SMS to ${this.maskPhone(formattedPhone)}`);
      
      // Send the SMS using Twilio
      const result = await this.client.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone,
        // Optional: Add status callback URL to track delivery
        // statusCallback: 'https://your-status-callback-url.com/sms-status'
      });
      
      console.log(`✅ SMS sent successfully, SID: ${result.sid}`);
      return { 
        success: true, 
        messageSid: result.sid,
        to: formattedPhone,
        status: result.status
      };
    } catch (error) {
      // Handle specific Twilio error codes
      let errorMessage = error.message;
      if (error.code) {
        switch (error.code) {
          case 21211:
            errorMessage = 'Invalid phone number format';
            break;
          case 21612:
            errorMessage = 'This phone number is not currently available for sending SMS';
            break;
          case 21610:
            errorMessage = 'Message body cannot be empty';
            break;
          default:
            errorMessage = `Twilio Error ${error.code}: ${error.message}`;
        }
      }
      
      console.error(`❌ Failed to send SMS notification: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Mask a phone number for logging purposes
   * @param {string} phoneNumber - The phone number to mask
   * @returns {string} - The masked phone number
   */
  maskPhone(phoneNumber) {
    if (!phoneNumber) return '';
    // Keep country code and last 4 digits, mask the rest
    return phoneNumber.replace(/(\+\d{1,3})(\d{6})(\d{4})/, '$1******$3');
  }
  
  /**
   * Format phone number to E.164 standard for Twilio
   * @param {string} phoneNumber - Raw phone number from user input
   * @returns {string} - E.164 formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Check if the number already has a country code
    if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
      return `+${digitsOnly}`;
    }
    
    // Add US country code (+1) if not present
    return `+1${digitsOnly}`;
  }
}

module.exports = new SMSService();
