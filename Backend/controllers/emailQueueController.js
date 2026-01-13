const EmailQueue = require('../models/EmailQueue');
const CampaignSchedule = require('../models/CampaignSchedule');
const db = require('../config/db');

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue email',
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
        message: 'emails array is required'
      });
    }

    const result = await EmailQueue.bulkCreate(emails);

    res.status(201).json({
      success: true,
      message: `${result.affectedRows} emails queued`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Bulk insert failed',
      error: error.message
    });
  }
};

/* ================= GET ================= */

const getEmailById = async (req, res) => {
  try {
    const email = await EmailQueue.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    res.json({ success: true, data: email });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getEmailsBySchedule = async (req, res) => {
  try {
    const emails = await EmailQueue.findByScheduleId(req.params.scheduleId);
    res.json({ success: true, data: emails, count: emails.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getEmailsByCampaign = async (req, res) => {
  try {
    const emails = await EmailQueue.findByCampaignId(req.params.campaignId);
    res.json({ success: true, data: emails, count: emails.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= PENDING / RETRY ================= */

// 🔥 USED BY n8n
const getPendingReadyEmails = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;

    const query = `
      SELECT *
      FROM email_queue
      WHERE status = 'pending'
        AND retry_count < max_retries
        AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
      LIMIT ?
    `;

    const [emails] = await db.query(query, [limit]);

    res.json({
      success: true,
      data: {
        emails,
        count: emails.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending emails',
      error: error.message
    });
  }
};

const getPendingEmails = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const emails = await EmailQueue.getPendingEmails(limit);
    res.json({ success: true, data: emails, count: emails.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRetryableEmails = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const emails = await EmailQueue.getRetryableEmails(limit);
    res.json({ success: true, data: emails, count: emails.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= STATUS ================= */

const markEmailSent = async (req, res) => {
  try {
    const { message_id } = req.body;

    const email = await EmailQueue.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    await EmailQueue.markSent(req.params.id, message_id);

    if (email.schedule_id) {
      const stats = await EmailQueue.getStatsBySchedule(email.schedule_id);
      if (stats.pending === 0 && stats.failed === 0) {
        await CampaignSchedule.updateStatus(email.schedule_id, 'completed');
      }
    }

    res.json({ success: true, message: 'Email marked as sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

    await EmailQueue.markFailed(req.params.id, error_message, error_code);

    res.json({ success: true, message: 'Email marked as failed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const incrementRetry = async (req, res) => {
  try {
    await EmailQueue.incrementRetry(req.params.id);
    res.json({ success: true, message: 'Retry incremented' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= STATS ================= */

const getStatsBySchedule = async (req, res) => {
  try {
    const stats = await EmailQueue.getStatsBySchedule(req.params.scheduleId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStatsByCampaign = async (req, res) => {
  try {
    const stats = await EmailQueue.getStatsByCampaign(req.params.campaignId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getGlobalStats = async (req, res) => {
  try {
    const stats = await EmailQueue.getGlobalStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= DELETE ================= */

const deleteEmail = async (req, res) => {
  try {
    await EmailQueue.delete(req.params.id);
    res.json({ success: true, message: 'Email deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteEmailsBySchedule = async (req, res) => {
  try {
    const count = await EmailQueue.deleteBySchedule(req.params.scheduleId);
    res.json({ success: true, message: `${count} emails deleted` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
  getGlobalStats,
  deleteEmail,
  deleteEmailsBySchedule
};
