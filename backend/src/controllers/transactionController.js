const Transaction = require('../models/Transaction');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { sendDonationConfirmationEmail, sendDonationReceivedEmail } = require('../services/emailService');

// Helper to generate QR code
const generateQRCode = () => {
  return 'QR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

// Helper to generate impact story
const generateImpactStory = (amount, category) => {
  const stories = {
    medical: `Your ₹${amount.toLocaleString()} contribution is helping provide critical medical care.`,
    education: `Your ₹${amount.toLocaleString()} donation is supporting education for underprivileged students.`,
    food: `Your ₹${amount.toLocaleString()} helps provide nutritious meals to families in need.`,
    shelter: `Your ₹${amount.toLocaleString()} is helping build safe housing for vulnerable communities.`,
    emergency: `Your ₹${amount.toLocaleString()} provides immediate relief to those in crisis.`
  };
  return stories[category] || `Your generous donation of ₹${amount.toLocaleString()} is making a real difference!`;
};

const createDonation = async (req, res) => {
  try {
    const { donorId, campaignId, amount, isAnonymous } = req.body;

    // Get campaign details
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Generate QR code for anonymous donations
    const qrCode = isAnonymous ? generateQRCode() : null;
    const trackUrl = qrCode ? `/impact/${qrCode}` : null;
    
    // Generate impact story
    const impactStory = generateImpactStory(amount, campaign.category);

    const txn = await Transaction.create({ 
      donorId: isAnonymous ? 'anonymous' : donorId,
      receiverId: campaign.receiverId,
      campaignId, 
      amount, 
      isAnonymous, 
      qrCode,
      trackUrl,
      impactStory, 
      status: 'completed',
      paymentId: 'pay_' + Date.now() // Mock payment ID
    });

    // Update campaign totals
    await Campaign.findByIdAndUpdate(campaignId, { 
      $inc: { raised: amount, donorCount: 1 } 
    });

    // Send emails to both donor and receiver
    const emailPromises = [];

    // 1. Send donation confirmation email to donor (only if not anonymous)
    if (!isAnonymous && donorId) {
      const donorEmailPromise = (async () => {
        try {
          const donor = await User.findById(donorId);
          if (donor && donor.email) {
            const emailResult = await sendDonationConfirmationEmail(donor.email, {
              donorName: donor.name || 'Valued Donor',
              amount: amount,
              campaignTitle: campaign.title,
              campaignCategory: campaign.category || 'General',
              transactionId: txn._id.toString(),
              date: txn.createdAt,
              isAnonymous: false,
              impactStory: impactStory
            });
            
            if (emailResult.success) {
              console.log(`✅ Donation confirmation email sent to donor: ${donor.email}`);
            } else {
              console.error(`⚠️ Failed to send donor email:`, emailResult.error);
            }
          }
        } catch (emailError) {
          console.error('⚠️ Donor email sending failed:', emailError.message);
        }
      })();
      emailPromises.push(donorEmailPromise);
    }

    // 2. Send donation received notification to receiver/beneficiary
    if (campaign.createdBy) {
      const receiverEmailPromise = (async () => {
        try {
          const receiver = await User.findById(campaign.createdBy);
          if (receiver && receiver.email) {
            const donorInfo = !isAnonymous && donorId ? await User.findById(donorId) : null;
            const emailResult = await sendDonationReceivedEmail(receiver.email, {
              receiverName: receiver.name || 'Campaign Owner',
              amount: amount,
              donorName: donorInfo ? donorInfo.name : 'Anonymous Donor',
              campaignTitle: campaign.title,
              campaignCategory: campaign.category || 'General',
              transactionId: txn._id.toString(),
              date: txn.createdAt,
              isAnonymous: isAnonymous
            });
            
            if (emailResult.success) {
              console.log(`✅ Donation received notification sent to receiver: ${receiver.email}`);
            } else {
              console.error(`⚠️ Failed to send receiver email:`, emailResult.error);
            }
          }
        } catch (emailError) {
          console.error('⚠️ Receiver email sending failed:', emailError.message);
        }
      })();
      emailPromises.push(receiverEmailPromise);
    }

    // Wait for all emails to be sent (but don't block the response)
    Promise.all(emailPromises).catch(err => {
      console.error('⚠️ Some emails failed to send:', err.message);
    });

    res.status(201).json({ 
      success: true, 
      data: txn,
      message: 'Donation successful! Thank you for your contribution.' 
    });
  } catch (error) {
    console.error('Donation error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getImpactByQR = async (req, res) => {
  try {
    const { qr } = req.params;
    const txn = await Transaction.findOne({ qrCode: qr });
    if (!txn) return res.status(404).json({ success: false, message: 'Invalid QR code' });

    const campaign = txn.campaignId ? await Campaign.findById(txn.campaignId) : null;
    res.json({ success: true, data: { transaction: txn, campaign } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: txns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDonation, getImpactByQR, getTransactions };
 
