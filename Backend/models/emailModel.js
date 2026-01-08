const db = require('../config/db');

const EmailModel = {
  
  // Get next campaign_id
  async getNextCampaignId() {
    try {
      const [rows] = await db.query(
        'SELECT COALESCE(MAX(campaign_id), 0) + 1 as next_id FROM Email'
      );
      return rows[0].next_id;
    } catch (error) {
      throw error;
    }
  },

  // Helper function to format date for MySQL
  formatDateForMySQL(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  },

  // Bulk insert emails
  async bulkInsert(emailData) {
    try {
      const query = `
        INSERT INTO Email 
        (campaign_id, campaign_name, start_date, end_date, subject, body_template, client_name, client_email, status) 
        VALUES ?
      `;
      
      const values = emailData.map(email => [
        email.campaign_id,
        email.campaign_name,
        this.formatDateForMySQL(email.start_date),
        this.formatDateForMySQL(email.end_date),
        email.subject,
        email.body_template,
        email.client_name,
        email.client_email,
        'pending'
      ]);

      const [result] = await db.query(query, [values]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get all emails
  async getAllEmails() {
    try {
      const [rows] = await db.query('SELECT * FROM Email ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get emails by campaign_id
  async getEmailsByCampaignId(campaign_id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM Email WHERE campaign_id = ? ORDER BY created_at DESC',
        [campaign_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Update email status (for N8N)
  async updateEmailStatus(id, status, sent_at = null) {
    try {
      const query = sent_at 
        ? 'UPDATE Email SET status = ?, sent_at = ? WHERE id = ?'
        : 'UPDATE Email SET status = ? WHERE id = ?';
      
      const params = sent_at 
        ? [status, this.formatDateForMySQL(sent_at), id] 
        : [status, id];
      
      const [result] = await db.query(query, params);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get pending emails (for N8N to fetch)
  async getPendingEmails() {
    try {
      const [rows] = await db.query(
        'SELECT * FROM Email WHERE status = "pending" ORDER BY created_at ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = EmailModel;