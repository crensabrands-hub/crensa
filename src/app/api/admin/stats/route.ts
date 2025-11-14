import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdminService } from '@/lib/services/adminService';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const stats = await AdminService.getAdminStats();
 
 return NextResponse.json(stats);
 } catch (error) {
 console.error('Error fetching admin stats:', error);
 return NextResponse.json(
 { error: 'Failed to fetch admin statistics' },
 { status: 500 }
 );
 }
}