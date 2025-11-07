const express = require('express');
const router = express.Router();
const ImpactStory = require('../models/ImpactStory');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

// @route   GET /api/impact-stories
// @desc    Get all published impact stories (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    
    const query = { status: 'published' };
    if (category && category !== 'all') {
      query.category = category;
    }

    const stories = await ImpactStory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('campaignId', 'title')
      .lean();

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Error fetching impact stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching impact stories',
      error: error.message
    });
  }
});

// @route   GET /api/impact-stories/admin
// @desc    Get all impact stories (admin only - including drafts)
// @access  Private (Admin)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only'
      });
    }
    
    const stories = await ImpactStory.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('campaignId', 'title')
      .lean();

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Error fetching all stories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stories',
      error: error.message
    });
  }
});

// @route   GET /api/impact-stories/:id
// @desc    Get single impact story
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const story = await ImpactStory.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('campaignId', 'title')
      .lean();

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching story',
      error: error.message
    });
  }
});

// @route   POST /api/impact-stories
// @desc    Create new impact story
// @access  Private (Admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only'
      });
    }
    
    const {
      title,
      date,
      category,
      summary,
      details,
      imageUrl,
      videoUrl,
      emotionalQuote,
      beneficiaryName,
      location,
      impactMetrics,
      status,
      campaignId
    } = req.body;

    // Validation
    if (!title || !category || !summary || !details) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, summary, details'
      });
    }

    const newStory = new ImpactStory({
      title,
      date: date || Date.now(),
      category,
      summary,
      details,
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      emotionalQuote: emotionalQuote || '',
      beneficiaryName: beneficiaryName || '',
      location: location || '',
      impactMetrics: impactMetrics || { peopleHelped: 0, fundsUsed: 0 },
      status: status || 'published',
      createdBy: req.user.id,
      campaignId: campaignId || null
    });

    await newStory.save();

    const populatedStory = await ImpactStory.findById(newStory._id)
      .populate('createdBy', 'name email')
      .populate('campaignId', 'title');

    res.status(201).json({
      success: true,
      message: 'Impact story created successfully',
      data: populatedStory
    });
  } catch (error) {
    console.error('Error creating impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating impact story',
      error: error.message
    });
  }
});

// @route   PUT /api/impact-stories/:id
// @desc    Update impact story
// @access  Private (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only'
      });
    }
    
    const {
      title,
      date,
      category,
      summary,
      details,
      imageUrl,
      videoUrl,
      emotionalQuote,
      beneficiaryName,
      location,
      impactMetrics,
      status
    } = req.body;

    const story = await ImpactStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    // Update fields
    if (title) story.title = title;
    if (date) story.date = date;
    if (category) story.category = category;
    if (summary) story.summary = summary;
    if (details) story.details = details;
    if (imageUrl !== undefined) story.imageUrl = imageUrl;
    if (videoUrl !== undefined) story.videoUrl = videoUrl;
    if (emotionalQuote !== undefined) story.emotionalQuote = emotionalQuote;
    if (beneficiaryName !== undefined) story.beneficiaryName = beneficiaryName;
    if (location !== undefined) story.location = location;
    if (impactMetrics) story.impactMetrics = impactMetrics;
    if (status) story.status = status;

    await story.save();

    const updatedStory = await ImpactStory.findById(story._id)
      .populate('createdBy', 'name email')
      .populate('campaignId', 'title');

    res.json({
      success: true,
      message: 'Impact story updated successfully',
      data: updatedStory
    });
  } catch (error) {
    console.error('Error updating impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating impact story',
      error: error.message
    });
  }
});

// @route   DELETE /api/impact-stories/:id
// @desc    Delete impact story
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only'
      });
    }
    
    const story = await ImpactStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Impact story not found'
      });
    }

    await ImpactStory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Impact story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting impact story:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting impact story',
      error: error.message
    });
  }
});

module.exports = router;
