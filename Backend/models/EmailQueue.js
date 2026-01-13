const db = require('../config/db');
const { htmlToText } = require('../utils/htmlToText');

class EmailQueue {

  /* ================= CREATE ================= */

  static async create(data) {
    if (!data.scheduled_at) {
      throw new Error('scheduled_at is required');
    }

    const bodyText = data.body_text || htmlToText(data.body_html);

    const query = `
      INSERT INTO email_queue
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
      bodyText,
      data.status || 'pending',
      data.scheduled_at,
      data.max_retries || 3
    ]);

    return result.insertId;
  }

  static async bulkCreate(emails) {
    if (!emails.length) throw new Error('No emails to insert');

    const query = `
      INSERT INTO email_queue
      (campaign_id, schedule_id, client_id, template_id, client_name, client_email,
       subject, body_html, body_text, status, scheduled_at, max_retries)
      VALUES ?
    `;

    const values = emails.map(e => [
      e.campaign_id,
      e.schedule_id,
      e.client_id,
      e.template_id,
      e.client_name,
      e.client_email,
      e.subject,
      e.body_html,
      e.body_text || htmlToText(e.body_html),
      e.status || 'pending',
      e.scheduled_at || new Date(), // ✅ SAFE DEFAULT
      e.max_retries || 3
    ]);

    const [result] = await db.query(query, [values]);
    return result;
  }

  /* ================= FETCH ================= */

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM email_queue WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByScheduleId(scheduleId, { status, limit } = {}) {
    let sql = 'SELECT * FROM email_queue WHERE schedule_id = ?';
    const params = [scheduleId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async findByCampaignId(campaignId, { status, limit } = {}) {
    let sql = 'SELECT * FROM email_queue WHERE campaign_id = ?';
    const params = [campaignId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  /* ================= QUEUE LOGIC ================= */

  static async getPendingEmails(limit = 100) {
    const [rows] = await db.query(`
      SELECT * FROM email_queue
      WHERE status = 'pending'
        AND scheduled_at <= NOW()
        AND retry_count < max_retries
      ORDER BY scheduled_at ASC
      LIMIT ?
    `, [Number(limit)]);

    return rows;
  }

  static async getRetryableEmails(limit = 50) {
    const [rows] = await db.query(`
      SELECT * FROM email_queue
      WHERE status = 'failed'
        AND retry_count < max_retries
      ORDER BY updated_at ASC
      LIMIT ?
    `, [Number(limit)]);

    return rows;
  }

  /* ================= STATS ================= */

  static async getStatsBySchedule(scheduleId) {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(status='pending') AS pending,
        SUM(status='sent') AS sent,
        SUM(status='failed') AS failed
      FROM email_queue
      WHERE schedule_id = ?
    `, [scheduleId]);

    return rows[0];
  }

  static async getStatsByCampaign(campaignId) {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(status='pending') AS pending,
        SUM(status='sent') AS sent,
        SUM(status='failed') AS failed
      FROM email_queue
      WHERE campaign_id = ?
    `, [campaignId]);

    return rows[0];
  }

  static async getGlobalStats() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status='pending') AS pending,
        SUM(status='sent') AS sent,
        SUM(status='failed') AS failed,
        SUM(retry_count > 0 AND status='failed') AS retry
      FROM email_queue
    `);

    return rows[0];
  }

  /* ================= STATUS UPDATES ================= */

  static async markSent(id, messageId = null) {
    const CampaignSchedule = require('./CampaignSchedule');

    const email = await this.findById(id);
    if (!email) return false;

    const [res] = await db.execute(
      `UPDATE email_queue
       SET status='sent', sent_at=NOW(), message_id=?
       WHERE id=? AND status!='sent'`,
      [messageId, id]
    );

    if (!res.affectedRows) return false;

    if (email.schedule_id) {
      const stats = await this.getStatsBySchedule(email.schedule_id);
      if (stats.pending === 0 && stats.failed === 0 && stats.sent > 0) {
        await CampaignSchedule.updateStatus(email.schedule_id, 'completed');
      }
    }

    return true;
  }

  static async markFailed(id, msg, code = null) {
    const [res] = await db.execute(`
      UPDATE email_queue
      SET status='failed',
          error_message=?,
          error_code=?,
          retry_count=retry_count+1
      WHERE id=?
    `, [msg, code, id]);

    return res.affectedRows > 0;
  }

  /* ================= DELETE ================= */

  static async deleteById(id) {
    const [res] = await db.execute(
      'DELETE FROM email_queue WHERE id=?',
      [id]
    );
    return res.affectedRows > 0;
  }

  static async deleteBySchedule(scheduleId) {
    const [res] = await db.execute(
      'DELETE FROM email_queue WHERE schedule_id=?',
      [scheduleId]
    );
    return res.affectedRows;
  }
}

module.exports = EmailQueue;
