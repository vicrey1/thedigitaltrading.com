const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '.env.test' });

const baseURL = 'http://localhost:3000/api';
let testToken = null;
let testUserId = null;

const testUser = {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User',
    username: 'testuser' + Date.now(),
    phone: '1234567890',
    country: 'US',
    securityQuestion: 'What is your favorite color?',
    securityAnswer: 'blue'
};

const api = axios.create({
    baseURL,
    validateStatus: null // Allow any status code for testing
});

async function setup() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create test user
        const response = await api.post('/auth/register', testUser);
        console.log('Register response:', response.data);

        // Login
        const loginResponse = await api.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login response:', loginResponse.data);

        testToken = loginResponse.data.token;
        testUserId = loginResponse.data.user.id;

        api.defaults.headers.common['Authorization'] = `Bearer ${testToken}`;

        return true;
    } catch (error) {
        console.error('Setup failed:', error.response?.data || error.message);
        return false;
    }
}

async function cleanup() {
    try {
        if (testUserId) {
            await User.findByIdAndDelete(testUserId);
            console.log('Test user cleaned up');
        }
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
}

async function testPinFeature() {
    try {
        console.log('\n=== Testing PIN Feature ===\n');

        // Test 1: Check initial PIN status
        console.log('Test 1: Checking initial PIN status');
        const initialStatus = await api.get('/withdrawal/pin-status');
        console.log('Initial PIN status:', initialStatus.data);

        // Test 2: Try to set an invalid PIN
        console.log('\nTest 2: Setting invalid PIN');
        const invalidPinResponse = await api.post('/withdrawal/set-withdrawal-pin', {
            pin: '12345', // Too short
            confirmPin: '12345'
        });
        console.log('Invalid PIN response:', invalidPinResponse.data);

        // Test 3: Set a valid PIN
        console.log('\nTest 3: Setting valid PIN');
        const validPinResponse = await api.post('/withdrawal/set-withdrawal-pin', {
            pin: '123456',
            confirmPin: '123456'
        });
        console.log('Valid PIN response:', validPinResponse.data);

        // Test 4: Check PIN status after setting
        console.log('\nTest 4: Checking PIN status after setting');
        const afterSetStatus = await api.get('/withdrawal/pin-status');
        console.log('After set PIN status:', afterSetStatus.data);

        // Test 5: Verify correct PIN
        console.log('\nTest 5: Verifying correct PIN');
        const verifyCorrectPin = await api.post('/withdrawal/verify-pin', {
            pin: '123456'
        });
        console.log('Verify correct PIN response:', verifyCorrectPin.data);

        // Test 6: Verify incorrect PIN
        console.log('\nTest 6: Verifying incorrect PIN');
        const verifyIncorrectPin = await api.post('/withdrawal/verify-pin', {
            pin: '111111'
        });
        console.log('Verify incorrect PIN response:', verifyIncorrectPin.data);

        // Test 7: Request PIN reset
        console.log('\nTest 7: Requesting PIN reset');
        const resetRequest = await api.post('/withdrawal/request-pin-reset');
        console.log('Reset request response:', resetRequest.data);

        // Get the reset code directly from the database for testing
        const user = await User.findById(testUserId).select('+pinResetCode');
        const resetCode = user.pinResetCode;

        // Test 8: Reset PIN with code
        console.log('\nTest 8: Resetting PIN with code');
        const resetPin = await api.post('/withdrawal/reset-pin', {
            code: resetCode,
            newPin: '654321'
        });
        console.log('Reset PIN response:', resetPin.data);

        // Test 9: Final PIN status check
        console.log('\nTest 9: Final PIN status check');
        const finalStatus = await api.get('/withdrawal/pin-status');
        console.log('Final PIN status:', finalStatus.data);

        console.log('\n=== PIN Feature Tests Complete ===\n');
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

async function runTests() {
    if (await setup()) {
        await testPinFeature();
        await cleanup();
    }
}

runTests().catch(console.error);