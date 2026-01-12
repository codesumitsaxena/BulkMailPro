const express = require('express');
const router = express.Router();
const emailQueueController = require('../controllers/emailQueueController');

// ============= POST ROUTES =============
router.post('/', emailQueueController.createEmail);
router.post('/bulk', emailQueueController.bulkCreateEmails);

// ============= GET ROUTES - SPECIFIC FIRST =============
// CRITICAL: Most specific routes MUST come before generic ones

// Pending/Retry routes (most specific)
router.get('/pending/ready', emailQueueController.getPendingReadyEmails);  // ✅ For n8n
router.get('/pending', emailQueueController.getPendingEmails);
router.get('/retryable', emailQueueController.getRetryableEmails);

// Stats routes (specific paths)
router.get('/stats/schedule/:scheduleId', emailQueueController.getStatsBySchedule);
router.get('/stats/campaign/:campaignId', emailQueueController.getStatsByCampaign);

// Filter routes (with params)
router.get('/schedule/:scheduleId', emailQueueController.getEmailsBySchedule);
router.get('/campaign/:campaignId', emailQueueController.getEmailsByCampaign);

// Generic ID route - MUST BE LAST for GET routes
router.get('/:id', emailQueueController.getEmailById);

// ============= PATCH ROUTES =============
router.patch('/:id/sent', emailQueueController.markEmailSent);
router.patch('/:id/failed', emailQueueController.markEmailFailed);
router.patch('/:id/retry', emailQueueController.incrementRetry);

// ============= DELETE ROUTES =============
router.delete('/schedule/:scheduleId', emailQueueController.deleteEmailsBySchedule);
router.delete('/:id', emailQueueController.deleteEmail);

module.exports = router;