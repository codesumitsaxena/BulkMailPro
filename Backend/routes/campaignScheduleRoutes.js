const express = require('express');
const router = express.Router();
const campaignScheduleController = require('../controllers/campaignScheduleController');

// Create new schedule
router.post('/', campaignScheduleController.createSchedule);

// Specific routes FIRST (before /:id)
router.get('/pending/today', campaignScheduleController.getPendingToday);
router.get('/campaign/:campaignId', campaignScheduleController.getSchedulesByCampaign);
router.get('/status/:status', campaignScheduleController.getSchedulesByStatus);

// Generic routes LAST
router.get('/:id', campaignScheduleController.getScheduleById);
router.put('/:id', campaignScheduleController.updateSchedule);
router.patch('/:id/status', campaignScheduleController.updateScheduleStatus);
router.patch('/:id/cancel', campaignScheduleController.cancelSchedule);
router.delete('/:id', campaignScheduleController.deleteSchedule);

module.exports = router;