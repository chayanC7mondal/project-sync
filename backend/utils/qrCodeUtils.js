import crypto from "crypto";

/**
 * Generate a unique QR code for a hearing session
 * @param {string} caseId - The case ID
 * @param {Date} hearingDate - The hearing date
 * @returns {Object} - Object containing qrCode and qrCodeData
 */
export const generateHearingQRCode = (caseId, hearingDate) => {
  const dateStr = new Date(hearingDate).toISOString().split('T')[0];
  const randomStr = crypto.randomBytes(8).toString('hex');
  
  // Create a unique code for scanning
  const qrCode = `HS-${caseId}-${dateStr}-${randomStr}`.substring(0, 50);
  
  // Data to be encoded in QR
  const qrCodeData = JSON.stringify({
    caseId,
    hearingDate: dateStr,
    code: qrCode,
    timestamp: Date.now()
  });
  
  return { qrCode, qrCodeData };
};

/**
 * Verify QR code is valid
 * @param {string} qrCode - The QR code to verify
 * @param {string} caseId - The case ID
 * @param {Date} hearingDate - The hearing date
 * @returns {boolean} - Whether the QR code is valid
 */
export const verifyQRCode = (qrCode, caseId, hearingDate) => {
  if (!qrCode || !caseId || !hearingDate) return false;
  
  const dateStr = new Date(hearingDate).toISOString().split('T')[0];
  return qrCode.startsWith(`HS-${caseId}-${dateStr}`);
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
