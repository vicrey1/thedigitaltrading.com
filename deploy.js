#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...');

// Check if we're in the right directory
if (!fs.existsSync('client') || !fs.existsSync('server')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

try {
  // Install server dependencies
  console.log('📦 Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });

  // Build the client
  console.log('🏗️  Building client for production...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  console.log('✅ Production build completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Deploy the server to Render using the render.yaml configuration');
  console.log('2. Deploy the client to Vercel or use the static build from client/build');
  console.log('3. Set up your environment variables on the hosting platform');
  console.log('4. Configure your custom domain (thedigitaltrading.com)');
  console.log('');
  console.log('🔧 Required environment variables for production:');
  console.log('- MONGO_URI (MongoDB connection string)');
  console.log('- JWT_SECRET (JWT signing secret)');
  console.log('- BREVO_API_KEY (Email service API key)');
  console.log('- EMAIL_* variables (Email configuration)');
  console.log('');
  console.log('🌐 Your app will be available at:');
  console.log('- Frontend: https://thedigitaltrading.com');
  console.log('- API: https://thedigitaltrading-api.onrender.com');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}