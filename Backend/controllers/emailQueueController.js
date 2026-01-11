// controllers/emailQueueController.js
const EmailQueue = require('../models/EmailQueue');

// Create a new email in queue
exports.createEmail = async (req, res) => {
  try {
    const emailId = await EmailQueue.create(req.body);
    const email = await EmailQueue.findById(emailId);
    
    res.status(201).json({
      success: true,
      message: 'Email queued successfully',
      data: email
    });
  } catch (error) {
    console.error('Error creating email:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating email',
      error: error.message
    });
  }
};

// Bulk create emails
exports.bulkCreateEmails = async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Emails array is required and must not be empty'
      });
    }
    
    const result = await EmailQueue.bulkCreate(emails);
    
    res.status(201).json({
      success: true,
      message: `${result.affectedRows} emails queued successfully`,
      data: {
        inserted: result.affectedRows,
        insertId: result.insertId
      }
    });
  } catch (error) {
    console.error('Error bulk creating emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating emails',
      error: error.message
    });
  }
};

// Get email by ID
exports.getEmailById = async (req, res) => {
  try {
    const email = await EmailQueue.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email',
      error: error.message
    });
  }
};

// Get emails by schedule ID
exports.getEmailsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const options = {
      status: req.query.status,
      limit: req.query.limit
    };
    
    const emails = await EmailQueue.findByScheduleId(scheduleId, options);
    
    res.json({
      success: true,
      data: {
        emails,
        count: emails.length
      }
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emails',
      error: error.message
    });
  }
};

// Get emails by campaign ID
exports.getEmailsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const options = {
      status: req.query.status,
      limit: req.query.limit
    };
    
    const emails = await EmailQueue.findByCampaignId(campaignId, options);
    
    res.json({
      success: true,
      data: {
        emails,
        count: emails.length
      }
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emails',
      error: error.message
    });
  }
};

// Get pending emails ready to send
exports.getPendingEmails = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const emails = await EmailQueue.getPendingEmails(limit);
    
    res.json({
      success: true,
      data: {
        emails,
        count: emails.length
      }
    });
  } catch (error) {
    console.error('Error fetching pending emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending emails',
      error: error.message
    });
  }
};

// Get retryable emails
exports.getRetryableEmails = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const emails = await EmailQueue.getRetryableEmails(limit);
    
    res.json({
      success: true,
      data: {
        emails,
        count: emails.length
      }
    });
  } catch (error) {
    console.error('Error fetching retryable emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching retryable emails',
      error: error.message
    });
  }
};

// Update email status
exports.updateEmailStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'queued', 'sending', 'sent', 'failed', 'bounced', 'rejected'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updated = await EmailQueue.updateStatus(req.params.id, status, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    const email = await EmailQueue.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Email status updated successfully',
      data: email
    });
  } catch (error) {
    console.error('Error updating email status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email status',
      error: error.message
    });
  }
};

// Mark email as sent
exports.markEmailSent = async (req, res) => {
  try {
    const { message_id } = req.body;
    const updated = await EmailQueue.markSent(req.params.id, message_id);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Email marked as sent'
    });
  } catch (error) {
    console.error('Error marking email as sent:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking email as sent',
      error: error.message
    });
  }
};

// Mark email as failed
exports.markEmailFailed = async (req, res) => {
  try {
    const { error_message, error_code } = req.body;
    
    if (!error_message) {
      return res.status(400).json({
        success: false,
        message: 'error_message is required'
      });
    }
    
    const updated = await EmailQueue.markFailed(req.params.id, error_message, error_code);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Email marked as failed'
    });
  } catch (error) {
    console.error('Error marking email as failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking email as failed',
      error: error.message
    });
  }
};

// Increment retry count
exports.incrementRetry = async (req, res) => {
  try {
    const updated = await EmailQueue.incrementRetry(req.params.id);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Retry count incremented'
    });
  } catch (error) {
    console.error('Error incrementing retry:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing retry count',
      error: error.message
    });
  }
};

// Get email statistics by schedule
exports.getStatsBySchedule = async (req, res) => {
  try {
    const stats = await EmailQueue.getStatsBySchedule(req.params.scheduleId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email statistics',
      error: error.message
    });
  }
};

// Get email statistics by campaign
exports.getStatsByCampaign = async (req, res) => {
  try {
    const stats = await EmailQueue.getStatsByCampaign(req.params.campaignId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email statistics',
      error: error.message
    });
  }
};

// Delete email
exports.deleteEmail = async (req, res) => {
  try {
    const deleted = await EmailQueue.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Email deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting email',
      error: error.message
    });
  }
};

// Delete emails by schedule
exports.deleteEmailsBySchedule = async (req, res) => {
  try {
    const result = await EmailQueue.deleteBySchedule(req.params.scheduleId);
    
    res.json({
      success: true,
      message: `${result.affectedRows} emails deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting emails',
      error: error.message
    });
  }
};