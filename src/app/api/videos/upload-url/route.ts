/**
 * POST /api/videos/upload-url
 *
 * Returns a pre-created Bunny Stream video slot (videoId) and the
 * direct PUT endpoint that the client can upload to without needing
 * to send the file through our Next.js server.
 *
 * Client flow:
 *   1. POST here → get { bunnyVideoId, uploadUrl, uploadHeaders }
 *   2. PUT the raw file to uploadUrl with uploadHeaders
 *   3. POST /api/videos/save with { bunnyVideoId, metadata }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { users } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import { createBunnyVideo } from "@/lib/services/bunnyService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (
      !process.env.BUNNY_STREAM_LIBRARY_ID ||
      !process.env.BUNNY_STREAM_API_KEY
    ) {
      return NextResponse.json(
        { error: "Video upload service is not configured properly" },
        { status: 500 }
      );
    }

    // Parse optional title from body (used to name the Bunny video slot)
    let title = `upload_${user.id}_${Date.now()}`;
    try {
      const body = await request.json().catch(() => ({}));
      if (body?.title) title = body.title;
    } catch { /* ignore */ }

    // Create the video slot in Bunny Stream
    const bunnyVideoId = await createBunnyVideo(title);

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey    = process.env.BUNNY_STREAM_API_KEY;

    return NextResponse.json({
      bunnyVideoId,
      // Client PUTs the raw file to this URL
      uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${bunnyVideoId}`,
      uploadHeaders: {
        AccessKey: apiKey,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error creating Bunny video slot:", error);
    return NextResponse.json(
      { error: "Failed to prepare upload. Please try again." },
      { status: 500 }
    );
  }
}
