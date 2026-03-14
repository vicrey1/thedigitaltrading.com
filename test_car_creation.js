const FormData = require('form-data');
const got = require('got').default;
const fs = require('fs');
const path = require('path');

// Test configuration
const API_URL = 'http://localhost:3001/api/cars';
const ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || 'your-admin-token-here';

async function testCarCreation() {
  try {
    console.log('[TEST] Starting car creation test...');

    // Create FormData
    const form = new FormData();

    // Add all required fields
    form.append('title', 'Test Lamborghini Urus 2021');
    form.append('description', 'A high-performance luxury SUV for testing.');
    form.append('price', 300000);
    form.append('originalPrice', 450000);
    form.append('make', 'LAMBORGHINI');
    form.append('model', 'URUS');
    form.append('year', 2021);
    form.append('mileage', 25000);
    form.append('fuelType', 'gasoline');
    form.append('transmission', 'automatic');
    form.append('bodyType', 'suv');
    form.append('drivetrain', '4WD');
    form.append('color', 'ORANGE');
    form.append('condition', 'excellent');
    form.append('location', 'NEW YORK');

    // Add features as separate entries
    const features = ['Air Conditioning', 'Bluetooth', 'GPS Navigation'];
    features.forEach(feature => {
      form.append('features', feature);
    });

    form.append('isFeatured', 'false');
    form.append('isAvailable', 'true');
    form.append('contactPhone', '+1 28967548765');
    form.append('contactEmail', 'test@example.com');

    // Use a real PNG image from the workspace for testing
    const realImagePath = path.join(__dirname, 'client', 'public', 'logo192.png');
    form.append('images', fs.createReadStream(realImagePath));

    // Make request using got
    const response = await got(API_URL, {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      responseType: 'json',
      throwHttpErrors: false
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('[TEST] ✓ Car created successfully!');
      console.log('[TEST] Response:', JSON.stringify(response.body, null, 2));
    } else {
      console.error('[TEST] ✗ Car creation failed!');
      console.error('[TEST] Status:', response.statusCode);
      console.error('[TEST] Error:', response.body);
    }

  } catch (error) {
    console.error('[TEST] ✗ Car creation failed!');
    if (error.response) {
      console.error('[TEST] Status:', error.response.status);
      console.error('[TEST] Error:', error.response.data);
      console.error('[TEST] Headers:', error.response.headers);
      console.error('[TEST] Config:', error.config);
    } else {
      console.error('[TEST] Error:', error.message);
      console.error('[TEST] Stack:', error.stack);
    }
  }
}


testCarCreation();
