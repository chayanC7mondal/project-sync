# Court Management System - Notification & Communication System

## 📋 Overview

The Court Management System now includes a comprehensive notification system that sends automated alerts via multiple channels:

- 📱 **SMS Notifications** (Free services supported)
- 📧 **Email Notifications** (Gmail SMTP)
- 🔔 **In-App Notifications** (Real-time dashboard)

## 🚀 Features

### 1. Multi-Stage Hearing Notifications
- **1 Week Before**: Advance reminders to IO and witnesses
- **Day of Hearing**: Urgent morning reminders
- **Post-Hearing**: Attendance-based follow-ups

### 2. Attendance-Based Alerts

#### Case 1: Witness Absent
- ⚠️ Warning SMS about legal consequences
- 📅 Next hearing date notification
- 📋 Escalation to supervising officers

#### Case 2: IO Absent  
- 📝 SMS requesting absence reason submission
- 🔄 Multiple absence tracking (disciplinary alerts)
- 👨‍💼 SP/Admin notifications for repeat offenses

#### Case 3: Both Absent
- 🚨 Combined critical alerts
- 📊 Supervisor escalation
- 📝 Mandatory reason submission

#### Case 4: All Present
- ✅ Success confirmations
- 🙏 Thank you messages
- 📈 Positive tracking

### 3. Role-Based Dashboards

#### Admin Dashboard
- 📊 Complete notification statistics
- 👥 User alert management  
- 🔧 Manual notification triggers
- 📈 System-wide analytics

#### IO (Investigating Officer) Dashboard
- 📅 Hearing reminders
- ⚠️ Attendance alerts
- 📝 Absence reason submissions
- 🚨 Escalation warnings

#### Liaison Officer Dashboard
- 📋 Today's hearing tracking
- 👥 Real-time attendance updates
- 📱 QR code generation
- 🔔 Witness check-in notifications

#### Witness Dashboard  
- 📅 Hearing reminders
- ✅ Attendance confirmations
- 📝 Absence reason forms
- ℹ️ Court instructions

## 🛠️ Technical Implementation

### SMS Services (Free Options)

1. **TextBelt** (Primary)
   - Free: 1 SMS per day per IP
   - Paid plans available
   - Setup: `TEXTBELT_KEY=textbelt` (free) or API key

2. **Fast2SMS** (Indian Service)
   - Free tier available
   - Setup: `SMS_GATEWAY_API_KEY=your-key`

3. **Email-to-SMS** (Fallback)
   - Uses carrier SMS gateways
   - Supports major Indian carriers
   - No additional API required

### Email Service
- **Gmail SMTP** (Free)
- **Setup**: `EMAIL_USER` and `EMAIL_APP_PASSWORD`
- Professional HTML templates
- Automatic text fallback

### Database Schema

```javascript
// HearingSession updates
{
  weeklyReminderSent: Boolean,
  dayOfReminderSent: Boolean, 
  postNotificationsSent: Boolean
}

// Notification model
{
  recipient: ObjectId,
  type: ['reminder', 'alert', 'success', 'warning', 'info'],
  priority: ['low', 'normal', 'high', 'urgent'],
  title: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# SMS Configuration
ENABLE_SMS=true
TEXTBELT_KEY=textbelt
SMS_GATEWAY_API_KEY=your-fast2sms-key

# Email Configuration  
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Test Recipients
TEST_EMAIL=test@example.com
TEST_PHONE_NUMBER=+919876543210
```

### Gmail App Password Setup
1. Enable 2-Factor Authentication
2. Generate App Password for "Mail"
3. Use app password (not regular password)

### SMS Service Setup

#### TextBelt (Recommended)
- Free: Use `TEXTBELT_KEY=textbelt`
- Paid: Get API key from textbelt.com

#### Fast2SMS (Indian Users)
- Sign up at fast2sms.com  
- Get API key from dashboard
- Free credits available

## 📡 API Endpoints

