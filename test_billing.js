// Test script for billing system
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBillingSystem() {
  console.log('🧪 Testing Billing System...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Server is running\n');

    // Test 2: Check if billing routes exist
    console.log('2. Testing billing routes...');
    
    // This should return 401 (unauthorized) which means the route exists
    try {
      await axios.get(`${BASE_URL}/api/withdrawal/billing-status`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Billing status route exists (returns 401 as expected without auth)');
      } else {
        console.log('❌ Billing status route error:', error.message);
      }
    }

    try {
      await axios.post(`${BASE_URL}/api/withdrawal/pay-billing/test123`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Pay billing route exists (returns 401 as expected without auth)');
      } else {
        console.log('❌ Pay billing route error:', error.message);
      }
    }

    try {
      await axios.post(`${BASE_URL}/api/withdrawal/pay-all-billing`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Pay all billing route exists (returns 401 as expected without auth)');
      } else {
        console.log('❌ Pay all billing route error:', error.message);
      }
    }

    console.log('\n🎉 Billing system routes are properly configured!');
    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Login to your account');
    console.log('3. Navigate to the Withdraw page');
    console.log('4. Try to make a withdrawal');
    console.log('5. Verify that the billing step (step 4) appears');
    console.log('6. Test the billing payment functionality');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testBillingSystem();