/**
 * Checks if a file path ends with a given extension.
 * Extracted from: libraries/helpers/src/utils/has.extension.ts
 */
export function hasExtension(path, extension) {
  if (!path || typeof path !== 'string') return false;
  return path.toLowerCase().endsWith('.' + extension.toLowerCase());
}
