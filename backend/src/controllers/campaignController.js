const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { sendCampaignApprovalEmail } = require('../services/emailService');

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCampaign = async (req, res) => {
  try {
    const { title, description, category, fundingGoal, deadline, location, createdBy, creatorRole, status } = req.body;
    
    // Map frontend fields to backend Campaign model fields
    const campaignData = {
      title,
      description,
      category,
      goal: fundingGoal, // Map fundingGoal to goal
      raised: 0,
      createdBy,
      deadline: deadline ? new Date(deadline) : null,
      location: {
        address: location
      },
      status: status || 'pending', // Default to pending for admin approval
      verified: false,
      active: false // Inactive until admin approves
    };

    const campaign = await Campaign.create(campaignData);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { 
        status: 'active', 
        verified: true, 
        active: true 
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Send approval email to campaign creator
    if (campaign.createdBy) {
      try {
        const creator = await User.findById(campaign.createdBy);
        if (creator && creator.email) {
          const emailResult = await sendCampaignApprovalEmail(creator.email, {
            creatorName: creator.name || 'Campaign Creator',
            campaignTitle: campaign.title,
            campaignCategory: campaign.category || 'General',
            campaignGoal: campaign.goal,
            campaignId: campaign._id.toString()
          });
          
          if (emailResult.success) {
            console.log(`✅ Campaign approval email sent to ${creator.email}`);
          } else {
            console.error(`⚠️ Failed to send approval email:`, emailResult.error);
          }
        }
      } catch (emailError) {
        console.error('⚠️ Campaign approval email failed:', emailError.message);
      }
    }

    res.json({ success: true, data: campaign, message: 'Campaign approved successfully' });
  } catch (error) {
    console.error('Error approving campaign:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { 
        status: 'rejected', 
        verified: false, 
        active: false 
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign, message: 'Campaign rejected' });
  } catch (error) {
    console.error('Error rejecting campaign:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCampaigns, getCampaignById, createCampaign, approveCampaign, rejectCampaign };
 
