import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdminService } from '@/lib/services/adminService';

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ userId: string }> }
) {
 try {
 const { userId: adminId } = await auth();
 
 if (!adminId) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { reason } = await request.json();
 const { userId: targetUserId } = await params;
 const ipAddress = request.headers.get('x-forwarded-for') || 
 request.headers.get('x-real-ip') || 
 'unknown';

 if (!reason) {
 return NextResponse.json(
 { error: 'Suspension reason is required' },
 { status: 400 }
 );
 }

 await AdminService.suspendUser(targetUserId, adminId, reason, ipAddress);
 
 return NextResponse.json({ success: true });
 } catch (error) {
 console.error('Error suspending user:', error);
 return NextResponse.json(
 { error: 'Failed to suspend user' },
 { status: 500 }
 );
 }
}