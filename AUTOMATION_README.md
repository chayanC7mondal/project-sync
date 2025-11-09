# 🚀 H4S Case Automation System

Complete automation system for creating cases with witnesses, investigating officers, QR codes, and attendance marking.

## 📋 What This System Does

This automation system handles the complete workflow of:

1. **Creating test users** (IO, Witness, Liaison Officer) with usernames:
   - `suresh_dash` (Investigating Officer)
   - `rahul_mishra` (Witness)
   - `liaison_officer` (Liaison Officer)

2. **Creating complete cases** with:
   - Case details (FIR, sections, court info)
   - Automatic witness profile creation
   - IO assignment
   - Liaison officer assignment (optional)

3. **Generating hearing sessions** with:
   - Unique QR codes
   - Manual entry codes
   - Scheduled date and time

4. **Creating attendance records** for:
   - Witness (status: not-marked)
   - Investigating Officer (status: not-marked)

5. **Marking attendance** automatically using:
   - QR code scanning
   - Manual code entry

## 🛠️ Setup

### Prerequisites
- MongoDB running
- Node.js installed
- Backend dependencies installed (`npm install` in backend folder)

### Start Backend Server
```powershell
cd project-sync/backend
node index.js
```

Server will run on: `http://localhost:3000`

## 📚 API Endpoints

### 1. Create Test Users
**No authentication required**
```
POST /api/automation/create-users
```

Creates three test users:
- IO: `suresh_dash` (password: `password123`)
- Witness: `rahul_mishra` (password: `password123`)
- Liaison: `liaison_officer` (password: `password123`)

### 2. Login
```
POST /api/auth/login
Body: { "username": "liaison_officer", "password": "password123" }
```

Returns authentication token needed for other endpoints.

### 3. Create Complete Case
**Requires authentication token**
```
POST /api/automation/create-complete-case
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: {
  "firNumber": "FIR/2024/12345",
  "firDate": "2024-11-01",
  "policeStation": "City Police Station",
  "sections": ["IPC 302", "IPC 120B"],
  "courtName": "District Court, Bhubaneswar",
  "courtNumber": "Court Room 205",
  "judge": "Hon'ble Justice Sharma",
  "nextHearingDate": "2025-11-15",
  "hearingTime": "10:30 AM",
  "status": "pending",
  "remarks": "Important case",
  "witnessUsername": "rahul_mishra",
  "ioUsername": "suresh_dash",
  "liaisonUsername": "liaison_officer"
}
```

Returns:
- Complete case details
- Hearing session with QR codes
- Attendance records for witness and IO
- Manual code and QR code for attendance marking

### 4. Mark Attendance
**Requires authentication token**
```
POST /api/automation/mark-attendance
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: {
  "code": "CASE2-AB12",
  "username": "rahul_mishra",
  "codeType": "manual"
}
```

Marks attendance as "present" and records arrival time.

### 5. Get Complete Case Details
**Requires authentication token**
```
GET /api/automation/case-details/{caseId}
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

Returns all related data:
- Case information
- Hearing sessions
- Attendance records

### 6. Get QR Codes for Case
**Requires authentication token**
```
GET /api/automation/qr-codes/{caseId}
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

Returns all QR codes and manual codes for the case.

## 🧪 Testing

### Option 1: PowerShell Script (Easiest)
```powershell
.\test-automation.ps1
```

This script automatically:
- Creates test users
- Logs in as liaison officer
- Creates a complete case
- Marks witness attendance
- Marks IO attendance
- Fetches case details
- Shows summary

### Option 2: Manual Testing

Follow the step-by-step guide in `AUTOMATION_TESTING_GUIDE.md`

### Option 3: Postman

Import the Postman collection from `AUTOMATION_TESTING_GUIDE.md`

## 📊 MongoDB Collections

After running the automation, check these collections:

### 1. `auths` - User accounts
```javascript
db.auths.find({ 
  username: { $in: ["suresh_dash", "rahul_mishra", "liaison_officer"] } 
}).pretty()
```

### 2. `cases` - Case records
```javascript
db.cases.find({}).pretty()
```

### 3. `witnesses` - Witness profiles
```javascript
db.witnesses.find({ witnessId: "rahul_mishra" }).pretty()
```

### 4. `hearingsessions` - Hearing sessions with QR codes
```javascript
db.hearingsessions.find({}).pretty()
```

### 5. `attendances` - Attendance records
```javascript
db.attendances.find({}).pretty()

// Find present attendance
db.attendances.find({ status: "present" }).pretty()
```

## 🔄 Complete Workflow

```
1. Create Users
   ↓
2. Login (Get Token)
   ↓
3. Create Complete Case
   ├─ Creates Case Record
   ├─ Creates/Updates Witness Profile
   ├─ Links IO to Case
   ├─ Creates Hearing Session
   ├─ Generates QR Code
   ├─ Generates Manual Code
   ├─ Creates Witness Attendance Record (not-marked)
   └─ Creates IO Attendance Record (not-marked)
   ↓
4. Mark Witness Attendance
   ├─ Scan QR Code OR
   └─ Enter Manual Code
   ↓
5. Mark IO Attendance
   ├─ Scan QR Code OR
   └─ Enter Manual Code
   ↓
6. View Complete Case Details
   └─ All attendance records now show "present"
```

## 🎯 Key Features

✅ **Automatic User Creation** - Creates test users with proper roles
✅ **Complete Case Setup** - One API call creates everything
✅ **Unique QR Codes** - Generated for each hearing session
✅ **Manual Code Backup** - If QR scanning fails
✅ **Attendance Tracking** - For both witnesses and officers
✅ **Proper Linking** - All MongoDB documents are properly linked with ObjectIds
✅ **Audit Trail** - Timestamps and status tracking
✅ **Error Handling** - Validates all inputs and handles errors gracefully

## 📝 Sample Response

When you create a complete case, you'll get:

```json
{
  "statusCode": 201,
  "data": {
    "case": {
      "caseId": "CASE/2025/A1B2C3D4",
      "firNumber": "FIR/2024/12345",
      "investigatingOfficer": {
        "username": "suresh_dash",
        "name": "Suresh Dash"
      },
      "witnesses": [{
        "witnessId": "rahul_mishra",
        "name": "Rahul Mishra"
      }]
    },
    "hearingSession": {
      "qrCode": "HS-CASE/2025/A1B2C3D4-2025-11-15-abc123",
      "manualCode": "CASE2-AB12",
      "hearingDate": "2025-11-15",
      "hearingTime": "10:30 AM"
    },
    "attendance": {
      "witness": { "status": "not-marked" },
      "io": { "status": "not-marked" }
    }
  },
  "message": "Complete case created successfully",
  "success": true
}
```

## 🔧 Files Created

1. **Backend Controllers**
   - `backend/controllers/automationController.js` - All automation logic

2. **Backend Routes**
   - `backend/routes/automationRoutes.js` - API route definitions

3. **Testing Files**
   - `test-automation.ps1` - PowerShell test script
   - `AUTOMATION_TESTING_GUIDE.md` - Detailed testing guide
   - `test-data.json` - Sample data and MongoDB queries

4. **Updated Files**
   - `backend/index.js` - Added automation routes

## 🐛 Troubleshooting

### "User not found"
Run Step 1 to create users first:
```bash
curl -X POST http://localhost:3000/api/automation/create-users
```

### "Unauthorized"
Login again to get a fresh token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"liaison_officer","password":"password123"}'
```

### "Attendance already marked"
This is normal - you can only mark attendance once per hearing. The endpoint will return the existing attendance record.

### Server not running
```bash
cd project-sync/backend
node index.js
```

## 🎉 Success Indicators

After running the automation, you should see:

1. ✅ **3 users created** in `auths` collection
2. ✅ **1 case created** in `cases` collection
3. ✅ **1 witness profile** in `witnesses` collection
4. ✅ **1 hearing session** in `hearingsessions` collection with QR codes
5. ✅ **2 attendance records** in `attendances` collection (witness + IO)
6. ✅ **Both attendances marked as "present"** after marking

## 📞 Support

If you encounter any issues:
1. Check MongoDB is running
2. Verify backend server is running on port 3000
3. Check `AUTOMATION_TESTING_GUIDE.md` for detailed steps
4. Review MongoDB collections to debug data issues

---

**Happy Testing! 🚀**
