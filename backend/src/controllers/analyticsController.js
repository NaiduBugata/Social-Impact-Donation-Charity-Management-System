const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Transaction = require('../models/Transaction');
const Request = require('../models/Request');

const getAnalytics = async (req, res) => {
  try {
    // User Analytics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const verifiedUsers = await User.countDocuments({ verified: true });

    // Campaign Analytics
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active', active: true });
    const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });
    const rejectedCampaigns = await Campaign.countDocuments({ status: 'rejected' });
    
    // Total raised from all campaigns
    const campaignFunds = await Campaign.aggregate([
      { $group: { _id: null, totalRaised: { $sum: '$raised' }, totalGoal: { $sum: '$goal' } } }
    ]);
    const totalRaisedFromCampaigns = campaignFunds.length > 0 ? campaignFunds[0].totalRaised : 0;
    const totalCampaignGoals = campaignFunds.length > 0 ? campaignFunds[0].totalGoal : 0;

    // Campaign by category
    const campaignsByCategory = await Campaign.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 }, raised: { $sum: '$raised' } } },
      { $sort: { count: -1 } }
    ]);

    // Request Analytics
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const sanctionedRequests = await Request.countDocuments({ status: 'sanctioned' });
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });

    // Total sanctioned amount
    const sanctionedData = await Request.aggregate([
      { $match: { sanctionedAmount: { $exists: true, $ne: null } } },
      { $group: { _id: null, totalSanctioned: { $sum: '$sanctionedAmount' } } }
    ]);
    const totalSanctioned = sanctionedData.length > 0 ? sanctionedData[0].totalSanctioned : 0;

    // Request amounts by status
    const requestsByStatus = await Request.aggregate([
      { $match: { amount: { $exists: true } } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    // Transaction Analytics
    const transactions = await Transaction.find();
    const totalDonations = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const transactionCount = transactions.length;
    const averageDonation = transactionCount > 0 ? totalDonations / transactionCount : 0;

    // Monthly donation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyDonations = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Total funds raised (campaigns + direct donations + sanctioned)
    const totalRaised = totalRaisedFromCampaigns + totalDonations + totalSanctioned;

    // Category data for charts
    const categoryData = campaignsByCategory.map(cat => ({
      name: cat._id || 'Other',
      value: cat.count,
      raised: cat.raised
    }));

    res.json({
      success: true,
      data: {
        // Summary Stats
        totalRaised,
        totalDonations,
        totalSanctioned,
        totalRaisedFromCampaigns,
        totalCampaignGoals,
        averageDonation,
        
        // User Stats
        totalUsers,
        verifiedUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        
        // Campaign Stats
        totalCampaigns,
        activeCampaigns,
        pendingCampaigns,
        rejectedCampaigns,
        
        // Request Stats
        totalRequests,
        pendingRequests,
        approvedRequests,
        sanctionedRequests,
        rejectedRequests,
        completedRequests,
        
        // Charts Data
        categoryData,
        requestsByStatus: requestsByStatus.map(r => ({
          status: r._id,
          count: r.count,
          amount: r.totalAmount
        })),
        monthlyDonations: monthlyDonations.map(m => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          count: m.count,
          total: m.total
        })),
        
        // Transaction Stats
        transactionCount
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };
