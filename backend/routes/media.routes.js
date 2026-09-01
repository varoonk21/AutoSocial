import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import {
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
  getUploadUrlHandler,
  saveMetadataHandler,
} from '../controllers/media.controller.js';
import { uploadUrlSchema, saveMetadataSchema, mediaIdParamSchema } from '../validations/media.validation.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listMedia);
router.post('/upload-url', validateBody(uploadUrlSchema), getUploadUrlHandler);
router.post('/', validateBody(saveMetadataSchema), saveMetadataHandler);
router.post('/generate-image', generateImageHandler);
router.delete('/:id', validateParams(mediaIdParamSchema), deleteMediaHandler);

export default router;
