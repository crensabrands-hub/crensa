# Bunny Stream Implementation

## Overview

Videos are hosted on **Bunny Stream** and thumbnails on **Bunny Storage**.
Legacy Cloudinary videos still work — they are never deleted, only replaced for new uploads.

---

## What Was Changed

### 1. New Service — `src/lib/services/bunnyService.ts`

Core abstraction over the Bunny APIs. Provides:

| Function | Purpose |
|---|---|
| `createBunnyVideo(title)` | Creates an empty video slot in Bunny Stream, returns GUID |
| `uploadBunnyVideoBuffer(videoId, buffer)` | PUTs raw video bytes into an existing slot |
| `uploadVideoToBunny(title, buffer)` | Combines both steps (server-side upload) |
| `getBunnyVideo(videoId)` | Fetches video metadata (duration, status) from Bunny |
| `buildVideoUrls(videoId)` | Builds HLS + MP4 CDN URLs from a GUID |
| `getBunnyEmbedUrl(videoId)` | Returns iframe embed URL for admin/debug use |
| `uploadThumbnailToBunny(path, buffer)` | Uploads image to Bunny Storage CDN |
| `mirrorThumbnailToBunny(remoteUrl, path)` | Downloads a remote image, re-uploads to Storage |
| `buildThumbnailPath(creatorId)` | Generates a unique storage path for a video thumbnail |
| `buildSeriesThumbnailPath(creatorId)` | Same, for series thumbnails |
| `isBunnyUrl(url)` / `isCloudinaryUrl(url)` | URL type detection helpers |

**Environment variables read:**

```
BUNNY_STREAM_LIBRARY_ID
BUNNY_STREAM_API_KEY
BUNNY_STREAM_CDN_HOSTNAME       # e.g. vz-b76ee301-edf.b-cdn.net

BUNNY_STORAGE_HOSTNAME          # storage.bunnycdn.com
BUNNY_STORAGE_ZONE_NAME         # crensa-thumbnails
BUNNY_STORAGE_API_KEY
BUNNY_STORAGE_CDN_HOSTNAME      # crensa-thumbnails.b-cdn.net
```

---

### 2. Database — `bunny_video_id` column

**Migration file:** `drizzle/0014_add_bunny_video_id.sql`

```sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS bunny_video_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS videos_bunny_video_id_idx ON videos (bunny_video_id);
```

**Schema (`src/lib/database/schema.ts`):**

```ts
// Bunny Stream video GUID — null for legacy Cloudinary videos
bunnyVideoId: varchar("bunny_video_id", { length: 255 }),
```

**Apply script:** `scripts/apply-bunny-migration.ts`

---

### 3. Upload API Routes

#### `POST /api/videos/upload-url` — `src/app/api/videos/upload-url/route.ts`

New route that enables **client-side direct upload** to Bunny (bypasses our server for the file bytes):

1. Authenticates the creator.
2. Calls `createBunnyVideo(title)` to create a video slot.
3. Returns `{ bunnyVideoId, uploadUrl, uploadHeaders }` to the client.

The client then PUTs the file directly to Bunny's CDN endpoint.

#### `POST /api/videos/save` — `src/app/api/videos/save/route.ts`

Called **after** the client finishes uploading to Bunny:

1. Accepts `{ bunnyVideoId, metadata }`.
2. Calls `buildVideoUrls(bunnyVideoId)` to get the HLS playback URL.
3. Fetches duration from Bunny via `getBunnyVideo()`.
4. Mirrors the auto-generated Bunny thumbnail to Bunny Storage.
5. Inserts the video row in the database with `bunnyVideoId`, `videoUrl` (HLS), `thumbnailUrl`.
6. Updates `creatorProfiles.videoCount`.
7. If `metadata.seriesId` is set, inserts into `seriesVideos` and updates series totals.

#### `POST /api/videos/upload` — `src/app/api/videos/upload/route.ts`

Legacy **server-side upload** route (file passes through Next.js server):

1. Reads the multipart file into a `Buffer`.
2. Calls `uploadVideoToBunny(title, buffer)` — full server-side pipeline.
3. Fetches duration from Bunny.
4. Mirrors thumbnail to Bunny Storage.
5. Saves the video record to the database.

