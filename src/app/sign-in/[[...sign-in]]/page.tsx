import { SignIn } from '@clerk/nextjs';
import { AuthPageLayout, crensaAuthTheme } from '@/components/auth';

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'We hit a temporary issue signing you in. Please try again.',
  signup_failed: 'We hit a temporary issue creating your account. Please try again.',
};

export default async function SignInPage({
 searchParams,
}: {
 searchParams: Promise<{ role?: string; error?: string }>;
}) {
 const params = await searchParams;
 const role = params.role || 'member';
 const isCreator = role === 'creator';
 const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? 'Something went wrong. Please try again.' : null;

 return (
 <AuthPageLayout
 title="Welcome Back"
 subtitle={
 isCreator
 ? 'Sign in to your creator account and start creating'
 : 'Sign in to discover amazing content'
 }
 >
 {errorMessage && (
   <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm text-center">
     {errorMessage}
   </div>
 )}
 <SignIn
 appearance={crensaAuthTheme}
 forceRedirectUrl="/api/auth/post-signin"
 fallbackRedirectUrl="/api/auth/post-signin"
 unsafeMetadata={{ role }}
 />
 </AuthPageLayout>
 );
}