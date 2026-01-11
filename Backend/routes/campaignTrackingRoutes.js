// routes/campaignTrackingRoutes.js
const express = require('express');
const router = express.Router();
const campaignTrackingController = require('../controllers/campaignTrackingController');

console.log('📊 Loading Campaign Tracking Routes...');

// Main tracking endpoint - All dates view
router.get('/campaign/:campaignId/tracking', campaignTrackingController.getCampaignTracking);

// Today's tracking endpoint - Only today's date (Auto-updates daily)
router.get('/campaign/:campaignId/today', campaignTrackingController.getTodayTracking);

// Real-time status updates (for polling)
router.get('/campaign/:campaignId/status-updates', campaignTrackingController.getStatusUpdates);

// Schedule overview (for dashboard)
router.get('/campaign/:campaignId/schedule-overview', campaignTrackingController.getScheduleOverview);

console.log('✅ Campaign Tracking Routes Loaded');

module.exports = router;