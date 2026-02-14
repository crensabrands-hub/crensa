'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { XMarkIcon, UserPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface GuestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
}

/**
 * GuestAccessModal
 * 
 * Shows when guest has exhausted free video limit (2 videos).
 * Prompts user to sign in or sign up to continue watching.
 * 
 * This modal appears ONLY when attempting to play the 3rd video,
 * NOT when browsing the homepage.
 */
export default function GuestAccessModal({
  isOpen,
  onClose,
  videoTitle,
}: GuestAccessModalProps) {
  const router = useRouter();

  const handleSignIn = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    router.push(`/sign-in?redirect_url=${returnUrl}`);
  };

  const handleSignUp = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    router.push(`/sign-up?redirect_url=${returnUrl}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black bg-opacity-20 rounded-full flex items-center justify-center text-gray-700 hover:bg-opacity-40 transition-all"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-accent-pink via-accent-bright-pink to-accent-teal p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <UserPlusIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Free Video Limit Reached
              </h2>
              <p className="text-white text-opacity-90 text-sm">
                You have watched your 2 free videos
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 text-center mb-4">
                  Sign in to continue watching free videos on Crensa
                </p>
                
                {/* Benefits List */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">Free access to 2 paid videos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">Personalized recommendations</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">Watch history & favorites</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">Support your favorite creators</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSignIn}
                  className="w-full px-6 py-3 bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white rounded-xl font-semibold hover:from-accent-bright-pink hover:to-accent-pink transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  Sign In
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleSignUp}
                  className="w-full px-6 py-3 bg-white border-2 border-accent-pink text-accent-pink rounded-xl font-semibold hover:bg-accent-pink hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Create Account
                  <UserPlusIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Footer Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                It is free to join and takes less than a minute
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
