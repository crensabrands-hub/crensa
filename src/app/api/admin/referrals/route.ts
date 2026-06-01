import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ReferralService } from '@/lib/services/referralService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role via Clerk public metadata
    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await ReferralService.getAdminReferralAnalytics();
    return NextResponse.json({ referrals: data });
  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
