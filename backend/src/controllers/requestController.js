const Request = require('../models/Request');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendCredentialsEmail } = require('../services/emailService');

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// helper: find nearby requests given a location and radius
function haversineKm(a, b) {
  const toRad = v => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon), Math.sqrt(1 - (sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon)));
  return R * c;
}

const getNearbyRequests = async (req, res) => {
  try {
    const { location, radiusKm = 10, category } = req.body || {};
    const all = await Request.find({ status: { $in: ['pending', 'approved'] } });
    const nearby = (all || []).filter(r => r.location && haversineKm(location, r.location) <= radiusKm && (!category || category === 'all' || r.category === category));
    res.json({ success: true, data: nearby });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const payload = req.body;
    const request = await Request.create(payload);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getRequestsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requests = await Request.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { requestId, helperId } = req.body;
    const request = await Request.findByIdAndUpdate(requestId, { acceptedBy: helperId, acceptedAt: new Date(), status: 'accepted' }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadRequestProof = async (req, res) => {
  try {
    const { requestId, proofUrl } = req.body;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.proofDocs = request.proofDocs || [];
    request.proofDocs.push(proofUrl);
    await request.save();
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeService = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findByIdAndUpdate(requestId, { completed: true, status: 'completed' }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sanctionRequest = async (req, res) => {
  try {
    const { requestId, amount } = req.body;
    const request = await Request.findByIdAndUpdate(requestId, { sanctionedAmount: amount, status: 'sanctioned' }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { requestId, adminId } = req.body;
    
    // Find the request first
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    console.log('📋 Request found:', {
      id: request._id,
      title: request.title,
      description: request.description,
      userId: request.userId,
      user: request.user,
      createdBy: request.createdBy,
      allFields: Object.keys(request.toObject())
    });
    
    // Find the user who created this request
    let beneficiary = null;
    const userIdField = request.userId || request.user || request.createdBy;
    
    if (userIdField) {
      // Try to find by userId if it exists
      console.log('🔍 Looking for user with ID:', userIdField);
      beneficiary = await User.findById(userIdField);
    }
    
    // If no userId or user not found, check if this is an organization registration request
    if (!beneficiary && request.title === 'Organization Registration') {
      console.log('🏢 Organization Registration request - searching for organization user...');
      console.log('📄 Request description:', request.description);
      
      // Try to parse the description as JSON to extract organization details
      let orgData = null;
      try {
        orgData = JSON.parse(request.description);
        console.log('✅ Parsed organization data:', orgData);
      } catch (e) {
        console.log('⚠️ Could not parse description as JSON');
      }
      
      // Try to extract email from description
      let organizationEmail = null;
      let organizationName = null;
      
      if (orgData) {
        organizationEmail = orgData.email;
        organizationName = orgData.organization_name || orgData.name;
      } else if (request.description) {
        const emailMatch = request.description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch) {
          organizationEmail = emailMatch[0];
          console.log('📧 Found email in description:', organizationEmail);
        }
      }
      
      // If we found an email, search by email
      if (organizationEmail) {
        beneficiary = await User.findOne({ 
          email: organizationEmail
        });
        
        if (beneficiary) {
          console.log('✅ Matched organization by email:', beneficiary.name, beneficiary.email);
        } else {
          // User doesn't exist - create them with a temporary password
          console.log('🆕 Creating new organization user:', organizationName, organizationEmail);
          
          // Generate a temporary password for user creation (will be replaced below)
          const tempPassword = await bcrypt.hash('TempPassword123!', 10);
          
          beneficiary = new User({
            name: organizationName || organizationEmail.split('@')[0],
            email: organizationEmail,
            role: 'receiver', // Organizations are receivers of help requests
            password: tempPassword
          });
          
          await beneficiary.save();
          console.log('✅ Organization user created:', beneficiary.name, beneficiary.email);
        }
      }
      
      // If still no match, find receiver users that exist
      if (!beneficiary) {
        const allReceivers = await User.find({ 
          role: 'receiver'
        }).sort({ createdAt: -1 }).limit(20);
        
        console.log('📝 Found receivers:', allReceivers.map(u => ({ 
          name: u.name, 
          email: u.email,
          createdAt: u.createdAt
        })));
        
        // Find the most recently created receiver
        if (allReceivers.length > 0) {
          beneficiary = allReceivers[0];
          console.log('✅ Using most recent receiver:', beneficiary.name, beneficiary.email);
        }
      }
    }
    
    if (!beneficiary) {
      console.error('❌ User not found with ID:', userIdField);
      return res.status(404).json({ 
        success: false, 
        message: 'Beneficiary user not found. Please ensure the user exists in the system.',
        debug: {
          requestId: request._id,
          userId: userIdField,
          requestTitle: request.title,
          availableFields: Object.keys(request.toObject())
        }
      });
    }
    
    console.log('✅ Beneficiary found:', beneficiary.name, beneficiary.email);
    
    // Generate a permanent password for the beneficiary
    let generatedPassword = '';
    const isOrganizationRequest = request.title === 'Organization Registration';
    
    if (isOrganizationRequest) {
      // For organization registration: OrgName + year format
      const orgNameClean = beneficiary.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      generatedPassword = `${orgNameClean}@2025`;
    } else {
      // For individual receivers: use last 6 chars of their ID + @ODCMS
      generatedPassword = `${beneficiary._id.toString().slice(-6).toUpperCase()}@ODCMS`;
    }
    
    console.log('🔑 Generated password:', generatedPassword);
    
    // Hash the password and update the user
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    await User.findByIdAndUpdate(beneficiary._id, { password: hashedPassword });
    console.log('💾 Password updated in database');
    
    // Update request status to approved
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId, 
      { 
        status: 'approved', 
        approvedBy: adminId, 
        approvedAt: new Date() 
      }, 
      { new: true }
    );
    
    // Prepare credentials for response and email
    const credentials = {
      email: beneficiary.email,
      password: generatedPassword,
      name: beneficiary.name,
      role: beneficiary.role
    };
    
    // Send credentials email to beneficiary
    console.log('📧 Sending credentials email to:', beneficiary.email);
    const emailResult = await sendCredentialsEmail(
      beneficiary.email,
      credentials,
      {
        title: request.title,
        category: request.category,
        amount: request.amount
      }
    );
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully to:', beneficiary.email);
    } else {
      console.error('⚠️ Email sending failed:', emailResult.error);
    }
    
    // Return success with the generated password (plain text for PDF)
    res.json({ 
      success: true, 
      data: updatedRequest,
      credentials: credentials,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('❌ Error in approveRequest:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { requestId, adminId, reason } = req.body;
    const request = await Request.findByIdAndUpdate(requestId, { status: 'rejected', rejectedBy: adminId, rejectedAt: new Date(), rejectionReason: reason }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRequests, createRequest, getRequestsByUser, acceptRequest, uploadRequestProof, completeService, sanctionRequest, getNearbyRequests, approveRequest, rejectRequest };
