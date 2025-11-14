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

 const currentPreferences = await preferencesRepository.findByUserId(user.id);
 
 if (currentPreferences) {
 const updatedPreferencesData = {
 notifications: currentPreferences.notifications,
 privacy: currentPreferences.privacy,
 playback: currentPreferences.playback,

 pushSubscription: null as any, // Using any for now since it's not in the schema
 };

 await preferencesRepository.update(user.id, updatedPreferencesData);
 }

 return NextResponse.json({ 
 success: true,
 message: "Push subscription removed successfully" 
 });
 } catch (error) {
 console.error("Error removing push subscription:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}