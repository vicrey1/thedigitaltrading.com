const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { calculateAvailableBalance } = require('../utils/balanceCalculator');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: __dirname + '/../' + envFile });

async function validateAllBalances() {
  try {
    console.log('Starting balance validation for all users...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({}, '_id email availableBalance');
    console.log(`Found ${users.length} users to validate`);
    
    let inconsistenciesFound = 0;
    let correctionsMade = 0;
    
    for (const user of users) {
      try {
        const calculatedBalance = await calculateAvailableBalance(user._id);
        const storedBalance = user.availableBalance || 0;
        const difference = Math.abs(calculatedBalance - storedBalance);
        
        if (difference > 0.01) {
          inconsistenciesFound++;
          
          console.log(`Inconsistency found for user ${user.email}:`, {
            stored: storedBalance,
            calculated: calculatedBalance,
            difference: difference
          });
          
          // Update the user's balance
          await User.findByIdAndUpdate(user._id, {
            availableBalance: calculatedBalance
          });
          
          // Log the correction
          await AuditLog.create({
            userId: user._id,
            action: 'balance_validation_correction',
            details: {
              previousBalance: storedBalance,
              correctedBalance: calculatedBalance,
              difference: difference,
              timestamp: new Date(),
              validationRun: true
            },
            performedBy: 'system_validation'
          });
          
          correctionsMade++;
        }
      } catch (error) {
        console.error(`Error validating balance for user ${user.email}:`, error);
      }
    }
    
    console.log('\nBalance validation completed:');
    console.log(`- Users checked: ${users.length}`);
    console.log(`- Inconsistencies found: ${inconsistenciesFound}`);
    console.log(`- Corrections made: ${correctionsMade}`);
    
    if (inconsistenciesFound === 0) {
      console.log('✅ All balances are consistent!');
    } else {
      console.log(`⚠️  ${inconsistenciesFound} balance inconsistencies were found and corrected.`);
    }
    
  } catch (error) {
    console.error('Error during balance validation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the validation
if (require.main === module) {
  validateAllBalances()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateAllBalances };