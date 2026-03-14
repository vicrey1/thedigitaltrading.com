const axios = require('axios');

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    validateStatus: null // Allow any status code for testing
});

// Set your test auth token here
const AUTH_TOKEN = 'your_auth_token';

async function testPinFeature() {
    try {
        api.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
        
        console.log('\n=== Testing PIN Feature ===\n');

        // Test 1: Check initial PIN status
        console.log('Test 1: Checking initial PIN status');
        const initialStatus = await api.get('/withdrawal/pin-status');
        console.log('Initial PIN status:', initialStatus.data);

        if (!initialStatus.data.hasPinSet) {
            // Test 2: Set a valid PIN
            console.log('\nTest 2: Setting valid PIN');
            const setPinResponse = await api.post('/withdrawal/set-withdrawal-pin', {
                pin: '123456',
                confirmPin: '123456'
            });
            console.log('Set PIN response:', setPinResponse.data);
        }

        // Test 3: Check PIN status after potential set
        console.log('\nTest 3: Checking PIN status');
        const currentStatus = await api.get('/withdrawal/pin-status');
        console.log('Current PIN status:', currentStatus.data);

        // Test 4: Verify PIN
        console.log('\nTest 4: Verifying PIN');
        const verifyResponse = await api.post('/withdrawal/verify-pin', {
            pin: '123456'
        });
        console.log('Verify PIN response:', verifyResponse.data);

        console.log('\n=== PIN Feature Tests Complete ===\n');
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testPinFeature().catch(console.error);