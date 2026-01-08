const EmailModel = require('../models/emailModel');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const emailController = {

  // Upload CSV and create campaign
  uploadCampaign: async (req, res) => {
    try {
      // Check if file uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
      }

      // Validate form data
      const { campaign_name, start_date, end_date, subject, body_template } = req.body;

      if (!campaign_name || !start_date || !end_date || !subject || !body_template) {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'All fields are required: campaign_name, start_date, end_date, subject, body_template'
        });
      }

      // Get next campaign_id
      const campaign_id = await EmailModel.getNextCampaignId();

      // Parse CSV
      const clients = [];
      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Validate CSV row
          if (row.client_name && row.client_email) {
            clients.push({
              campaign_id,
              campaign_name,
              start_date,
              end_date,
              subject,
              body_template,
              client_name: row.client_name.trim(),
              client_email: row.client_email.trim()
            });
          }
        })
        .on('end', async () => {
          try {
            // Check if clients found
            if (clients.length === 0) {
              fs.unlinkSync(filePath);
              return res.status(400).json({
                success: false,
                message: 'No valid clients found in CSV. Required columns: client_name, client_email'
              });
            }

            // Bulk insert
            const result = await EmailModel.bulkInsert(clients);

            // Delete CSV file after processing
            fs.unlinkSync(filePath);

            res.status(201).json({
              success: true,
              message: 'Campaign created successfully',
              data: {
                campaign_id,
                campaign_name,
                total_clients: clients.length,
                inserted: result.affectedRows
              }
            });

          } catch (error) {
            fs.unlinkSync(filePath);
            console.error('Database error:', error);
            res.status(500).json({
              success: false,
              message: 'Failed to insert data',
              error: error.message
            });
          }
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          console.error('CSV parsing error:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to parse CSV',
            error: error.message
          });
        });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // Get all emails
  getAllEmails: async (req, res) => {
    try {
      const emails = await EmailModel.getAllEmails();
      
      res.status(200).json({
        success: true,
        count: emails.length,
        data: emails
      });
    } catch (error) {
      console.error('Get all emails error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch emails',
        error: error.message
      });
    }
  },

  // Get emails by campaign_id
  getEmailsByCampaignId: async (req, res) => {
    try {
      const { campaign_id } = req.params;

      if (!campaign_id) {
        return res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
      }

      const emails = await EmailModel.getEmailsByCampaignId(campaign_id);

      if (emails.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No emails found for this campaign'
        });
      }

      res.status(200).json({
        success: true,
        campaign_id: parseInt(campaign_id),
        count: emails.length,
        data: emails
      });
    } catch (error) {
      console.error('Get by campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaign emails',
        error: error.message
      });
    }
  },

  // Update email status (for N8N)
  updateEmailStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, sent_at } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'ID and status are required'
        });
      }

      if (!['pending', 'sent', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, sent, or failed'
        });
      }

      const result = await EmailModel.updateEmailStatus(id, status, sent_at);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Email status updated successfully',
        data: { id, status, sent_at }
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status',
        error: error.message
      });
    }
  },

  // Get pending emails (for N8N)
  getPendingEmails: async (req, res) => {
    try {
      const emails = await EmailModel.getPendingEmails();

      res.status(200).json({
        success: true,
        count: emails.length,
        data: emails
      });
    } catch (error) {
      console.error('Get pending error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending emails',
        error: error.message
      });
    }
  }
};

module.exports = emailController;