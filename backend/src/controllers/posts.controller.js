import { Post, Integration } from '../models/index.js';
import { makeId } from '../utils/makeId.js';
import { schedulePost, removeScheduledJobs } from '../services/scheduler.service.js';
import { logger } from '../utils/logger.util.js';

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

async function createPost(req, res) {
  try {
    const { type = 'schedule', date, posts: rawPosts } = req.body;

    if (!rawPosts || !Array.isArray(rawPosts) || rawPosts.length === 0) {
      return res.status(400).json({ error: 'At least one post is required' });
    }

    const publishDate = type === 'now' ? new Date() : (date ? new Date(date) : null);
    if (type !== 'draft' && !publishDate) {
      return res.status(400).json({ error: 'A publish date is required for scheduled posts' });
    }

    // Validate integrations only for non-draft posts
    if (type !== 'draft') {
      const integrationIds = [...new Set(rawPosts.filter(p => p.integrationId).map((p) => p.integrationId))];
      if (integrationIds.length > 0) {
        const integrations = await Integration.find({
          _id: { $in: integrationIds },
          userId: req.user._id,
        });
        if (integrations.length !== integrationIds.length) {
          return res.status(403).json({ error: 'One or more integrations are invalid' });
        }
      }
    }

    const group = makeId(8);
    const state = type === 'draft' ? 'DRAFT' : 'QUEUE';

    const createdPosts = [];
    let parentPostId = null;

    for (const rawPost of rawPosts) {
      const postData = {
        userId: req.user._id,
        content: rawPost.content || '',
        publishDate: publishDate || new Date(),
        state,
        group,
        settings: JSON.stringify(rawPost.settings || {}),
        image: JSON.stringify(rawPost.media || []),
        parentPostId,
      };
      if (rawPost.integrationId) {
        postData.integrationId = rawPost.integrationId;
      }

      const post = await Post.create(postData);

      if (!parentPostId) parentPostId = post._id;
      createdPosts.push(post);
    }

    if (type === 'now') {
      // Schedule for immediate execution
      await schedulePost(group, new Date());
    } else if (type === 'schedule' && publishDate) {
      // Schedule for future execution
      await schedulePost(group, publishDate);
    }

    res.status(201).json({ posts: createdPosts, group });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

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
    if (req.body.state !== undefined) updates.state = req.body.state;

    const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });

    // If rescheduling (changing date on a QUEUE post), update the Agenda job
    if (date && post.state === 'QUEUE') {
      await removeScheduledJobs(post.group);
      await schedulePost(post.group, new Date(date));
    }

    res.json({ post: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deletePost(req, res) {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Remove any scheduled Agenda jobs for this group
    if (post.state === 'QUEUE') {
      await removeScheduledJobs(post.group);
    }

    await Post.deleteMany({ group: post.group, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export { listPosts, getPost, createPost, updatePost, deletePost };
