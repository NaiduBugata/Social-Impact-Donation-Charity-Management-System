require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const { sendCampaignApprovalEmail } = require('../src/services/emailService');

const testCampaignApprovalEmail = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find test receiver/campaign creator
    const creator = await User.findOne({ email: 'receiver@test.com' });
    
    if (!creator) {
      console.log('❌ Test creator not found. Run seed script first.');
      process.exit(1);
    }

    console.log('👤 Campaign Creator:');
    console.log(`   Name: ${creator.name}`);
    console.log(`   Email: ${creator.email}\n`);

    // Find or create test campaign
    let campaign = await Campaign.findOne({ createdBy: creator._id });
    
    if (!campaign) {
      console.log('📝 Creating test campaign...');
      campaign = await Campaign.create({
        title: 'Test Medical Campaign for Approval',
        description: 'Test campaign to verify approval email',
        category: 'medical',
        goal: 100000,
        raised: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: { address: 'Mumbai' },
        createdBy: creator._id,
        status: 'pending',
        active: false,
        verified: false,
        donorCount: 0
      });
      console.log(`✅ Campaign created: ${campaign.title}\n`);
    } else {
      console.log(`✅ Using existing campaign: ${campaign.title}\n`);
    }

    console.log('📧 Testing Campaign Approval Email...\n');

    // Test campaign approval email
    const emailResult = await sendCampaignApprovalEmail(creator.email, {
      creatorName: creator.name,
      campaignTitle: campaign.title,
      campaignCategory: campaign.category,
      campaignGoal: campaign.goal,
      campaignId: campaign._id.toString()
    });

    console.log('='.repeat(60));
    console.log('📊 TEST RESULT');
    console.log('='.repeat(60));
    
    if (emailResult.success) {
      console.log('✅ SUCCESS: Campaign approval email sent!');
      console.log(`   Recipient: ${creator.email}`);
      console.log(`   Campaign: ${campaign.title}`);
      console.log(`   Goal: ₹${campaign.goal.toLocaleString('en-IN')}`);
    } else {
      console.log('❌ FAILED: Email sending failed');
      console.log(`   Error: ${emailResult.error}`);
    }
    
    console.log('='.repeat(60));
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Check inbox: ' + creator.email);
    console.log('   2. Look for email: "🎉 Your Campaign is Now Live!"');
    console.log('   3. Check spam folder if not in inbox');
    console.log('   4. Test approval from admin dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testCampaignApprovalEmail();
