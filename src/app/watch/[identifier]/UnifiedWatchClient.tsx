'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { UnifiedVideoPlayer } from '@/components/watch/UnifiedVideoPlayer';
import WatchErrorBoundary from './WatchErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import GuestAccessModal from '@/components/watch/GuestAccessModal';
import {
  canGuestWatchFreeVideo,
  incrementGuestWatchCount,
  getGuestWatchCount,
} from '@/lib/utils/guestAccess';

interface VideoData {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl: string;
    duration: number;
    creditCost: number;
    category: string;
    tags: string[];
    viewCount: number;
    creator: {
        id: string;
        username: string;
        displayName: string;
        avatar?: string;
    };
    shareToken?: string;
}

interface AccessInfo {
    hasAccess: boolean;
    accessType: 'owned' | 'token_preview' | 'requires_purchase' | 'creator_self_access';
    shareToken?: string;
    requiresPurchase: boolean;
}

interface WatchData {
    success: boolean;
    video: VideoData;
    hasAccess: boolean;
    accessType: string;
    requiresPurchase: boolean;
    shareToken?: string;
    error?: string;
}

interface UnifiedWatchClientProps {
    identifier: string;
}

export default function UnifiedWatchClient({ identifier }: UnifiedWatchClientProps) {
    const router = useRouter();
    const { userId, isSignedIn } = useAuth();
    const [data, setData] = useState<WatchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>();
    const [identifierType, setIdentifierType] = useState<'video_id' | 'share_token' | null>(null);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guestAccessChecked, setGuestAccessChecked] = useState(false);

    const fetchWatchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setStatusCode(undefined);

            const response = await fetch(`/api/watch/${identifier}`);

            if (!response.ok) {
                setStatusCode(response.status);

                try {
                    const errorData = await response.json();
                    setError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                } catch {

                    setError(`HTTP ${response.status}: ${response.statusText}`);
                }
                return;
            }

            const watchData: WatchData = await response.json();

            if (!watchData.success) {
                setError(watchData.error || 'Failed to load video');
                return;
            }

            setData(watchData);

            if (watchData.shareToken || watchData.video.shareToken) {
                setIdentifierType('share_token');
            } else {
                setIdentifierType('video_id');
            }

        } catch (error) {
            console.error('Error fetching watch data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load video');
        } finally {
            setLoading(false);
        }
    }, [identifier]);

    useEffect(() => {
        fetchWatchData();
    }, [fetchWatchData]);

    // Check guest access after video data is loaded
    useEffect(() => {
        if (!data || guestAccessChecked) return;

        // Only check for guests (not authenticated)
        if (isSignedIn) {
            setGuestAccessChecked(true);
            return;
        }

        // Get coin price from video data (use coinPrice if available, otherwise creditCost)
        const coinPrice = data.video.coinPrice ?? data.video.creditCost ?? 0;

        // Only apply to free videos (coin_price = 0)
        if (coinPrice !== 0) {
            setGuestAccessChecked(true);
            return;
        }

        // Check if guest can watch this free video
        const canWatch = canGuestWatchFreeVideo(false, coinPrice);

        if (!canWatch) {
            // Guest has exhausted free watches - show modal
            setShowGuestModal(true);
            setGuestAccessChecked(true);
        } else {
            // Guest can watch - increment counter
            incrementGuestWatchCount();
            setGuestAccessChecked(true);
        }
    }, [data, isSignedIn, guestAccessChecked]);

    const handleCloseGuestModal = () => {
        setShowGuestModal(false);
        // Redirect to homepage
        router.push('/');
    };

    const handleRetry = () => {
        fetchWatchData();
    };

    const handleGoHome = () => {
        router.push('/');
    };

    const handleGoDiscover = () => {
        router.push('/discover');
    };

    if (loading) {
        return (
            <LoadingFallback
                message="Loading video..."
                onRetry={handleRetry}
                timeout={8000}
            />
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-black">
                <WatchErrorBoundary
                    error={error || 'Video not found'}
                    onRetry={handleRetry}
                    onGoHome={handleGoHome}
                    onGoDiscover={handleGoDiscover}
                    statusCode={statusCode}
                    identifier={identifier}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Guest Access Modal */}
            <GuestAccessModal
                isOpen={showGuestModal}
                onClose={handleCloseGuestModal}
                videoTitle={data.video.title}
            />

            {/* Only show video player if guest access is allowed */}
            {!showGuestModal && (
                <UnifiedVideoPlayer
                    video={{
                        ...data.video,
                        videoUrl: data.video.videoUrl || ''
                    }}
                    access={{
                        hasAccess: data.hasAccess,
                        accessType: data.accessType as any,
                        shareToken: data.shareToken,
                        requiresPurchase: data.requiresPurchase
                    }}
                    identifierType={identifierType || 'video_id'}
                    onAccessGranted={() => {

                        fetchWatchData();
                    }}
                    onError={(error) => {
                        setError(error);
                    }}
                />
            )}
        </div>
    );
}