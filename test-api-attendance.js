// Test the mark self-attendance API endpoint directly
import fetch from 'node-fetch';

const testMarkSelfAttendance = async () => {
  console.log("🧪 Testing Mark Self-Attendance API");
  console.log("===================================");

  const apiUrl = "http://localhost:3000/api/hearings/mark-self-attendance";
  
  // Test data
  const testData = {
    code: "CR001-0013E7A",  // Example manual code
    caseId: "CR/001/2025",
    latitude: 20.2961,
    longitude: 85.8245
  };

  console.log("\n📡 API Endpoint:", apiUrl);
  console.log("📦 Request Data:", JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real app, this would include auth token
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(testData)
    });

    console.log("\n📊 Response Status:", response.status);
    console.log("📄 Response Headers:", Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log("📋 Response Data:", JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log("\n✅ API call successful!");
    } else {
      console.log("\n❌ API call failed!");
      console.log("Error:", responseData.message || "Unknown error");
    }

  } catch (error) {
    console.log("\n💥 Network Error:", error.message);
    console.log("🔧 Possible Issues:");
    console.log("   1. Backend server not running");
    console.log("   2. Database connection issues");
    console.log("   3. Authentication required");
    console.log("   4. CORS configuration");
  }

  console.log("\n🔍 Debugging Steps:");
  console.log("1. Check if backend is running on port 3000");
  console.log("2. Verify database connection");
  console.log("3. Check authentication token");
  console.log("4. Validate hearing session exists");
  console.log("5. Ensure witness is registered for the hearing");
};

// Test different scenarios
const runTests = async () => {
  console.log("🚀 Starting API Tests...\n");
  
  // Test 1: Valid manual code
  console.log("Test 1: Valid Manual Code");
  await testMarkSelfAttendance();
  
  console.log("\n" + "=".repeat(50));
  
  // Test 2: Invalid code format
  console.log("\nTest 2: Invalid Code Format");
  const invalidTest = {
    code: "INVALID-CODE",
    caseId: "CR/001/2025"
  };
  
  console.log("📦 Invalid Test Data:", JSON.stringify(invalidTest, null, 2));
  console.log("Expected Result: 400 Bad Request or 404 Not Found");
  
  console.log("\n" + "=".repeat(50));
  
  console.log("\n✨ Frontend Integration Check:");
  console.log("1. Ensure apiClient includes auth headers");
  console.log("2. Check if user is logged in");
  console.log("3. Verify case selection matches backend data");
  console.log("4. Confirm manual code format is correct");
};

runTests().catch(console.error);