import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userRepository } from "@/lib/database/repositories";

export async function GET() {
 try {
 const { userId } = await auth();

 if (!userId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(userId);

 if (!user) {
 return NextResponse.json(
 {
 error: "User not found",
 needsOnboarding: true,
 },
 { status: 404 }
 );
 }

 return NextResponse.json({ user });
 } catch (error) {
 console.error("Profile fetch error:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}

export async function PATCH(request: NextRequest) {
 try {
 const { userId } = await auth();

 if (!userId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await request.json();
 const { displayName, bio, username, avatar, socialLinks, preferences } =
 body;

 const user = await userRepository.findByClerkId(userId);

 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const userUpdates: any = {};
 if (username && username !== user.username) {

 const isAvailable = await userRepository.isUsernameAvailable(
 username,
 user.id
 );
 if (!isAvailable) {
 return NextResponse.json(
 { error: "Username already taken" },
 { status: 400 }
 );
 }
 userUpdates.username = username;
 }
 if (avatar !== undefined) userUpdates.avatar = avatar;

 if (Object.keys(userUpdates).length > 0) {
 await userRepository.update(user.id, userUpdates);
 }

 if (user.role === "creator") {
 const profileUpdates: any = {};
 if (displayName) profileUpdates.displayName = displayName;
 if (bio !== undefined) profileUpdates.bio = bio;
 if (socialLinks) profileUpdates.socialLinks = socialLinks;

 if (Object.keys(profileUpdates).length > 0) {
 await userRepository.updateCreatorProfile(user.id, profileUpdates);
 }
 } else if (user.role === "member" && preferences) {

 await userRepository.updateMemberProfile(user.id, preferences);
 }

 const updatedUser = await userRepository.findByClerkId(userId);

 return NextResponse.json({
 message: "Profile updated successfully",
 user: updatedUser,
 });
 } catch (error) {
 console.error("Profile update error:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}
