const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  uploadFileHandler,
  generateImageHandler,
  listMedia,
  deleteMediaHandler,
} = require('../controllers/media.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listMedia);
router.post('/upload', upload.single('file'), uploadFileHandler);
router.post('/generate-image', generateImageHandler);
router.delete('/:id', deleteMediaHandler);

module.exports = router;
