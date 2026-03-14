const mongoose = require('mongoose');
const { calculateAvailableBalance } = require('./utils/balanceCalculator');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/thedigitaltrading', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testUsers = [
  { id: '68d9260d2f3c6557433fb4cc', name: 'Dominik M Humburger', email: 'Vameh09@gmail.com', expectedAmount: 11000 },
  { id: '68d9309aeedd0cd99754af13', name: 'Dominik M Humburger', email: 'victoragapiah1881@gmail.com', expectedAmount: 0 },
  { id: '688409602820d627ad8bcfe1', name: 'Admin User', email: 'admin@thedigitaltrading.com', expectedAmount: 0 },
  { id: '68db096c63c6fd9985670beb', name: 'David Arquitt', email: 'Davestrading67@yahoo.com', expectedAmount: 0 },
  { id: '68e2d700b179a9e630ccaa95', name: 'Robert Baresse', email: 'robertbaresse8@gmail.com', expectedAmount: 350 }
];

async function testBalances() {
  console.log('Testing balance calculations for users...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`\n=== ${user.name} (${user.email}) ===`);
      console.log(`Expected Amount: $${user.expectedAmount}`);
      
      const balanceData = await calculateAvailableBalance(user.id);
      
      console.log('Balance Calculation Details:');
      console.log(`- Deposit Balance: $${balanceData.depositBalance}`);
      console.log(`- Total Invested: $${balanceData.totalInvested}`);
      console.log(`- Total Confirmed ROI: $${balanceData.totalConfirmedRoi}`);
      console.log(`- Net Admin Adjustments: $${balanceData.netAdminAdjustments}`);
      console.log(`- Calculated Available Balance: $${balanceData.calculatedAvailableBalance}`);
      
      const discrepancy = balanceData.calculatedAvailableBalance - user.expectedAmount;
      console.log(`- Discrepancy: $${discrepancy}`);
      
      if (Math.abs(discrepancy) > 0.01) {
        console.log('❌ MISMATCH DETECTED!');
      } else {
        console.log('✅ Balance matches expected amount');
      }
      
    } catch (error) {
      console.log(`❌ Error calculating balance: ${error.message}`);
    }
  }
  
  mongoose.connection.close();
}

testBalances().catch(console.error);