// models/CampaignSchedule.js
const db = require('../config/db');

class CampaignSchedule {
  // Create a new schedule
  static async create(data) {
    const query = `
      INSERT INTO Campaign_Schedule 
      (campaign_id, schedule_date, template_id, start_row, end_row, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      data.campaign_id,
      data.schedule_date,
      data.template_id,
      data.start_row,
      data.end_row,
      data.status || 'pending'
    ]);
    
    console.log(`✅ Schedule created: ID ${result.insertId} for date ${data.schedule_date}`);
    return result.insertId;
  }

  // Get schedule by ID
  static async findById(id) {
    const query = 'SELECT * FROM Campaign_Schedule WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Get all schedules for a campaign
  static async findByCampaignId(campaignId) {
    const query = `
      SELECT * FROM Campaign_Schedule 
      WHERE campaign_id = ? 
      ORDER BY schedule_date ASC
    `;
    const [rows] = await db.execute(query, [campaignId]);
    return rows;
  }

  // Get schedules by status
  static async findByStatus(status) {
    const query = `
      SELECT * FROM Campaign_Schedule 
      WHERE status = ? 
      ORDER BY schedule_date ASC
    `;
    const [rows] = await db.execute(query, [status]);
    return rows;
  }

  // Get pending schedules for today
  static async getPendingToday() {
    const query = `
      SELECT * FROM Campaign_Schedule 
      WHERE status = 'pending' AND schedule_date = CURDATE()
      ORDER BY id ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Update schedule
  static async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.schedule_date) {
      fields.push('schedule_date = ?');
      values.push(data.schedule_date);
    }
    if (data.template_id) {
      fields.push('template_id = ?');
      values.push(data.template_id);
    }
    if (data.start_row !== undefined) {
      fields.push('start_row = ?');
      values.push(data.start_row);
    }
    if (data.end_row !== undefined) {
      fields.push('end_row = ?');
      values.push(data.end_row);
    }
    if (data.status) {
      fields.push('status = ?');
      values.push(data.status);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE Campaign_Schedule SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    
    return result.affectedRows > 0;
  }

  // Update schedule status
  static async updateStatus(id, status) {
    const query = 'UPDATE Campaign_Schedule SET status = ? WHERE id = ?';
    const [result] = await db.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Delete schedule
  static async delete(id) {
    const query = 'DELETE FROM Campaign_Schedule WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Cancel schedule
  static async cancel(id) {
    // Since your enum only has 'pending' and 'completed', we can't use 'cancelled'
    // Instead, we'll delete it or keep as 'completed'
    const query = 'UPDATE Campaign_Schedule SET status = ? WHERE id = ?';
    const [result] = await db.execute(query, ['completed', id]);
    return result.affectedRows > 0;
  }

  // Get schedule count for campaign
  static async getCountByCampaign(campaignId) {
    const query = 'SELECT COUNT(*) as count FROM Campaign_Schedule WHERE campaign_id = ?';
    const [rows] = await db.execute(query, [campaignId]);
    return rows[0].count;
  }
}

module.exports = CampaignSchedule;