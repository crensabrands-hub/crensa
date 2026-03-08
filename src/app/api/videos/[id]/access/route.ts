import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { videoAccessService } from "@/lib/services/videoAccessService";
import { userRepository } from "@/lib/database/repositories/users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: videoId } = await params;
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("seriesId");

    if (!seriesId) {
      return NextResponse.json(
        { success: false, error: "Series ID is required" },
        { status: 400 }
      );
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const accessResult = await videoAccessService.checkVideoAccess(
      user.id,
      videoId,
      seriesId
    );

    return NextResponse.json({
      success: true,
      ...accessResult,
    });
  } catch (error) {
    console.error("Error checking video access:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check video access" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: videoId } = await params;
    const body = await request.json();
    const { seriesId, creatorId } = body;

    if (!seriesId || !creatorId) {
      return NextResponse.json(
        { success: false, error: "Series ID and Creator ID are required" },
        { status: 400 }
      );
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const result = await videoAccessService.purchaseVideo(
      user.id,
      videoId,
      seriesId,
      creatorId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error purchasing video:", error);
    return NextResponse.json(
      { success: false, error: "Failed to purchase video" },
      { status: 500 }
    );
  }
}
