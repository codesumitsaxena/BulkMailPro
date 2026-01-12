const express = require('express');
const router = express.Router();
const campaignClientController = require('../controllers/campaignClientController');


router.post('/bulk', campaignClientController.bulkCreateClients);
router.get('/campaign/:campaignId/count', campaignClientController.getClientCount);
router.get('/campaign/:campaignId/range', campaignClientController.getClientsByRowRange);
router.get('/campaign/:campaignId', campaignClientController.getClientsByCampaign);
router.post('/', campaignClientController.createClient);
router.get('/:id', campaignClientController.getClientById);
router.put('/:id', campaignClientController.updateClient);
router.patch('/:id/validate', campaignClientController.validateEmail);
router.delete('/:id', campaignClientController.deleteClient);

module.exports = router;