const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');

// Load environment variables for local development
if (process.env.FUNCTIONS_EMULATOR) {
  require('dotenv').config();
}

class EmailService {
  constructor() {
    // Initialize SendGrid with API key from environment variables
    // Try multiple sources: .env file, Firebase config, process.env
    const apiKey = process.env.SENDGRID_API_KEY || 
                   (functions.config().sendgrid ? functions.config().sendgrid.api_key : null);
    
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      console.log('✅ SendGrid initialized successfully');
    } else {
      console.warn('⚠️ SendGrid API key not configured. Email notifications will be disabled.');
      console.log('Environment check:', {
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Found' : 'Not found',
        functions_config: functions.config().sendgrid?.api_key ? 'Found' : 'Not found',
        FUNCTIONS_EMULATOR: process.env.FUNCTIONS_EMULATOR
      });
    }
  }

  /**
   * Generate HTML email template for appointment confirmation
   */
  generateAppointmentEmailTemplate(appointmentData) {
    const {
      customerName,
      email,
      phone,
      vehicleInfo,
      serviceType,
      description,
      preferredDate,
      preferredTime,
      paymentMethod,
      insuranceCompany,
      id
    } = appointmentData;

    const formattedDate = preferredDate 
      ? new Date(preferredDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'To be scheduled';

    const services = Array.isArray(appointmentData.selectedServices) 
      ? appointmentData.selectedServices.join(', ')
      : (appointmentData.damageType || 'General Service');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation - P&N Auto</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .welcome {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2a5298;
        }
        
        .appointment-details {
            background-color: #f8f9fa;
            border-left: 4px solid #2a5298;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;
        }
        
        .detail-label {
            font-weight: bold;
            color: #1e3c72;
            min-width: 140px;
            margin-right: 10px;
        }
        
        .detail-value {
            color: #555;
            flex: 1;
        }
        
        .reference-number {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            margin: 25px 0;
        }
        
        .reference-number strong {
            font-size: 18px;
        }
        
        .next-steps {
            background-color: #e8f4f8;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .next-steps h3 {
            color: #1e3c72;
            margin-bottom: 15px;
        }
        
        .next-steps ul {
            padding-left: 20px;
        }
        
        .next-steps li {
            margin-bottom: 8px;
            color: #555;
        }
        
        .contact-info {
            background-color: #1e3c72;
            color: white;
            padding: 25px;
            text-align: center;
        }
        
        .contact-info h3 {
            margin-bottom: 15px;
        }
        
        .contact-details {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        
        .contact-item {
            margin: 5px;
        }
        
        .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }
        
        .website-link {
            color: #2a5298;
            text-decoration: none;
            font-weight: bold;
        }
        
        .website-link:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .detail-row {
                flex-direction: column;
            }
            
            .detail-label {
                min-width: auto;
                margin-bottom: 5px;
            }
            
            .contact-details {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 P&N Auto Body</h1>
            <p>Your Trusted Automotive Service Partner</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                Hello ${customerName}! 👋
            </div>
            
            <p>Thank you for choosing P&N Auto Body! We have successfully received your appointment request and our team will review it shortly.</p>
            
            <div class="reference-number">
                <strong>Appointment Reference: #${id?.substring(0, 8).toUpperCase() || 'PENDING'}</strong>
            </div>
            
            <div class="appointment-details">
                <h3 style="color: #1e3c72; margin-bottom: 15px;">📋 Appointment Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">👤 Customer:</span>
                    <span class="detail-value">${customerName}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📧 Email:</span>
                    <span class="detail-value">${email}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📱 Phone:</span>
                    <span class="detail-value">${phone}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">🚙 Vehicle:</span>
                    <span class="detail-value">${vehicleInfo}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">🔧 Service Type:</span>
                    <span class="detail-value">${serviceType}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">⚙️ Services:</span>
                    <span class="detail-value">${services}</span>
                </div>
                
                ${description ? `
                <div class="detail-row">
                    <span class="detail-label">📝 Description:</span>
                    <span class="detail-value">${description}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                    <span class="detail-label">📅 Preferred Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                
                ${preferredTime ? `
                <div class="detail-row">
                    <span class="detail-label">⏰ Preferred Time:</span>
                    <span class="detail-value">${preferredTime}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                    <span class="detail-label">💳 Payment Method:</span>
                    <span class="detail-value">${paymentMethod === 'insurance' ? 'Insurance' : 'Out of Pocket'}</span>
                </div>
                
                ${insuranceCompany ? `
                <div class="detail-row">
                    <span class="detail-label">🛡️ Insurance Company:</span>
                    <span class="detail-value">${insuranceCompany}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="next-steps">
                <h3>🎯 What Happens Next?</h3>
                <ul>
                    <li><strong>Review & Confirmation:</strong> Our team will review your request within 24 hours</li>
                    <li><strong>Schedule Confirmation:</strong> We'll contact you to confirm your appointment time</li>
                    <li><strong>Service Preparation:</strong> We'll prepare everything needed for your visit</li>
                    <li><strong>Quality Service:</strong> Our certified technicians will provide expert care for your vehicle</li>
                </ul>
            </div>
        </div>
        
        <div class="contact-info">
            <h3>📞 Need to Contact Us?</h3>
            <p>Our team is here to help with any questions about your appointment.</p>
            <div class="contact-details">
                <div class="contact-item">
                    <strong>📍 Address:</strong><br>
                    191 Bruckner Blvd<br>
                    Bronx, NY
                </div>
                <div class="contact-item">
                    <strong>🌐 Website:</strong><br>
                    <a href="https://pnbautobody-33725.web.app/" class="website-link">Visit Our Website</a>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent to confirm your appointment request with P&N Auto Body.</p>
            <p>Please keep this email for your records.</p>
            <br>
            <p>© 2025 P&N Auto Body. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointmentData) {
    try {
      console.log('📧 Starting email send process...');
      
      // Get API key directly since we're not in constructor anymore
      const apiKey = process.env.SENDGRID_API_KEY || 
                   (functions.config().sendgrid ? functions.config().sendgrid.api_key : null);
      
      console.log('📧 API key check:', {
        hasApiKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'None'
      });
      
      if (!apiKey) {
        console.error('⚠️ CRITICAL: SendGrid API key not configured.');
        console.error('- process.env.SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Found' : 'Not found');
        console.error('- functions.config().sendgrid:', functions.config().sendgrid ? 'Found' : 'Not found');
        return { success: false, error: 'Email service not configured (No API key)' };
      }
      
      // Make sure API key is set each time (in case it wasn't in constructor)
      sgMail.setApiKey(apiKey);

      console.log('📧 Generating email content for:', appointmentData.email);
      const htmlContent = this.generateAppointmentEmailTemplate(appointmentData);
      
      const msg = {
        to: appointmentData.email,
        from: {
          email: 'noreply@pnbautobody.com',
          name: 'P&N Auto'
        },
        replyTo: 'info@pnbautobody.com',
        subject: `Appointment Confirmation - P&N Auto Body #${appointmentData.id?.substring(0, 8).toUpperCase() || 'PENDING'}`,
        html: htmlContent,
        text: this.generatePlainTextEmail(appointmentData), // Fallback for email clients that don't support HTML
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          }
        }
      };

      console.log('📧 Sending email to:', appointmentData.email);
      console.log('📧 Email subject:', msg.subject);
      
      const response = await sgMail.send(msg);
      console.log('✅ Appointment confirmation email sent successfully:', {
        to: appointmentData.email,
        messageId: response[0]?.headers ? response[0].headers['x-message-id'] : 'unknown'
      });

      return { 
        success: true, 
        messageId: response[0]?.headers ? response[0].headers['x-message-id'] : 'unknown' 
      };
    } catch (error) {
      console.error('💥 Failed to send appointment confirmation email:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('SendGrid API response error:', {
          status: error.response.status,
          body: error.response.body
        });
      } else {
        console.error('Unknown email error (not API related):', error.message);
        console.error('Error stack:', error.stack);
      }

      return { success: false, error: error.message };
    }
  }
  

  /**
   * Generate plain text version of the email (fallback)
   */
  generatePlainTextEmail(appointmentData) {
    const {
      customerName,
      email,
      phone,
      vehicleInfo,
      serviceType,
      description,
      preferredDate,
      preferredTime,
      paymentMethod,
      insuranceCompany,
      id
    } = appointmentData;

    const formattedDate = preferredDate 
      ? new Date(preferredDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'To be scheduled';

    const services = Array.isArray(appointmentData.selectedServices) 
      ? appointmentData.selectedServices.join(', ')
      : (appointmentData.damageType || 'General Service');

    return `
P&N Auto Body - Appointment Confirmation

Hello ${customerName}!

Thank you for choosing P&N Auto Body! We have successfully received your appointment request and our team will review it shortly.

Appointment Reference: #${id?.substring(0, 8).toUpperCase() || 'PENDING'}

APPOINTMENT DETAILS:
- Customer: ${customerName}
- Email: ${email}
- Phone: ${phone}
- Vehicle: ${vehicleInfo}
- Service Type: ${serviceType}
- Services: ${services}
${description ? `- Description: ${description}` : ''}
- Preferred Date: ${formattedDate}
${preferredTime ? `- Preferred Time: ${preferredTime}` : ''}
- Payment Method: ${paymentMethod === 'insurance' ? 'Insurance' : 'Out of Pocket'}
${insuranceCompany ? `- Insurance Company: ${insuranceCompany}` : ''}

WHAT HAPPENS NEXT?
1. Review & Confirmation: Our team will review your request within 24 hours
2. Schedule Confirmation: We'll contact you to confirm your appointment time
3. Service Preparation: We'll prepare everything needed for your visit
4. Quality Service: Our certified technicians will provide expert care for your vehicle

CONTACT US:
Address: 191 Bruckner Blvd, Bronx, NY
Website: https://pnbautobody-33725.web.app/

This email was sent to confirm your appointment request with P&N Auto Body.
Please keep this email for your records.

© 2025 P&N Auto Body. All rights reserved.
    `;
  }
}

module.exports = new EmailService();
