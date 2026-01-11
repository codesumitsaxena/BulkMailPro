// routes/campaignClientRoutes.js
const express = require('express');
const router = express.Router();
const campaignClientController = require('../controllers/campaignClientController');

// ==========================================
// ⚠️ IMPORTANT: Route Order Matters!
// Specific routes MUST come BEFORE generic routes
// Otherwise :campaignId will catch "count" as an ID
// ==========================================

// Bulk create clients
router.post('/bulk', campaignClientController.bulkCreateClients);

// Get client count for a campaign (MUST be before /campaign/:campaignId)
router.get('/campaign/:campaignId/count', campaignClientController.getClientCount);

// Get clients by row range (MUST be before /campaign/:campaignId)
router.get('/campaign/:campaignId/range', campaignClientController.getClientsByRowRange);

// Get all clients for a campaign
router.get('/campaign/:campaignId', campaignClientController.getClientsByCampaign);

// Create single client
router.post('/', campaignClientController.createClient);

// Get single client by ID
router.get('/:id', campaignClientController.getClientById);

// Update client
router.put('/:id', campaignClientController.updateClient);

// Validate email
router.patch('/:id/validate', campaignClientController.validateEmail);

// Delete client
router.delete('/:id', campaignClientController.deleteClient);

module.exports = router;