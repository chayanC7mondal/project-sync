import { sendSMS, sendEmail, sendMultiChannelNotification } from './utils/smsUtils.js';
import Auth from './models/authModel.js';
import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * Comprehensive test for SMS and Email notification system
 */

const testNotificationSystem = async () => {
  console.log('🚀 Testing Court Management Notification System');
  console.log('='.repeat(50));

  // Test SMS functionality
  await testSMS();
  
  // Test Email functionality  
  await testEmail();
  
  // Test multi-channel notifications
  await testMultiChannel();
  
  console.log('\n✅ All notification tests completed!');
  console.log('📋 Setup Instructions:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Configure your email: EMAIL_USER and EMAIL_APP_PASSWORD');
  console.log('3. For SMS: Set TEXTBELT_KEY or SMS_GATEWAY_API_KEY');
  console.log('4. Set ENABLE_SMS=true to activate SMS sending');
};

const testSMS = async () => {
  console.log('\n📱 Testing SMS Services:');
  console.log('-'.repeat(30));

  const testNumber = process.env.TEST_PHONE_NUMBER || '+919876543210'; // Indian format
  const message = 'Test SMS from Court Management System. Your hearing is scheduled for tomorrow at 10:00 AM.';

  try {
    console.log(`Sending SMS to: ${testNumber}`);
    const result = await sendSMS(testNumber, message);
    
    if (result.success) {
      console.log(`✅ SMS sent successfully via ${result.provider}`);
      if (result.messageId) console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.log(`❌ SMS failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ SMS error: ${error.message}`);
  }
};

const testEmail = async () => {
  console.log('\n📧 Testing Email Service:');
  console.log('-'.repeat(30));

  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const subject = 'Court Hearing Notification - Test';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
        <h1>🏛️ Court Management System</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc;">
        <h2 style="color: #1e40af;">Court Hearing Reminder</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          This is a test email from the Court Management System notification service.
        </p>
        <div style="margin: 20px 0; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6;">
          <p><strong>Test Case:</strong> CR/001/2025</p>
          <p><strong>Hearing Date:</strong> Tomorrow at 10:00 AM</p>
          <p><strong>Court Room:</strong> District Court, Room 1</p>
        </div>
        <div style="margin-top: 30px; padding: 20px; background: #fee2e2; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-weight: bold; color: #dc2626;">URGENT: Your presence is mandatory</p>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 14px;">
        This is an automated message from the Court Management System.
      </div>
    </div>
  `;

  try {
    console.log(`Sending email to: ${testEmail}`);
    const result = await sendEmail(testEmail, subject, htmlContent);
    
    if (result.success) {
      console.log(`✅ Email sent successfully via ${result.provider}`);
      if (result.messageId) console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.log(`❌ Email failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Email error: ${error.message}`);
  }
};

const testMultiChannel = async () => {
  console.log('\n🔄 Testing Multi-Channel Notifications:');
  console.log('-'.repeat(40));

  // Create a mock user for testing
  const mockUser = {
    _id: 'test-user-id',
    username: 'test_officer',
    email: process.env.TEST_EMAIL || 'test@example.com',
    phone: process.env.TEST_PHONE_NUMBER || '+919876543210',
    role: 'io',
    employeeId: 'IO001'
  };

  const mockNotification = {
    recipient: mockUser._id,
    type: 'alert',
    priority: 'urgent',
    title: 'URGENT: Court Hearing Today',
    message: 'Your court hearing for case CR/001/2025 is scheduled today at 10:00 AM in District Court, Room 1. Please arrive 30 minutes early with all case documents.',
    relatedEntityType: 'hearing',
    relatedEntityId: 'test-hearing-id'
  };

  try {
    console.log('Sending multi-channel notification...');
    const results = await sendMultiChannelNotification(mockUser, mockNotification);
    
    console.log('📊 Results:');
    if (results.inApp) {
      console.log('   ✅ In-app notification: Success');
    } else {
      console.log('   ❌ In-app notification: Failed');
    }
    
    if (results.sms) {
      console.log(`   ${results.sms.success ? '✅' : '❌'} SMS: ${results.sms.success ? 'Success via ' + results.sms.provider : results.sms.error}`);
    } else {
      console.log('   ⏭️  SMS: Skipped (not urgent priority or disabled)');
    }
    
    if (results.email) {
      console.log(`   ${results.email.success ? '✅' : '❌'} Email: ${results.email.success ? 'Success via ' + results.email.provider : results.email.error}`);
    } else {
      console.log('   ⏭️  Email: Skipped (not urgent priority)');
    }
    
  } catch (error) {
    console.log(`❌ Multi-channel error: ${error.message}`);
  }
};

// Test different notification scenarios
const testNotificationScenarios = () => {
  console.log('\n📋 Notification Scenarios:');
  console.log('-'.repeat(30));
  
  console.log('1. 📅 Pre-hearing Reminder (1 week before):');
  console.log('   • SMS + Email to IO and witnesses');
  console.log('   • Priority: HIGH');
  
  console.log('\n2. ⏰ Day-of-hearing Reminder (morning):');
  console.log('   • SMS + Email to all parties');
  console.log('   • Priority: URGENT');
  
  console.log('\n3. ❌ Witness Absent:');
  console.log('   • SMS warning about legal consequences');
  console.log('   • Next hearing date notification');
  
  console.log('\n4. 🚫 IO Absent:');
  console.log('   • SMS requesting absence reason');
  console.log('   • Multiple absence escalation to supervisors');
  
  console.log('\n5. ⚠️ Both Absent:');
  console.log('   • Combined notifications');
  console.log('   • Supervisor alerts');
  
  console.log('\n6. ✅ All Present:');
  console.log('   • Confirmation messages');
  console.log('   • Thank you notifications');
};

// Environment check
const checkEnvironment = () => {
  console.log('\n🔧 Environment Configuration:');
  console.log('-'.repeat(30));
  
  console.log('SMS Services:');
  console.log(`   ENABLE_SMS: ${process.env.ENABLE_SMS || 'false'}`);
  console.log(`   TEXTBELT_KEY: ${process.env.TEXTBELT_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SMS_GATEWAY_API_KEY: ${process.env.SMS_GATEWAY_API_KEY ? '✅ Set' : '❌ Not set'}`);
  
  console.log('\nEmail Service:');
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`   EMAIL_APP_PASSWORD: ${process.env.EMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  
  console.log('\nTest Recipients:');
  console.log(`   TEST_EMAIL: ${process.env.TEST_EMAIL || 'Using default'}`);
  console.log(`   TEST_PHONE_NUMBER: ${process.env.TEST_PHONE_NUMBER || 'Using default'}`);
};

// Main execution
const main = async () => {
  try {
    checkEnvironment();
    testNotificationScenarios();
    
    if (process.argv.includes('--run-tests')) {
      await testNotificationSystem();
    } else {
      console.log('\n💡 To run actual tests, use: node test-notifications.js --run-tests');
      console.log('⚠️  Make sure to set up your .env file first!');
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

main();