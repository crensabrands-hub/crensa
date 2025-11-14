import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/database";
import { videos, users, creatorProfiles } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 300; // 5 minutes
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const config = {
 api: {
 bodyParser: {
 sizeLimit: "100mb",
 },
 responseLimit: false,
 },
};

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FORMATS = ["mp4", "webm", "mov", "avi"];

export async function POST(request: NextRequest) {
 try {

 const timeoutPromise = new Promise((_, reject) => {
 setTimeout(() => reject(new Error("Request timeout")), 300000); // 5 minutes
 });

 return (await Promise.race([
 handleUpload(request),
 timeoutPromise,
 ])) as NextResponse;
 } catch (error) {
 console.error("Video upload error:", error);

 if (error instanceof Error && error.message === "Request timeout") {
 return NextResponse.json(
 {
 error:
 "Upload timeout. Please try with a smaller file or check your connection.",
 },
 { status: 408 }
 );
 }

 return NextResponse.json(
 { error: "Failed to upload video. Please try again." },
 { status: 500 }
 );
 }
}

async function handleUpload(request: NextRequest) {
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

 const contentLength = request.headers.get("content-length");
 if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
 return NextResponse.json(
 {
 error: `File size too large. Maximum size: ${
 MAX_FILE_SIZE / (1024 * 1024)
 }MB`,
 },
 { status: 413 }
 );
 }

 let formData: FormData;
 try {
 formData = await request.formData();
 } catch (error) {
 console.error("Error parsing form data:", error);
 return NextResponse.json(
 { error: "Failed to parse upload data. File may be too large." },
 { status: 413 }
 );
 }

 const videoFile = formData.get("video") as File;
 const metadataStr = formData.get("metadata") as string;

 if (!videoFile || !metadataStr) {
 return NextResponse.json(
 { error: "Video file and metadata are required" },
 { status: 400 }
 );
 }

 if (videoFile.size > MAX_FILE_SIZE) {
 return NextResponse.json(
 {
 error: `File size too large. Maximum size: ${
 MAX_FILE_SIZE / (1024 * 1024)
 }MB`,
 },
 { status: 413 }
 );
 }

 const fileExtension = videoFile.name.split(".").pop()?.toLowerCase();
 if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
 return NextResponse.json(
 {
 error: `Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(
 ", "
 )}`,
 },
 { status: 400 }
 );
 }

 let metadata;
 try {
 metadata = JSON.parse(metadataStr);
 } catch (error) {
 return NextResponse.json(
 { error: "Invalid metadata format" },
 { status: 400 }
 );
 }

 if (!metadata.title || !metadata.category || !metadata.coinPrice) {
 return NextResponse.json(
 { error: "Title, category, and coin price are required" },
 { status: 400 }
 );
 }

 const coinPrice = Number(metadata.coinPrice);
 if (
 isNaN(coinPrice) ||
 !Number.isInteger(coinPrice) ||
 coinPrice < 1 ||
 coinPrice > 2000
 ) {
 return NextResponse.json(
 { error: "Coin price must be a whole number between 1 and 2000" },
 { status: 400 }
 );
 }

 const validAspectRatios = [
 "1:1",
 "16:9",
 "9:16",
 "2:3",
 "3:2",
 "4:5",
 "5:4",
 ];
 if (
 metadata.aspectRatio &&
 !validAspectRatios.includes(metadata.aspectRatio)
 ) {
 return NextResponse.json(
 {
 error: `Invalid aspect ratio. Allowed values: ${validAspectRatios.join(
 ", "
 )}`,
 },
 { status: 400 }
 );
 }

 const chunks: Uint8Array[] = [];
 const reader = videoFile.stream().getReader();

 try {
 while (true) {
 const { done, value } = await reader.read();
 if (done) break;
 chunks.push(value);
 }
 } finally {
 reader.releaseLock();
 }

 const buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));

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

 const aspectRatio = metadata.aspectRatio || "16:9";
 const getAspectRatioTransformation = (ratio: string) => {
 switch (ratio) {
 case "9:16":
 return { aspect_ratio: "9:16", crop: "fill", gravity: "center" };
 case "1:1":
 return { aspect_ratio: "1:1", crop: "fill", gravity: "center" };
 case "4:5":
 return { aspect_ratio: "4:5", crop: "fill", gravity: "center" };
 case "5:4":
 return { aspect_ratio: "5:4", crop: "fill", gravity: "center" };
 case "3:2":
 return { aspect_ratio: "3:2", crop: "fill", gravity: "center" };
 case "2:3":
 return { aspect_ratio: "2:3", crop: "fill", gravity: "center" };
 default: // 16:9
 return { aspect_ratio: "16:9", crop: "fill", gravity: "center" };
 }
 };

 const videoUploadResult = await new Promise((resolve, reject) => {
 const uploadTimeout = setTimeout(() => {
 reject(new Error("Cloudinary upload timeout"));
 }, 240000); // 4 minutes timeout

 const aspectTransformation = getAspectRatioTransformation(aspectRatio);

 cloudinary.uploader
 .upload_stream(
 {
 resource_type: "video",
 folder: "crensa/videos",
 public_id: `${user.id}_${Date.now()}`,
 format: "mp4",
 quality: "auto",
 chunk_size: 6000000, // 6MB chunks for better reliability
 timeout: 240000, // 4 minutes
 eager_async: true, // Process large videos asynchronously

 },
 (error, result) => {
 clearTimeout(uploadTimeout);
 if (error) {
 console.error("Cloudinary upload error:", error);
 reject(error);
 } else {
 resolve(result);
 }
 }
 )
 .end(buffer);
 });

 const videoResult = videoUploadResult as any;

 const getThumbnailDimensions = (ratio: string) => {
 switch (ratio) {
 case "9:16":
 return { width: 360, height: 640 }; // Vertical
 case "1:1":
 return { width: 480, height: 480 }; // Square
 case "4:5":
 return { width: 384, height: 480 }; // Portrait
 case "5:4":
 return { width: 480, height: 384 }; // Landscape
 case "3:2":
 return { width: 480, height: 320 }; // Classic
 case "2:3":
 return { width: 320, height: 480 }; // Tall portrait
 default: // 16:9
 return { width: 640, height: 360 }; // Widescreen
 }
 };

 const thumbnailDimensions = getThumbnailDimensions(aspectRatio);
 const thumbnailUrl = cloudinary.url(videoResult.public_id, {
 resource_type: "video",
 format: "jpg",
 transformation: [
 {
 width: thumbnailDimensions.width,
 height: thumbnailDimensions.height,
 crop: "fill",
 gravity: "center",
 },
 { quality: "auto:good" },
 ],
 });

 const [newVideo] = await db
 .insert(videos)
 .values({
 creatorId: user.id,
 title: metadata.title.trim(),
 description: metadata.description?.trim() || null,
 videoUrl: videoResult.secure_url,
 thumbnailUrl,
 duration: Math.round(videoResult.duration || 0),
 creditCost: (coinPrice / 20).toFixed(2), // Convert coins to rupees for legacy field
 coinPrice: coinPrice,
 category: metadata.category,
 tags: metadata.tags || [],
 aspectRatio: metadata.aspectRatio || "16:9", // Default to 16:9 if not provided
 viewCount: 0,
 totalEarnings: "0.00",
 isActive: true,
 })
 .returning();

 const [currentProfile] = await db
 .select()
 .from(creatorProfiles)
 .where(eq(creatorProfiles.userId, user.id))
 .limit(1);

 if (currentProfile) {
 await db
 .update(creatorProfiles)
 .set({
 videoCount: currentProfile.videoCount + 1,
 updatedAt: new Date(),
 })
 .where(eq(creatorProfiles.userId, user.id));
 }

 return NextResponse.json({
 success: true,
 video: {
 ...newVideo,
 createdAt: new Date(newVideo.createdAt),
 updatedAt: new Date(newVideo.updatedAt),
 },
 });
 } catch (error) {
 console.error("Video upload error:", error);

 if (error && typeof error === "object" && "http_code" in error) {
 const cloudinaryError = error as any;
 if (cloudinaryError.http_code === 400) {
 return NextResponse.json(
 { error: "Invalid video file or format" },
 { status: 400 }
 );
 }
 if (cloudinaryError.http_code === 413) {
 return NextResponse.json(
 { error: "File too large for upload service" },
 { status: 413 }
 );
 }
 }

 if (error instanceof Error) {
 if (
 error.message.includes("timeout") ||
 error.message.includes("ETIMEDOUT")
 ) {
 return NextResponse.json(
 {
 error:
 "Upload timeout. Please try with a smaller file or check your connection.",
 },
 { status: 408 }
 );
 }
 if (
 error.message.includes("ECONNRESET") ||
 error.message.includes("network")
 ) {
 return NextResponse.json(
 {
 error:
 "Network error during upload. Please check your connection and try again.",
 },
 { status: 503 }
 );
 }
 }

 return NextResponse.json(
 { error: "Failed to upload video. Please try again." },
 { status: 500 }
 );
 }
}

export async function OPTIONS() {
 return new NextResponse(null, {
 status: 200,
 headers: {
 "Access-Control-Allow-Origin": "*",
 "Access-Control-Allow-Methods": "POST, OPTIONS",
 "Access-Control-Allow-Headers": "Content-Type",
 },
 });
}
