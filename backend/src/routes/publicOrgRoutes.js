const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');

const router = express.Router();

// GET /api/public-org - Get all verified organizations
router.get('/', async (req, res) => {
  try {
    // Return users with role 'organization' or 'receiver' who are verified
    const organizations = await User.find({ 
      role: { $in: ['organization', 'receiver'] },
      isVerified: true 
    }).select('name email role isVerified createdAt');
    
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register-request', async (req, res) => {
  try {
    const payload = req.body;
    // create a request representing the organization registration request
    await Request.create({ title: 'Organization Registration', description: JSON.stringify(payload), type: 'service' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
