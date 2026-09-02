import {
  getMedia,
  deleteMediaPermanently,
  getUploadUrl,
  saveMediaMetadata,
} from './media.service.js';
import { generateImage } from '../../services/ai.service.js';
import { uploadToS3 } from '../../lib/s3.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.util.js';
import { AppError } from '../../utils/appError.util.js';
import { parseQueryPagination } from '../../utils/pagination.util.js';

async function getUploadUrlHandler(req, res) {
  const { fileName, contentType, fileSize } = req.body;
  const result = await getUploadUrl(req.user._id, { fileName, contentType, fileSize });
  sendSuccess(res, result);
}

async function saveMetadataHandler(req, res) {
  const { key, originalName, contentType, fileSize, source } = req.body;
  const media = await saveMediaMetadata(req.user._id, { key, originalName, contentType, fileSize, source });
  sendSuccess(res, { media }, 201);
}

async function generateImageHandler(req, res) {
  const { prompt, vertical = false } = req.body;
  if (!prompt) return sendError(res, new AppError('prompt is required', 400, "BAD_REQUEST"));

  const base64 = await generateImage(prompt, !!vertical);
  
  // Save AI-generated image to S3 and database
  const imageBuffer = Buffer.from(base64, 'base64');
  const key = `users/${req.user._id}/images/ai-${Date.now()}.png`;
  
  await uploadToS3(key, imageBuffer, 'image/png');
  
  const media = await saveMediaMetadata(req.user._id, {
    key,
    originalName: `ai-${prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}.png`,
    contentType: 'image/png',
    fileSize: imageBuffer.length,
    source: 'ai',
  });

  const { getS3Url } = await import('../../lib/s3.js');
  const path = await getS3Url(key);

  sendSuccess(res, { media: { ...media.toObject(), path } });
}

const ALLOWED_SORT_FIELDS = ['createdAt', 'originalName'];

async function listMedia(req, res) {
  const query = parseQueryPagination(req.query, ALLOWED_SORT_FIELDS);
  const result = await getMedia(req.user._id, query);
  sendPaginated(res, result.media, result.total, query.page, query.pageSize);
}

async function deleteMediaHandler(req, res) {
  await deleteMediaPermanently(req.user._id, req.params.id);
  sendSuccess(res, { success: true });
}

export {
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
  getUploadUrlHandler,
  saveMetadataHandler,
};
