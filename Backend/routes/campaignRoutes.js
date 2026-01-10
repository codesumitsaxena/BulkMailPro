const express = require('express');
const router = express.Router();
const CampaignController = require('../controllers/campaignController');

// Create campaign
router.post('/', CampaignController.createCampaign);

// Get all campaigns (with optional status filter)
router.get('/', CampaignController.getAllCampaigns);

// Get campaigns by date range
router.get('/date-range', CampaignController.getCampaignsByDateRange);

// Get campaign by ID
router.get('/:id', CampaignController.getCampaignById);

// Update campaign
router.put('/:id', CampaignController.updateCampaign);

// Update campaign status
router.patch('/:id/status', CampaignController.updateCampaignStatus);

// Delete campaign
router.delete('/:id', CampaignController.deleteCampaign);

module.exports = router;


