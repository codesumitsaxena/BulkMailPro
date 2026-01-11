// routes/campaignScheduleRoutes.js
const express = require('express');
const router = express.Router();
const campaignScheduleController = require('../controllers/campaignScheduleController');

router.post('/', campaignScheduleController.createSchedule);
router.get('/:id', campaignScheduleController.getScheduleById);
router.get('/campaign/:campaignId', campaignScheduleController.getSchedulesByCampaign);
router.get('/status/:status', campaignScheduleController.getSchedulesByStatus);
router.get('/pending/today', campaignScheduleController.getPendingToday);
router.put('/:id', campaignScheduleController.updateSchedule);
router.patch('/:id/status', campaignScheduleController.updateScheduleStatus);
router.patch('/:id/increment-sent', campaignScheduleController.incrementEmailSent);
router.patch('/:id/increment-failed', campaignScheduleController.incrementEmailFailed);
router.patch('/:id/cancel', campaignScheduleController.cancelSchedule);
router.delete('/:id', campaignScheduleController.deleteSchedule);

module.exports = router;