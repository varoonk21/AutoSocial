/**
 * Express Application Entry Point
 *
 * Sets up all middleware, routes, and starts the server.
 * Also starts the background post scheduler.
 *
 * Usage:
 *   npm install
 *   cp config/env.example .env
 *   # Fill in your .env values
 *   node server.js
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { startScheduler } from './services/scheduler.service.js';

import authRoutes from './routes/auth.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import postsRoutes from './routes/posts.routes.js';
import mediaRoutes from './routes/media.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Required for cookie auth
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/media', mediaRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Error Handler ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads served at http://localhost:${PORT}/uploads`);
  });

  // Start post scheduler (polls every 60 seconds)
  startScheduler(60 * 1000);
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
