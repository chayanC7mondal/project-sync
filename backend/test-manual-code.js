import { generateHearingQRCode, verifyCode } from "./utils/qrCodeUtils.js";

// Test the manual code generation
console.log("Testing Manual Code Generation:");
console.log("================================");

// Test cases
const testCases = [
  { caseId: "CR/001/2025", hearingDate: "2025-11-09" },
  { caseId: "CR/002/2025", hearingDate: "2025-11-10" },
  { caseId: "CR/003/2025", hearingDate: "2025-11-11" },
  { caseId: "FIR/123/2025", hearingDate: "2025-11-12" },
  { caseId: "CRL/456/2025", hearingDate: "2025-11-13" }
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}:`);
  console.log(`Case ID: ${testCase.caseId}`);
  console.log(`Hearing Date: ${testCase.hearingDate}`);
  
  const result = generateHearingQRCode(testCase.caseId, testCase.hearingDate);
  
  console.log(`Generated QR Code: ${result.qrCode}`);
  console.log(`Manual Code: ${result.manualCode}`);
  console.log(`QR Code Data: ${result.qrCodeData}`);
  
  // Test verification
  const qrValid = verifyCode(result.qrCode, testCase.caseId, testCase.hearingDate);
  const manualValid = verifyCode(result.manualCode, testCase.caseId, testCase.hearingDate);
  
  console.log(`QR Code Valid: ${qrValid}`);
  console.log(`Manual Code Valid: ${manualValid}`);
  console.log("---");
});