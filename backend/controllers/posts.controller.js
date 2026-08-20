/**
 * Posts Controller
 * Extracted from: apps/backend/src/api/routes/posts.controller.ts
 */

const { Post, Integration } = require('../models');
const { makeId } = require('../utils/makeId');
const { generatePosts, generatePostsFromUrl, separatePosts } = require('../services/ai.service');
const { publishGroup } = require('../services/scheduler.service');

// ─── GET /posts ───────────────────────────────────────────────────────────────
// List all posts for the user with optional date range filter

async function listPosts(req, res) {
  try {
    const { from, to, state } = req.query;
    const query = { userId: req.user._id };

    if (from || to) {
      query.publishDate = {};
      if (from) query.publishDate.$gte = new Date(from);
      if (to) query.publishDate.$lte = new Date(to);
    }
    if (state) query.state = state;

    const posts = await Post.find(query)
      .populate('integrationId', 'name picture providerIdentifier profile')
      .sort({ publishDate: 1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /posts/:id ───────────────────────────────────────────────────────────

async function getPost(req, res) {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id }).populate(
      'integrationId',
      'name picture providerIdentifier profile'
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── POST /posts ──────────────────────────────────────────────────────────────
// Create one or more scheduled posts (possibly a thread across platforms)

async function createPost(req, res) {
  try {
    /**
     * Request body shape:
     * {
     *   type: 'schedule' | 'draft' | 'now',
     *   date: ISO date string,
     *   posts: [
     *     {
     *       integrationId: string,        // Which connected account to post to
     *       content: string,              // Post text
     *       settings: object,             // Platform-specific settings
     *       media: [{ path, type }],      // Media attachments
     *     },
     *     // ... additional posts = thread replies
     *   ]
     * }
     */
    const { type = 'schedule', date, posts: rawPosts } = req.body;

    if (!rawPosts || !Array.isArray(rawPosts) || rawPosts.length === 0) {
      return res.status(400).json({ error: 'At least one post is required' });
    }

    const publishDate = type === 'now' ? new Date() : (date ? new Date(date) : null);
    if (type !== 'draft' && !publishDate) {
      return res.status(400).json({ error: 'A publish date is required for scheduled posts' });
    }

    // Validate integrations belong to user
    const integrationIds = [...new Set(rawPosts.map((p) => p.integrationId))];
    const integrations = await Integration.find({
      _id: { $in: integrationIds },
      userId: req.user._id,
    });
    if (integrations.length !== integrationIds.length) {
      return res.status(403).json({ error: 'One or more integrations are invalid' });
    }

    // Group all posts under a shared group ID
    const group = makeId(8);
    const state = type === 'draft' ? 'DRAFT' : 'QUEUE';

    const createdPosts = [];
    let parentPostId = null;

    for (const rawPost of rawPosts) {
      const post = await Post.create({
        userId: req.user._id,
        integrationId: rawPost.integrationId,
        content: rawPost.content || '',
        publishDate: publishDate || new Date(),
        state,
        group,
        settings: JSON.stringify(rawPost.settings || {}),
        image: JSON.stringify(rawPost.media || []),
        parentPostId,
      });

      if (!parentPostId) parentPostId = post._id; // Set parent for thread replies
      createdPosts.push(post);
    }

    // If 'now' — publish immediately without waiting for scheduler
    if (type === 'now') {
      const populated = await Post.find({ group }).populate('integrationId');
      publishGroup(populated).catch((err) =>
        console.error('Immediate post failed:', err.message)
      );
    }

    res.status(201).json({ posts: createdPosts, group });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── PUT /posts/:id ───────────────────────────────────────────────────────────
// Update post content (only QUEUE/DRAFT posts)

async function updatePost(req, res) {
  try {
    const { content, date, settings, media } = req.body;
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!['QUEUE', 'DRAFT'].includes(post.state)) {
      return res.status(400).json({ error: 'Can only edit queued or draft posts' });
    }

    const updates = {};
    if (content !== undefined) updates.content = content;
    if (date) updates.publishDate = new Date(date);
    if (settings !== undefined) updates.settings = JSON.stringify(settings);
    if (media !== undefined) updates.image = JSON.stringify(media);

    const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ post: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── DELETE /posts/:id ────────────────────────────────────────────────────────

async function deletePost(req, res) {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Delete all posts in the same group (thread)
    await Post.deleteMany({ group: post.group, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── POST /posts/generate ─────────────────────────────────────────────────────
// AI-powered post generation from text or URL

async function generatePostsHandler(req, res) {
  try {
    const { content, url } = req.body;

    if (!content && !url) {
      return res.status(400).json({ error: 'Provide either content text or a URL' });
    }

    const suggestions = url
      ? await generatePostsFromUrl(url)
      : await generatePosts(content);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── POST /posts/separate ─────────────────────────────────────────────────────
// Split a long post into a thread using AI

async function separatePostsHandler(req, res) {
  try {
    const { content, len = 280 } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const result = await separatePosts(content, Number(len));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  generatePostsHandler,
  separatePostsHandler,
};
