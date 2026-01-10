const db = require('../config/db');

class CampaignModel {
  // Create campaign
  static async create(campaignData) {
    const { campaign_name, start_date, end_date, total_clients, csv_file_path } = campaignData;
    
    const query = `
      INSERT INTO Campaign (campaign_name, start_date, end_date, total_clients, csv_file_path)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      campaign_name, 
      start_date, 
      end_date, 
      total_clients || 0, 
      csv_file_path || null
    ]);
    
    return result;
  }

  // Get all campaigns
  static async getAll() {
    const query = 'SELECT * FROM Campaign ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Get campaign by ID
  static async getById(id) {
    const query = 'SELECT * FROM Campaign WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Update campaign
  static async update(id, campaignData) {
    const { campaign_name, start_date, end_date, total_clients, csv_file_path, status } = campaignData;
    
    const query = `
      UPDATE Campaign 
      SET campaign_name = ?, start_date = ?, end_date = ?, 
          total_clients = ?, csv_file_path = ?, status = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [
      campaign_name, 
      start_date, 
      end_date, 
      total_clients, 
      csv_file_path, 
      status,
      id
    ]);
    
    return result;
  }

  // Update campaign status only
  static async updateStatus(id, status) {
    const query = 'UPDATE Campaign SET status = ? WHERE id = ?';
    const [result] = await db.execute(query, [status, id]);
    return result;
  }

  // Update total clients count
  static async updateTotalClients(id, total_clients) {
    const query = 'UPDATE Campaign SET total_clients = ? WHERE id = ?';
    const [result] = await db.execute(query, [total_clients, id]);
    return result;
  }

  // Delete campaign
  static async delete(id) {
    const query = 'DELETE FROM Campaign WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }

  // Get campaigns by status
  static async getByStatus(status) {
    const query = 'SELECT * FROM Campaign WHERE status = ? ORDER BY created_at DESC';
    const [rows] = await db.execute(query, [status]);
    return rows;
  }

  // Get campaigns by date range
  static async getByDateRange(startDate, endDate) {
    const query = `
      SELECT * FROM Campaign 
      WHERE start_date >= ? AND end_date <= ?
      ORDER BY start_date ASC
    `;
    const [rows] = await db.execute(query, [startDate, endDate]);
    return rows;
  }

  // Check if campaign name exists
  static async nameExists(campaign_name, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM Campaign WHERE campaign_name = ?';
    const params = [campaign_name];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows[0].count > 0;
  }
}

module.exports = CampaignModel;


