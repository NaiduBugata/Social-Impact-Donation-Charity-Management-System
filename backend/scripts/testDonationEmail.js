require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const Transaction = require('../src/models/Transaction');
const { sendDonationConfirmationEmail, sendDonationReceivedEmail } = require('../src/services/emailService');

const testDonationEmails = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find or create test users
    let donor = await User.findOne({ email: 'donor@test.com' });
    let receiver = await User.findOne({ email: 'receiver@test.com' });

    if (!donor || !receiver) {
      console.log('❌ Test users not found. Please run the seed script first.');
      process.exit(1);
    }

    console.log('📧 Test User Details:');
    console.log(`   Donor: ${donor.name} (${donor.email})`);
    console.log(`   Receiver: ${receiver.name} (${receiver.email})\n`);

    // Find or create test campaign
    let campaign = await Campaign.findOne({ createdBy: receiver._id });
    
    if (!campaign) {
      console.log('📝 Creating test campaign...');
      campaign = await Campaign.create({
        title: 'Test Medical Campaign',
        description: 'Test campaign for email verification',
        category: 'medical',
        fundingGoal: 50000,
        raised: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Mumbai',
        createdBy: receiver._id,
        status: 'active',
        active: true,
        verified: true,
        donorCount: 0
      });
      console.log(`✅ Campaign created: ${campaign.title}\n`);
    } else {
      console.log(`✅ Using existing campaign: ${campaign.title}\n`);
    }

    // Test email details
    const testAmount = 5000;
    const testDate = new Date();
    const testTransactionId = 'TEST-' + Date.now();

    console.log('📧 Sending test emails...\n');

    // 1. Test donor confirmation email
    console.log('1️⃣ Testing DONOR confirmation email...');
    const donorEmailResult = await sendDonationConfirmationEmail(donor.email, {
      donorName: donor.name,
      amount: testAmount,
      campaignTitle: campaign.title,
      campaignCategory: campaign.category,
      transactionId: testTransactionId,
      date: testDate,
      isAnonymous: false,
      impactStory: `Your ₹${testAmount.toLocaleString()} contribution is helping provide critical medical care.`
    });

    if (donorEmailResult.success) {
      console.log(`   ✅ SUCCESS: Donor email sent to ${donor.email}`);
    } else {
      console.log(`   ❌ FAILED: ${donorEmailResult.error}`);
    }

    // 2. Test receiver notification email
    console.log('\n2️⃣ Testing RECEIVER notification email...');
    const receiverEmailResult = await sendDonationReceivedEmail(receiver.email, {
      receiverName: receiver.name,
      amount: testAmount,
      donorName: donor.name,
      campaignTitle: campaign.title,
      campaignCategory: campaign.category,
      transactionId: testTransactionId,
      date: testDate,
      isAnonymous: false
    });

    if (receiverEmailResult.success) {
      console.log(`   ✅ SUCCESS: Receiver email sent to ${receiver.email}`);
    } else {
      console.log(`   ❌ FAILED: ${receiverEmailResult.error}`);
    }

    // 3. Test anonymous donation (receiver only)
    console.log('\n3️⃣ Testing ANONYMOUS donation email (receiver only)...');
    const anonymousEmailResult = await sendDonationReceivedEmail(receiver.email, {
      receiverName: receiver.name,
      amount: testAmount,
      donorName: 'Anonymous Donor',
      campaignTitle: campaign.title,
      campaignCategory: campaign.category,
      transactionId: 'TEST-ANON-' + Date.now(),
      date: testDate,
      isAnonymous: true
    });

    if (anonymousEmailResult.success) {
      console.log(`   ✅ SUCCESS: Anonymous donation notification sent to ${receiver.email}`);
    } else {
      console.log(`   ❌ FAILED: ${anonymousEmailResult.error}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Donor Email: ${donorEmailResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Receiver Email: ${receiverEmailResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Anonymous Email: ${anonymousEmailResult.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('='.repeat(60));
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Check the email inboxes:');
    console.log(`      - Donor: ${donor.email}`);
    console.log(`      - Receiver: ${receiver.email}`);
    console.log('   2. Verify SendGrid sender email in SendGrid dashboard');
    console.log('   3. Check spam folder if emails not in inbox');
    console.log('   4. Review SendGrid activity logs for delivery status\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testDonationEmails();
