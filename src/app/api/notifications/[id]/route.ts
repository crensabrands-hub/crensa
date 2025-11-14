import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { notificationsRepository, userRepository } from "@/lib/database/repositories";

export async function PATCH(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 const { userId: clerkId } = await auth();

 if (!clerkId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(clerkId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const { action } = await request.json();
 const params = await context.params;

 if (action === 'mark_read') {
 const notification = await notificationsRepository.markAsRead(params.id);
 
 if (!notification) {
 return NextResponse.json({ error: "Notification not found" }, { status: 404 });
 }

 return NextResponse.json(notification);
 }

 return NextResponse.json({ error: "Invalid action" }, { status: 400 });
 } catch (error) {
 console.error("Error updating notification:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}

export async function DELETE(
 _request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 const { userId: clerkId } = await auth();

 if (!clerkId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const user = await userRepository.findByClerkId(clerkId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const params = await context.params;
 const success = await notificationsRepository.delete(params.id);
 
 if (!success) {
 return NextResponse.json({ error: "Notification not found" }, { status: 404 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("Error deleting notification:", error);
 return NextResponse.json(
 { error: "Internal server error" },
 { status: 500 }
 );
 }
}