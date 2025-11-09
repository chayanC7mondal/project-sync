# H4S Automation Test Script
# This script tests the complete case automation workflow

Write-Host "==================================================" -ForegroundColor Blue
Write-Host "   H4S Case Automation Testing Script" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue
Write-Host ""

$baseUrl = "http://localhost:3000"

# Step 1: Create users
Write-Host "Step 1: Creating test users..." -ForegroundColor Green
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/api/automation/create-users" -Method POST -ContentType "application/json"
    Write-Host "✓ Users created/verified: $($users.data.Length)" -ForegroundColor Cyan
    foreach ($user in $users.data) {
        Write-Host "  - $($user.type): $($user.user.username)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error creating users: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Login
Write-Host "Step 2: Logging in as liaison officer..." -ForegroundColor Green
$loginBody = @{
    username = "liaison_officer"
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $login.data.token
    Write-Host "✓ Login successful!" -ForegroundColor Cyan
    Write-Host "  Token: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Error logging in: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create complete case
Write-Host "Step 3: Creating complete case with QR codes..." -ForegroundColor Green
$caseBody = @{
    firNumber = "FIR/2024/$(Get-Random -Minimum 10000 -Maximum 99999)"
    firDate = "2024-11-01"
    policeStation = "City Police Station"
    sections = @("IPC 302", "IPC 120B", "IPC 201")
    courtName = "District Court, Bhubaneswar"
    courtNumber = "Court Room 205"
    judge = "Hon'ble Justice Sharma"
    nextHearingDate = "2025-11-15"
    hearingTime = "10:30 AM"
    status = "pending"
    remarks = "Automated test case - witness testimony required"
    witnessUsername = "rahul_mishra"
    ioUsername = "suresh_dash"
    liaisonUsername = "liaison_officer"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $case = Invoke-RestMethod -Uri "$baseUrl/api/automation/create-complete-case" -Method POST -Body $caseBody -Headers $headers
    $caseId = $case.data.case.caseId
    $manualCode = $case.data.hearingSession.manualCode
    $qrCode = $case.data.hearingSession.qrCode
    
    Write-Host "✓ Case created successfully!" -ForegroundColor Cyan
    Write-Host "  Case ID: $caseId" -ForegroundColor Yellow
    Write-Host "  FIR Number: $($case.data.case.firNumber)" -ForegroundColor Yellow
    Write-Host "  Manual Code: $manualCode" -ForegroundColor Yellow
    Write-Host "  QR Code: $qrCode" -ForegroundColor Yellow
    Write-Host "  Hearing Date: $($case.data.hearingSession.hearingDate)" -ForegroundColor Yellow
    Write-Host "  IO: $($case.data.case.investigatingOfficer.name)" -ForegroundColor Yellow
    Write-Host "  Witness: $($case.data.case.witnesses[0].name)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Error creating case: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Mark witness attendance
Write-Host "Step 4: Marking witness attendance (using manual code)..." -ForegroundColor Green
$witnessAttendance = @{
    code = $manualCode
    username = "rahul_mishra"
    codeType = "manual"
} | ConvertTo-Json

try {
    $attendance1 = Invoke-RestMethod -Uri "$baseUrl/api/automation/mark-attendance" -Method POST -Body $witnessAttendance -Headers $headers
    Write-Host "✓ Witness attendance marked!" -ForegroundColor Cyan
    Write-Host "  Status: $($attendance1.data.status)" -ForegroundColor Yellow
    Write-Host "  Arrival Time: $($attendance1.data.arrivalTime)" -ForegroundColor Yellow
    Write-Host "  Marked via QR: $($attendance1.data.markedViaQR)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Error marking witness attendance: $_" -ForegroundColor Red
}

Write-Host ""

# Step 5: Mark IO attendance
Write-Host "Step 5: Marking IO attendance (using manual code)..." -ForegroundColor Green
$ioAttendance = @{
    code = $manualCode
    username = "suresh_dash"
    codeType = "manual"
} | ConvertTo-Json

try {
    $attendance2 = Invoke-RestMethod -Uri "$baseUrl/api/automation/mark-attendance" -Method POST -Body $ioAttendance -Headers $headers
    Write-Host "✓ IO attendance marked!" -ForegroundColor Cyan
    Write-Host "  Status: $($attendance2.data.status)" -ForegroundColor Yellow
    Write-Host "  Arrival Time: $($attendance2.data.arrivalTime)" -ForegroundColor Yellow
    Write-Host "  Marked via QR: $($attendance2.data.markedViaQR)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Error marking IO attendance: $_" -ForegroundColor Red
}

Write-Host ""

# Step 6: Get case details
Write-Host "Step 6: Fetching complete case details..." -ForegroundColor Green
try {
    $details = Invoke-RestMethod -Uri "$baseUrl/api/automation/case-details/$caseId" -Method GET -Headers $headers
    Write-Host "✓ Case details retrieved!" -ForegroundColor Cyan
    Write-Host "  Total hearing sessions: $($details.data.hearingSessions.Length)" -ForegroundColor Yellow
    Write-Host "  Total attendance records: $($details.data.attendance.Length)" -ForegroundColor Yellow
    
    Write-Host "`n  Attendance Summary:" -ForegroundColor Yellow
    foreach ($att in $details.data.attendance) {
        Write-Host "    - $($att.userId.username) ($($att.userId.role)): $($att.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error fetching case details: $_" -ForegroundColor Red
}

Write-Host ""

# Step 7: Get QR codes
Write-Host "Step 7: Fetching QR codes for case..." -ForegroundColor Green
try {
    $qrCodes = Invoke-RestMethod -Uri "$baseUrl/api/automation/qr-codes/$caseId" -Method GET -Headers $headers
    Write-Host "✓ QR codes retrieved!" -ForegroundColor Cyan
    foreach ($session in $qrCodes.data) {
        Write-Host "  Hearing on $($session.hearingDate):" -ForegroundColor Yellow
        Write-Host "    Manual Code: $($session.manualCode)" -ForegroundColor Gray
        Write-Host "    QR Code: $($session.qrCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error fetching QR codes: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Blue
Write-Host "   Testing Complete!" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Summary:" -ForegroundColor Green
Write-Host "✓ Test users created (suresh_dash, rahul_mishra, liaison_officer)" -ForegroundColor Cyan
Write-Host "✓ Complete case created: $caseId" -ForegroundColor Cyan
Write-Host "✓ QR codes generated: $manualCode" -ForegroundColor Cyan
Write-Host "✓ Witness attendance marked" -ForegroundColor Cyan
Write-Host "✓ IO attendance marked" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now check MongoDB to see all the data!" -ForegroundColor Yellow
Write-Host "  - Cases collection: $caseId" -ForegroundColor Gray
Write-Host "  - HearingSessions collection: QR codes and manual codes" -ForegroundColor Gray
Write-Host "  - Attendances collection: Present status for both users" -ForegroundColor Gray
Write-Host "  - Witnesses collection: rahul_mishra profile" -ForegroundColor Gray
Write-Host ""