### Notifications
```
GET    /api/notifications              # Get user notifications
POST   /api/notifications              # Create notification
PATCH  /api/notifications/:id/read     # Mark as read
PATCH  /api/notifications/mark-all-read # Mark all read
GET    /api/notifications/unread-count # Get unread count
DELETE /api/notifications/:id          # Delete notification
```

### Absence Management
```
POST   /api/absence-reasons/submit                     # Submit reason
GET    /api/absence-reasons/my-reasons                 # Get my reasons
POST   /api/absence-reasons/trigger-notifications/:id # Manual trigger
GET    /api/absence-reasons/stats                     # Get statistics
```

## 🔄 Automated Scheduler

The system runs automatic checks:

### Daily 9:00 AM
- Check 1-week advance hearings
- Send pre-hearing reminders
- Update reminder flags

### Daily 6:00 PM  
- Process today's hearings
- Analyze attendance patterns
- Send post-hearing notifications
- Escalate to supervisors if needed

### Real-time
- QR code attendance updates
- Instant witness check-in alerts
- Live dashboard updates

## 📱 Frontend Integration

### Notification Center Component
```jsx
import NotificationCenter from '@/pages/NotificationCenter';

// Role-based dashboard views
// Real-time polling (30 second intervals)
// Multi-channel status indicators
// Quick action buttons
```

### Key Features
- **Real-time Updates**: 30-second polling
- **Role-based Views**: Customized for each user type  
- **Quick Actions**: Absence forms, emergency contacts
- **System Status**: Service health indicators
- **Statistics Dashboard**: Comprehensive metrics

## 🧪 Testing

### Test Script
```bash
# Check configuration
node test-notifications.js

# Run actual tests  
node test-notifications.js --run-tests
```

### Test Scenarios
- ✅ SMS delivery (multiple services)
- ✅ Email delivery (HTML + text)
- ✅ Multi-channel coordination
- ✅ Error handling and fallbacks
- ✅ Database integration

## 🚦 Notification Flow Examples

### Scenario 1: Normal Hearing Flow
```
Day -7: 📱 SMS + 📧 Email reminders sent
Day 0 (9am): 🚨 Urgent day-of reminders  
Day 0 (2pm): ✅ All present confirmations
```

### Scenario 2: IO Absent
```  
Day 0 (2pm): 🚫 IO absence detected
Day 0 (2:05pm): 📱 SMS absence reason request
Day 0 (6pm): 👨‍💼 Supervisor notification if no reason
```

### Scenario 3: Multiple Absences
```
Absence #3: 🚨 Escalation to SP
Auto-tracking: 📊 30-day absence count
Notification: 👮‍♂️ Disciplinary review alert
```

## 🔐 Security & Privacy

- **Authentication**: JWT-based API security
- **Data Protection**: Encrypted sensitive information  
- **Rate Limiting**: Prevents SMS/email abuse
- **Audit Logging**: Complete notification trail
- **Role Permissions**: Access control by user type

## 📈 Monitoring & Analytics

### Available Metrics
- 📊 Notification delivery rates
- 📱 SMS service success rates  
- 📧 Email open/delivery rates
- 👥 User engagement statistics
- ⏱️ Response time tracking

### Dashboard Views
- **Admin**: System-wide metrics
- **Supervisor**: Team performance  
- **Individual**: Personal statistics

## 🔄 Maintenance

### Regular Tasks
- Monitor SMS service quotas
- Check email service health
- Review notification statistics
- Update phone number formats
- Clean old notifications

### Troubleshooting
1. **SMS Not Working**: Check API keys and quotas
2. **Email Issues**: Verify Gmail app password  
3. **No Notifications**: Check scheduler status
4. **Database Errors**: Review connection settings

## 🎯 Future Enhancements

- 📞 Voice call integration (Twilio)
- 📱 Push notifications (mobile app)
- 🌐 WhatsApp Business API
- 📊 Advanced analytics dashboard
- 🤖 AI-powered message optimization
- 📅 Smart scheduling algorithms

---

**Setup Priority**: Configure .env → Test services → Deploy scheduler → Monitor delivery rates

**Support**: Check logs in `./logs/` and notification statistics in admin dashboard.