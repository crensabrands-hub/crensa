/**
 * Bunny Stream + Bunny Storage service
 *
 * Videos  → Bunny Stream  (library 681957, CDN: vz-b76ee301-edf.b-cdn.net)
 * Thumbnails → Bunny Storage (zone: crensa-thumbnails, CDN: crensa-thumbnails.b-cdn.net)
 *
 * Migration strategy:
 *  - New uploads go to Bunny.
 *  - Existing Cloudinary URLs are left untouched in the DB; they still play fine.
 *  - bunnyVideoId column (added by migration) identifies Bunny-hosted videos.
 */

// ─────────────────────────── Config ───────────────────────────

const STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const STREAM_API_KEY    = process.env.BUNNY_STREAM_API_KEY!;
const STREAM_CDN_HOST   = process.env.BUNNY_STREAM_CDN_HOSTNAME!; // vz-b76ee301-edf.b-cdn.net

const STORAGE_HOSTNAME  = process.env.BUNNY_STORAGE_HOSTNAME!;    // storage.bunnycdn.com
const STORAGE_ZONE      = process.env.BUNNY_STORAGE_ZONE_NAME!;   // crensa-thumbnails
const STORAGE_API_KEY   = process.env.BUNNY_STORAGE_API_KEY!;
const STORAGE_CDN_HOST  = process.env.BUNNY_STORAGE_CDN_HOSTNAME!; // crensa-thumbnails.b-cdn.net

const STREAM_BASE = `https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}`;

// ─────────────────────────── Types ────────────────────────────

export interface BunnyVideoUploadResult {
  /** Bunny video GUID – store this as bunnyVideoId in DB */
  videoId: string;
  /** HLS playback URL */
  playbackUrl: string;
  /** Direct MP4 fallback URL */
  directUrl: string;
}

export interface BunnyThumbnailUploadResult {
  /** Full CDN URL for the thumbnail */
  thumbnailUrl: string;
  /** Storage path (useful for deletion later) */
  storagePath: string;
}

// ─────────────────────── Stream helpers ───────────────────────

/**
 * Step 1 of 2 for video upload:
 * Create a video object in Bunny Stream and return the videoId.
 */
export async function createBunnyVideo(title: string): Promise<string> {
  const res = await fetch(`${STREAM_BASE}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: STREAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny Stream createVideo failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.guid as string;
}

/**
 * Step 2 of 2 for video upload:
 * PUT the raw video buffer into an existing Bunny video slot.
 */
export async function uploadBunnyVideoBuffer(
  videoId: string,
  buffer: Buffer,
): Promise<void> {
  const res = await fetch(`${STREAM_BASE}/videos/${videoId}`, {
    method: 'PUT',
    headers: {
      AccessKey: STREAM_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer.buffer as ArrayBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny Stream upload failed (${res.status}): ${text}`);
  }
}

/**
 * Full server-side video upload: create slot → upload buffer.
 * Returns playback URLs.
 */
export async function uploadVideoToBunny(
  title: string,
  buffer: Buffer,
): Promise<BunnyVideoUploadResult> {
  const videoId = await createBunnyVideo(title);
  await uploadBunnyVideoBuffer(videoId, buffer);
  return buildVideoUrls(videoId);
}

/**
 * Fetch video details from Bunny Stream (used for duration, status).
 */
export async function getBunnyVideo(videoId: string): Promise<any> {
  const res = await fetch(`${STREAM_BASE}/videos/${videoId}`, {
    headers: { AccessKey: STREAM_API_KEY },
  });
  if (!res.ok) throw new Error(`getBunnyVideo failed (${res.status})`);
  return res.json();
}

/**
 * Build the CDN playback URLs for a Bunny video GUID.
 * We use the HLS URL as the primary `videoUrl` stored in the DB.
 */
export function buildVideoUrls(videoId: string): BunnyVideoUploadResult {
  return {
    videoId,
    playbackUrl: `https://${STREAM_CDN_HOST}/${videoId}/playlist.m3u8`,
    directUrl:   `https://${STREAM_CDN_HOST}/${videoId}/play_720p.mp4`,
  };
}

/**
 * Returns an iframe embed URL for a Bunny video.
 * Useful for debug/admin pages.
 */
export function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${STREAM_LIBRARY_ID}/${videoId}`;
}

// ─────────────────────── Storage helpers ──────────────────────

/**
 * Upload a thumbnail (jpeg/png buffer) to Bunny Storage.
 * path example: "thumbnails/userId_timestamp.jpg"
 */
export async function uploadThumbnailToBunny(
  storagePath: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg',
): Promise<BunnyThumbnailUploadResult> {
  const url = `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${storagePath}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: STORAGE_API_KEY,
      'Content-Type': contentType,
    },
    body: buffer.buffer as ArrayBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny Storage upload failed (${res.status}): ${text}`);
  }

  return {
    thumbnailUrl: `https://${STORAGE_CDN_HOST}/${storagePath}`,
    storagePath,
  };
}

/**
 * Download a remote URL and re-upload it as a thumbnail in Bunny Storage.
 * Used by the migration script to move Cloudinary thumbnails.
 */
export async function mirrorThumbnailToBunny(
  remoteUrl: string,
  storagePath: string,
): Promise<BunnyThumbnailUploadResult> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to fetch remote thumbnail: ${remoteUrl}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return uploadThumbnailToBunny(storagePath, buffer, contentType);
}

/**
 * Generate a thumbnail storage path from a creator ID + timestamp.
 */
export function buildThumbnailPath(creatorId: string, suffix: string = ''): string {
  const ts = Date.now();
  return `thumbnails/${creatorId}_${ts}${suffix}.jpg`;
}

/**
 * Generate a series thumbnail storage path.
 */
export function buildSeriesThumbnailPath(creatorId: string): string {
  return `series/${creatorId}_${Date.now()}.jpg`;
}

// ─────────────────────── Utility ──────────────────────────────

/**
 * Returns true if a URL is a Bunny CDN URL (not Cloudinary).
 */
export function isBunnyUrl(url: string): boolean {
  return url.includes('b-cdn.net') || url.includes('bunnycdn.com');
}

/**
 * Returns true if a URL is a legacy Cloudinary URL.
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}
