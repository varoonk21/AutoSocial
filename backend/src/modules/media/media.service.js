import crypto from "crypto";
import { getPresignedUploadUrl, getS3Url, deleteS3Object } from "../../lib/s3.js";
import * as mediaRepository from "./media.repository.js";
import { toSkipTake } from "../../utils/pagination.util.js";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB (LinkedIn/IG accept large video files)

// video/quicktime uploads as .mov so providers detect it by extension
const EXTENSION_OVERRIDES = { "video/quicktime": "mov", "video/webm": "webm", "video/mp4": "mp4" };

async function getMedia(userId, queryParams) {
  const { page, pageSize, search = "", type = "", source = "", sort } = queryParams;
  const { skip, take: limit } = toSkipTake(page, pageSize);
  
  const query = {
    userId,
    deletedAt: null,
    ...(search ? { originalName: { $regex: search, $options: "i" } } : {}),
    ...(type && type !== "all" ? { type } : {}),
    ...(source && source !== "all" ? { source } : {}),
  };

  const sortParam = sort ? { [sort.field]: sort.direction === "desc" ? -1 : 1 } : { createdAt: -1 };

  const { media, total } = await mediaRepository.findMedia(query, skip, limit, sortParam);

  const mediaWithUrls = await Promise.all(
    media.map(async (m) => {
      const obj = m.toObject();
      obj.path = await getS3Url(m.key);
      return obj;
    }),
  );

  return { media: mediaWithUrls, total, limit };
}

async function getUploadUrl(userId, { fileName, contentType, fileSize }) {
  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  if (!ALLOWED_IMAGE_TYPES.has(contentType) && !isVideo) {
    throw new Error(`Unsupported file type: ${contentType}`);
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (fileSize > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  const ext = EXTENSION_OVERRIDES[contentType] || contentType.split("/")[1] || "jpg";
  const uniqueId = crypto.randomUUID();
  const folder = isVideo ? "videos" : "images";
  const key = `users/${userId}/${folder}/${uniqueId}.${ext}`;

  const presignedUrl = await getPresignedUploadUrl(key, contentType);

  return { presignedUrl, key };
}

async function saveMediaMetadata(userId, { key, originalName, contentType, fileSize, source = "user" }) {
  const type = contentType.startsWith("video") ? "video" : "image";

  const media = await mediaRepository.createMedia({
    userId,
    name: key.split("/").pop(),
    originalName,
    type,
    source,
    fileSize,
    key,
  });

  // Return the same library URL shape as GET /media so clients can use it directly
  const obj = media.toObject();
  obj.path = await getS3Url(key);
  return obj;
}

async function deleteMediaPermanently(userId, mediaId) {
  const media = await mediaRepository.findMediaByIdAndUser(mediaId, userId);
  if (!media) {
    throw new Error("Media not found");
  }

  if (media.key) {
    await deleteS3Object(media.key);
  }

  await mediaRepository.deleteMediaById(mediaId);

  return media;
}

async function renameMedia(userId, mediaId, originalName) {
  const media = await mediaRepository.findMediaByIdAndUser(mediaId, userId);
  if (!media) {
    throw new Error("Media not found");
  }

  const updated = await mediaRepository.updateMediaById(mediaId, userId, { originalName });
  return updated;
}

export { getMedia, getUploadUrl, saveMediaMetadata, deleteMediaPermanently, renameMedia };
