import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdminService } from '@/lib/services/adminService';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { searchParams } = new URL(request.url);
 const page = parseInt(searchParams.get('page') || '1');
 const search = searchParams.get('search') || '';
 const role = searchParams.get('role') || '';
 const status = searchParams.get('status') || '';

 const result = await AdminService.getUsersForManagement(
 page,
 20,
 search,
 role,
 status
 );
 
 return NextResponse.json(result);
 } catch (error) {
 console.error('Error fetching users:', error);
 return NextResponse.json(
 { error: 'Failed to fetch users' },
 { status: 500 }
 );
 }
}