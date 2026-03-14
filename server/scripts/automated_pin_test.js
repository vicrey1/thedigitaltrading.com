const axios = require('axios');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const User = require('../models/User');
const { startMongoDB } = require('./start-mongodb');

// Configuration
const config = {
    mongoUri: 'mongodb://localhost:27017/thedigitaltrading_test',
    serverPort: 4000,
    baseURL: 'http://localhost:4000/api'
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

let server;
let testUserId;
let authToken;

// Create API instance
const api = axios.create({
    baseURL: config.baseURL,
    validateStatus: null
});

// Start the server
function startServer() {
    return new Promise((resolve) => {
        console.log('Starting test server...');
        
        // Set test environment variables
        const serverEnv = {
            ...process.env,
            NODE_ENV: 'test',
            PORT: config.serverPort,
            MONGO_URI: config.mongoUri,
            JWT_SECRET: 'test_secret_key'
        };

        server = spawn('node', ['server.js'], {
            env: serverEnv,
            cwd: path.join(__dirname, '..')
        });

        server.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);
            if (data.toString().includes('Server is running')) {
                resolve();
            }
        });

        server.stderr.on('data', (data) => {
            console.error(`Server Error: ${data}`);
        });

        // Fallback resolve after 5 seconds if we don't see the expected output
        setTimeout(resolve, 5000);
    });
}

// Stop the server
function stopServer() {
    return new Promise((resolve) => {
        if (server) {
            server.kill();
            console.log('Server stopped');
        }
        resolve();
    });
}

// Setup database connection
async function setupDatabase() {
    console.log('Setting up test database...');
    await mongoose.connect(config.mongoUri);
    await mongoose.connection.db.dropDatabase();
    console.log('Database reset completed');
}

// Clean up database
async function cleanupDatabase() {
    console.log('Cleaning up test database...');
    if (testUserId) {
        await User.findByIdAndDelete(testUserId);
    }
    await mongoose.connection.close();
    console.log('Database cleanup completed');
}

// Test steps
async function runTests() {
    try {
        console.log('\n=== Starting PIN Feature Tests ===\n');

        // Step 1: Register test user
        console.log('Step 1: Registering test user');
        const registerResponse = await api.post('/auth/register', testUser);
        console.log('Register response:', registerResponse.data);

        // Step 2: Login
        console.log('\nStep 2: Logging in');
        const loginResponse = await api.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        authToken = loginResponse.data.token;
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

        // Step 9: Test PIN reset request
        console.log('\nStep 9: Testing PIN reset request');
        const resetRequestResponse = await api.post('/withdrawal/request-pin-reset');
        console.log('Reset request response:', resetRequestResponse.data);

        // Get reset code from database for testing
        const user = await User.findById(testUserId).select('+pinResetCode');
        const resetCode = user.pinResetCode;

        // Step 10: Test PIN reset
        console.log('\nStep 10: Testing PIN reset');
        const resetResponse = await api.post('/withdrawal/reset-pin', {
            code: resetCode,
            newPin: '987654'
        });
        console.log('Reset response:', resetResponse.data);

        // Final status check
        const finalStatus = await api.get('/withdrawal/pin-status');
        console.log('\nFinal PIN status:', finalStatus.data);

        console.log('\n=== All Tests Completed Successfully ===\n');

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        // Start MongoDB if not running
        const mongoStarted = await startMongoDB();
        if (!mongoStarted) {
            console.error('Failed to start MongoDB. Please ensure MongoDB is installed and accessible.');
            return;
        }
        await setupDatabase();
        await startServer();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for server to be ready
        await runTests();
    } catch (error) {
        console.error('Test suite failed:', error);
    } finally {
        await stopServer();
        await cleanupDatabase();
    }
}

// Run the test suite
main().catch(console.error);