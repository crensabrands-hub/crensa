import { SignUp } from '@clerk/nextjs';
import { AuthPageLayout, crensaAuthTheme } from '@/components/auth';
import Link from 'next/link';

export default function CreatorSignUpPage() {
 const role = 'creator';

 return (
 <AuthPageLayout
 title="Join Crensa as a Creator"
 subtitle="Create your account and start monetizing your content immediately"
 >
 {/* Member Signup Link - Top Section */}
 <div className="mb-6 text-center">
 <Link
 href="/sign-up"
 className="inline-flex items-center justify-center px-6 py-3 bg-primary-neon-yellow hover:bg-primary-light-yellow text-primary-navy font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
 >
 Sign up as a Member
 </Link>
 <p className="text-neutral-white/60 text-sm mt-2">
 Just want to watch content? Join as a member instead
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