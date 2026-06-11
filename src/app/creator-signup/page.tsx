import { SignUp } from '@clerk/nextjs';
import { AuthPageLayout, crensaAuthTheme } from '@/components/auth';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';
import { redirect } from 'next/navigation';

export default async function CreatorSignUpPage() {
  const { userId } = await auth();

  if (userId) {
    const existingUser = await userRepository.findByClerkId(userId);

    if (existingUser) {
      if (existingUser.role === 'creator') {
        redirect('/creator/dashboard');
      }

      return (
        <AuthPageLayout
          title="Account Already Exists"
          subtitle="You already have an account on Crensa"
        >
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold mb-2">
              This account is already registered as a member
            </p>
            <p className="text-neutral-white/60 text-sm mb-6">
              Each account can only have one role. You cannot sign up as a creator with an existing member account.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-neon-yellow hover:bg-primary-light-yellow text-primary-navy font-semibold rounded-lg transition-colors duration-200"
            >
              Go to Member Dashboard
            </Link>
          </div>
        </AuthPageLayout>
      );
    }
  }

  const role = 'creator';

  return (
    <AuthPageLayout
      title="Join Crensa as a Creator"
      subtitle="Create your account and start monetizing your content immediately"
    >
      {/*
        Clerk's SignUp widget handles its own multi-step flow (email verification, etc.)
        internally. It requires routing.path to match where it's mounted so Clerk can
        construct the correct verify-email-address sub-route. Without this, Clerk posts
        to /creator-signup/verify-email-address which returns 404.
        We use routing="hash" to keep all Clerk steps client-side without requiring
        server-side sub-routes under /creator-signup/*.
      */}
      <SignUp
        appearance={crensaAuthTheme}
        routing="hash"
        forceRedirectUrl={`/api/auth/post-signup?role=${role}`}
        fallbackRedirectUrl={`/api/auth/post-signup?role=${role}`}
        signInUrl={`/sign-in?role=${role}`}
        unsafeMetadata={{ role }}
      />

      <div className="mt-6 text-center">
        <p className="text-neutral-white/60 text-sm mb-2">
          Just want to watch content? Join as a member instead
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-neon-yellow hover:bg-primary-light-yellow text-primary-navy font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-xs"
        >
          Sign up as a Member
        </Link>
      </div>
    </AuthPageLayout>
  );
}
