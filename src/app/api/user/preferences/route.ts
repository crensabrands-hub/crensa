import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userRepository, preferencesRepository } from "@/lib/database/repositories";

export async function GET() {
 try {
 const { userId: clerkId } = await auth();

 if (!clerkId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(clerkId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const preferences = await preferencesRepository.findByUserId(user.id);

 return NextResponse.json(preferences || {
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: "public",
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: "auto",
 volume: 80,
 },
 });
 } catch (error) {
 console.error("Error fetching user preferences:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}

export async function PATCH(request: NextRequest) {
 try {
 const { userId: clerkId } = await auth();

 if (!clerkId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(clerkId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const updateData = await request.json();

 const currentPreferences = await preferencesRepository.findByUserId(user.id);

 const updatedPreferencesData = {
 notifications: {
 ...(currentPreferences?.notifications || {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 }),
 ...(updateData.notifications || {}),
 },
 privacy: {
 ...(currentPreferences?.privacy || {
 profileVisibility: "public" as const,
 showEarnings: true,
 showViewCount: true,
 }),
 ...(updateData.privacy || {}),
 },
 playback: {
 ...(currentPreferences?.playback || {
 autoplay: true,
 quality: "auto" as const,
 volume: 80,
 }),
 ...(updateData.playback || {}),
 },
 };

 const updatedPreferences = await preferencesRepository.upsert(user.id, updatedPreferencesData);

 return NextResponse.json(updatedPreferences);
 } catch (error) {
 console.error("Error updating user preferences:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}