'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '@/contexts/AuthContext';

function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [status, setStatus] = useState('Checking your profile...');

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) {
        router.push('/sign-up');
        return;
      }

      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.user.role === 'creator') {
            router.push('/creator/dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        } else if (response.status === 404) {
          // No profile — check if we have a role from URL param or Clerk metadata
          const roleParam = searchParams.get('role') as UserRole | null;
          const clerkRole = user.unsafeMetadata?.role as UserRole | undefined;
          const intendedRole = roleParam || clerkRole || null;

          // Default to 'member' if no role found — normal sign-up flow assigns member by default
          const resolvedRole = (intendedRole && ['creator', 'member'].includes(intendedRole))
            ? intendedRole
            : 'member';

          setCheckingProfile(false);
          setStatus(`Setting up your ${resolvedRole} account...`);
          setIsLoading(true);
          await handleRoleSetup(resolvedRole);
          return;
        }
      } catch (error) {
        console.error('Onboarding: Error checking profile:', error);
      }

      // Profile check failed — default to member
      setCheckingProfile(false);
      setStatus('Setting up your account...');
      setIsLoading(true);
      await handleRoleSetup('member');
    };

    checkExistingProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRoleSetup = async (role: UserRole) => {
    if (!user) return;

    setIsLoading(true);
    setStatus(`Setting up your ${role} account...`);

    try {
      const response = await fetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          email: user.emailAddresses[0]?.emailAddress,
          username: user.username || user.firstName?.toLowerCase() || `user_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = role === 'creator' ? '/creator/dashboard' : '/dashboard';
      } else if (response.status === 409) {
        // Profile already exists — redirect to its dashboard
        const existingRole = data?.user?.role;
        window.location.href = existingRole === 'creator' ? '/creator/dashboard' : '/dashboard';
      } else {
        console.error('Failed to setup profile:', data);
        setIsLoading(false);
        setStatus('Setup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error setting up profile:', error);
      setIsLoading(false);
      setStatus('Network error. Please try again.');
    }
  };


  // Spinner shown while checking profile OR during auto-setup
  if (checkingProfile || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">{status}</div>
        </div>
      </div>
    );
  }

  // Should never reach here — all paths above redirect or trigger auto-setup
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <div className="text-white text-xl">Setting up your account...</div>
      </div>
    </div>
  );
}

export default OnboardingPage;
