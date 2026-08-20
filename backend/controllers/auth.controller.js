/**
 * Auth Controller
 * Extracted from: apps/backend/src/api/routes/auth.controller.ts
 */

const { register, login } = require('../services/auth.service');

async function registerHandler(req, res) {
  try {
    const { email, password, name } = req.body;
    const { user, token } = await register({ email, password, name });

    res.cookie('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;
    const { user, token } = await login({ email, password });

    res.cookie('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

function logoutHandler(req, res) {
  res.clearCookie('auth');
  res.json({ success: true });
}

function meHandler(req, res) {
  // req.user is set by requireAuth middleware
  res.json({ user: req.user });
}

module.exports = { registerHandler, loginHandler, logoutHandler, meHandler };
