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

  return media;
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
