import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';
import { ReferralService } from '@/lib/services/referralService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await userRepository.findByClerkId(userId);
    if (!user || user.role !== 'creator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stats = await ReferralService.getCreatorReferralStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching creator referral stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
