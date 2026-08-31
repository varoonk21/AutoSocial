import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { registerHandler, loginHandler, logoutHandler, meHandler } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', requireAuth, logoutHandler);
router.get('/me', requireAuth, meHandler);

export default router;
