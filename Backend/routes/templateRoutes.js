const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/templateController');

// Create template
router.post('/', TemplateController.createTemplate);

// Get all templates
router.get('/', TemplateController.getAllTemplates);

// Get template by ID
router.get('/:id', TemplateController.getTemplateById);

// Update template
router.put('/:id', TemplateController.updateTemplate);

// Delete template
router.delete('/:id', TemplateController.deleteTemplate);

module.exports = router;