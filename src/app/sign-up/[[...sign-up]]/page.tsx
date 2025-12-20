import { SignUp } from '@clerk/nextjs';
import { AuthPageLayout, crensaAuthTheme } from '@/components/auth';
import Link from 'next/link';

export default async function SignUpPage({
 searchParams,
}: {
 searchParams: Promise<{ role?: string }>;
}) {
 // Default to member role - no role selection required
 const role = 'member';

 return (
 <AuthPageLayout
 title="Join Crensa"
 subtitle="Create your account and discover amazing content instantly"
 >
 {/* Creator Signup Button - Top Section */}
 <div className="mb-6 text-center">
 <Link
 href="/creator-signup"
 className="inline-flex items-center justify-center px-6 py-3 bg-accent-pink hover:bg-accent-bright-pink text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
 >
 Sign up as a Creator
 </Link>
 <p className="text-neutral-white/60 text-sm mt-2">
 Want to monetize your content? Join as a creator instead
 </p>
 </div>

 <SignUp
 appearance={crensaAuthTheme}
 forceRedirectUrl={`/api/auth/post-signup?role=${role}`}
 unsafeMetadata={{ role }}
 />
 </AuthPageLayout>
 );
}
