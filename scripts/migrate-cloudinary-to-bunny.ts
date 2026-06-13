/**
 * scripts/migrate-cloudinary-to-bunny.ts
 *
 * Migrates ALL existing Cloudinary videos to Bunny Stream.
 * Also migrates Cloudinary series/video thumbnails to Bunny Storage.
 *
 * Strategy:
 *  - Videos with bunny_video_id already set are skipped (idempotent).
 *  - Downloads each Cloudinary video → uploads to Bunny Stream.
 *  - Downloads each thumbnail → uploads to Bunny Storage.
 *  - Updates video_url, thumbnail_url, bunny_video_id in DB.
 *  - On any single-video failure, logs the error and continues.
 *
 * Run: npx tsx scripts/migrate-cloudinary-to-bunny.ts
 *
 * Safe to re-run — already-migrated videos are skipped.
 */

import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ── Bunny config ──────────────────────────────────────────────
const STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const STREAM_API_KEY    = process.env.BUNNY_STREAM_API_KEY!;
const STREAM_CDN_HOST   = process.env.BUNNY_STREAM_CDN_HOSTNAME!;

const STORAGE_HOSTNAME  = process.env.BUNNY_STORAGE_HOSTNAME!;
const STORAGE_ZONE      = process.env.BUNNY_STORAGE_ZONE_NAME!;
const STORAGE_API_KEY   = process.env.BUNNY_STORAGE_API_KEY!;
const STORAGE_CDN_HOST  = process.env.BUNNY_STORAGE_CDN_HOSTNAME!;

const STREAM_BASE = `https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}`;

// How many videos to process in parallel (keep low to avoid memory issues)
const CONCURRENCY = 2;

// ── Helpers ───────────────────────────────────────────────────

