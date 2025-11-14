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

 const { userId: targetUserId } = await params;
 const ipAddress = request.headers.get('x-forwarded-for') || 
 request.headers.get('x-real-ip') || 
 'unknown';

 await AdminService.unsuspendUser(targetUserId, adminId, ipAddress);
 
 return NextResponse.json({ success: true });
 } catch (error) {
 console.error('Error unsuspending user:', error);
 return NextResponse.json(
 { error: 'Failed to unsuspend user' },
 { status: 500 }
 );
 }
}