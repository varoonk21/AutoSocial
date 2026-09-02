import {
  getMedia,
  deleteMediaPermanently,
  getUploadUrl,
  saveMediaMetadata,
} from './media.service.js';
import { generateImage } from '../../services/ai.service.js';
import { uploadToS3 } from '../../lib/s3.js';

async function getUploadUrlHandler(req, res) {
  try {
    const { fileName, contentType, fileSize } = req.body;
    const result = await getUploadUrl(req.user._id, { fileName, contentType, fileSize });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function saveMetadataHandler(req, res) {
  try {
    const { key, originalName, contentType, fileSize, source } = req.body;
    const media = await saveMediaMetadata(req.user._id, { key, originalName, contentType, fileSize, source });
    res.status(201).json({ media });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function generateImageHandler(req, res) {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listMedia(req, res) {
  try {
    const { page = 1, search = '', type = '', source = '' } = req.query;
    const result = await getMedia(req.user._id, Number(page), search, type, source);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteMediaHandler(req, res) {
  try {
    await deleteMediaPermanently(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export {
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
  getUploadUrlHandler,
  saveMetadataHandler,
};
