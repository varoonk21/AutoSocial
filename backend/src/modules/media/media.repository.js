import { Media } from '../../models/index.js';

async function findMedia(query, skip, limit) {
  const [media, total] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Media.countDocuments(query),
  ]);
  return { media, total };
}

async function createMedia(data) {
  return await Media.create(data);
}

async function findMediaByIdAndUser(mediaId, userId) {
  return await Media.findOne({ _id: mediaId, userId });
}

async function deleteMediaById(mediaId) {
  return await Media.findByIdAndDelete(mediaId);
}

export {
  findMedia,
  createMedia,
  findMediaByIdAndUser,
  deleteMediaById,
};
