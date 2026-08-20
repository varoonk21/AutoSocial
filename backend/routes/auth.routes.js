const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { registerHandler, loginHandler, logoutHandler, meHandler } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', requireAuth, logoutHandler);
router.get('/me', requireAuth, meHandler);

module.exports = router;
