const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  generatePostsHandler,
  separatePostsHandler,
} = require('../controllers/posts.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/ai/generate', generatePostsHandler);
router.post('/ai/separate', separatePostsHandler);

module.exports = router;
