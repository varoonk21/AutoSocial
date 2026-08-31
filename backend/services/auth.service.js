/**
 * Authentication Service
 *
 * Extracted and simplified from:
 *   apps/backend/src/services/auth/auth.service.ts
 *
 * Handles:
 *   - User registration with email/password
 *   - User login (email/password verification)
 *   - JWT token generation and verification
 *   - Password hashing with bcrypt
 *
 * What's removed:
 *   - OAuth provider support (Google, GitHub) — add back if needed
 *   - Organization/multi-tenant logic
 *   - Email activation flow
 *   - NestJS dependency injection
 *
 * npm install: jsonwebtoken bcryptjs
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import env from '../config/env.config.js';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const BCRYPT_ROUNDS = 12;

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Registers a new user with email and password.
 * Returns the JWT token on success.
 *
 * @param {{ email: string, password: string, name?: string }} data
 * @returns {{ user: object, token: string }}
 */
async function register(data) {
  const { email, password, name } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || email.split('@')[0],
    activated: true,
  });

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticates a user with email and password.
 * Returns the JWT token on success.
 *
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
async function login(data) {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password) {
    throw new Error('This account uses social login. Please sign in with the provider you used to register.');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  if (!user.activated) {
    throw new Error('Please activate your account before logging in');
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

// ─── JWT Utilities ─────────────────────────────────────────────────────────────

/**
 * Generates a signed JWT for the given user.
 * @param {object} user - Mongoose User document
 * @returns {string}
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifies and decodes a JWT.
 * @param {string} token
 * @returns {{ id: string, email: string }}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Looks up a user by their ID.
 * @param {string} userId
 * @returns {object|null}
 */
async function getUserById(userId) {
  return User.findById(userId).select('-password');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Removes sensitive fields before sending user data to the client.
 */
function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

export {
  register,
  login,
  generateToken,
  verifyToken,
  getUserById,
};
