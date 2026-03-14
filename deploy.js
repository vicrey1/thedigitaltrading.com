#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 THE DIGITAL TRADING - Production Deployment Script');
console.log('==================================================');

// Check if we're in the right directory
if (!fs.existsSync('client') || !fs.existsSync('server')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

try {
  // Install server dependencies
  console.log('\n📦 Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });

  // Install client dependencies
  console.log('\n📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });

  // Build the client
  console.log('\n🏗️ Building client for production...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  console.log('\n✅ Build completed successfully!');
  console.log('\n🚀 Next steps for deployment:');
  console.log('1. Deploy to Render using render.yaml:');
  console.log('   - Go to https://render.com');
  console.log('   - Connect your GitHub repository');
  console.log('   - Create a Blueprint deployment');
  console.log('   - Render will automatically deploy both frontend and backend');
  console.log('   - Set environment variables (see DEPLOYMENT.md)');
  console.log('\n2. Alternative - Deploy services manually:');
  console.log('   - Create Web Service for backend (server folder)');
  console.log('   - Create Static Site for frontend (client folder)');
  console.log('\n3. Configure custom domain (optional)');
  console.log('\n📖 For detailed instructions, see DEPLOYMENT.md');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}