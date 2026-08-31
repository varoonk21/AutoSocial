/**
 * Database connection helper.
 * Connects to MongoDB using the DATABASE_URL env variable.
 */

import mongoose from 'mongoose';
import env from './env.config.js';


export async function connectDB() {

  try {
    await mongoose.connect(env.DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });
}