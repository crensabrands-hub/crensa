import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const user = await userRepository.findByClerkId(userId);

    if (!user) {
      // No profile found (e.g. Google OAuth on first sign-in) — auto-create as member
      console.warn('User signed in but no profile found, auto-creating as member');

      const clerkRole = clerkUser.unsafeMetadata?.role as string | undefined;
      const role = (clerkRole === 'creator') ? 'creator' : 'member';

      const baseUsername =
        clerkUser.username ||
        clerkUser.firstName?.toLowerCase() ||
        `user_${Date.now()}`;

      let finalUsername = baseUsername;
      let isAvailable = await userRepository.isUsernameAvailable(finalUsername);
      let suffix = 1;
      while (!isAvailable) {
        finalUsername = `${baseUsername}${suffix}`;
        isAvailable = await userRepository.isUsernameAvailable(finalUsername);
        suffix++;
      }

      try {
        const newUser = await userRepository.create({
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: finalUsername,
          role,
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

        const dashboardUrl = role === 'creator' ? '/creator/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      } catch (createError: any) {
        // Handle race condition duplicate
        if (createError?.message?.includes('duplicate key') || createError?.cause?.code === '23505') {
          const existing = await userRepository.findByClerkId(userId);
          if (existing) {
            const dashboardUrl = existing.role === 'creator' ? '/creator/dashboard' : '/dashboard';
            return NextResponse.redirect(new URL(dashboardUrl, request.url));
          }
        }
        throw createError;
      }
    }

    const dashboardUrl = user.role === 'creator'
      ? '/creator/dashboard'
      : '/dashboard';

    return NextResponse.redirect(new URL(dashboardUrl, request.url));

  } catch (error) {
    console.error('Error in post-signin handler:', error);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
