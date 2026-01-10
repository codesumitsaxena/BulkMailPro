const CampaignModel = require('../models/campaignModel');

class CampaignController {
  // Create new campaign
  static async createCampaign(req, res) {
    try {
      const { campaign_name, start_date, end_date, total_clients, csv_file_path } = req.body;

      // Validation
      if (!campaign_name || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Campaign name, start date, and end date are required'
        });
      }

      // Validate dates
      const start = new Date(start_date);
      const end = new Date(end_date);
      
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be greater than or equal to start date'
        });
      }

      // Check max 5 days
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays > 4) {
        return res.status(400).json({
          success: false,
          message: 'Campaign duration cannot exceed 5 days'
        });
      }

      // Check if campaign name already exists
      const nameExists = await CampaignModel.nameExists(campaign_name);
      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'Campaign name already exists'
        });
      }

      // Create campaign
      const result = await CampaignModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: {
          id: result.insertId,
          campaign_name,
          start_date,
          end_date,
          total_clients: total_clients || 0,
          status: 'draft'
        }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create campaign',
        error: error.message
      });
    }
  }

  // Get all campaigns
  static async getAllCampaigns(req, res) {
    try {
      const { status } = req.query;

      let campaigns;
      if (status) {
        campaigns = await CampaignModel.getByStatus(status);
      } else {
        campaigns = await CampaignModel.getAll();
      }

      res.status(200).json({
        success: true,
        count: campaigns.length,
        data: campaigns
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaigns',
        error: error.message
      });
    }
  }

  // Get campaign by ID
  static async getCampaignById(req, res) {
    try {
      const { id } = req.params;
      const campaign = await CampaignModel.getById(id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.status(200).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaign',
        error: error.message
      });
    }
  }

  // Update campaign
  static async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const { campaign_name, start_date, end_date } = req.body;

      // Check if campaign exists
      const campaign = await CampaignModel.getById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Validation
      if (!campaign_name || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Campaign name, start date, and end date are required'
        });
      }

      // Validate dates
      const start = new Date(start_date);
      const end = new Date(end_date);
      
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be greater than or equal to start date'
        });
      }

      // Check max 5 days
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays > 4) {
        return res.status(400).json({
          success: false,
          message: 'Campaign duration cannot exceed 5 days'
        });
      }

      // Check if new name conflicts
      if (campaign_name !== campaign.campaign_name) {
        const nameExists = await CampaignModel.nameExists(campaign_name, id);
        if (nameExists) {
          return res.status(409).json({
            success: false,
            message: 'Campaign name already exists'
          });
        }
      }

      // Update campaign
      await CampaignModel.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data: {
          id,
          ...req.body
        }
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update campaign',
        error: error.message
      });
    }
  }

  // Update campaign status
  static async updateCampaignStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['draft', 'active', 'completed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: draft, active, or completed'
        });
      }

      // Check if campaign exists
      const campaign = await CampaignModel.getById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Update status
      await CampaignModel.updateStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Campaign status updated successfully',
        data: {
          id,
          status
        }
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update campaign status',
        error: error.message
      });
    }
  }

  // Delete campaign
  static async deleteCampaign(req, res) {
    try {
      const { id } = req.params;

      // Check if campaign exists
      const campaign = await CampaignModel.getById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Delete campaign
      await CampaignModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete campaign',
        error: error.message
      });
    }
  }

  // Get campaigns by date range
  static async getCampaignsByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const campaigns = await CampaignModel.getByDateRange(start_date, end_date);

      res.status(200).json({
        success: true,
        count: campaigns.length,
        data: campaigns
      });
    } catch (error) {
      console.error('Error fetching campaigns by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch campaigns',
        error: error.message
      });
    }
  }
}

module.exports = CampaignController;