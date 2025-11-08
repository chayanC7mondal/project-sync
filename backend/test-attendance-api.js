import axios from 'axios';

// Test the attendance marking API
async function testAttendanceAPI() {
    console.log('Testing Attendance API:');
    console.log('====================');

    const baseURL = 'http://localhost:3000';
    
    // Test data matching the format from manual code generation
    const testData = {
        caseId: 'CR/001/2025',
        code: 'CR001-7236', // Using format from test-manual-code.js
        witnessId: 'WIT001',
        witnessName: 'John Doe',
        latitude: 20.2961,
        longitude: 85.8245
    };

    try {
        console.log('Sending request to:', `${baseURL}/api/hearings/mark-self-attendance`);
        console.log('Request data:', JSON.stringify(testData, null, 2));

        const response = await axios.post(`${baseURL}/api/hearings/mark-self-attendance`, testData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('\n✅ Success!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('\n❌ Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('No response received. Is server running?');
            console.log('Request error:', error.message);
        } else {
            console.log('Error setting up request:', error.message);
        }
    }
}

// Test with QR code data
async function testQRAttendanceAPI() {
    console.log('\n\nTesting QR Code Attendance:');
    console.log('===========================');

    const baseURL = 'http://localhost:3000';
    
    // QR code data format from test-manual-code.js
    const qrData = {
        caseId: "CR/001/2025",
        hearingDate: "2025-11-09",
        code: "HS-CR/001/2025-2025-11-09-aa731009cc1dca1d",
        manualCode: "CR001-7236",
        timestamp: Date.now()
    };

    const testData = {
        qrData: JSON.stringify(qrData),
        witnessId: 'WIT002',
        witnessName: 'Jane Smith',
        latitude: 20.2961,
        longitude: 85.8245
    };

    try {
        console.log('Sending QR request to:', `${baseURL}/api/hearings/mark-self-attendance`);
        console.log('Request data:', JSON.stringify(testData, null, 2));

        const response = await axios.post(`${baseURL}/api/hearings/mark-self-attendance`, testData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('\n✅ QR Success!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('\n❌ QR Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('No response received. Is server running?');
            console.log('Request error:', error.message);
        } else {
            console.log('Error setting up request:', error.message);
        }
    }
}

// Run tests
async function runTests() {
    await testAttendanceAPI();
    await testQRAttendanceAPI();
}

runTests();