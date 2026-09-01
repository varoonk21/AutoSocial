/**
 * Media Controller
 * Extracted from: apps/backend/src/api/routes/media.controller.ts
 */

import {
  getMedia,
  deleteMediaPermanently,
  getUploadUrl,
  saveMediaMetadata,
} from '../services/media.service.js';
import { generateImage } from '../services/ai.service.js';

async function getUploadUrlHandler(req, res) {
  try {
    const { fileName, contentType, fileSize } = req.body;
    if (!fileName || !contentType || !fileSize) {
      return res.status(400).json({ error: 'fileName, contentType, and fileSize are required' });
    }

    const result = await getUploadUrl(req.user._id, { fileName, contentType, fileSize });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function saveMetadataHandler(req, res) {
  try {
    const { key, url, originalName, contentType, fileSize } = req.body;
    if (!key || !url || !originalName || !contentType || !fileSize) {
      return res.status(400).json({ error: 'key, url, originalName, contentType, and fileSize are required' });
    }

    const media = await saveMediaMetadata(req.user._id, { key, url, originalName, contentType, fileSize });
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
    res.json({ output: `data:image/png;base64,${base64}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listMedia(req, res) {
  try {
    const { page = 1, search = '' } = req.query;
    const result = await getMedia(req.user._id, Number(page), search);
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
