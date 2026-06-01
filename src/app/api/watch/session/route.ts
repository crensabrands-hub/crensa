import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/database/connection';
import { watchSessions, videos } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { userRepository } from '@/lib/database/repositories';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, durationSeconds, completed } = body;

    if (!videoId || typeof durationSeconds !== 'number' || durationSeconds < 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify the video exists
    const video = await db
      .select({ id: videos.id })
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    if (!video.length) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Resolve user ID if authenticated — anonymous sessions are allowed
    let userId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const user = await userRepository.findByClerkId(clerkId);
        userId = user?.id ?? null;
      }
    } catch {
      // Non-fatal — proceed as anonymous
    }

    await db.insert(watchSessions).values({
      videoId,
      userId,
      durationSeconds: Math.round(durationSeconds),
      completed: completed === true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watch session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
