// models/EmailQueue.js
const db = require('../config/db');

class EmailQueue {
  // Create a new email in queue
  static async create(data) {
    const query = `
      INSERT INTO Email_Queue 
      (campaign_id, schedule_id, client_id, template_id, client_name, client_email, 
       subject, body_html, body_text, status, scheduled_at, max_retries)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      data.campaign_id,
      data.schedule_id,
      data.client_id,
      data.template_id,
      data.client_name,
      data.client_email,
      data.subject,
      data.body_html,
      data.body_text || null,
      data.status || 'pending',
      data.scheduled_at,
      data.max_retries || 3
    ]);
    
    return result.insertId;
  }

  // Bulk create emails
  static async bulkCreate(emails) {
    const query = `
      INSERT INTO Email_Queue 
      (campaign_id, schedule_id, client_id, template_id, client_name, client_email, 
       subject, body_html, body_text, status, scheduled_at, max_retries)
      VALUES ?
    `;
    
    const values = emails.map(email => [
      email.campaign_id,
      email.schedule_id,
      email.client_id,
      email.template_id,
      email.client_name,
      email.client_email,
      email.subject,
      email.body_html,
      email.body_text || null,
      email.status || 'pending',
      email.scheduled_at,
      email.max_retries || 3
    ]);
    
    const [result] = await db.query(query, [values]);
    return result;
  }

  // Get email by ID
  static async findById(id) {
    const query = 'SELECT * FROM Email_Queue WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Get emails by schedule ID
  static async findByScheduleId(scheduleId, options = {}) {
    let query = 'SELECT * FROM Email_Queue WHERE schedule_id = ?';
    const params = [scheduleId];
    
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY created_at ASC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(options.limit));
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Get emails by campaign ID
  static async findByCampaignId(campaignId, options = {}) {
    let query = 'SELECT * FROM Email_Queue WHERE campaign_id = ?';
    const params = [campaignId];
    
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY created_at ASC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(options.limit));
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Get pending emails ready to send
  static async getPendingEmails(limit = 100) {
    const query = `
      SELECT * FROM Email_Queue 
      WHERE status IN ('pending', 'queued') 
      AND scheduled_at <= NOW()
      AND retry_count < max_retries
      ORDER BY scheduled_at ASC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [limit]);
    return rows;
  }

  // Get failed emails that can be retried
  static async getRetryableEmails(limit = 50) {
    const query = `
      SELECT * FROM Email_Queue 
      WHERE status = 'failed' 
      AND retry_count < max_retries
      ORDER BY updated_at ASC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [limit]);
    return rows;
  }

  // Update email status
  static async updateStatus(id, status, additionalData = {}) {
    const fields = ['status = ?'];
    const values = [status];
    
    if (status === 'sent' && !additionalData.sent_at) {
      fields.push('sent_at = NOW()');
    }
    if (status === 'sending' && !additionalData.started_at) {
      fields.push('updated_at = NOW()');
    }
    if (additionalData.sent_at) {
      fields.push('sent_at = ?');
      values.push(additionalData.sent_at);
    }
    if (additionalData.message_id) {
      fields.push('message_id = ?');
      values.push(additionalData.message_id);
    }
    if (additionalData.error_message) {
      fields.push('error_message = ?');
      values.push(additionalData.error_message);
    }
    if (additionalData.error_code) {
      fields.push('error_code = ?');
      values.push(additionalData.error_code);
    }
    
    values.push(id);
    const query = `UPDATE Email_Queue SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    
    return result.affectedRows > 0;
  }

  // Increment retry count
  static async incrementRetry(id) {
    const query = 'UPDATE Email_Queue SET retry_count = retry_count + 1 WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Mark as failed
  static async markFailed(id, errorMessage, errorCode = null) {
    const query = `
      UPDATE Email_Queue 
      SET status = 'failed', 
          error_message = ?, 
          error_code = ?,
          retry_count = retry_count + 1
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [errorMessage, errorCode, id]);
    return result.affectedRows > 0;
  }

  // Mark as sent
  static async markSent(id, messageId = null) {
    const query = `
      UPDATE Email_Queue 
      SET status = 'sent', 
          sent_at = NOW(),
          message_id = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [messageId, id]);
    return result.affectedRows > 0;
  }

  // Get email statistics by schedule
  static async getStatsBySchedule(scheduleId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status IN ('pending', 'queued') THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending_count
      FROM Email_Queue 
      WHERE schedule_id = ?
      GROUP BY status
    `;
    const [rows] = await db.execute(query, [scheduleId]);
    return rows;
  }

  // Get email statistics by campaign
  static async getStatsByCampaign(campaignId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status IN ('pending', 'queued') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM Email_Queue 
      WHERE campaign_id = ?
    `;
    const [rows] = await db.execute(query, [campaignId]);
    return rows[0];
  }

  // Delete email
  static async delete(id) {
    const query = 'DELETE FROM Email_Queue WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Delete emails by schedule
  static async deleteBySchedule(scheduleId) {
    const query = 'DELETE FROM Email_Queue WHERE schedule_id = ?';
    const [result] = await db.execute(query, [scheduleId]);
    return result.affectedRows > 0;
  }
}

module.exports = EmailQueue;