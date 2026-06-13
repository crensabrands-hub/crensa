import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { videos, users, creatorProfiles } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import {
  uploadVideoToBunny,
  uploadThumbnailToBunny,
  buildThumbnailPath,
  getBunnyVideo,
} from "@/lib/services/bunnyService";

export const maxDuration = 300; // 5 minutes
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB (Bunny handles large files fine)
const ALLOWED_FORMATS = ["mp4", "webm", "mov", "avi"];

// Aspect-ratio → thumbnail dimensions map
const THUMBNAIL_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "9:16":  { width: 360,  height: 640  },
  "1:1":   { width: 480,  height: 480  },
  "4:5":   { width: 384,  height: 480  },
  "5:4":   { width: 480,  height: 384  },
  "3:2":   { width: 480,  height: 320  },
  "2:3":   { width: 320,  height: 480  },
  "16:9":  { width: 640,  height: 360  },
};

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user || user.role !== "creator") {
      return NextResponse.json(
        { error: "Only creators can upload videos" },
        { status: 403 }
      );
    }

    // Validate Bunny config
    if (
      !process.env.BUNNY_STREAM_LIBRARY_ID ||
      !process.env.BUNNY_STREAM_API_KEY ||
      !process.env.BUNNY_STREAM_CDN_HOSTNAME
    ) {
      console.error("Missing Bunny Stream configuration");
      return NextResponse.json(
        { error: "Video upload service is not configured properly" },
        { status: 500 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Failed to parse upload data. File may be too large." },
        { status: 413 }
      );
    }

    const videoFile = formData.get("video") as File;
    const metadataStr = formData.get("metadata") as string;

    if (!videoFile || !metadataStr) {
      return NextResponse.json(
        { error: "Video file and metadata are required" },
        { status: 400 }
      );
    }

    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    const fileExtension = videoFile.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid format. Allowed: ${ALLOWED_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    let metadata: any;
    try {
      metadata = JSON.parse(metadataStr);
    } catch {
      return NextResponse.json({ error: "Invalid metadata format" }, { status: 400 });
    }

    if (!metadata.title || !metadata.category || metadata.coinPrice === undefined) {
      return NextResponse.json(
        { error: "Title, category, and coin price are required" },
        { status: 400 }
      );
    }

    const coinPrice = Number(metadata.coinPrice);
    if (isNaN(coinPrice) || !Number.isInteger(coinPrice) || coinPrice < 0 || coinPrice > 2000) {
      return NextResponse.json(
        { error: "Coin price must be a whole number between 0 and 2000" },
        { status: 400 }
      );
    }

    const validAspectRatios = ["1:1", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4"];
    if (metadata.aspectRatio && !validAspectRatios.includes(metadata.aspectRatio)) {
      return NextResponse.json({ error: "Invalid aspect ratio" }, { status: 400 });
    }

    // Read file into buffer
    const chunks: Uint8Array[] = [];
    const reader = videoFile.stream().getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

    // ── Upload video to Bunny Stream ──
    const { videoId: bunnyVideoId, playbackUrl, directUrl } =
      await uploadVideoToBunny(metadata.title.trim(), buffer);

    // Fetch duration from Bunny (may still be processing; use 0 as fallback)
    let duration = 0;
    try {
      const bunnyMeta = await getBunnyVideo(bunnyVideoId);
      duration = Math.round(bunnyMeta.length || 0);
    } catch {
      // non-fatal — video is still uploading/encoding
    }

    // ── Generate & upload thumbnail to Bunny Storage ──
    const aspectRatio = (metadata.aspectRatio || "16:9") as string;
    const { width, height } = THUMBNAIL_DIMENSIONS[aspectRatio] ?? THUMBNAIL_DIMENSIONS["16:9"];

    // Use Bunny Stream's auto-generated thumbnail URL for the source
    const bunnyAutoThumb = `https://${process.env.BUNNY_STREAM_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`;

    let thumbnailUrl = bunnyAutoThumb; // fallback if storage upload fails
    try {
      const thumbPath = buildThumbnailPath(user.id);
      const thumbRes = await fetch(bunnyAutoThumb);
      if (thumbRes.ok) {
        const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
        const uploaded = await uploadThumbnailToBunny(thumbPath, thumbBuffer, "image/jpeg");
        thumbnailUrl = uploaded.thumbnailUrl;
      }
    } catch {
      // non-fatal; use Bunny auto-thumb CDN URL
    }

    // ── Persist to database ──
    const [newVideo] = await db
      .insert(videos)
      .values({
        creatorId: user.id,
        title: metadata.title.trim(),
        description: metadata.description?.trim() || null,
        videoUrl: playbackUrl,         // HLS URL
        thumbnailUrl,
        bunnyVideoId,                  // store GUID for future management
        duration,
        creditCost: (coinPrice / 20).toFixed(2),
        coinPrice,
        category: metadata.category,
        tags: metadata.tags || [],
        aspectRatio: (metadata.aspectRatio || "16:9") as any,
        viewCount: 0,
        totalEarnings: "0.00",
        isActive: true,
      })
      .returning();

    // Update creator video count
    const [profile] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, user.id))
      .limit(1);

    if (profile) {
      await db
        .update(creatorProfiles)
        .set({ videoCount: profile.videoCount + 1, updatedAt: new Date() })
        .where(eq(creatorProfiles.userId, user.id));
    }

    return NextResponse.json({
      success: true,
      video: { ...newVideo, createdAt: new Date(newVideo.createdAt), updatedAt: new Date(newVideo.updatedAt) },
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload video. Please try again." },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
