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
      console.log(`Post-signup: User already exists with clerkId ${userId}, redirecting to dashboard`);
      const dashboardUrl = existingUser.role === 'creator'
        ? '/creator/dashboard'
        : '/dashboard';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Also check by email in case the clerkId changed but email exists
    const emailAddress = clerkUser.emailAddresses[0]?.emailAddress;
    if (emailAddress) {
      const existingByEmail = await userRepository.findByEmail(emailAddress);
      if (existingByEmail) {
        console.log(`Post-signup: User already exists with email ${emailAddress}, redirecting to dashboard`);
        const dashboardUrl = existingByEmail.role === 'creator'
          ? '/creator/dashboard'
          : '/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
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

    let newUser;
    try {
      newUser = await userRepository.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        username: finalUsername,
        role: role as 'creator' | 'member',
        avatar: clerkUser.imageUrl || null,
      });
    } catch (createError: any) {
      // Handle duplicate key errors gracefully
      if (createError?.message?.includes('duplicate key') || createError?.cause?.code === '23505') {
        console.error('Duplicate user detected during creation, checking existing user...');
        // Try to find by clerkId or email one more time
        const existing = await userRepository.findByClerkId(userId) || 
                         await userRepository.findByEmail(clerkUser.emailAddresses[0]?.emailAddress || '');
        
        if (existing) {
          const dashboardUrl = existing.role === 'creator' ? '/creator/dashboard' : '/dashboard';
          return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }
      }
      // If not a duplicate or can't find existing, rethrow
      throw createError;
    }

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
    return NextResponse.redirect(new URL('/sign-in?error=signup_failed', request.url));
  }
}
