import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userRepository, preferencesRepository } from "@/lib/database/repositories";

export async function POST(request: NextRequest) {
 try {
 const { userId: clerkId } = await auth();

 if (!clerkId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(clerkId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const { subscription } = await request.json();

 if (!subscription || !subscription.endpoint) {
 return NextResponse.json(
 { error: "Invalid subscription data" },
 { status: 400 }
 );
 }

 let currentPreferences = await preferencesRepository.findByUserId(user.id);
 
 const updatedPreferencesData = {
 notifications: currentPreferences?.notifications || {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: currentPreferences?.privacy || {
 profileVisibility: "public" as const,
 showEarnings: true,
 showViewCount: true,
 },
 playback: currentPreferences?.playback || {
 autoplay: true,
 quality: "auto" as const,
 volume: 80,
 },

 pushSubscription: {
 endpoint: subscription.endpoint,
 keys: subscription.keys,
 expirationTime: subscription.expirationTime,
 subscribedAt: new Date().toISOString(),
 } as any, // Using any for now since it's not in the schema
 };

 await preferencesRepository.upsert(user.id, updatedPreferencesData);

 return NextResponse.json({ 
 success: true,
 message: "Push subscription saved successfully" 
 });
 } catch (error) {
 console.error("Error saving push subscription:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}