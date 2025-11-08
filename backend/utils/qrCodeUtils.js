import crypto from "crypto";

/**
 * Generate a unique QR code and manual entry code for a hearing session
 * @param {string} caseId - The case ID
 * @param {Date} hearingDate - The hearing date
 * @returns {Object} - Object containing qrCode, qrCodeData, and manualCode
 */
export const generateHearingQRCode = (caseId, hearingDate) => {
  const dateStr = new Date(hearingDate).toISOString().split('T')[0];
  const randomStr = crypto.randomBytes(8).toString('hex');

  // Create a unique code for scanning
  const qrCode = `HS-${caseId}-${dateStr}-${randomStr}`.substring(0, 50);

  // Create a more sophisticated manual entry code
  // Extract case type prefix (e.g., CR/001/2025 -> CR001)
  const casePrefix = caseId.replace(/[\/\-]/g, '').substring(0, 5).toUpperCase();
  
  // Generate a unique 4-character alphanumeric code
  const uniqueCode = crypto.randomBytes(2).toString('hex').toUpperCase();
  
  // Create manual code: CasePrefix-UniqueCode (e.g., CR001-A8B2)
  const manualCode = `${casePrefix}-${uniqueCode}`;

  // Data to be encoded in QR
  const qrCodeData = JSON.stringify({
    caseId,
    hearingDate: dateStr,
    code: qrCode,
    manualCode,
    timestamp: Date.now()
  });

  return { qrCode, qrCodeData, manualCode };
};

/**
 * Verify QR code or manual entry code is valid
 * @param {string} code - The QR code or manual entry code to verify
 * @param {string} caseId - The case ID
 * @param {Date} hearingDate - The hearing date
 * @returns {boolean} - Whether the code is valid
 */
export const verifyCode = (code, caseId, hearingDate) => {
  if (!code || !caseId || !hearingDate) return false;

  const dateStr = new Date(hearingDate).toISOString().split('T')[0];
  const casePrefix = caseId.replace(/[\/\-]/g, '').substring(0, 5).toUpperCase();
  
  // Check if it's a QR code or manual code
  return code.startsWith(`HS-${caseId}-${dateStr}`) || code.startsWith(casePrefix);
};

/**
 * Mark attendance for a witness using QR code or manual entry code
 * @param {string} code - The QR code or manual entry code
 * @param {string} caseId - The case ID
 * @param {Date} hearingDate - The hearing date
 * @returns {Object} - Object indicating success or failure
 */
export const markAttendance = (code, caseId, hearingDate) => {
  if (verifyCode(code, caseId, hearingDate)) {
    // Logic to update attendance in the database
    return { success: true, message: "Attendance marked successfully." };
  }
  return { success: false, message: "Invalid code or case details." };
};

/**
 * Check if hearing is today or tomorrow
 * @param {Date} hearingDate - The hearing date
 * @returns {Object} - Object with isToday and isTomorrow flags
 */
export const checkHearingProximity = (hearingDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const hearing = new Date(hearingDate);
  hearing.setHours(0, 0, 0, 0);
  
  return {
    isToday: hearing.getTime() === today.getTime(),
    isTomorrow: hearing.getTime() === tomorrow.getTime()
  };
};
