// models/CampaignClient.js
const db = require('../config/db');

class CampaignClient {
  // Create a new campaign client
  static async create(data) {
    const query = `
      INSERT INTO Campaign_Client 
      (campaign_id, csv_row, client_name, client_email)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      data.campaign_id,
      data.csv_row_number,
      data.client_name,
      data.client_email
    ]);
    
    return result.insertId;
  }

  // Bulk insert clients (FIXED)
  static async bulkCreate(clients) {
    if (!clients || clients.length === 0) {
      throw new Error('Clients array is empty');
    }

    const query = `
      INSERT INTO Campaign_Client 
      (campaign_id, csv_row, client_name, client_email)
      VALUES ?
    `;
    
    const values = clients.map(client => [
      client.campaign_id,
      client.csv_row_number,
      client.client_name,
      client.client_email
    ]);
    
    console.log(`📤 Inserting ${values.length} clients into database...`);
    
    try {
      const [result] = await db.query(query, [values]);
      console.log(`✅ Bulk insert successful: ${result.affectedRows} rows inserted`);
      return result;
    } catch (error) {
      console.error('❌ Bulk insert error:', error.message);
      console.error('Sample data:', values.slice(0, 2));
      throw error;
    }
  }

  // Get client by ID
  static async findById(id) {
    const query = 'SELECT * FROM Campaign_Client WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Get all clients for a campaign
  static async findByCampaignId(campaignId, options = {}) {
    let query = 'SELECT * FROM Campaign_Client WHERE campaign_id = ?';
    const params = [campaignId];
    
    query += ' ORDER BY csv_row ASC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(options.limit));
    }
    
    if (options.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(options.offset));
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Get clients by row range
  static async findByRowRange(campaignId, startRow, endRow) {
    const query = `
      SELECT * FROM Campaign_Client 
      WHERE campaign_id = ? AND csv_row BETWEEN ? AND ?
      ORDER BY csv_row ASC
    `;
    const [rows] = await db.execute(query, [campaignId, startRow, endRow]);
    return rows;
  }

  // Update client
  static async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.client_name) {
      fields.push('client_name = ?');
      values.push(data.client_name);
    }
    if (data.client_email) {
      fields.push('client_email = ?');
      values.push(data.client_email);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE Campaign_Client SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    
    return result.affectedRows > 0;
  }

  // Delete client
  static async delete(id) {
    const query = 'DELETE FROM Campaign_Client WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get client count for campaign
  static async getCountByCampaign(campaignId) {
    const query = 'SELECT COUNT(*) as count FROM Campaign_Client WHERE campaign_id = ?';
    const [rows] = await db.execute(query, [campaignId]);
    return rows[0].count;
  }
}

module.exports = CampaignClient;