import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  generatePostsHandler,
  separatePostsHandler,
} from '../controllers/posts.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/ai/generate', generatePostsHandler);
router.post('/ai/separate', separatePostsHandler);

export default router;
