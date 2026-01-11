// controllers/campaignScheduleController.js
const CampaignSchedule = require('../models/CampaignSchedule');

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const scheduleId = await CampaignSchedule.create(req.body);
    const schedule = await CampaignSchedule.findById(scheduleId);
    
    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating schedule',
      error: error.message
    });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
};

// Get all schedules for a campaign
exports.getSchedulesByCampaign = async (req, res) => {
  try {
    const schedules = await CampaignSchedule.findByCampaignId(req.params.campaignId);
    
    res.json({
      success: true,
      data: {
        schedules,
        count: schedules.length
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

// Get schedules by status
exports.getSchedulesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const schedules = await CampaignSchedule.findByStatus(status);
    
    res.json({
      success: true,
      data: {
        schedules,
        count: schedules.length,
        status
      }
    });
  } catch (error) {
    console.error('Error fetching schedules by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

// Get pending schedules for today
exports.getPendingToday = async (req, res) => {
  try {
    const schedules = await CampaignSchedule.getPendingForToday();
    
    res.json({
      success: true,
      data: {
        schedules,
        count: schedules.length
      }
    });
  } catch (error) {
    console.error('Error fetching pending schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending schedules',
      error: error.message
    });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const updated = await CampaignSchedule.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or no changes made'
      });
    }
    
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
};

// Update schedule status
exports.updateScheduleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updated = await CampaignSchedule.updateStatus(req.params.id, status, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Schedule status updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule status',
      error: error.message
    });
  }
};

// Increment email sent counter
exports.incrementEmailSent = async (req, res) => {
  try {
    const updated = await CampaignSchedule.incrementEmailSent(req.params.id);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Email sent counter incremented'
    });
  } catch (error) {
    console.error('Error incrementing email sent:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing email sent counter',
      error: error.message
    });
  }
};

// Increment email failed counter
exports.incrementEmailFailed = async (req, res) => {
  try {
    const updated = await CampaignSchedule.incrementEmailFailed(req.params.id);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Email failed counter incremented'
    });
  } catch (error) {
    console.error('Error incrementing email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing email failed counter',
      error: error.message
    });
  }
};

// Cancel schedule
exports.cancelSchedule = async (req, res) => {
  try {
    const cancelled = await CampaignSchedule.cancel(req.params.id);
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or cannot be cancelled (already completed/cancelled)'
      });
    }
    
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Schedule cancelled successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling schedule',
      error: error.message
    });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const deleted = await CampaignSchedule.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
};