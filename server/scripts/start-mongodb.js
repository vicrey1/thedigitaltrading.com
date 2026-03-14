const { exec } = require('child_process');
const mongoose = require('mongoose');

function isMongoRunning() {
    return new Promise((resolve) => {
        mongoose.connect('mongodb://localhost:27017/test', { serverSelectionTimeoutMS: 2000 })
            .then(() => {
                mongoose.connection.close();
                resolve(true);
            })
            .catch(() => resolve(false));
    });
}

async function startMongoDB() {
    console.log('Checking MongoDB status...');
    
    const isRunning = await isMongoRunning();
    if (isRunning) {
        console.log('MongoDB is already running');
        return true;
    }

    return new Promise((resolve) => {
        console.log('Starting MongoDB...');
        
        // Try to start MongoDB service
        exec('net start MongoDB', (error, stdout, stderr) => {
            if (error) {
                console.error('Failed to start MongoDB service:', error);
                console.log('Attempting to start mongod directly...');
                
                // If service start fails, try running mongod directly
                exec('mongod', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Failed to start mongod:', error);
                        resolve(false);
                    } else {
                        console.log('MongoDB started via mongod');
                        resolve(true);
                    }
                });
            } else {
                console.log('MongoDB service started');
                resolve(true);
            }
        });
    });
}

module.exports = { startMongoDB };