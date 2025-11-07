const express = require('express');
const { getCampaigns, getCampaignById, createCampaign, approveCampaign, rejectCampaign } = require('../controllers/campaignController');

const router = express.Router();

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.patch('/:id/approve', approveCampaign);
router.patch('/:id/reject', rejectCampaign);

module.exports = router;
 
