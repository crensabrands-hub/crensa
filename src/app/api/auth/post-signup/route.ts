import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';
import { ReferralService } from '@/lib/services/referralService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    let role = searchParams.get('role') || 'member';

    if (!['creator', 'member'].includes(role)) {
      role = 'member';
    }

    // Capture referral code from query param (passed through Clerk's forceRedirectUrl)
    const refCode = searchParams.get('ref')?.trim().toUpperCase() || null;

    const existingUser = await userRepository.findByClerkId(userId);

    if (existingUser) {
      const dashboardUrl = existingUser.role === 'creator'
        ? '/creator/dashboard'
        : '/dashboard';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    const username =
      clerkUser.username ||
      clerkUser.firstName?.toLowerCase() ||
      `user_${Date.now()}`;

    let finalUsername = username;
    let isAvailable = await userRepository.isUsernameAvailable(finalUsername);
    let suffix = 1;

    while (!isAvailable) {
      finalUsername = `${username}${suffix}`;
      isAvailable = await userRepository.isUsernameAvailable(finalUsername);
      suffix++;
    }

    const newUser = await userRepository.create({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      username: finalUsername,
      role: role as 'creator' | 'member',
      avatar: clerkUser.imageUrl || null,
    });

    if (role === 'creator') {
      await userRepository.createCreatorProfile({
        userId: newUser.id,
        displayName: clerkUser.firstName || finalUsername,
        bio: '',
        socialLinks: [],
      });
    } else {
      await userRepository.createMemberProfile({ userId: newUser.id });
    }

    // Record referral for members:
    // - If a valid ref code was provided, link to that creator
    // - If no ref code (organic signup), link to the Crensa platform creator as fallback
    if (role === 'member') {
      try {
        let referrerId: string | null = null;
        let usedCode: string | null = null;

        if (refCode) {
          const referrer = await ReferralService.resolveReferralCode(refCode);
          if (referrer) {
            referrerId = referrer.creatorUserId;
            usedCode = refCode;
          }
        }

        // Fall back to Crensa platform creator for organic signups
        if (!referrerId) {
          referrerId = await ReferralService.getPlatformCreatorId();
          usedCode = 'CRNSPLATFORM';
        }

        if (referrerId) {
          await ReferralService.recordReferral({
            referrerId,
            referredUserId: newUser.id,
            referralCode: usedCode!,
          });
        }
      } catch (referralError) {
        // Non-fatal — never block signup due to referral failure
        console.error('Referral recording failed (non-fatal):', referralError);
      }
    }

    const dashboardUrl = role === 'creator' ? '/creator/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));

  } catch (error) {
    console.error('Error in post-signup handler:', error);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
