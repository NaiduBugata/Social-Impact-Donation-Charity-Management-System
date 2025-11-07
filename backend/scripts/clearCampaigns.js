// scripts/clearCampaigns.js
const mongoose = require('mongoose');
const Campaign = require('../src/models/Campaign');
require('dotenv').config();

const clearCampaigns = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const result = await Campaign.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} campaigns from database`);
    
    console.log('\n✅ All static/seed campaigns removed!');
    console.log('💡 Only user-created campaigns will now appear.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearCampaigns();
