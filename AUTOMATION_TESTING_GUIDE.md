# H4S Case Automation Testing Guide

This guide will help you test the complete automated case creation workflow.

## Prerequisites

1. MongoDB is running
2. Backend server is running on port 3000
3. You have a tool like Postman, Thunder Client, or curl

## Step-by-Step Testing Guide

### Step 1: Create Test Users

**Endpoint:** `POST http://localhost:3000/api/automation/create-users`

**No authentication required for this step**

**Request:**
```bash
curl -X POST http://localhost:3000/api/automation/create-users \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "data": [
    {
      "type": "IO",
      "user": {
        "_id": "...",
        "username": "suresh_dash",
        "name": "Suresh Dash",
        "email": "suresh.dash@police.gov.in",
        "role": "io"
      }
    },
    {
      "type": "Witness",
      "user": {
        "_id": "...",
        "username": "rahul_mishra",
        "name": "Rahul Mishra",
        "email": "rahul.mishra@example.com",
        "role": "witness"
      }
    },
    {
      "type": "Liaison",
      "user": {
        "_id": "...",
        "username": "liaison_officer",
        "name": "Liaison Officer",
        "email": "liaison@police.gov.in",
        "role": "liaison"
      }
    }
  ],
  "message": "Test users created/verified successfully",
  "success": true
}
```

**Note:** All users have password: `password123`

---

### Step 2: Login as Liaison Officer (or IO)

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "liaison_officer",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "...",
      "username": "liaison_officer",
      "name": "Liaison Officer",
      "role": "liaison"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "success": true
}
```

**Save the token** - you'll need it for the next steps!

---

### Step 3: Create Complete Case with QR Codes

**Endpoint:** `POST http://localhost:3000/api/automation/create-complete-case`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Request Body:**
```json
{
  "firNumber": "FIR/2024/12345",
  "firDate": "2024-11-01",
  "policeStation": "City Police Station",
  "sections": ["IPC 302", "IPC 120B", "IPC 201"],
  "courtName": "District Court, Bhubaneswar",
  "courtNumber": "Court Room 205",
  "judge": "Hon'ble Justice Sharma",
  "nextHearingDate": "2025-11-15",
  "hearingTime": "10:30 AM",
  "status": "pending",
  "remarks": "Important murder case - witness testimony required",
  "witnessUsername": "rahul_mishra",
  "ioUsername": "suresh_dash",
  "liaisonUsername": "liaison_officer"
}
```

**curl Command:**
```bash
curl -X POST http://localhost:3000/api/automation/create-complete-case \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firNumber": "FIR/2024/12345",
    "firDate": "2024-11-01",
    "policeStation": "City Police Station",
    "sections": ["IPC 302", "IPC 120B", "IPC 201"],
    "courtName": "District Court, Bhubaneswar",
    "courtNumber": "Court Room 205",
    "judge": "Hon'\''ble Justice Sharma",
    "nextHearingDate": "2025-11-15",
    "hearingTime": "10:30 AM",
    "status": "pending",
    "remarks": "Important murder case - witness testimony required",
    "witnessUsername": "rahul_mishra",
    "ioUsername": "suresh_dash",
    "liaisonUsername": "liaison_officer"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "data": {
    "case": {
      "_id": "...",
      "caseId": "CASE/2025/A1B2C3D4",
      "firNumber": "FIR/2024/12345",
      "policeStation": "City Police Station",
      "courtName": "District Court, Bhubaneswar",
      "investigatingOfficer": {
        "username": "suresh_dash",
        "name": "Suresh Dash",
        "role": "io"
      },
      "witnesses": [
        {
          "witnessId": "rahul_mishra",
          "name": "Rahul Mishra",
          "phone": "9876543211"
        }
      ],
      "nextHearingDate": "2025-11-15T00:00:00.000Z",
      "hearingTime": "10:30 AM"
    },
    "hearingSession": {
      "_id": "...",
      "hearingDate": "2025-11-15T00:00:00.000Z",
      "hearingTime": "10:30 AM",
      "qrCode": "HS-CASE/2025/A1B2C3D4-2025-11-15-abc123def456",
      "manualCode": "CASE2-AB12",
      "courtName": "District Court, Bhubaneswar",
      "status": "scheduled"
    },
    "attendance": {
      "witness": {
        "_id": "...",
        "userId": "...",
        "userType": "witness",
        "status": "not-marked"
      },
      "io": {
        "_id": "...",
        "userId": "...",
        "userType": "officer",
        "status": "not-marked"
      }
    },
    "qrDetails": {
      "qrCode": "HS-CASE/2025/A1B2C3D4-2025-11-15-abc123def456",
      "manualCode": "CASE2-AB12",
      "qrCodeData": "{\"caseId\":\"CASE/2025/A1B2C3D4\",\"hearingDate\":\"2025-11-15\",\"code\":\"...\",\"manualCode\":\"CASE2-AB12\",\"timestamp\":1699564800000}"
    }
  },
  "message": "Complete case created successfully with QR codes and attendance records",
  "success": true
}
```

