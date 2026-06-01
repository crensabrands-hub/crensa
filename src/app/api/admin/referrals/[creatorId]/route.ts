import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ReferralService } from '@/lib/services/referralService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { creatorId } = await params;
    const users = await ReferralService.getReferredUsers(creatorId);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching referred users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
