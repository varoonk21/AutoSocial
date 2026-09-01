import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  uploadFileHandler,
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
  getUploadUrlHandler,
  saveMetadataHandler,
} from '../controllers/media.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listMedia);
router.post('/upload', upload.single('file'), uploadFileHandler);
router.post('/upload-url', getUploadUrlHandler);
router.post('/', saveMetadataHandler);
router.post('/generate-image', generateImageHandler);
router.delete('/:id', deleteMediaHandler);

export default router;
