import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database/connection";
import { users, creatorProfiles, creatorFollows } from "@/lib/database/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { userRepository } from "@/lib/database/repositories/users";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await userRepository.findByClerkId(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role !== "member") {
            return NextResponse.json({ error: "Access denied. Member role required." }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get("limit");
        const parsedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
        const limit = Number.isFinite(parsedLimit) ? Math.max(1, parsedLimit) : null;

        const baseQuery = db
            .select({
                id: users.id,
                username: users.username,
                avatar: users.avatar,
                displayName: creatorProfiles.displayName,
                bio: creatorProfiles.bio,
                videoCount: creatorProfiles.videoCount,
                followerCount: sql<number>`(
                    SELECT COUNT(*) FROM ${creatorFollows}
                    WHERE ${creatorFollows.creatorId} = ${users.id}
                )`,
                followedAt: creatorFollows.createdAt,
            })
            .from(creatorFollows)
            .innerJoin(users, eq(creatorFollows.creatorId, users.id))
            .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
            .where(and(eq(creatorFollows.followerId, user.id), eq(users.role, "creator")))
            .orderBy(desc(creatorFollows.createdAt));

        const followedCreators = await (limit ? baseQuery.limit(limit) : baseQuery);

        const creators = followedCreators.map((creator) => ({
            id: creator.id,
            username: creator.username,
            displayName: creator.displayName || creator.username || "Creator",
            avatar: creator.avatar || "/icons/icon-192.png",
            bio: creator.bio || "",
            followerCount: creator.followerCount || 0,
            videoCount: creator.videoCount || 0,
            isFollowed: true,
            followedAt: creator.followedAt,
        }));

        return NextResponse.json({ success: true, creators });
    } catch (error) {
        console.error("Error fetching followed creators:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch followed creators",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
