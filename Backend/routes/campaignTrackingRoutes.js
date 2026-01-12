// routes/campaignTrackingRoutes.js
const express = require('express');
const router = express.Router();
const campaignTrackingController = require('../controllers/campaignTrackingController');

console.log('📊 Loading Campaign Tracking Routes...');

router.get('/campaign/:campaignId/tracking', campaignTrackingController.getCampaignTracking);
router.get('/campaign/:campaignId/today', campaignTrackingController.getTodayTracking);
router.get('/campaign/:campaignId/status-updates', campaignTrackingController.getStatusUpdates);
router.get('/campaign/:campaignId/schedule-overview', campaignTrackingController.getScheduleOverview);
console.log('✅ Campaign Tracking Routes Loaded');

module.exports = router;