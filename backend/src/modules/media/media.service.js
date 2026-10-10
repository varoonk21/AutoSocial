import { AppError } from "../../utils/appError.util.js";
import crypto from "crypto";
import { getPresignedUploadUrl, getS3Url, deleteS3Object } from "../../lib/s3.js";
import * as mediaRepository from "./media.repository.js";
import { toSkipTake } from "../../utils/pagination.util.js";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}`);
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit");
  }

  const ext = contentType.split("/")[1] || "jpg";
  const uniqueId = crypto.randomUUID();
  const key = `users/${userId}/images/${uniqueId}.${ext}`;

  const presignedUrl = await getPresignedUploadUrl(key, contentType);

  return { presignedUrl, key };
}

/**
 * S3 keys are namespaced per user (`users/<userId>/...`). The upload-URL
 * endpoint only issues keys under the caller's prefix, but the metadata
 * endpoint takes a client-supplied key — reject anything outside the caller's
 * own namespace or containing path traversal.
 */
function assertUserScopedKey(userId, key) {
  const prefix = `users/${userId}/`;
  if (typeof key !== "string" || !key.startsWith(prefix) || key.includes("..") || key.includes("\\")) {
    throw new AppError("Invalid media key: must be an upload key issued for your account", 400, "INVALID_MEDIA_KEY");
  }
}

async function saveMediaMetadata(userId, { key, originalName, contentType, fileSize, source = "user" }) {
  // The key is client-supplied: enforce that it lives under this user's own
  // prefix and contains no path traversal.
  assertUserScopedKey(userId, key);
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
