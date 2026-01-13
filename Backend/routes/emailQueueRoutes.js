const express = require('express');
const router = express.Router();
const emailQueueController = require('../controllers/emailQueueController');

// ============= POST ROUTES =============
router.post('/', emailQueueController.createEmail);
router.post('/bulk', emailQueueController.bulkCreateEmails);

// ============= STATS ROUTES (FIRST) =============
router.get('/stats', emailQueueController.getGlobalStats);
router.get('/stats/schedule/:scheduleId', emailQueueController.getStatsBySchedule);
router.get('/stats/campaign/:campaignId', emailQueueController.getStatsByCampaign);

// ============= PENDING / RETRY =============
router.get('/pending/ready', emailQueueController.getPendingReadyEmails);
router.get('/pending', emailQueueController.getPendingEmails);
router.get('/retryable', emailQueueController.getRetryableEmails);

// ============= FILTER ROUTES =============
router.get('/schedule/:scheduleId', emailQueueController.getEmailsBySchedule);
router.get('/campaign/:campaignId', emailQueueController.getEmailsByCampaign);

// ============= PATCH ROUTES =============
router.patch('/:id/sent', emailQueueController.markEmailSent);
router.patch('/:id/failed', emailQueueController.markEmailFailed);
router.patch('/:id/retry', emailQueueController.incrementRetry);

// ============= DELETE ROUTES =============
router.delete('/schedule/:scheduleId', emailQueueController.deleteEmailsBySchedule);
router.delete('/:id', emailQueueController.deleteEmail);

// ============= GENERIC (LAST ALWAYS) =============
router.get('/:id', emailQueueController.getEmailById);

module.exports = router;
