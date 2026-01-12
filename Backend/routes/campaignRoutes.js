const express = require('express');
const router = express.Router();
const CampaignController = require('../controllers/campaignController');

router.post('/', CampaignController.createCampaign);
router.get('/', CampaignController.getAllCampaigns);
router.get('/date-range', CampaignController.getCampaignsByDateRange);
router.get('/:id', CampaignController.getCampaignById);
router.put('/:id', CampaignController.updateCampaign);
router.patch('/:id/status', CampaignController.updateCampaignStatus);
router.delete('/:id', CampaignController.deleteCampaign);

module.exports = router;