**Important:** Save the `qrCode`, `manualCode`, and `caseId` from the response!

---

### Step 4: Mark Witness Attendance

**Endpoint:** `POST http://localhost:3000/api/automation/mark-attendance`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Request Body (Using QR Code):**
```json
{
  "code": "HS-CASE/2025/A1B2C3D4-2025-11-15-abc123def456",
  "username": "rahul_mishra",
  "codeType": "qr"
}
```

**OR (Using Manual Code):**
```json
{
  "code": "CASE2-AB12",
  "username": "rahul_mishra",
  "codeType": "manual"
}
```

**curl Command:**
```bash
curl -X POST http://localhost:3000/api/automation/mark-attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "code": "CASE2-AB12",
    "username": "rahul_mishra",
    "codeType": "manual"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "hearingSessionId": {
      "hearingDate": "2025-11-15T00:00:00.000Z",
      "hearingTime": "10:30 AM",
      "qrCode": "HS-CASE/2025/A1B2C3D4-2025-11-15-abc123def456",
      "manualCode": "CASE2-AB12"
    },
    "caseId": {
      "caseId": "CASE/2025/A1B2C3D4",
      "firNumber": "FIR/2024/12345",
      "courtName": "District Court, Bhubaneswar"
    },
    "userId": "...",
    "userType": "witness",
    "status": "present",
    "arrivalTime": "2025-11-09T10:25:00.000Z",
    "markedViaQR": false,
    "qrScannedAt": "2025-11-09T10:25:00.000Z",
    "isVerified": true
  },
  "message": "Attendance marked successfully",
  "success": true
}
```

---

### Step 5: Mark IO Attendance

**Same as Step 4, but use IO username:**

**Request Body:**
```json
{
  "code": "CASE2-AB12",
  "username": "suresh_dash",
  "codeType": "manual"
}
```

---

### Step 6: Get Complete Case Details

**Endpoint:** `GET http://localhost:3000/api/automation/case-details/{caseId}`

**Example:** `GET http://localhost:3000/api/automation/case-details/CASE/2025/A1B2C3D4`

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`

**curl Command:**
```bash
curl -X GET http://localhost:3000/api/automation/case-details/CASE/2025/A1B2C3D4 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "case": {
      "caseId": "CASE/2025/A1B2C3D4",
      "firNumber": "FIR/2024/12345",
      "investigatingOfficer": {
        "username": "suresh_dash",
        "name": "Suresh Dash"
      },
      "witnesses": [...],
      "status": "pending"
    },
    "hearingSessions": [
      {
        "hearingDate": "2025-11-15T00:00:00.000Z",
        "qrCode": "...",
        "manualCode": "CASE2-AB12",
        "status": "scheduled"
      }
    ],
    "attendance": [
      {
        "userId": {
          "username": "rahul_mishra",
          "role": "witness"
        },
        "status": "present",
        "arrivalTime": "..."
      },
      {
        "userId": {
          "username": "suresh_dash",
          "role": "io"
        },
        "status": "present",
        "arrivalTime": "..."
      }
    ]
  },
  "message": "Complete case details retrieved successfully",
  "success": true
}
```

---

### Step 7: Get QR Codes for Case

**Endpoint:** `GET http://localhost:3000/api/automation/qr-codes/{caseId}`

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`

**curl Command:**
```bash
curl -X GET http://localhost:3000/api/automation/qr-codes/CASE/2025/A1B2C3D4 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "H4S Automation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Create Test Users",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/automation/create-users",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "automation", "create-users"]
        }
      }
    },
    {
      "name": "2. Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"liaison_officer\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "3. Create Complete Case",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"firNumber\": \"FIR/2024/12345\",\n  \"firDate\": \"2024-11-01\",\n  \"policeStation\": \"City Police Station\",\n  \"sections\": [\"IPC 302\", \"IPC 120B\", \"IPC 201\"],\n  \"courtName\": \"District Court, Bhubaneswar\",\n  \"courtNumber\": \"Court Room 205\",\n  \"judge\": \"Hon'ble Justice Sharma\",\n  \"nextHearingDate\": \"2025-11-15\",\n  \"hearingTime\": \"10:30 AM\",\n  \"status\": \"pending\",\n  \"remarks\": \"Important murder case - witness testimony required\",\n  \"witnessUsername\": \"rahul_mishra\",\n  \"ioUsername\": \"suresh_dash\",\n  \"liaisonUsername\": \"liaison_officer\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/automation/create-complete-case",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "automation", "create-complete-case"]
        }
      }
    },
    {
      "name": "4. Mark Witness Attendance",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"code\": \"{{manualCode}}\",\n  \"username\": \"rahul_mishra\",\n  \"codeType\": \"manual\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/automation/mark-attendance",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "automation", "mark-attendance"]
        }
      }
    },
    {
      "name": "5. Mark IO Attendance",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"code\": \"{{manualCode}}\",\n  \"username\": \"suresh_dash\",\n  \"codeType\": \"manual\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/automation/mark-attendance",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "automation", "mark-attendance"]
        }
      }
    },
    {
      "name": "6. Get Case Details",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/automation/case-details/{{caseId}}",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "automation", "case-details", "{{caseId}}"]
        }
      }
    },
    {
      "name": "7. Get QR Codes",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/automation/qr-codes/{{caseId}}",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "automation", "qr-codes", "{{caseId}}"]
        }
      }
    }
  ]
}
```

---

## Quick Test Script (PowerShell)

Save this as `test-automation.ps1` and run in PowerShell:

```powershell
# Step 1: Create users
Write-Host "Step 1: Creating test users..." -ForegroundColor Green
$users = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/create-users" -Method POST -ContentType "application/json"
Write-Host "Users created: $($users.data.Length)" -ForegroundColor Cyan

