const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/templateController');

router.post('/', TemplateController.createTemplate);
router.get('/', TemplateController.getAllTemplates);
router.get('/:id', TemplateController.getTemplateById);
router.put('/:id', TemplateController.updateTemplate);
router.delete('/:id', TemplateController.deleteTemplate);

module.exports = router;