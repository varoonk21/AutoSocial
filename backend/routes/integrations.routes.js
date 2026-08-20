const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  listIntegrations,
  getOAuthUrl,
  oauthCallback,
  getPages,
  savePage,
  deleteIntegration,
  toggleDisable,
} = require('../controllers/integrations.controller');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/list', listIntegrations);
router.get('/social/:provider', getOAuthUrl);
router.get('/social/:provider/callback', oauthCallback);
router.get('/social/:provider/pages', getPages);
router.post('/social/:provider/page', savePage);
router.delete('/:id', deleteIntegration);
router.put('/:id/disable', toggleDisable);

module.exports = router;
