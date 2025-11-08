import { markSelfAttendance } from "./controllers/hearingController.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Test the self-attendance marking function
console.log("Testing Self-Attendance Marking:");
console.log("=================================");

// Mock request and response objects for testing
const createMockReq = (body, userId) => ({
  body,
  userId,
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    console.log(`Response Status: ${res.statusCode}`);
    console.log("Response Data:", JSON.stringify(data, null, 2));
    return res;
  };
  return res;
};

const mockNext = (error) => {
  if (error) {
    console.error("Error:", error.message);
  }
};

// Test cases
const testCases = [
  {
    name: "Valid Manual Code",
    body: {
      code: "CR001-A8B2",
      caseId: "CR/001/2025",
      latitude: 20.2961,
      longitude: 85.8245,
    },
    userId: new mongoose.Types.ObjectId(),
  },
  {
    name: "Valid QR Code",
    body: {
      code: "HS-CR/001/2025-2025-11-09-abc123def456",
      caseId: "CR/001/2025",
      latitude: 20.2961,
      longitude: 85.8245,
    },
    userId: new mongoose.Types.ObjectId(),
  },
  {
    name: "Invalid Code",
    body: {
      code: "INVALID-CODE",
      caseId: "CR/001/2025",
    },
    userId: new mongoose.Types.ObjectId(),
  },
  {
    name: "Missing Code",
    body: {
      caseId: "CR/001/2025",
    },
    userId: new mongoose.Types.ObjectId(),
  },
];

console.log(
  "Note: These are mock tests. For full testing, you need a running database connection."
);
console.log(
  "The actual API endpoint is: POST /api/hearings/mark-self-attendance"
);
console.log("\nExpected request body format:");
console.log(
  JSON.stringify(
    {
      code: "CR001-A8B2 or HS-CR/001/2025-...",
      caseId: "CR/001/2025",
      latitude: 20.2961,
      longitude: 85.8245,
    },
    null,
    2
  )
);

console.log("\nTest cases prepared:");
testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}:`);
  console.log("Request body:", JSON.stringify(testCase.body, null, 2));
});

console.log("\nTo test the actual endpoint:");
console.log("1. Start the backend server");
console.log("2. Use the frontend manual code entry form");
console.log("3. Or use a tool like Postman/curl to test the API directly");
