import { z } from 'zod';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
];

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1, 'fileName is required'),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    errorMap: () => ({ message: 'Unsupported file type. Allowed: JPEG, PNG, GIF, WebP, AVIF' }),
  }),
  fileSize: z.number().positive('fileSize must be positive').max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
});

export const saveMetadataSchema = z.object({
  key: z.string().min(1, 'key is required'),
  url: z.string().url('url must be a valid URL'),
  originalName: z.string().min(1, 'originalName is required'),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    errorMap: () => ({ message: 'Unsupported file type' }),
  }),
  fileSize: z.number().positive('fileSize must be positive').max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
});

export const mediaIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID'),
});
