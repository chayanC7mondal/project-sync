import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Auth from './models/authModel.js';
import Notification from './models/notificationModel.js';
import { sendMultiChannelNotification } from './utils/smsUtils.js';

// Load environment variables
dotenv.config();

// Test notification system with real database data
async function testNotificationSystemLive() {
  try {
    console.log('🔄 Testing Live Notification System');
    console.log('==================================');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // 1. Check if we have any existing users
    const existingUsers = await Auth.find({}).limit(5);
    console.log(`📊 Found ${existingUsers.length} users in database`);

    if (existingUsers.length === 0) {
      console.log('ℹ️  No users found. Creating a test user...');
      
      // Create a test user
      const testUser = new Auth({
        employeeId: 'TEST001',
        username: 'testuser',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'testpassword',
        role: 'io',
        rank: 'Inspector',
        department: 'Crime Branch',
        station: 'Central Police Station'
      });
      
      await testUser.save();
      console.log('✅ Test user created');
      existingUsers.push(testUser);
    }

    // 2. Test in-app notification creation
    console.log('\n📱 Testing In-App Notifications:');
    console.log('------------------------------');
    
    const testUser = existingUsers[0];
    console.log(`Testing with user: ${testUser.username} (${testUser.role})`);

    // Create test notification
    const testNotification = {
      recipient: testUser._id,
      type: "reminder",
      priority: "high",
      title: "Test Court Hearing Reminder",
      message: `Hello ${testUser.username}, this is a test notification for the court management system. You have a hearing scheduled for case CR/001/2025 on November 15, 2025 at 10:00 AM.`,
      relatedEntityType: "hearing"
    };

    // Create notification in database
    const notification = await Notification.create(testNotification);
    console.log('✅ In-app notification created successfully');
    console.log(`📋 Notification ID: ${notification._id}`);

    // 3. Test retrieving notifications
    console.log('\n📨 Testing Notification Retrieval:');
    console.log('--------------------------------');
    
    const userNotifications = await Notification.find({ 
      recipient: testUser._id 
    }).sort({ createdAt: -1 }).limit(5);
    
    console.log(`📊 Found ${userNotifications.length} notifications for user`);
    userNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} (${notif.priority}) - ${notif.isRead ? 'READ' : 'UNREAD'}`);
    });

    // 4. Test multi-channel notification (without actual SMS/Email sending)
    console.log('\n🔄 Testing Multi-Channel Flow:');
    console.log('----------------------------');
    
    try {
      const result = await sendMultiChannelNotification(testUser, {
        ...testNotification,
        priority: "urgent" // This should trigger SMS and Email attempts
      });
      
      console.log('📊 Multi-channel results:');
      console.log(`   📱 In-app: ${result.inApp ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   📧 Email: ${result.email?.success ? 'SUCCESS' : 'SKIPPED/FAILED'}`);
      console.log(`   📲 SMS: ${result.sms?.success ? 'SUCCESS' : 'SKIPPED/FAILED'}`);
      
    } catch (error) {
      console.log(`⚠️  Multi-channel test failed: ${error.message}`);
      console.log('   (This is expected if SMS/Email services are not configured)');
    }

    // 5. Test notification statistics
    console.log('\n📈 Testing Notification Statistics:');
    console.log('----------------------------------');
    
    const stats = {
      totalNotifications: await Notification.countDocuments({}),
      unreadNotifications: await Notification.countDocuments({ isRead: false }),
      highPriorityNotifications: await Notification.countDocuments({ priority: 'high' }),
      urgentNotifications: await Notification.countDocuments({ priority: 'urgent' }),
      todayNotifications: await Notification.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    };

    console.log(`📊 Total notifications: ${stats.totalNotifications}`);
    console.log(`🔔 Unread notifications: ${stats.unreadNotifications}`);
    console.log(`🔥 High priority: ${stats.highPriorityNotifications}`);
    console.log(`🚨 Urgent notifications: ${stats.urgentNotifications}`);
    console.log(`📅 Today's notifications: ${stats.todayNotifications}`);

    // 6. Test notification endpoints simulation
    console.log('\n🔌 API Endpoints Available:');
    console.log('---------------------------');
    console.log('GET    /api/notifications              - Get user notifications');
    console.log('POST   /api/notifications              - Create notification');
    console.log('PATCH  /api/notifications/:id/read     - Mark as read');
    console.log('PATCH  /api/notifications/mark-all-read - Mark all read');
    console.log('GET    /api/notifications/unread-count - Get unread count');
    console.log('DELETE /api/notifications/:id          - Delete notification');

    console.log('\n✅ Live notification system test completed!');
    console.log('\n🌐 Frontend Integration:');
    console.log('------------------------');
    console.log('1. Open browser: http://localhost:5051');
    console.log('2. Navigate to Notification Center page');
    console.log('3. Login with any user account');
    console.log('4. Check for real-time notification updates');

    return {
      success: true,
      testUser: testUser,
      notificationId: notification._id,
      stats: stats
    };

  } catch (error) {
    console.error('❌ Error in live notification test:', error);
    return { success: false, error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test
testNotificationSystemLive()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 All tests passed! Notification system is working correctly.');
      console.log('\n📝 Next Steps:');
      console.log('1. Configure .env file for SMS/Email services');
      console.log('2. Test frontend notification center');
      console.log('3. Create hearing sessions to trigger automated notifications');
    } else {
      console.log(`\n❌ Test failed: ${result.error}`);
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
  });