> This route still works but is less efficient for large files. The preferred flow is `upload-url` + `save`.

---

### 4. Frontend Upload Components

#### `src/components/creator/VideoUpload.tsx`

Full upload form used on the creator upload page. Now uses the two-step Bunny flow:

```
POST /api/videos/upload-url  →  PUT file directly to Bunny  →  POST /api/videos/save
```

- Progress bar reflects actual XHR upload progress (0–90%), then "Processing" (90–100%).
- `xhr.timeout = 600000` (10 min) for large files.

#### `src/components/creator/SeriesVideoManager.tsx` — `VideoUploadForm`

Inline upload form inside the series manager. Uses the identical two-step Bunny flow with the `seriesId` included in the save payload so the video is automatically added to the series.

---

### 5. Video Player — HLS Compatibility Fix

**`src/components/watch/AspectRatioVideoPlayer.tsx`**

Bunny Stream stores the primary URL as an HLS playlist (`.m3u8`). Most browsers (except Safari) don't support HLS natively. A URL rewrite was added:

```ts
const resolvedVideoUrl = videoUrl.endsWith('.m3u8')
  ? videoUrl.replace('playlist.m3u8', 'play_720p.mp4')
  : videoUrl;
```

This swaps the HLS URL for Bunny's direct MP4 URL so every browser can play it without a JS HLS library.

The player also records watch sessions via `POST /api/watch/session` on play, pause, end, and page visibility change.

---

### 6. `next.config.js` — Image Domain Allowlist

Added Bunny CDN hostnames so `next/image` can serve Bunny-hosted thumbnails:

```js
{ hostname: "*.b-cdn.net" },
{ hostname: "vz-b76ee301-edf.b-cdn.net" },
{ hostname: "crensa-thumbnails.b-cdn.net" },
```

---

### 7. TypeScript Types — `src/types/index.ts`

Two new interfaces added:

```ts
interface BunnyUploadUrlResponse {
  bunnyVideoId: string;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
}

interface BunnyVideoSaveRequest {
  bunnyVideoId: string;
  metadata: VideoMetadata;
  duration?: number;
}
```

---

### 8. Migration Script — `scripts/migrate-cloudinary-to-bunny.ts`

One-shot idempotent script to migrate all existing Cloudinary content:

- Fetches all `videos` where `bunny_video_id IS NULL AND video_url LIKE '%cloudinary%'`.
- Downloads each video from Cloudinary → uploads to Bunny Stream.
- Downloads each thumbnail → uploads to Bunny Storage.
- Updates `video_url`, `thumbnail_url`, `bunny_video_id` in the database.
- Handles dead/404 Cloudinary assets gracefully (marks as `__dead_cloudinary_asset__`).
- Migrates series thumbnails separately.
- Concurrency: 2 parallel tasks to avoid OOM on large files.
- Safe to re-run; already-migrated rows are skipped.

```bash
npx tsx scripts/migrate-cloudinary-to-bunny.ts
```

---

### 9. `.env.local.example` Updated

Cloudinary keys marked as **LEGACY** with a note not to use them for new uploads. Bunny keys documented with example values.

---

## Upload Flow Summary

```
Creator selects file
       │
       ▼
POST /api/videos/upload-url
  → Bunny creates video slot
  → Returns { bunnyVideoId, uploadUrl, uploadHeaders }
       │
       ▼
PUT file directly to Bunny CDN (XHR with progress)
       │
       ▼
POST /api/videos/save
  → Bunny auto-thumbnail mirrored to Bunny Storage
  → Video row inserted in DB (bunnyVideoId, HLS URL)
  → Creator video count updated
  → Series updated (if seriesId provided)
```

---

## What Is Not Yet Implemented

- Native HLS playback via a JS library (e.g. hls.js) — currently falls back to direct MP4. Safari users get HLS automatically.
- Bunny video deletion when a creator deletes a video (currently only the DB row is removed).
- Admin UI showing Bunny embed URLs (the `getBunnyEmbedUrl` helper exists but is unused in the UI).
- Webhook from Bunny to update `duration` once encoding completes (currently fetched immediately, may return 0 if still encoding).
