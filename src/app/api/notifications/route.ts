import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { notificationsRepository, userRepository } from "@/lib/database/repositories";

export async function GET(request: NextRequest) {
 try {
 const { userId: clerkId } = await auth();

 if (!clerkId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(clerkId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const { searchParams } = new URL(request.url);
 const unreadOnly = searchParams.get('unread') === 'true';
 const limit = parseInt(searchParams.get('limit') || '50');

 const notifications = unreadOnly 
 ? await notificationsRepository.findUnreadByUserId(user.id, limit)
 : await notificationsRepository.findByUserId(user.id, limit);

 return NextResponse.json(notifications);
 } catch (error) {
 console.error("Error fetching notifications:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}

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

 const { type, title, message, metadata } = await request.json();

 if (!type || !title || !message) {
 return NextResponse.json(
 { error: "Missing required fields: type, title, message" },
 { status: 400 }
 );
 }

 const notification = await notificationsRepository.create({
 userId: user.id,
 type,
 title,
 message,
 metadata: metadata || null,
 });

 return NextResponse.json(notification);
 } catch (error) {
 console.error("Error creating notification:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}