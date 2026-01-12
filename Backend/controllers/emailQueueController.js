const EmailQueue = require('../models/EmailQueue');

/* ================= CREATE ================= */

const createEmail = async (req, res) => {
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

const bulkCreateEmails = async (req, res) => {
  try {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Emails array is required'
      });
    }

    const result = await EmailQueue.bulkCreate(emails);

    res.status(201).json({
      success: true,
      message: `${result.affectedRows} emails queued`,
      data: result
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk create failed',
      error: error.message
    });
  }
};

/* ================= GET ================= */

const getEmailById = async (req, res) => {
  try {
    const email = await EmailQueue.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not found' 
      });
    }
    res.json({ success: true, data: email });
  } catch (error) {
    console.error('Error getting email by id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching email',
      error: error.message 
    });
  }
};

const getEmailsBySchedule = async (req, res) => {
  try {
    const emails = await EmailQueue.findByScheduleId(req.params.scheduleId, req.query);
    res.json({ 
      success: true, 
      data: emails,
      count: emails.length 
    });
  } catch (error) {
    console.error('Error getting emails by schedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching emails',
      error: error.message 
    });
  }
};

const getEmailsByCampaign = async (req, res) => {
  try {
    const emails = await EmailQueue.findByCampaignId(req.params.campaignId, req.query);
    res.json({ 
      success: true, 
      data: emails,
      count: emails.length 
    });
  } catch (error) {
    console.error('Error getting emails by campaign:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching emails',
      error: error.message 
    });
  }
};

const getPendingEmails = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const emails = await EmailQueue.getPendingEmails(limit);
    
    console.log(`✅ Found ${emails.length} pending emails`);
    
    res.json({ 
      success: true, 
      data: emails,
      count: emails.length 
    });
  } catch (error) {
    console.error('Error getting pending emails:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending emails',
      error: error.message 
    });
  }
};

// For n8n workflow - structured response
const getPendingReadyEmails = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const emails = await EmailQueue.getPendingEmails(limit);
    
    console.log(`✅ [n8n] Found ${emails.length} pending ready emails`);
    
    res.json({ 
      success: true, 
      data: { 
        emails: emails,
        count: emails.length 
      } 
    });
  } catch (error) {
    console.error('Error fetching pending ready emails:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching emails',
      error: error.message 
    });
  }
};

const getRetryableEmails = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const emails = await EmailQueue.getRetryableEmails(limit);
    res.json({ 
      success: true, 
      data: emails,
      count: emails.length 
    });
  } catch (error) {
    console.error('Error getting retryable emails:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching retryable emails',
      error: error.message 
    });
  }
};

/* ================= STATUS ================= */

const markEmailSent = async (req, res) => {
  try {
    const { message_id } = req.body;
    const updated = await EmailQueue.markSent(req.params.id, message_id);
    
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: 'Email not found or already processed'
      });
    }
    
    console.log(`✅ Email ${req.params.id} marked as sent`);
    
    res.json({ 
      success: true,
      message: 'Email marked as sent'
    });
  } catch (error) {
    console.error('Error marking email as sent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating email status',
      error: error.message 
    });
  }
};

const markEmailFailed = async (req, res) => {
  try {
    const { error_message, error_code } = req.body;
    
    if (!error_message) {
      return res.status(400).json({
        success: false,
        message: 'error_message is required'
      });
    }
    
    const updated = await EmailQueue.markFailed(
      req.params.id,
      error_message,
      error_code
    );
    
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: 'Email not found'
      });
    }
    
    console.log(`❌ Email ${req.params.id} marked as failed: ${error_message}`);
    
    res.json({ 
      success: true,
      message: 'Email marked as failed'
    });
  } catch (error) {
    console.error('Error marking email as failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating email status',
      error: error.message 
    });
  }
};

const incrementRetry = async (req, res) => {
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
      message: 'Error updating retry count',
      error: error.message 
    });
  }
};

/* ================= STATS ================= */

const getStatsBySchedule = async (req, res) => {
  try {
    const stats = await EmailQueue.getStatsBySchedule(req.params.scheduleId);
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error getting stats by schedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
};

const getStatsByCampaign = async (req, res) => {
  try {
    const stats = await EmailQueue.getStatsByCampaign(req.params.campaignId);
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error getting stats by campaign:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
};

/* ================= DELETE ================= */

const deleteEmail = async (req, res) => {
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

const deleteEmailsBySchedule = async (req, res) => {
  try {
    const count = await EmailQueue.deleteBySchedule(req.params.scheduleId);
    res.json({ 
      success: true,
      message: `${count} emails deleted`,
      count: count
    });
  } catch (error) {
    console.error('Error deleting emails by schedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting emails',
      error: error.message 
    });
  }
};

/* ================= EXPORT ================= */

module.exports = {
  createEmail,
  bulkCreateEmails,
  getEmailById,
  getEmailsBySchedule,
  getEmailsByCampaign,
  getPendingEmails,
  getPendingReadyEmails,
  getRetryableEmails,
  markEmailSent,
  markEmailFailed,
  incrementRetry,
  getStatsBySchedule,
  getStatsByCampaign,
  deleteEmail,
  deleteEmailsBySchedule
};