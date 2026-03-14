const mongoose = require('mongoose');
const User = require('../models/User');
const { calculateAvailableBalance } = require('../utils/balanceCalculator');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function syncBalances() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);

    // Process each user
    for (const user of users) {
      try {
        console.log(`\nProcessing user: ${user.email}`);
        
        // Calculate correct balance
        const balanceData = await calculateAvailableBalance(user._id);
        const calculatedBalance = parseFloat(balanceData.calculatedAvailableBalance.toFixed(2));
        const currentBalance = parseFloat((user.availableBalance || 0).toFixed(2));
        
        // Log balance details
        console.log('Current stored balance:', currentBalance);
        console.log('Calculated balance:', calculatedBalance);
        console.log('Balance components:');
        console.log('- Deposits:', balanceData.depositBalance);
        console.log('- Invested:', balanceData.totalInvested);
        console.log('- ROI:', balanceData.totalConfirmedRoi);
        console.log('- Admin Adjustments:', balanceData.netAdminAdjustments);

        // Update if there's a mismatch
        if (currentBalance !== calculatedBalance) {
          console.log(`Balance mismatch found for ${user.email}`);
          console.log(`Updating from $${currentBalance} to $${calculatedBalance}`);
          
          user.availableBalance = calculatedBalance;
          await user.save();
          
          console.log('Balance updated successfully');
        } else {
          console.log('Balance is correct');
        }
      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err);
      }
    }

    console.log('\nBalance sync complete');
  } catch (err) {
    console.error('Sync error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the sync
syncBalances().then(() => {
  console.log('Sync script finished');
}).catch(err => {
  console.error('Script error:', err);
});