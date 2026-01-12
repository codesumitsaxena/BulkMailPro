const express = require('express');
const router = express.Router();
const emailQueueController = require('../controllers/emailQueueController');

// ============= CREATE =============
router.post('/', emailQueueController.createEmail);
router.post('/bulk', emailQueueController.bulkCreateEmails);

// ============= GET =============
router.get('/pending', emailQueueController.getPendingEmails);
router.get('/pending/ready', emailQueueController.getPendingReadyEmails);  // ✅ For n8n
router.get('/retryable', emailQueueController.getRetryableEmails);
router.get('/schedule/:scheduleId', emailQueueController.getEmailsBySchedule);
router.get('/campaign/:campaignId', emailQueueController.getEmailsByCampaign);
router.get('/:id', emailQueueController.getEmailById);

// ============= STATUS UPDATES =============
router.patch('/:id/sent', emailQueueController.markEmailSent);
router.patch('/:id/failed', emailQueueController.markEmailFailed);
router.patch('/:id/retry', emailQueueController.incrementRetry);

// ============= STATS =============
router.get('/stats/schedule/:scheduleId', emailQueueController.getStatsBySchedule);
router.get('/stats/campaign/:campaignId', emailQueueController.getStatsByCampaign);

// ============= DELETE =============
router.delete('/:id', emailQueueController.deleteEmail);
router.delete('/schedule/:scheduleId', emailQueueController.deleteEmailsBySchedule);

module.exports = router;