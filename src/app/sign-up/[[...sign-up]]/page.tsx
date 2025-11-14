import { SignUp } from '@clerk/nextjs';
import { AuthPageLayout, crensaAuthTheme } from '@/components/auth';

export default async function SignUpPage({
 searchParams,
}: {
 searchParams: Promise<{ role?: string }>;
}) {
 const { role: roleParam } = await searchParams;
 const role = roleParam || 'member';
 const isCreator = role === 'creator';

 return (
 <AuthPageLayout
 title={isCreator ? 'Join Crensa as a Creator' : 'Join Crensa'}
 subtitle={
 isCreator
 ? 'Create your account and start monetizing your content immediately'
 : 'Create your account and discover amazing content instantly'
 }
 >
 <SignUp
 appearance={crensaAuthTheme}
 forceRedirectUrl={`/api/auth/post-signup?role=${role}`}
 unsafeMetadata={{ role }}
 />
 </AuthPageLayout>
 );
}
