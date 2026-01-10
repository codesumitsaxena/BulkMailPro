const TemplateModel = require('../models/templateModel');

class TemplateController {
  // Create new template
  static async createTemplate(req, res) {
    try {
      const { name, subject, body_template } = req.body;

      // Validation
      if (!name || !subject || !body_template) {
        return res.status(400).json({
          success: false,
          message: 'Name, subject, and body_template are required'
        });
      }

      // Check if template name already exists
      const exists = await TemplateModel.exists(name);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Template name already exists'
        });
      }

      // Create template
      const result = await TemplateModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: {
          id: result.insertId,
          name,
          subject,
          body_template
        }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create template',
        error: error.message
      });
    }
  }

  // Get all templates
  static async getAllTemplates(req, res) {
    try {
      const templates = await TemplateModel.getAll();

      res.status(200).json({
        success: true,
        count: templates.length,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
        error: error.message
      });
    }
  }

  // Get template by ID
  static async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const template = await TemplateModel.getById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch template',
        error: error.message
      });
    }
  }

  // Update template
  static async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const { name, subject, body_template } = req.body;

      // Check if template exists
      const template = await TemplateModel.getById(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Validation
      if (!name || !subject || !body_template) {
        return res.status(400).json({
          success: false,
          message: 'Name, subject, and body_template are required'
        });
      }

      // Check if new name conflicts with existing template
      if (name !== template.name) {
        const exists = await TemplateModel.exists(name);
        if (exists) {
          return res.status(409).json({
            success: false,
            message: 'Template name already exists'
          });
        }
      }

      // Update template
      await TemplateModel.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        data: {
          id,
          name,
          subject,
          body_template
        }
      });
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        error: error.message
      });
    }
  }

  // Delete template
  static async deleteTemplate(req, res) {
    try {
      const { id } = req.params;

      // Check if template exists
      const template = await TemplateModel.getById(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Delete template
      await TemplateModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error.message
      });
    }
  }
}

module.exports = TemplateController;

