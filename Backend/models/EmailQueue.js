const db = require('../config/db');

class EmailQueue {

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

  static async bulkCreate(emails) {
    if (!emails.length) throw new Error('No emails to insert');

    const query = `
      INSERT INTO Email_Queue
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
      e.body_text || null,
      e.status || 'pending',
      e.scheduled_at,
      e.max_retries || 3
    ]);

    const [result] = await db.query(query, [values]);
    return result;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM Email_Queue WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getPendingEmails(limit = 100) {
    const query = `
      SELECT * FROM Email_Queue
      WHERE status = 'pending'
      AND scheduled_at <= NOW()
      AND retry_count < max_retries
      ORDER BY scheduled_at ASC
      LIMIT ?
    `;
    const [rows] = await db.query(query, [Number(limit)]);
    return rows;
  }

  static async getRetryableEmails(limit = 50) {
    const query = `
      SELECT * FROM Email_Queue
      WHERE status = 'failed'
      AND retry_count < max_retries
      ORDER BY updated_at ASC
      LIMIT ?
    `;
    const [rows] = await db.query(query, [Number(limit)]);
    return rows;
  }

  static async updateStatus(id, status, extra = {}) {
    const fields = ['status = ?'];
    const values = [status];

    if (extra.sent_at) {
      fields.push('sent_at = ?');
      values.push(extra.sent_at);
    }
    if (extra.message_id) {
      fields.push('message_id = ?');
      values.push(extra.message_id);
    }
    if (extra.error_message) {
      fields.push('error_message = ?');
      values.push(extra.error_message);
    }
    if (extra.error_code) {
      fields.push('error_code = ?');
      values.push(extra.error_code);
    }

    values.push(id);

    const query = `UPDATE Email_Queue SET ${fields.join(', ')} WHERE id = ?`;
    const [res] = await db.execute(query, values);
    return res.affectedRows > 0;
  }

  static async incrementRetry(id) {
    const [res] = await db.execute(
      'UPDATE Email_Queue SET retry_count = retry_count + 1 WHERE id = ?',
      [id]
    );
    return res.affectedRows > 0;
  }

  static async markFailed(id, msg, code = null) {
    const query = `
      UPDATE Email_Queue
      SET status='failed', error_message=?, error_code=?, retry_count=retry_count+1
      WHERE id=?
    `;
    const [res] = await db.execute(query, [msg, code, id]);
    return res.affectedRows > 0;
  }

  static async markSent(id, messageId = null) {
    const [res] = await db.execute(
      `UPDATE Email_Queue SET status='sent', sent_at=NOW(), message_id=? WHERE id=?`,
      [messageId, id]
    );
    return res.affectedRows > 0;
  }
}

module.exports = EmailQueue;
