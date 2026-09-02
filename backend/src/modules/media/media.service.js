import crypto from "crypto";
import { getPresignedUploadUrl, getS3Url, deleteS3Object } from "../../lib/s3.js";
import * as mediaRepository from "./media.repository.js";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function getMedia(userId, page = 1, search = "", type = "", source = "") {
  const limit = 24;
  const skip = (page - 1) * limit;
  const query = {
    userId,
    deletedAt: null,
    ...(search ? { originalName: { $regex: search, $options: "i" } } : {}),
    ...(type && type !== "all" ? { type } : {}),
    ...(source && source !== "all" ? { source } : {}),
  };

  const { media, total } = await mediaRepository.findMedia(query, skip, limit);

  const mediaWithUrls = await Promise.all(
    media.map(async (m) => {
      const obj = m.toObject();
      obj.path = await getS3Url(m.key);
      return obj;
    }),
  );

  return { media: mediaWithUrls, total, page, pages: Math.ceil(total / limit) };
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

export { getMedia, getUploadUrl, saveMediaMetadata, deleteMediaPermanently };
