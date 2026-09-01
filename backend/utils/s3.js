import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../config/env.config.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.AWS_S3_BUCKET;
const PRESIGNED_URL_EXPIRY = 300; // 5 minutes

/**
 * Generates a presigned URL for uploading a file to S3.
 *
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_URL_EXPIRY });
}

/**
 * Deletes an object from S3.
 *
 * @param {string} key - S3 object key
 */
export async function deleteS3Object(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Returns the public URL for an S3 object.
 *
 * @param {string} key - S3 object key
 * @returns {string} Public URL
 */
export function getS3PublicUrl(key) {
  return `https://${BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
