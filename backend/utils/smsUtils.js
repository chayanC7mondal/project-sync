import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

// Email configuration
const createEmailTransporter = () => {
  // Use Gmail SMTP as a free service
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
    }
  });
};

/**
 * Send SMS using free services
 * Priority: TextBelt (free) -> SMS Gateway API (fallback)
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    console.log(`[SMS] Attempting to send SMS to ${phoneNumber}`);
    
    if (!process.env.ENABLE_SMS || process.env.ENABLE_SMS === 'false') {
      console.log('[SMS] SMS sending is disabled in environment');
      return { success: true, provider: 'disabled', message: 'SMS sending disabled' };
    }

    // Method 1: TextBelt (Free - 1 SMS per day per IP)
    if (process.env.TEXTBELT_KEY || process.env.NODE_ENV === 'development') {
      try {
        const response = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            message: message,
            key: process.env.TEXTBELT_KEY || 'textbelt' // 'textbelt' for free quota
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`[SMS] TextBelt SMS sent successfully to ${phoneNumber}`);
          return { success: true, provider: 'textbelt', messageId: result.textId };
        } else {
          console.warn(`[SMS] TextBelt failed: ${result.error}`);
        }
      } catch (error) {
        console.error('[SMS] TextBelt error:', error.message);
      }
    }

    // Method 2: SMS Gateway API (Fallback - Free tier available)
    if (process.env.SMS_GATEWAY_API_KEY) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': process.env.SMS_GATEWAY_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: phoneNumber
          })
        });

        const result = await response.json();
        
        if (result.return) {
          console.log(`[SMS] Fast2SMS sent successfully to ${phoneNumber}`);
          return { success: true, provider: 'fast2sms', messageId: result.request_id };
        } else {
          console.warn(`[SMS] Fast2SMS failed: ${result.message}`);
        }
      } catch (error) {
        console.error('[SMS] Fast2SMS error:', error.message);
      }
    }

    // Method 3: Email-to-SMS as final fallback (carrier gateways)
    if (process.env.EMAIL_USER) {
      try {
        const emailGateways = {
          // Indian carriers
          'airtel': '@airtelap.com',
          'jio': '@jiomsg.com', 
          'vi': '@vtext.com', // Vodafone Idea
          'bsnl': '@bsnlmobile.com',
          // International carriers
          'verizon': '@vtext.com',
          'att': '@txt.att.net',
          'tmobile': '@tmomail.net',
          'sprint': '@messaging.sprintpcs.com'
        };

        // Try common Indian carriers first
        for (const [carrier, gateway] of Object.entries(emailGateways)) {
          if (carrier === 'airtel' || carrier === 'jio' || carrier === 'vi') {
            try {
              const emailAddress = `${phoneNumber}${gateway}`;
              await sendEmail(emailAddress, 'Court Hearing Alert', message);
              console.log(`[SMS] Email-to-SMS sent via ${carrier} gateway to ${phoneNumber}`);
              return { success: true, provider: `email-sms-${carrier}` };
            } catch (error) {
              console.warn(`[SMS] Email-to-SMS via ${carrier} failed:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error('[SMS] Email-to-SMS fallback failed:', error.message);
      }
    }

    console.warn(`[SMS] All SMS methods failed for ${phoneNumber}`);
    return { success: false, error: 'All SMS services unavailable' };

  } catch (error) {
    console.error('[SMS] Critical SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification
 */
export const sendEmail = async (to, subject, htmlContent, textContent = null) => {
  try {
    console.log(`[EMAIL] Sending email to ${to}`);
    
    if (!process.env.EMAIL_USER) {
      console.log('[EMAIL] Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"Court Management System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Email sent successfully to ${to}, MessageId: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId, provider: 'gmail' };
    
  } catch (error) {
    console.error(`[EMAIL] Email sending failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification via multiple channels (in-app + SMS + Email)
 */
export const sendMultiChannelNotification = async (user, notification) => {
  const results = {
    inApp: null,
    sms: null,
    email: null
  };

  try {
    // 1. In-app notification (always send)
    const { sendNotification } = await import('./notificationUtils.js');
    results.inApp = await sendNotification(notification);

    // 2. SMS notification (if phone number available)
    if (user.phone && notification.priority && ['high', 'urgent'].includes(notification.priority)) {
      const smsMessage = `${notification.title}\n\n${notification.message}\n\n- Court Management System`;
      results.sms = await sendSMS(user.phone, smsMessage);
    }

    // 3. Email notification (if email available and important)
    if (user.email && notification.priority && ['high', 'urgent'].includes(notification.priority)) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1>Court Management System</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af;">${notification.title}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              ${notification.message}
            </p>
            <div style="margin-top: 30px; padding: 20px; background: #e0f2fe; border-left: 4px solid #0284c7;">
              <p style="margin: 0; font-weight: bold; color: #0284c7;">Priority: ${notification.priority.toUpperCase()}</p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated message from the Court Management System.
              </p>
            </div>
          </div>
        </div>
      `;
      
      results.email = await sendEmail(user.email, notification.title, emailHtml);
    }

    return results;

  } catch (error) {
    console.error('[MULTI-CHANNEL] Notification sending failed:', error);
    return { ...results, error: error.message };
  }
};

export default { sendSMS, sendEmail, sendMultiChannelNotification };
