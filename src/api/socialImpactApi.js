/**
 * 🌍 Social Impact Donation & Charity Management System
 * Complete localStorage-based API simulation
 * Features: AI matching, QR tracking, trust graph, gamification
 */

// ========================================
// 📦 DATA INITIALIZATION & STORAGE
// ========================================

const STORAGE_KEYS = {
  USERS: 'social_impact_users',
  REQUESTS: 'social_impact_requests',
  HELPERS: 'social_impact_helpers',
  TRANSACTIONS: 'social_impact_transactions',
  CAMPAIGNS: 'social_impact_campaigns',
  PROOFS: 'social_impact_proofs',
  TRUST_EDGES: 'social_impact_trust_edges',
  BADGES: 'social_impact_badges',
  KYC: 'social_impact_kyc',
  NOTIFICATIONS: 'social_impact_notifications',
  IMPACT_STORIES: 'social_impact_stories'
};

// Initialize data on first load
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    // Seed users with comprehensive data
    const seedUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@socialimpact.org',
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator',
        verified: true,
        kycStatus: 'approved',
        trustScore: 100,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        username: 'donor1',
        email: 'donor@example.com',
        password: 'donor123',
        role: 'donor',
        name: 'Rajesh Kumar',
        verified: true,
        kycStatus: 'approved',
        location: { lat: 28.6139, lng: 77.2090, address: 'Delhi, India' },
        trustScore: 85,
        totalDonated: 15000,
        impactedLives: 12,
        badge: 'Gold',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        username: 'helper1',
        email: 'doctor@example.com',
        password: 'helper123',
        role: 'helper',
        name: 'Dr. Priya Sharma',
        verified: true,
        kycStatus: 'approved',
        profession: 'Doctor',
        specialization: 'General Medicine',
        location: { lat: 28.7041, lng: 77.1025, address: 'North Delhi, India' },
        trustScore: 92,
        servicesProvided: 8,
        availability: true,
        license: 'MED-2024-12345',
        badge: 'Platinum',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        username: 'receiver1',
        email: 'receiver@example.com',
        password: 'receiver123',
        role: 'receiver',
        name: 'Amit Patel',
        verified: true,
        kycStatus: 'approved',
        location: { lat: 28.6692, lng: 77.4538, address: 'Ghaziabad, UP' },
        trustScore: 78,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        username: 'ngo1',
        email: 'ngo@helpindia.org',
        password: 'ngo123',
        role: 'organization',
        name: 'Help India Foundation',
        verified: true,
        kycStatus: 'approved',
        organizationType: 'NGO',
        registrationNumber: 'NGO-2020-5678',
        location: { lat: 28.5355, lng: 77.3910, address: 'Noida, UP' },
        trustScore: 95,
        campaignsRun: 15,
        totalFundsReceived: 250000,
        badge: 'Platinum',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));

    // Seed campaigns (diverse categories for better analytics)
    const seedCampaigns = [
      {
        id: 'camp1',
        title: 'Medical Emergency: Heart Surgery for Child',
        description: 'A 7-year-old child from Delhi needs urgent heart surgery. Your support can save a life.',
        category: 'medical',
        goal: 500000,
        raised: 325000,
        verified: true,
        active: true,
        createdBy: '4',
        receiverId: '4',
        organizationId: '5',
        organizationName: 'Help India Foundation',
        location: { lat: 28.6692, lng: 77.4538, address: 'Ghaziabad, UP' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        proofImages: ['https://via.placeholder.com/400x300?text=Medical+Bills'],
        verifiedProof: true,
        donorCount: 23,
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'camp2',
        title: 'Education Support: Laptop for Online Classes',
        description: 'Help underprivileged students access online education during the pandemic.',
        category: 'education',
        goal: 50000,
        raised: 50000,
        verified: true,
        active: false,
        createdBy: '5',
        receiverId: '4',
        organizationId: '5',
        organizationName: 'Help India Foundation',
        location: { lat: 28.5355, lng: 77.3910, address: 'Noida, UP' },
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        proofImages: ['https://via.placeholder.com/400x300?text=Laptop+Delivered'],
        verifiedProof: true,
        donorCount: 8,
        status: 'completed',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'camp3',
        title: 'Food Relief for Flood Victims',
        description: 'Urgent food packets needed for 200 families affected by floods in Bihar.',
        category: 'food',
        goal: 100000,
        raised: 75000,
        verified: true,
        active: true,
        createdBy: '5',
        receiverId: '4',
        organizationId: '5',
        organizationName: 'Help India Foundation',
        location: { lat: 25.5941, lng: 85.1376, address: 'Patna, Bihar' },
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        proofImages: ['https://via.placeholder.com/400x300?text=Flood+Relief'],
        verifiedProof: true,
        donorCount: 15,
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'camp4',
        title: 'Shelter for Homeless - Winter Relief',
        description: 'Build temporary shelters for 50 homeless families during the harsh winter.',
        category: 'shelter',
        goal: 200000,
        raised: 125000,
        verified: true,
        active: true,
        createdBy: '5',
        receiverId: '4',
        organizationId: '5',
        organizationName: 'Help India Foundation',
        location: { lat: 28.7041, lng: 77.1025, address: 'Delhi, India' },
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        proofImages: ['https://via.placeholder.com/400x300?text=Shelter+Construction'],
        verifiedProof: true,
        donorCount: 18,
        status: 'active',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'camp5',
        title: 'Healthcare Camp in Rural Village',
        description: 'Free medical checkup and medicines for 500+ villagers without access to healthcare.',
        category: 'healthcare',
        goal: 80000,
        raised: 60000,
        verified: true,
        active: true,
        createdBy: '5',
        receiverId: '4',
        organizationId: '5',
        organizationName: 'Help India Foundation',
        location: { lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan' },
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        proofImages: ['https://via.placeholder.com/400x300?text=Healthcare+Camp'],
        verifiedProof: true,
        donorCount: 12,
        status: 'active',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(seedCampaigns));

    // Seed requests
    const seedRequests = [
      {
        id: 'req1',
        userId: '4',
        category: 'medical',
        title: 'Need Doctor Consultation - Fever',
        description: 'High fever for 3 days, need immediate medical consultation.',
        type: 'service',
        location: { lat: 28.6692, lng: 77.4538, address: 'Ghaziabad, UP' },
        status: 'pending',
        urgency: 'high',
        proofDocs: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'req2',
        userId: '4',
        campaignId: 'camp1',
        category: 'medical',
        title: 'Medical Emergency: Heart Surgery',
        description: 'Urgent heart surgery required',
        type: 'financial',
        amount: 500000,
        location: { lat: 28.6692, lng: 77.4538, address: 'Ghaziabad, UP' },
        status: 'approved',
        sanctionedAmount: 325000,
        proofDocs: ['medical_bills.pdf', 'doctor_prescription.jpg'],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(seedRequests));

    // Seed transactions (with realistic amounts matching campaign totals)
    const seedTransactions = [
      // Medical Campaign (₹3,25,000 total)
      {
        id: 'txn1',
        donorId: '2',
        receiverId: '4',
        campaignId: 'camp1',
        amount: 50000,
        paymentId: 'pay_mock_001',
        isAnonymous: false,
        qrCode: null,
        trackUrl: null,
        status: 'completed',
        impactStory: 'Your ₹50,000 helped provide initial medical consultation and diagnostic tests for the child.',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn2',
        donorId: 'anonymous',
        receiverId: '4',
        campaignId: 'camp1',
        amount: 100000,
        paymentId: 'pay_mock_002',
        isAnonymous: true,
        qrCode: 'QR-ANO-7F8E9D',
        trackUrl: '/impact/QR-ANO-7F8E9D',
        status: 'completed',
        impactStory: 'Your ₹1,00,000 funded critical pre-surgery medications and specialized lab tests.',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn3',
        donorId: '2',
        receiverId: '4',
        campaignId: 'camp1',
        amount: 75000,
        paymentId: 'pay_mock_003',
        isAnonymous: false,
        qrCode: null,
        trackUrl: null,
        status: 'completed',
        impactStory: 'Your ₹75,000 contributed to the surgical equipment and OT booking.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn4',
        donorId: 'anonymous',
        receiverId: '4',
        campaignId: 'camp1',
        amount: 100000,
        paymentId: 'pay_mock_004',
        isAnonymous: true,
        qrCode: 'QR-ANO-8G9F0E',
        trackUrl: '/impact/QR-ANO-8G9F0E',
        status: 'completed',
        impactStory: 'Your ₹1,00,000 helped secure the cardiology specialist and ICU bed.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Education Campaign (₹50,000 total - COMPLETED)
      {
        id: 'txn5',
        donorId: '2',
        receiverId: '4',
        campaignId: 'camp2',
        amount: 25000,
        paymentId: 'pay_mock_005',
        isAnonymous: false,
        qrCode: null,
        trackUrl: null,
        status: 'completed',
        impactStory: 'Your ₹25,000 helped purchase 2 laptops for underprivileged students.',
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn6',
        donorId: 'anonymous',
        receiverId: '4',
        campaignId: 'camp2',
        amount: 25000,
        paymentId: 'pay_mock_006',
        isAnonymous: true,
        qrCode: 'QR-ANO-9H0G1F',
        trackUrl: '/impact/QR-ANO-9H0G1F',
        status: 'completed',
        impactStory: 'Your ₹25,000 funded laptops and internet connectivity for online education.',
        timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Food Relief Campaign (₹75,000 total)
      {
        id: 'txn7',
        donorId: '2',
        receiverId: '4',
        campaignId: 'camp3',
        amount: 30000,
        paymentId: 'pay_mock_007',
        isAnonymous: false,
        qrCode: null,
        trackUrl: null,
        status: 'completed',
        impactStory: 'Your ₹30,000 provided 500 food packets for flood-affected families.',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn8',
        donorId: 'anonymous',
        receiverId: '4',
        campaignId: 'camp3',
        amount: 45000,
        paymentId: 'pay_mock_008',
        isAnonymous: true,
        qrCode: 'QR-ANO-0I1H2G',
        trackUrl: '/impact/QR-ANO-0I1H2G',
        status: 'completed',
        impactStory: 'Your ₹45,000 supplied clean water and dry rations for 300 families.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Shelter Campaign (₹1,25,000 total)
      {
        id: 'txn9',
        donorId: '2',
        receiverId: '4',
        campaignId: 'camp4',
        amount: 60000,
        paymentId: 'pay_mock_009',
        isAnonymous: false,
        qrCode: null,
        trackUrl: null,
        status: 'completed',
        impactStory: 'Your ₹60,000 funded construction materials for 10 temporary shelters.',
        timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn10',
        donorId: 'anonymous',
        receiverId: '4',
        campaignId: 'camp4',
        amount: 65000,
        paymentId: 'pay_mock_010',
        isAnonymous: true,
        qrCode: 'QR-ANO-1J2I3H',
        trackUrl: '/impact/QR-ANO-1J2I3H',
        status: 'completed',
        impactStory: 'Your ₹65,000 provided blankets, mattresses, and heating for shelters.',
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Healthcare Campaign (₹60,000 total)
      {
        id: 'txn11',
        donorId: '2',
        receiverId: '4',
        campaignId: 'camp5',
        amount: 35000,
        paymentId: 'pay_mock_011',
        isAnonymous: false,
        qrCode: null,
        trackUrl: null,
        status: 'completed',
        impactStory: 'Your ₹35,000 funded medicines and diagnostic equipment for the health camp.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'txn12',
        donorId: 'anonymous',
        receiverId: '4',
        campaignId: 'camp5',
        amount: 25000,
        paymentId: 'pay_mock_012',
        isAnonymous: true,
        qrCode: 'QR-ANO-2K3J4I',
        trackUrl: '/impact/QR-ANO-2K3J4I',
        status: 'completed',
        impactStory: 'Your ₹25,000 covered doctor fees and medical consumables for 200+ patients.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(seedTransactions));

    // Seed trust edges
    const seedTrustEdges = [
      { from: '2', to: '4', type: 'donation', strength: 5, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { from: '3', to: '4', type: 'service', strength: 8, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { from: '2', to: '5', type: 'donation', strength: 3, timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    localStorage.setItem(STORAGE_KEYS.TRUST_EDGES, JSON.stringify(seedTrustEdges));

    // Initialize other collections
    localStorage.setItem(STORAGE_KEYS.HELPERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROOFS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.KYC, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.IMPACT_STORIES, JSON.stringify([]));
  }
};

// ========================================
// 🧮 UTILITY FUNCTIONS
// ========================================

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate unique QR code
const generateQRCode = () => {
  return 'QR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

// Generate impact story using AI-like logic
const generateImpactStory = (amount, category, receiverName) => {
  const stories = {
    medical: [
      `Your ₹${amount} helped ${receiverName} get critical medical treatment.`,
      `Thanks to your ₹${amount}, ${receiverName} received life-saving medication.`,
      `Your generous ₹${amount} covered medical tests for ${receiverName}.`
    ],
    education: [
      `Your ₹${amount} provided educational materials for ${receiverName}.`,
      `Thanks to your ₹${amount}, ${receiverName} can continue their studies.`,
      `Your ₹${amount} funded online learning resources for ${receiverName}.`
    ],
    emergency: [
      `Your ₹${amount} provided immediate relief to ${receiverName}.`,
      `Thanks to your ₹${amount}, ${receiverName} received emergency assistance.`,
      `Your quick ₹${amount} donation helped ${receiverName} in crisis.`
    ]
  };
  const categoryStories = stories[category] || stories.emergency;
  return categoryStories[Math.floor(Math.random() * categoryStories.length)];
};

// Calculate trust score based on activity
const calculateTrustScore = (userId) => {
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const trustEdges = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRUST_EDGES) || '[]');
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const user = users.find(u => u.id === userId);
  
  if (!user) return 50;
  
  let score = user.trustScore || 50;
  const userTransactions = transactions.filter(t => t.donorId === userId || t.receiverId === userId);
  const userEdges = trustEdges.filter(e => e.from === userId || e.to === userId);
  
  // Increase score based on activity
  score += userTransactions.length * 2;
  score += userEdges.reduce((sum, edge) => sum + edge.strength, 0);
  
  return Math.min(100, Math.max(0, score));
};

// Badge assignment logic
const assignBadge = (userId) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const user = users.find(u => u.id === userId);
  
  if (!user) return null;
  
  const totalDonated = user.totalDonated || 0;
  const trustScore = user.trustScore || 0;
  
  if (totalDonated >= 50000 && trustScore >= 90) return 'Platinum';
  if (totalDonated >= 20000 && trustScore >= 75) return 'Gold';
  if (totalDonated >= 5000 && trustScore >= 60) return 'Silver';
  return 'Bronze';
};

// ========================================
// 🤖 AI SIMULATION FUNCTIONS
// ========================================

// AI Matching Engine - Suggest relevant campaigns to donors
const aiMatchCampaigns = (userId) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const user = users.find(u => u.id === userId);
  
  if (!user) return [];
  
  // Get user's donation history
  const userDonations = transactions.filter(t => t.donorId === userId);
  const preferredCategories = [...new Set(userDonations.map(d => {
    const campaign = campaigns.find(c => c.id === d.campaignId);
    return campaign?.category;
  }).filter(Boolean))];
  
  // Score campaigns
  const scoredCampaigns = campaigns.filter(c => c.active).map(campaign => {
    let score = 0;
    
    // Category match
    if (preferredCategories.includes(campaign.category)) score += 50;
    
    // Location proximity
    if (user.location && campaign.location) {
      const distance = calculateDistance(
        user.location.lat, user.location.lng,
        campaign.location.lat, campaign.location.lng
      );
      if (distance < 10) score += 30;
      else if (distance < 50) score += 15;
    }
    
    // Urgency (closer to deadline)
    const daysLeft = (new Date(campaign.deadline) - new Date()) / (24 * 60 * 60 * 1000);
    if (daysLeft < 7) score += 20;
    
    // Progress (near completion)
    const progress = (campaign.raised / campaign.goal) * 100;
    if (progress > 80 && progress < 100) score += 25;
    
    return { ...campaign, matchScore: score };
  });
  
  return scoredCampaigns.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
};

// AI Helper Matching - Find nearby helpers for requests
const aiMatchHelpers = (requestId) => {
  const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const request = requests.find(r => r.id === requestId);
  
  if (!request || !request.location) return [];
  
  const helpers = users.filter(u => u.role === 'helper' && u.availability && u.location);
  
  return helpers.map(helper => {
    const distance = calculateDistance(
      request.location.lat, request.location.lng,
      helper.location.lat, helper.location.lng
    );
    
    let score = 0;
    if (distance < 5) score += 50;
    else if (distance < 10) score += 30;
    else if (distance < 20) score += 15;
    
    score += helper.trustScore * 0.3;
    score += (helper.servicesProvided || 0) * 2;
    
    return { ...helper, distance, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
};

// Sentiment Analysis (Simulated)
const analyzeSentiment = (text) => {
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'helpful', 'thank', 'blessed', 'grateful'];
  const negativeWords = ['bad', 'poor', 'terrible', 'slow', 'delayed', 'fraud', 'fake'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return { sentiment: 'positive', score: 0.8 };
  if (negativeCount > positiveCount) return { sentiment: 'negative', score: 0.2 };
  return { sentiment: 'neutral', score: 0.5 };
};

// ========================================
// 📡 API ENDPOINT SIMULATION
// ========================================

const api = {
  // Authentication
  login: async (credentials) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => 
      (u.email === credentials.email || u.username === credentials.username) &&
      u.password === credentials.password &&
      u.role === credentials.role
    );
    
    if (user) {
      const token = 'mock_token_' + user.id;
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        token,
        user: userWithoutPassword,
        message: 'Login successful',
        redirect: `/${user.role}`
      };
    }
    
    return { success: false, message: 'Invalid credentials' };
  },
  
  register: async (userData) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      verified: false,
      kycStatus: 'pending',
      trustScore: 50,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return { success: true, message: 'Registration successful' };
  },
  
  // Campaign Management
  getCampaigns: async (filters = {}) => {
    let campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
    
    if (filters.active !== undefined) {
      campaigns = campaigns.filter(c => c.active === filters.active);
    }
    if (filters.category) {
      campaigns = campaigns.filter(c => c.category === filters.category);
    }
    if (filters.verified !== undefined) {
      campaigns = campaigns.filter(c => c.verified === filters.verified);
    }
    
    return { success: true, data: campaigns };
  },
  
  createCampaign: async (campaignData) => {
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
    const newCampaign = {
      id: 'camp' + Date.now(),
      ...campaignData,
      raised: 0,
      verified: false,
      active: true,
      donorCount: 0,
      createdAt: new Date().toISOString()
    };
    
    campaigns.push(newCampaign);
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    
    return { success: true, data: newCampaign };
  },
  
  // Donation Processing
  createDonation: async (donationData) => {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const trustEdges = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRUST_EDGES) || '[]');
    
    const campaign = campaigns.find(c => c.id === donationData.campaignId);
    if (!campaign) return { success: false, message: 'Campaign not found' };
    
    const receiver = users.find(u => u.id === campaign.receiverId);
    
    // Generate QR for anonymous donations
    const qrCode = donationData.isAnonymous ? generateQRCode() : null;
    const trackUrl = qrCode ? `/impact/${qrCode}` : null;
    
    // Generate impact story
    const impactStory = generateImpactStory(
      donationData.amount,
      campaign.category,
      receiver?.name || 'the beneficiary'
    );
    
    const newTransaction = {
      id: 'txn' + Date.now(),
      donorId: donationData.isAnonymous ? 'anonymous' : donationData.donorId,
      receiverId: campaign.receiverId,
      campaignId: donationData.campaignId,
      amount: donationData.amount,
      paymentId: 'pay_mock_' + Date.now(),
      isAnonymous: donationData.isAnonymous,
      qrCode,
      trackUrl,
      status: 'completed',
      impactStory,
      createdAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Update campaign raised amount
    campaign.raised += donationData.amount;
    campaign.donorCount += 1;
    const campaignIndex = campaigns.findIndex(c => c.id === campaign.id);
    campaigns[campaignIndex] = campaign;
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    
    // Update donor stats if not anonymous
    if (!donationData.isAnonymous) {
      const donor = users.find(u => u.id === donationData.donorId);
      if (donor) {
        donor.totalDonated = (donor.totalDonated || 0) + donationData.amount;
        donor.impactedLives = (donor.impactedLives || 0) + 1;
        donor.trustScore = calculateTrustScore(donor.id);
        donor.badge = assignBadge(donor.id);
        
        const userIndex = users.findIndex(u => u.id === donor.id);
        users[userIndex] = donor;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      
      // Add trust edge
      trustEdges.push({
        from: donationData.donorId,
        to: campaign.receiverId,
        type: 'donation',
        strength: Math.min(10, donationData.amount / 1000),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.TRUST_EDGES, JSON.stringify(trustEdges));
    }
    
    return { success: true, data: newTransaction, message: 'Donation successful!' };
  },
  
  // Request Management
  getRequests: async (filters = {}) => {
    let requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    
    if (filters.status) {
      requests = requests.filter(r => r.status === filters.status);
    }
    if (filters.category) {
      requests = requests.filter(r => r.category === filters.category);
    }
    if (filters.type) {
      requests = requests.filter(r => r.type === filters.type);
    }
    
    return { success: true, data: requests };
  },
  
  createRequest: async (requestData) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    
    const newRequest = {
      id: 'req' + Date.now(),
      ...requestData,
      status: 'pending',
      proofDocs: [],
      createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    
    // Trigger AI matching for nearby helpers
    if (requestData.type === 'service') {
      const matches = aiMatchHelpers(newRequest.id);
      // In real app, send notifications to matched helpers
    }
    
    return { success: true, data: newRequest };
  },
  
  sanctionRequest: async (sanctionData) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const request = requests.find(r => r.id === sanctionData.requestId);
    
    if (!request) return { success: false, message: 'Request not found' };
    
    request.status = 'sanctioned';
    request.sanctionedAmount = sanctionData.amount;
    request.sanctionedBy = sanctionData.adminId;
    request.sanctionedAt = new Date().toISOString();
    
    const requestIndex = requests.findIndex(r => r.id === request.id);
    requests[requestIndex] = request;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    
    return { success: true, data: request };
  },
  
  // Helper/Receiver specific endpoints
  getNearbyRequests: async ({ location, radiusKm = 25, category = 'all' }) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    
    // Filter pending/approved requests
    let filtered = requests.filter(r => 
      (r.status === 'pending' || r.status === 'approved') &&
      r.type !== 'financial-only'
    );
    
    // Filter by category if specified
    if (category && category !== 'all') {
      filtered = filtered.filter(r => r.category === category);
    }
    
    // Calculate distance and filter by radius
    const nearby = filtered.map(req => {
      if (!req.location) return { ...req, distance: null };
      const distance = calculateDistance(
        location.lat, location.lng,
        req.location.lat, req.location.lng
      );
      return { ...req, distance };
    }).filter(r => r.distance === null || r.distance <= radiusKm)
      .sort((a, b) => {
        // Sort by urgency first, then distance
        const urgencyOrder = { high: 1, medium: 2, low: 3 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return (a.distance || 0) - (b.distance || 0);
      });
    
    return { success: true, data: nearby };
  },
  
  acceptRequest: async ({ requestId, helperId }) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const request = requests.find(r => r.id === requestId);
    const helper = users.find(u => u.id === helperId);
    
    if (!request) return { success: false, message: 'Request not found' };
    if (!helper) return { success: false, message: 'Helper not found' };
    
    // Create service record
    const services = JSON.parse(localStorage.getItem('social_impact_services') || '[]');
    const newService = {
      id: 'srv' + Date.now(),
      requestId,
      helperId,
      request,
      helper: { id: helper.id, name: helper.name, specialty: helper.profession },
      receiver: users.find(u => u.id === request.userId),
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    };
    
    services.push(newService);
    localStorage.setItem('social_impact_services', JSON.stringify(services));
    
    // Update request status
    request.status = 'in-progress';
    request.assignedHelper = helperId;
    const requestIndex = requests.findIndex(r => r.id === requestId);
    requests[requestIndex] = request;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    
    return { success: true, data: newService };
  },
  
  getHelperServices: async (helperId) => {
    const services = JSON.parse(localStorage.getItem('social_impact_services') || '[]');
    const helperServices = services.filter(s => s.helperId === helperId);
    return { success: true, data: helperServices };
  },
  
  completeService: async ({ serviceId, proof, completedBy }) => {
    const services = JSON.parse(localStorage.getItem('social_impact_services') || '[]');
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return { success: false, message: 'Service not found' };
    
    service.status = 'completed';
    service.proof = proof;
    service.completedAt = new Date().toISOString();
    service.hoursSpent = Math.floor(Math.random() * 5) + 1; // Simulate hours (1-5)
    
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    services[serviceIndex] = service;
    localStorage.setItem('social_impact_services', JSON.stringify(services));
    
    // Update request status
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const request = requests.find(r => r.id === service.requestId);
    if (request) {
      request.status = 'completed';
      const requestIndex = requests.findIndex(r => r.id === request.id);
      requests[requestIndex] = request;
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }
    
    // Update helper stats
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const helper = users.find(u => u.id === completedBy);
    if (helper) {
      helper.servicesProvided = (helper.servicesProvided || 0) + 1;
      helper.trustScore = Math.min(100, (helper.trustScore || 75) + 2);
      const userIndex = users.findIndex(u => u.id === helper.id);
      users[userIndex] = helper;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    return { success: true, data: service };
  },
  
  getRequestsByUser: async (userId) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const userRequests = requests.filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data: userRequests };
  },
  
  uploadRequestProof: async ({ requestId, proof }) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const request = requests.find(r => r.id === requestId);
    
    if (!request) return { success: false, message: 'Request not found' };
    
    request.proof = proof;
    request.proofUploadedAt = new Date().toISOString();
    
    const requestIndex = requests.findIndex(r => r.id === requestId);
    requests[requestIndex] = request;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    
    return { success: true, data: request };
  },
  
  // Geo-Matching
  geoMatch: async (matchData) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const { location, radiusKm = 10 } = matchData;
    
    const helpers = users.filter(u => u.role === 'helper' && u.availability && u.location).map(helper => {
      const distance = calculateDistance(
        location.lat, location.lng,
        helper.location.lat, helper.location.lng
      );
      return { ...helper, distance };
    }).filter(h => h.distance <= radiusKm);
    
    const donors = users.filter(u => u.role === 'donor' && u.location).map(donor => {
      const distance = calculateDistance(
        location.lat, location.lng,
        donor.location.lat, donor.location.lng
      );
      return { ...donor, distance };
    }).filter(d => d.distance <= radiusKm);
    
    return { success: true, data: { helpers, donors } };
  },
  
  // AI Features
  getRecommendedCampaigns: async (userId) => {
    const matches = aiMatchCampaigns(userId);
    return { success: true, data: matches };
  },
  
  getMatchedHelpers: async (requestId) => {
    const matches = aiMatchHelpers(requestId);
    return { success: true, data: matches };
  },
  
  analyzeFeedback: async (text) => {
    const result = analyzeSentiment(text);
    return { success: true, data: result };
  },
  
  // Trust Graph
  getTrustGraph: async (userId) => {
    const trustEdges = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRUST_EDGES) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const relevantEdges = trustEdges.filter(e => e.from === userId || e.to === userId);
    const nodes = new Set([userId]);
    relevantEdges.forEach(edge => {
      nodes.add(edge.from);
      nodes.add(edge.to);
    });
    
    const graphData = {
      nodes: Array.from(nodes).map(id => {
        const user = users.find(u => u.id === id);
        return {
          id,
          name: user?.name || 'Unknown',
          role: user?.role,
          trustScore: user?.trustScore
        };
      }),
      edges: relevantEdges
    };
    
    return { success: true, data: graphData };
  },
  
  // Analytics
  getAnalytics: async () => {
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const totalRaised = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDonors = users.filter(u => u.role === 'donor').length;
    const totalReceivers = users.filter(u => u.role === 'receiver').length;
    const totalHelpers = users.filter(u => u.role === 'helper').length;
    const activeCampaigns = campaigns.filter(c => c.active).length;
    
    // Category-wise distribution (convert to array format for charts)
    const categoryObj = campaigns.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.raised;
      return acc;
    }, {});
    
    const categoryData = Object.entries(categoryObj).map(([name, value]) => ({ name, value }));
    
    // Monthly trends data
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthStart = new Date();
      monthStart.setMonth(currentMonth - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate >= monthStart && tDate < monthEnd;
      });
      
      const monthRequests = requests.filter(r => {
        const rDate = new Date(r.createdAt);
        return rDate >= monthStart && rDate < monthEnd;
      });
      
      monthlyData.push({
        month: monthNames[monthIndex],
        donations: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
        requests: monthRequests.length
      });
    }
    
    // Location-wise heatmap data
    const locationData = campaigns.map(c => ({
      lat: c.location?.lat,
      lng: c.location?.lng,
      value: c.raised,
      title: c.title
    })).filter(l => l.lat && l.lng);
    
    return {
      success: true,
      data: {
        totalRaised,
        totalDonors,
        totalReceivers,
        totalHelpers,
        activeCampaigns,
        categoryData,
        monthlyData,
        locationData,
        recentTransactions: transactions.slice(-10).reverse()
      }
    };
  },
  
  // KYC Management
  uploadKYC: async (kycData) => {
    const kyc = JSON.parse(localStorage.getItem(STORAGE_KEYS.KYC) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const newKYC = {
      id: 'kyc' + Date.now(),
      userId: kycData.userId,
      documentType: kycData.documentType,
      documentNumber: kycData.documentNumber,
      documentImages: kycData.documentImages,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    kyc.push(newKYC);
    localStorage.setItem(STORAGE_KEYS.KYC, JSON.stringify(kyc));
    
    const user = users.find(u => u.id === kycData.userId);
    if (user) {
      user.kycStatus = 'pending';
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    return { success: true, data: newKYC };
  },
  
  verifyKYC: async (kycId, adminId, approved) => {
    const kyc = JSON.parse(localStorage.getItem(STORAGE_KEYS.KYC) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const kycDoc = kyc.find(k => k.id === kycId);
    if (!kycDoc) return { success: false, message: 'KYC document not found' };
    
    kycDoc.status = approved ? 'approved' : 'rejected';
    kycDoc.verifiedBy = adminId;
    kycDoc.verifiedAt = new Date().toISOString();
    
    const kycIndex = kyc.findIndex(k => k.id === kycId);
    kyc[kycIndex] = kycDoc;
    localStorage.setItem(STORAGE_KEYS.KYC, JSON.stringify(kyc));
    
    const user = users.find(u => u.id === kycDoc.userId);
    if (user) {
      user.kycStatus = approved ? 'approved' : 'rejected';
      user.verified = approved;
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    return { success: true, data: kycDoc };
  },
  
  // Impact Tracking
  getImpactByQR: async (qrCode) => {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    const transaction = transactions.find(t => t.qrCode === qrCode);
    if (!transaction) return { success: false, message: 'Invalid QR code' };
    
    const campaign = campaigns.find(c => c.id === transaction.campaignId);
    const receiver = users.find(u => u.id === transaction.receiverId);
    
    return {
      success: true,
      data: {
        transaction,
        campaign,
        receiver: receiver ? { name: receiver.name, location: receiver.location } : null,
        impactStory: transaction.impactStory
      }
    };
  }
};

// ========================================
// 🌐 FETCH INTERCEPTOR
// ========================================

const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  // Initialize data on first API call
  initializeData();
  
  if (!url.startsWith('/api/')) {
    return originalFetch(url, options);
  }
  
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};
  
  console.log(`[Social Impact API] ${method} ${url}`, body);
  
  let response;
  
  try {
    // Route to appropriate API handler
    if (url === '/api/auth/login' && method === 'POST') {
      response = await api.login(body);
    } else if (url === '/api/auth/register' && method === 'POST') {
      response = await api.register(body);
    } else if (url.startsWith('/api/campaigns')) {
      if (method === 'GET') response = await api.getCampaigns(body);
      if (method === 'POST') response = await api.createCampaign(body);
    } else if (url === '/api/donate' && method === 'POST') {
      response = await api.createDonation(body);
    } else if (url === '/api/requests/nearby' && method === 'POST') {
      // Helper: Find nearby requests
      response = await api.getNearbyRequests(body);
    } else if (url === '/api/requests/accept' && method === 'POST') {
      // Helper: Accept a request
      response = await api.acceptRequest(body);
    } else if (url === '/api/requests/upload-proof' && method === 'POST') {
      // Receiver: Upload proof for request
      response = await api.uploadRequestProof(body);
    } else if (url.match(/\/api\/requests\/user\/(\d+)/) && method === 'GET') {
      // Receiver: Get their own requests
      const userId = url.match(/\/api\/requests\/user\/(\d+)/)[1];
      response = await api.getRequestsByUser(userId);
    } else if (url.match(/\/api\/services\/helper\/(\d+)/) && method === 'GET') {
      // Helper: Get their services
      const helperId = url.match(/\/api\/services\/helper\/(\d+)/)[1];
      response = await api.getHelperServices(helperId);
    } else if (url === '/api/service/complete' && method === 'POST') {
      // Helper: Mark service as complete
      response = await api.completeService(body);
    } else if (url.startsWith('/api/requests')) {
      if (method === 'GET') response = await api.getRequests(body);
      if (method === 'POST') response = await api.createRequest(body);
    } else if (url === '/api/sanction' && method === 'POST') {
      response = await api.sanctionRequest(body);
    } else if (url === '/api/geo/match' && method === 'POST') {
      response = await api.geoMatch(body);
    } else if (url === '/api/ai/recommend' && method === 'POST') {
      response = await api.getRecommendedCampaigns(body.userId);
    } else if (url === '/api/ai/match-helpers' && method === 'POST') {
      response = await api.getMatchedHelpers(body.requestId);
    } else if (url === '/api/ai/sentiment' && method === 'POST') {
      response = await api.analyzeFeedback(body.text);
    } else if (url.startsWith('/api/trust-graph')) {
      const userId = url.split('/').pop();
      response = await api.getTrustGraph(userId);
    } else if (url === '/api/analytics' && method === 'GET') {
      response = await api.getAnalytics();
    } else if (url === '/api/kyc' && method === 'POST') {
      response = await api.uploadKYC(body);
    } else if (url.startsWith('/api/kyc/verify') && method === 'POST') {
      response = await api.verifyKYC(body.kycId, body.adminId, body.approved);
    } else if (url.startsWith('/api/impact/')) {
      const qrCode = url.split('/').pop();
      response = await api.getImpactByQR(qrCode);
    } else {
      response = { success: false, message: 'Endpoint not found' };
    }
  } catch (error) {
    response = { success: false, message: error.message };
  }
  
  console.log(`[Social Impact API] Response:`, response);
  
  return {
    ok: response.success,
    status: response.success ? 200 : 400,
    json: async () => response,
    text: async () => JSON.stringify(response)
  };
};

// Export reset function for debugging
window.__socialImpactApi = {
  reset: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    initializeData();
    console.log('Social Impact API data reset');
  },
  getData: (key) => JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]'),
  setData: (key, data) => localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
};

console.log('🌍 Social Impact Donation API Loaded - localStorage Mode');
console.log('Use window.__socialImpactApi.reset() to reset all data');

export default api;
