const mongoose = require('mongoose');
const axios = require('axios');
const { spawn, exec } = require('child_process');
const path = require('path');
const User = require('../models/User');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const config = {
    mongoUri: 'mongodb://localhost:27017/thedigitaltrading',
    serverPort: 3000,
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

let server;
let testUserId;
let mongoProcess;

// Create API instance
const api = axios.create({
    baseURL: config.baseURL,
    validateStatus: null
});

// Check if a port is in use
async function isPortInUse(port) {
    try {
        await axios.get(`http://localhost:${port}`);
        return true;
    } catch (error) {
        return error.code !== 'ECONNREFUSED';
    }
}

// Start MongoDB
async function startMongoDB() {
    console.log('Starting MongoDB...');
    try {
        // Try connecting to see if MongoDB is already running
        await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('MongoDB is already running');
        return true;
    } catch (error) {
        console.log('MongoDB not running, attempting to start...');
        try {
            // Try starting MongoDB as a service first
            await execAsync('net start MongoDB');
            console.log('MongoDB service started');
            return true;
        } catch (error) {
            try {
                // If service start fails, try running mongod directly
                mongoProcess = spawn('mongod', [], {
                    stdio: 'pipe'
                });
                
                return new Promise((resolve) => {
                    mongoProcess.stdout.on('data', (data) => {
                        if (data.toString().includes('waiting for connections')) {
                            console.log('MongoDB started successfully');
                            resolve(true);
                        }
                    });
                    
                    // Timeout after 30 seconds
                    setTimeout(() => {
                        resolve(false);
                    }, 30000);
                });
            } catch (error) {
                console.error('Failed to start MongoDB:', error);
                return false;
            }
        }
    }
}

// Start the server
async function startServer() {
    console.log('Starting server...');
    
    // Check if server is already running
    const serverRunning = await isPortInUse(config.serverPort);
    if (serverRunning) {
        console.log('Server is already running');
        return true;
    }

    return new Promise((resolve) => {
        // Start the server
        server = spawn('node', ['server.js'], {
            env: { ...process.env, PORT: config.serverPort },
            cwd: path.join(__dirname, '..')
        });

        server.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);
            if (data.toString().includes('Server is running')) {
                resolve(true);
            }
        });

        server.stderr.on('data', (data) => {
            console.error(`Server Error: ${data}`);
        });

        // Wait for server to be ready
        let attempts = 0;
        const maxAttempts = 30;
        
        const checkServer = async () => {
            try {
                await axios.get(`http://localhost:${config.serverPort}/api/health`);
                console.log('Server is ready');
                resolve(true);
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    console.log('Server failed to start');
                    resolve(false);
                } else {
                    setTimeout(checkServer, 1000);
                }
            }
        };
        
        checkServer();
    });
}

// Stop services
async function cleanup() {
    console.log('\nCleaning up...');
    
    // Clean up test user
    if (testUserId) {
        try {
            await User.findByIdAndDelete(testUserId);
            console.log('Test user removed');
        } catch (error) {
            console.error('Failed to remove test user:', error);
        }
    }

    // Stop the server
    if (server) {
        server.kill();
        console.log('Server stopped');
    }

    // Close MongoDB connection
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }

    // Stop MongoDB if we started it
    if (mongoProcess) {
        mongoProcess.kill();
        console.log('MongoDB process stopped');
    }
}

// Run tests
async function runTests() {
    try {
        console.log('\n=== Starting PIN Feature Tests ===\n');

        // Step 1: Register test user
        console.log('Step 1: Registering test user');
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
        if (invalidPinResponse.data.success) {
            throw new Error('Invalid PIN was accepted');
        }

        // Step 5: Set valid PIN
        console.log('\nStep 5: Setting valid PIN');
        const setPinResponse = await api.post('/withdrawal/set-withdrawal-pin', {
            pin: '123456',
            confirmPin: '123456'
        });
        console.log('Set PIN response:', setPinResponse.data);
        if (!setPinResponse.data.success) {
            throw new Error('Failed to set valid PIN');
        }

        // Step 6: Verify PIN status after setting
        console.log('\nStep 6: Verifying PIN status after setting');
        const afterSetStatus = await api.get('/withdrawal/pin-status');
        console.log('After set status:', afterSetStatus.data);
        if (!afterSetStatus.data.hasPinSet) {
            throw new Error('PIN status not updated after setting');
        }

        // Step 7: Test PIN verification
        console.log('\nStep 7: Testing PIN verification');
        const verifyResponse = await api.post('/withdrawal/verify-pin', {
            pin: '123456'
        });
        console.log('Verify PIN response:', verifyResponse.data);
        if (!verifyResponse.data.success) {
            throw new Error('Failed to verify correct PIN');
        }

        // Step 8: Test incorrect PIN
        console.log('\nStep 8: Testing incorrect PIN');
        const incorrectPinResponse = await api.post('/withdrawal/verify-pin', {
            pin: '111111'
        });
        console.log('Incorrect PIN response:', incorrectPinResponse.data);
        if (incorrectPinResponse.data.success) {
            throw new Error('Incorrect PIN was accepted');
        }

        console.log('\n=== All Tests Completed Successfully ===\n');
        return true;

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        return false;
    }
}

// Main execution
async function main() {
    try {
        // Start MongoDB
        const mongoStarted = await startMongoDB();
        if (!mongoStarted) {
            throw new Error('Failed to start MongoDB');
        }

        // Wait for MongoDB to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Start server
        const serverStarted = await startServer();
        if (!serverStarted) {
            throw new Error('Failed to start server');
        }

        // Wait for server to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Run tests
        const success = await runTests();
        
        if (success) {
            console.log('\nSmoke test completed successfully!');
            process.exit(0);
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

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Run the test suite
main().catch(console.error);