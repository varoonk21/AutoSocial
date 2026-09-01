/**
 * Media Service
 *
 * Handles file uploads to AWS S3 via presigned URLs.
 * Files are stored in: users/{userId}/images/{uuid}.{ext}
 */

import crypto from 'crypto';
import { Media } from '../../models/index.js';
import { getPresignedUploadUrl, deleteS3Object, getS3PublicUrl } from '../../utils/s3.js';

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
  getMedia,
  getUploadUrl,
  saveMediaMetadata,
  deleteMediaPermanently,
};
