import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/database";
import { users } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
 !process.env.CLOUDINARY_CLOUD_NAME ||
 !process.env.CLOUDINARY_API_KEY ||
 !process.env.CLOUDINARY_API_SECRET
 ) {
 console.error("Missing Cloudinary configuration");
 return NextResponse.json(
 { error: "Video upload service is not configured properly" },
 { status: 500 }
 );
 }

 const publicId = `crensa/videos/${user.id}_${Date.now()}`;
 const timestamp = Math.round(Date.now() / 1000);

 const paramsToSign: Record<string, any> = {
 timestamp: timestamp,
 public_id: publicId,
 folder: "crensa/videos",
 eager_async: true, // CRITICAL: Process transformations asynchronously
 };

 const signature = cloudinary.utils.api_sign_request(
 paramsToSign,
 process.env.CLOUDINARY_API_SECRET!
 );

 return NextResponse.json({
 uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
 uploadParams: {
 timestamp: timestamp,
 public_id: publicId,
 folder: "crensa/videos",
 eager_async: true,
 signature: signature,
 api_key: process.env.CLOUDINARY_API_KEY,
 },
 publicId,
 });
 } catch (error) {
 console.error("Error generating upload URL:", error);
 return NextResponse.json(
 { error: "Failed to generate upload URL" },
 { status: 500 }
 );
 }
}
