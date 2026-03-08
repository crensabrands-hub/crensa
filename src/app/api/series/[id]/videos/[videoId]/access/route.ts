import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { seriesVideos, series, videos } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: seriesId, videoId } = await params;
    const body = await request.json();
    const { accessType, individualCoinPrice } = body;

    // Validate access type
    if (!["free", "paid", "series-only"].includes(accessType)) {
      return NextResponse.json(
        { success: false, error: "Invalid access type" },
        { status: 400 }
      );
    }

    // Validate coin price for paid videos
    if (accessType === "paid" && (!individualCoinPrice || individualCoinPrice <= 0)) {
      return NextResponse.json(
        { success: false, error: "Paid videos must have a valid coin price" },
        { status: 400 }
      );
    }

    // Verify series ownership
    const [seriesData] = await db
      .select({ creatorId: series.creatorId })
      .from(series)
      .where(eq(series.id, seriesId))
      .limit(1);

    if (!seriesData) {
      return NextResponse.json(
        { success: false, error: "Series not found" },
        { status: 404 }
      );
    }

    // Get user from database
    const { userRepository } = await import("@/lib/database/repositories/users");
    const user = await userRepository.findByClerkId(userId);

    if (!user || user.id !== seriesData.creatorId) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to edit this series" },
        { status: 403 }
      );
    }

    // Verify video exists in series
    const [seriesVideo] = await db
      .select()
      .from(seriesVideos)
      .where(
        and(
          eq(seriesVideos.seriesId, seriesId),
          eq(seriesVideos.videoId, videoId)
        )
      )
      .limit(1);

    if (!seriesVideo) {
      return NextResponse.json(
        { success: false, error: "Video not found in series" },
        { status: 404 }
      );
    }

    // Update access type
    await db
      .update(seriesVideos)
      .set({
        accessType: accessType as "free" | "paid" | "series-only",
        individualCoinPrice: accessType === "paid" ? individualCoinPrice : 0,
      })
      .where(eq(seriesVideos.id, seriesVideo.id));

    return NextResponse.json({
      success: true,
      message: "Video access type updated successfully",
      accessType,
      individualCoinPrice: accessType === "paid" ? individualCoinPrice : 0,
    });
  } catch (error) {
    console.error("Error updating video access type:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update video access type" },
      { status: 500 }
    );
  }
}
