import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
  getUploadUrlHandler,
  saveMetadataHandler,
} from '../controllers/media.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listMedia);
router.post('/upload-url', getUploadUrlHandler);
router.post('/', saveMetadataHandler);
router.post('/generate-image', generateImageHandler);
router.delete('/:id', deleteMediaHandler);

export default router;
