const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

// Test configuration
const config = {
    mongoUri: 'mongodb://localhost:27017/thedigitaltrading',
    baseURL: 'http://localhost:3000/api'
};

// Test user data
const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!',
    name: 'Test User',
    username: `testuser${Date.now()}`,
    phone: '1234567890',
    country: 'US',
    securityQuestion: 'What is your favorite color?',
    securityAnswer: 'blue'
};

let testUserId;

// Create API instance
const api = axios.create({
    baseURL: config.baseURL,
    validateStatus: null
});

async function runTests() {
    try {
        console.log('\n=== Starting PIN Feature Tests ===\n');

        // Step 1: Register test user
        console.log('Step 1: Registering test user');
        // Check if server is running
        try {
            await api.get('/');
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Server is not running. Please start the server first with `npm start`');
            }
        }

        const registerResponse = await api.post('/auth/register', testUser);
        console.log('Register response:', registerResponse.data);

        if (!registerResponse.data.success) {
            throw new Error('Failed to register test user');
        }

        // Step 2: Login
        console.log('\nStep 2: Logging in');
        const loginResponse = await api.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        });

        if (!loginResponse.data.token) {
            throw new Error('Failed to login');
        }

        const authToken = loginResponse.data.token;
        testUserId = loginResponse.data.user.id;
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        console.log('Login successful. Token received.');

        // Step 3: Check initial PIN status
        console.log('\nStep 3: Checking initial PIN status');
        const initialStatus = await api.get('/withdrawal/pin-status');
        console.log('Initial PIN status:', initialStatus.data);

        // Step 4: Try setting invalid PIN
        console.log('\nStep 4: Testing invalid PIN');
        const invalidPinResponse = await api.post('/withdrawal/set-withdrawal-pin', {
            pin: '12345', // Too short
            confirmPin: '12345'
        });
        console.log('Invalid PIN response:', invalidPinResponse.data);

        // Step 5: Set valid PIN
        console.log('\nStep 5: Setting valid PIN');
        const setPinResponse = await api.post('/withdrawal/set-withdrawal-pin', {
            pin: '123456',
            confirmPin: '123456'
        });
        console.log('Set PIN response:', setPinResponse.data);

        // Step 6: Verify PIN status after setting
        console.log('\nStep 6: Verifying PIN status after setting');
        const afterSetStatus = await api.get('/withdrawal/pin-status');
        console.log('After set status:', afterSetStatus.data);

        // Step 7: Test PIN verification
        console.log('\nStep 7: Testing PIN verification');
        const verifyResponse = await api.post('/withdrawal/verify-pin', {
            pin: '123456'
        });
        console.log('Verify PIN response:', verifyResponse.data);

        // Step 8: Test incorrect PIN
        console.log('\nStep 8: Testing incorrect PIN');
        const incorrectPinResponse = await api.post('/withdrawal/verify-pin', {
            pin: '111111'
        });
        console.log('Incorrect PIN response:', incorrectPinResponse.data);

        console.log('\n=== All Tests Completed Successfully ===\n');

        return true;

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        return false;
    }
}

// Cleanup function
async function cleanup() {
    try {
        if (testUserId) {
            await mongoose.connect(config.mongoUri);
            await User.findByIdAndDelete(testUserId);
            console.log('Test user cleaned up');
            await mongoose.connection.close();
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
}

// Main execution
async function main() {
    try {
        const success = await runTests();
        if (success) {
            console.log('\nSmoke test passed successfully!');
        } else {
            console.log('\nSmoke test failed!');
            process.exit(1);
        }
    } catch (error) {
        console.error('Test suite failed:', error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

// Run the test suite
main().catch(console.error);