import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { videos, users } from "@/lib/database/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const { searchParams } = new URL(request.url);
 const sortBy = searchParams.get("sortBy") || "newest";
 const filterBy = searchParams.get("filterBy") || "all";
 const limit = parseInt(searchParams.get("limit") || "50");
 const offset = parseInt(searchParams.get("offset") || "0");

 let whereConditions = eq(videos.creatorId, user.id);

 let additionalFilter = null;
 if (filterBy === "active") {
 additionalFilter = eq(videos.isActive, true);
 } else if (filterBy === "inactive") {
 additionalFilter = eq(videos.isActive, false);
 }

 let orderBy;
 switch (sortBy) {
 case "oldest":
 orderBy = asc(videos.createdAt);
 break;
 case "views":
 orderBy = desc(videos.viewCount);
 break;
 case "earnings":
 orderBy = desc(videos.totalEarnings);
 break;
 case "title":
 orderBy = asc(videos.title);
 break;
 default: // newest
 orderBy = desc(videos.createdAt);
 break;
 }

 let finalWhereCondition = whereConditions;
 if (additionalFilter) {
 finalWhereCondition =
 and(whereConditions, additionalFilter) || whereConditions;
 }

 const userVideos = await db
 .select()
 .from(videos)
 .where(finalWhereCondition)
 .orderBy(orderBy)
 .limit(limit)
 .offset(offset);

 const totalCount = await db
 .select()
 .from(videos)
 .where(finalWhereCondition);

 return NextResponse.json({
 videos: userVideos.map((video) => ({
 ...video,
 createdAt: new Date(video.createdAt),
 updatedAt: new Date(video.updatedAt),
 })),
 pagination: {
 total: totalCount.length,
 limit,
 offset,
 hasMore: offset + limit < totalCount.length,
 },
 });
 } catch (error) {
 console.error("Get videos error:", error);
 return NextResponse.json(
 { error: "Failed to get videos" },
 { status: 500 }
 );
 }
}