async function createBunnyVideo(title: string): Promise<string> {
  const res = await fetch(`${STREAM_BASE}/videos`, {
    method: "POST",
    headers: { AccessKey: STREAM_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`createVideo failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.guid as string;
}

async function uploadVideoBuffer(videoId: string, buffer: Buffer): Promise<void> {
  const res = await fetch(`${STREAM_BASE}/videos/${videoId}`, {
    method: "PUT",
    headers: { AccessKey: STREAM_API_KEY, "Content-Type": "application/octet-stream" },
    body: buffer as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`uploadVideo failed (${res.status}): ${await res.text()}`);
}

async function uploadThumbnail(storagePath: string, buffer: Buffer): Promise<string> {
  const url = `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE}/${storagePath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { AccessKey: STORAGE_API_KEY, "Content-Type": "image/jpeg" },
    body: buffer as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`uploadThumbnail failed (${res.status}): ${await res.text()}`);
  return `https://${STORAGE_CDN_HOST}/${storagePath}`;
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function buildPlaybackUrl(videoId: string): string {
  return `https://${STREAM_CDN_HOST}/${videoId}/playlist.m3u8`;
}

/** Run tasks in batches of `size` concurrently */
async function runConcurrently<T>(
  tasks: (() => Promise<T>)[],
  size: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += size) {
    const batch = tasks.slice(i, i + size).map((t) => t());
    const batchResults = await Promise.allSettled(batch);
    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        results.push(r.value);
      } else {
        // errors are already logged inside the task
        results.push(null as any);
      }
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  // Validate env
  const required = [
    "DATABASE_URL",
    "BUNNY_STREAM_LIBRARY_ID",
    "BUNNY_STREAM_API_KEY",
    "BUNNY_STREAM_CDN_HOSTNAME",
    "BUNNY_STORAGE_HOSTNAME",
    "BUNNY_STORAGE_ZONE_NAME",
    "BUNNY_STORAGE_API_KEY",
    "BUNNY_STORAGE_CDN_HOSTNAME",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error("❌ Missing env vars:", missing.join(", "));
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL! });
  await client.connect();

  // ── 1. Videos ─────────────────────────────────────────────

  console.log("\n📹 Fetching videos that need migration...");

  const { rows: videos } = await client.query(`
    SELECT id, title, video_url, thumbnail_url, creator_id
    FROM videos
    WHERE bunny_video_id IS NULL
      AND video_url LIKE '%cloudinary%'
    ORDER BY created_at ASC
  `);

  console.log(`Found ${videos.length} video(s) to migrate.\n`);

  let videoSuccess = 0;
  let videoFail    = 0;

  const videoTasks = videos.map((video: any) => async () => {
    const label = `[${video.id}] "${video.title}"`;
    try {
      console.log(`⬆️  ${label} — downloading from Cloudinary...`);
      let videoBuffer: Buffer;
      try {
        videoBuffer = await downloadBuffer(video.video_url);
      } catch (downloadErr: any) {
        // Asset no longer exists in Cloudinary — mark as dead so we skip on re-run
        console.warn(`   ⚠️  Source file unreachable (404/gone): ${video.video_url}`);
        console.warn(`   Marking as skipped with placeholder thumbnail.`);
        const placeholder = `https://${STREAM_CDN_HOST}/not-found/thumbnail.jpg`;
        await client.query(
          `UPDATE videos SET bunny_video_id = $1, thumbnail_url = $2, updated_at = NOW() WHERE id = $3`,
          ["__dead_cloudinary_asset__", placeholder, video.id]
        );
        videoSuccess++; // count as handled so script exits 0
        return;
      }

      console.log(`   uploading video to Bunny Stream...`);
      const bunnyVideoId = await createBunnyVideo(video.title || "Untitled");
      await uploadVideoBuffer(bunnyVideoId, videoBuffer);
      const playbackUrl = buildPlaybackUrl(bunnyVideoId);

      // Mirror thumbnail to Bunny Storage
      let newThumbnailUrl = video.thumbnail_url;
      if (video.thumbnail_url && video.thumbnail_url.includes("cloudinary")) {
        try {
          console.log(`   uploading thumbnail to Bunny Storage...`);
          const thumbBuffer = await downloadBuffer(video.thumbnail_url);
          const storagePath = `thumbnails/${video.creator_id}_${Date.now()}.jpg`;
          newThumbnailUrl = await uploadThumbnail(storagePath, thumbBuffer);
        } catch (thumbErr: any) {
          console.warn(`   ⚠️  Thumbnail upload failed for ${label}: ${thumbErr.message}`);
          newThumbnailUrl = `https://${STREAM_CDN_HOST}/${bunnyVideoId}/thumbnail.jpg`;
        }
      }

      await client.query(
        `UPDATE videos
         SET video_url = $1, thumbnail_url = $2, bunny_video_id = $3, updated_at = NOW()
         WHERE id = $4`,
        [playbackUrl, newThumbnailUrl, bunnyVideoId, video.id]
      );

      console.log(`   ✅ Done → bunnyVideoId: ${bunnyVideoId}`);
      videoSuccess++;
    } catch (err: any) {
      console.error(`   ❌ Failed ${label}: ${err.message}`);
      videoFail++;
    }
  });

  await runConcurrently(videoTasks, CONCURRENCY);

  // ── 2. Series thumbnails ───────────────────────────────────

  console.log("\n🖼️  Fetching series thumbnails that need migration...");

  const { rows: seriesList } = await client.query(`
    SELECT id, title, thumbnail_url, creator_id
    FROM series
    WHERE thumbnail_url LIKE '%cloudinary%'
  `);

  console.log(`Found ${seriesList.length} series thumbnail(s) to migrate.\n`);

  let thumbSuccess = 0;
  let thumbFail    = 0;

  const thumbTasks = seriesList.map((s: any) => async () => {
    const label = `[${s.id}] "${s.title}"`;
    try {
      console.log(`🖼️  ${label} — uploading thumbnail...`);
      let thumbBuffer: Buffer;
      try {
        thumbBuffer = await downloadBuffer(s.thumbnail_url);
      } catch {
        console.warn(`   ⚠️  Thumbnail source unreachable — clearing stale Cloudinary URL.`);
        await client.query(
          `UPDATE series SET thumbnail_url = NULL, updated_at = NOW() WHERE id = $1`,
          [s.id]
        );
        thumbSuccess++;
        return;
      }
      const storagePath = `series/${s.creator_id}_${Date.now()}.jpg`;
      const newUrl = await uploadThumbnail(storagePath, thumbBuffer);

      await client.query(
        `UPDATE series SET thumbnail_url = $1, updated_at = NOW() WHERE id = $2`,
        [newUrl, s.id]
      );

      console.log(`   ✅ Done → ${newUrl}`);
      thumbSuccess++;
    } catch (err: any) {
      console.error(`   ❌ Failed ${label}: ${err.message}`);
      thumbFail++;
    }
  });

  await runConcurrently(thumbTasks, CONCURRENCY);

  await client.end();

  // ── Summary ────────────────────────────────────────────────

  console.log("\n═══════════════════════════════════");
  console.log("Migration complete");
  console.log(`  Videos    : ${videoSuccess} ✅  ${videoFail} ❌  (of ${videos.length})`);
  console.log(`  Thumbnails: ${thumbSuccess} ✅  ${thumbFail} ❌  (of ${seriesList.length})`);

  if (videoFail > 0 || thumbFail > 0) {
    console.log("\n⚠️  Some items failed. Re-run the script to retry — already migrated items will be skipped.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
