import { ExternalBlob } from '../backend';
import type { PortfolioImage, EventPhoto } from '../backend';

/**
 * Converts a PortfolioImage's filename field to a displayable URL.
 *
 * The filename field stores either:
 * - A persistent IC blob storage HTTP URL (from backend-returned ExternalBlob.getDirectURL())
 * - A blob: URL (session-local, only valid in the uploading browser session)
 * - A data: URL (base64 encoded)
 * - A plain filename string (legacy, no longer used)
 *
 * Returns null if no valid URL can be determined.
 */
export function getPortfolioImageSrc(image: PortfolioImage): string | null {
  const fn = image.filename;
  if (!fn) return null;
  if (fn.startsWith('http') || fn.startsWith('blob:') || fn.startsWith('data:')) {
    return fn;
  }
  return null;
}

/**
 * Converts an EventPhoto's blob to a displayable URL.
 *
 * Uses ExternalBlob.getDirectURL() which returns the IC canister's
 * persistent HTTP streaming URL for the stored blob.
 *
 * Returns null if the blob is missing or getDirectURL() throws.
 */
export function getEventPhotoSrc(photo: EventPhoto): string | null {
  try {
    if (!photo.blob) return null;
    return photo.blob.getDirectURL();
  } catch {
    return null;
  }
}

/**
 * Converts an ExternalBlob to a displayable URL.
 * Returns null if the blob is missing or getDirectURL() throws.
 */
export function getBlobSrc(blob: ExternalBlob | null | undefined): string | null {
  try {
    if (!blob) return null;
    return blob.getDirectURL();
  } catch {
    return null;
  }
}
