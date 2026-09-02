import {
  getMedia,
  deleteMediaPermanently,
  getUploadUrl,
  saveMediaMetadata,
} from './media.service.js';
import { generateImage } from '../../services/ai.service.js';
import { uploadToS3 } from '../../lib/s3.js';

async function getUploadUrlHandler(req, res) {
  const { fileName, contentType, fileSize } = req.body;
  const result = await getUploadUrl(req.user._id, { fileName, contentType, fileSize });
  res.json(result);
}

async function saveMetadataHandler(req, res) {
  const { key, originalName, contentType, fileSize, source } = req.body;
  const media = await saveMediaMetadata(req.user._id, { key, originalName, contentType, fileSize, source });
  res.status(201).json({ media });
}

async function generateImageHandler(req, res) {
  const { prompt, vertical = false } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

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

  res.json({ media: { ...media.toObject(), path } });
}

async function listMedia(req, res) {
  const { page = 1, search = '', type = '', source = '' } = req.query;
  const result = await getMedia(req.user._id, Number(page), search, type, source);
  res.json(result);
}

async function deleteMediaHandler(req, res) {
  await deleteMediaPermanently(req.user._id, req.params.id);
  res.json({ success: true });
}

export {
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
  getUploadUrlHandler,
  saveMetadataHandler,
};
