const db = require('../config/db');

class TemplateModel {
  // Create template
  static async create(templateData) {
    const { name, subject, body_template } = templateData;
    
    const query = `
      INSERT INTO Template (name, subject, body_template)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [name, subject, body_template]);
    return result;
  }

  // Get all templates
  static async getAll() {
    const query = 'SELECT * FROM Template ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  // Get template by ID
  static async getById(id) {
    const query = 'SELECT * FROM Template WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Get template by name
  static async getByName(name) {
    const query = 'SELECT * FROM Template WHERE name = ?';
    const [rows] = await db.execute(query, [name]);
    return rows[0];
  }

  // Update template
  static async update(id, templateData) {
    const { name, subject, body_template } = templateData;
    
    const query = `
      UPDATE Template 
      SET name = ?, subject = ?, body_template = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [name, subject, body_template, id]);
    return result;
  }

  // Delete template
  static async delete(id) {
    const query = 'DELETE FROM Template WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result;
  }

  // Check if template exists
  static async exists(name) {
    const query = 'SELECT COUNT(*) as count FROM Template WHERE name = ?';
    const [rows] = await db.execute(query, [name]);
    return rows[0].count > 0;
  }
}

module.exports = TemplateModel;



