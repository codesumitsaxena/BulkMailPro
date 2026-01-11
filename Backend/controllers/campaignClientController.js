// controllers/campaignClientController.js
const CampaignClient = require('../models/CampaignClient');

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const clientId = await CampaignClient.create(req.body);
    const client = await CampaignClient.findById(clientId);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
};

// Bulk create clients
exports.bulkCreateClients = async (req, res) => {
  try {
    const { clients } = req.body;
    
    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Clients array is required and must not be empty'
      });
    }
    
    const result = await CampaignClient.bulkCreate(clients);
    
    res.status(201).json({
      success: true,
      message: `${result.affectedRows} clients created successfully`,
      data: {
        inserted: result.affectedRows,
        insertId: result.insertId
      }
    });
  } catch (error) {
    console.error('Error bulk creating clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating clients',
      error: error.message
    });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await CampaignClient.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
};

// Get all clients for a campaign
exports.getClientsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const options = {
      is_email_valid: req.query.is_email_valid,
      limit: req.query.limit,
      offset: req.query.offset
    };
    
    const clients = await CampaignClient.findByCampaignId(campaignId, options);
    const count = await CampaignClient.getCountByCampaign(campaignId);
    
    res.json({
      success: true,
      data: {
        clients,
        total: count,
        returned: clients.length
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

// Get clients by row range
exports.getClientsByRowRange = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { start_row, end_row } = req.query;
    
    if (!start_row || !end_row) {
      return res.status(400).json({
        success: false,
        message: 'start_row and end_row query parameters are required'
      });
    }
    
    const clients = await CampaignClient.findByRowRange(
      campaignId,
      parseInt(start_row),
      parseInt(end_row)
    );
    
    res.json({
      success: true,
      data: {
        clients,
        count: clients.length,
        range: { start_row, end_row }
      }
    });
  } catch (error) {
    console.error('Error fetching clients by row range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients by row range',
      error: error.message
    });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const updated = await CampaignClient.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or no changes made'
      });
    }
    
    const client = await CampaignClient.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
};

// Validate email
exports.validateEmail = async (req, res) => {
  try {
    const { is_valid } = req.body;
    
    if (is_valid === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_valid field is required'
      });
    }
    
    const updated = await CampaignClient.validateEmail(req.params.id, is_valid);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Email validation status updated',
      data: { is_valid }
    });
  } catch (error) {
    console.error('Error validating email:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating email',
      error: error.message
    });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const deleted = await CampaignClient.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
};

// Get client count
exports.getClientCount = async (req, res) => {
  try {
    const count = await CampaignClient.getCountByCampaign(req.params.campaignId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching client count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client count',
      error: error.message
    });
  }
};