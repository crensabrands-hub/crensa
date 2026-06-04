'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '@/contexts/AuthContext';

function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
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

          if (intendedRole && ['creator', 'member'].includes(intendedRole)) {
            // Auto-complete setup — no need to show the picker
            setCheckingProfile(false);
            setStatus(`Setting up your ${intendedRole} account...`);
            setIsLoading(true);
            await handleRoleSetup(intendedRole);
            return;
          }
        }
      } catch (error) {
        console.error('Onboarding: Error checking profile:', error);
      }

      setCheckingProfile(false);
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

  const handleRoleSelection = async (role: UserRole) => {
    setSelectedRole(role);
    await handleRoleSetup(role);
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

  // Fallback: no role detected — show picker
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Crensa!</h1>
          <p className="text-xl text-gray-300">Choose how you want to use Crensa</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Creator */}
          <div
            className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 cursor-pointer transition-all duration-300 ${
              selectedRole === 'creator'
                ? 'border-purple-400 bg-white/20'
                : 'border-white/20 hover:border-white/40 hover:bg-white/15'
            }`}
            onClick={() => !isLoading && setSelectedRole('creator')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Creator</h3>
              <p className="text-gray-300 mb-6">Upload and monetize your short video content.</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Upload unlimited videos</li>
                <li>• Set custom pricing</li>
                <li>• Track earnings &amp; analytics</li>
              </ul>
            </div>
          </div>

          {/* Member */}
          <div
            className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 cursor-pointer transition-all duration-300 ${
              selectedRole === 'member'
                ? 'border-blue-400 bg-white/20'
                : 'border-white/20 hover:border-white/40 hover:bg-white/15'
            }`}
            onClick={() => !isLoading && setSelectedRole('member')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 013-3h6a3 3 0 013 3v2M7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Member</h3>
              <p className="text-gray-300 mb-6">Discover and watch amazing content from creators.</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Browse trending content</li>
                <li>• Pay-per-view system</li>
                <li>• Wallet management</li>
              </ul>
            </div>
          </div>
        </div>

        {selectedRole && (
          <div className="text-center mt-8">
            <button
              onClick={() => handleRoleSelection(selectedRole)}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up your account...' : `Continue as ${selectedRole === 'creator' ? 'Creator' : 'Member'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;