# Step 2: Login
Write-Host "`nStep 2: Logging in as liaison officer..." -ForegroundColor Green
$loginBody = @{
    username = "liaison_officer"
    password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $login.data.token
Write-Host "Login successful! Token: $($token.Substring(0,20))..." -ForegroundColor Cyan

# Step 3: Create complete case
Write-Host "`nStep 3: Creating complete case..." -ForegroundColor Green
$caseBody = @{
    firNumber = "FIR/2024/12345"
    firDate = "2024-11-01"
    policeStation = "City Police Station"
    sections = @("IPC 302", "IPC 120B", "IPC 201")
    courtName = "District Court, Bhubaneswar"
    courtNumber = "Court Room 205"
    judge = "Hon'ble Justice Sharma"
    nextHearingDate = "2025-11-15"
    hearingTime = "10:30 AM"
    status = "pending"
    remarks = "Important murder case - witness testimony required"
    witnessUsername = "rahul_mishra"
    ioUsername = "suresh_dash"
    liaisonUsername = "liaison_officer"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$case = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/create-complete-case" -Method POST -Body $caseBody -Headers $headers
$caseId = $case.data.case.caseId
$manualCode = $case.data.hearingSession.manualCode
$qrCode = $case.data.hearingSession.qrCode

Write-Host "Case created!" -ForegroundColor Cyan
Write-Host "  Case ID: $caseId" -ForegroundColor Yellow
Write-Host "  Manual Code: $manualCode" -ForegroundColor Yellow
Write-Host "  QR Code: $qrCode" -ForegroundColor Yellow

# Step 4: Mark witness attendance
Write-Host "`nStep 4: Marking witness attendance..." -ForegroundColor Green
$witnessAttendance = @{
    code = $manualCode
    username = "rahul_mishra"
    codeType = "manual"
} | ConvertTo-Json

$attendance1 = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/mark-attendance" -Method POST -Body $witnessAttendance -Headers $headers
Write-Host "Witness attendance: $($attendance1.data.status)" -ForegroundColor Cyan

# Step 5: Mark IO attendance
Write-Host "`nStep 5: Marking IO attendance..." -ForegroundColor Green
$ioAttendance = @{
    code = $manualCode
    username = "suresh_dash"
    codeType = "manual"
} | ConvertTo-Json

$attendance2 = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/mark-attendance" -Method POST -Body $ioAttendance -Headers $headers
Write-Host "IO attendance: $($attendance2.data.status)" -ForegroundColor Cyan

# Step 6: Get case details
Write-Host "`nStep 6: Fetching complete case details..." -ForegroundColor Green
$details = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/case-details/$caseId" -Method GET -Headers $headers
Write-Host "Attendance records: $($details.data.attendance.Length)" -ForegroundColor Cyan

Write-Host "`nAll steps completed successfully!" -ForegroundColor Green
```

Run with: `.\test-automation.ps1`

---

## Verification in MongoDB

Connect to MongoDB and check the collections:

```javascript
// Check cases
db.cases.find({ caseId: "CASE/2025/A1B2C3D4" }).pretty()

// Check hearing sessions
db.hearingsessions.find({}).pretty()

// Check attendance records
db.attendances.find({}).pretty()

// Check witnesses
db.witnesses.find({ witnessId: "rahul_mishra" }).pretty()

// Check auth users
db.auths.find({ username: { $in: ["suresh_dash", "rahul_mishra", "liaison_officer"] } }).pretty()
```

---

## Troubleshooting

1. **"User not found" error:** Make sure you ran Step 1 to create users
2. **"Unauthorized" error:** Check if your token is valid and not expired
3. **"Case not found" error:** Verify the caseId is correct (copy from Step 3 response)
4. **"Attendance already marked":** This is normal if you try to mark twice

---

## Summary

This automation system creates:
1. ✅ **Test users** (IO, Witness, Liaison Officer)
2. ✅ **Complete case** with all details
3. ✅ **Witness profile** linked to case
4. ✅ **Hearing session** with unique QR code and manual code
5. ✅ **Attendance records** for both witness and IO (status: not-marked)
6. ✅ **Auto-marking attendance** using QR or manual code
7. ✅ **Complete audit trail** in MongoDB

All data is properly linked with MongoDB ObjectIds and can be queried through the API!
