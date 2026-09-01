/**
 * Media Service
 *
 * Extracted and simplified from:
 *   libraries/nestjs-libraries/src/upload/local.storage.ts
 *   apps/backend/src/api/routes/media.controller.ts
 *
 * Handles file uploads to local filesystem.
 * Files are stored in: ./uploads/YYYY/MM/DD/<random>.<ext>
 * Public URL: FRONTEND_URL/uploads/YYYY/MM/DD/<random>.<ext>
 *
 * Optional: Add Cloudflare R2 / AWS S3 support by replacing the
 * uploadFile() method with your cloud provider SDK calls.
 *
 * npm install: file-type
 */

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Media } from '../models/index.js';
import env from '../config/env.config.js';
import { getPresignedUploadUrl, deleteS3Object, getS3PublicUrl } from '../utils/s3.js';

// Allowed MIME types (matches original local.storage.ts allow-list)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'image/tiff',
  'video/mp4',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
]);

const UPLOAD_DIR = env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// ─── Upload to local filesystem ───────────────────────────────────────────────

/**
 * Saves a file buffer to the local filesystem.
 * Detects MIME type from buffer bytes (never trusts the client-reported type).
 *
 * Source: local.storage.ts → uploadFile()
 *
 * @param {Express.Multer.File} file - Multer file object (from memory storage)
 * @returns {{ filename, path, mimetype, originalname }}
 */
async function uploadFile(file) {
  // Dynamically import file-type (ESM-only package in newer versions)
  const { fileTypeFromBuffer } = await import('file-type');

  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new Error(`Unsupported file type: ${detected?.mime || 'unknown'}`);
  }

  const safeExt = `.${detected.ext}`;
  const safeMime = detected.mime;

  const { dirPath, innerPath } = getUploadPath();
  fs.mkdirSync(dirPath, { recursive: true });

  const randomName = generateRandomName();
  const filename = `${randomName}${safeExt}`;
  const filePath = path.join(dirPath, filename);
  const publicPath = `${innerPath}/${filename}`;

  fs.writeFileSync(filePath, file.buffer);

  return {
    filename,
    path: `${env.FRONTEND_URL}/uploads${publicPath}`,
    mimetype: safeMime,
    originalname: filename,
  };
}

// ─── Save media record to DB ───────────────────────────────────────────────────

/**
 * Saves a file record to the Media collection.
 *
 * @param {string} userId
 * @param {string} name        - Internal filename
 * @param {string} publicUrl   - Public URL to access the file
 * @param {string} originalName - Original filename from user
 * @param {'image'|'video'} type
 */
async function saveMedia(userId, name, publicUrl, originalName, type = 'image') {
  const media = await Media.create({
    userId,
    name,
    originalName: originalName || name,
    path: publicUrl,
    type,
  });
  return media;
}

// ─── List user media ──────────────────────────────────────────────────────────

/**
 * Gets paginated media for a user.
 */
async function getMedia(userId, page = 1, search = '') {
  const limit = 24;
  const skip = (page - 1) * limit;
  const query = {
    userId,
    deletedAt: null,
    ...(search ? { originalName: { $regex: search, $options: 'i' } } : {}),
  };

  const [media, total] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Media.countDocuments(query),
  ]);

  return { media, total, page, pages: Math.ceil(total / limit) };
}

/**
 * Soft-deletes a media record.
 */
async function deleteMedia(userId, mediaId) {
  return Media.findOneAndUpdate(
    { _id: mediaId, userId },
    { deletedAt: new Date() },
    { new: true }
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUploadPath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const innerPath = `/${year}/${month}/${day}`;
  const dirPath = path.join(UPLOAD_DIR, innerPath);
  return { dirPath, innerPath };
}

function generateRandomName() {
  return Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
}

// ─── S3 Presigned URL ─────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Generates a presigned S3 upload URL for the frontend to upload directly.
 *
 * @param {string} userId
 * @param {{ fileName: string, contentType: string, fileSize: number }} params
 * @returns {{ presignedUrl: string, key: string, url: string }}
 */
async function getUploadUrl(userId, { fileName, contentType, fileSize }) {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}`);
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  const ext = contentType.split('/')[1] || 'jpg';
  const uniqueId = crypto.randomUUID();
  const key = `users/${userId}/images/${uniqueId}.${ext}`;

  const presignedUrl = await getPresignedUploadUrl(key, contentType);
  const url = getS3PublicUrl(key);

  return { presignedUrl, key, url };
}

/**
 * Saves image metadata after successful S3 upload.
 *
 * @param {string} userId
 * @param {{ key: string, url: string, originalName: string, contentType: string, fileSize: number }} params
 */
async function saveMediaMetadata(userId, { key, url, originalName, contentType, fileSize }) {
  const type = contentType.startsWith('video') ? 'video' : 'image';

  const media = await Media.create({
    userId,
    name: key.split('/').pop(),
    originalName,
    path: url,
    type,
    fileSize,
    key,
  });

  return media;
}

/**
 * Hard-deletes a media record and its S3 object.
 *
 * @param {string} userId
 * @param {string} mediaId
 */
async function deleteMediaPermanently(userId, mediaId) {
  const media = await Media.findOne({ _id: mediaId, userId });
  if (!media) {
    throw new Error('Media not found');
  }

  if (media.key) {
    await deleteS3Object(media.key);
  }

  await Media.findByIdAndDelete(mediaId);

  return media;
}

export {
  uploadFile,
  saveMedia,
  getMedia,
  deleteMedia,
  getUploadUrl,
  saveMediaMetadata,
  deleteMediaPermanently,
};
