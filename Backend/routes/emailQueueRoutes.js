// routes/emailQueueRoutes.js
const express = require('express');
const router = express.Router();
const emailQueueController = require('../controllers/emailQueueController');

router.post('/', emailQueueController.createEmail);
router.post('/bulk', emailQueueController.bulkCreateEmails);
router.get('/:id', emailQueueController.getEmailById);
router.get('/schedule/:scheduleId', emailQueueController.getEmailsBySchedule);
router.get('/campaign/:campaignId', emailQueueController.getEmailsByCampaign);
router.get('/pending/ready', emailQueueController.getPendingEmails);
router.get('/failed/retryable', emailQueueController.getRetryableEmails);
router.get('/schedule/:scheduleId/stats', emailQueueController.getStatsBySchedule);
router.get('/campaign/:campaignId/stats', emailQueueController.getStatsByCampaign);
router.patch('/:id/status', emailQueueController.updateEmailStatus);
router.patch('/:id/sent', emailQueueController.markEmailSent);
router.patch('/:id/failed', emailQueueController.markEmailFailed);
router.patch('/:id/retry', emailQueueController.incrementRetry);
router.delete('/:id', emailQueueController.deleteEmail);
router.delete('/schedule/:scheduleId', emailQueueController.deleteEmailsBySchedule);

module.exports = router;