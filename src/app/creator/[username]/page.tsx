import Image from 'next/image';
import Link from 'next/link';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { UserRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { creatorFollows, videos } from '@/lib/database/schema';
import { and, count, desc, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
    CheckCircle2,
    Clock,
    IndianRupee,
    Eye,
    Globe,
    Instagram,
    PlayCircle,
    Share2,
    Twitter,
    Users,
    Video,
    Youtube,
    ExternalLink,
} from 'lucide-react';

interface CreatorData {
    id: string;
    username: string;
    avatar: string | null;
    displayName: string;
    bio: string;
    category: string;
    followerCount: number;
    videoCount: number;
    totalViews: number;
    totalEarnings: string;
    socialLinks: Array<{ platform: string; url: string }>;
    isVerified: boolean;
    createdAt: string;
    featuredVideos: CreatorVideo[];
}

interface CreatorVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    viewCount: number;
    duration: number;
    createdAt: string;
    category?: string | null;
}

async function getCreatorData(username: string): Promise<CreatorData | null> {
    try {
        const userRepository = new UserRepository();
        let user;
        try {
            user = await userRepository.findByUsername(username);
        } catch (dbError) {
            console.error('Database error finding user:', dbError);
            return null;
        }

        if (!user) {
            return null;
        }

        let followerCount = 0;
        try {
            const followerAgg = await db
                .select({ count: count() })
                .from(creatorFollows)
                .where(eq(creatorFollows.creatorId, user.id));
            followerCount = Number(followerAgg?.[0]?.count ?? 0);
        } catch (error) {
            console.error('Error fetching follower count:', error);
        }

        let creatorVideos: any[] = [];
        try {
            creatorVideos = await db
                .select({
                    id: videos.id,
                    title: videos.title,
                    thumbnailUrl: videos.thumbnailUrl,
                    viewCount: videos.viewCount,
                    duration: videos.duration,
                    createdAt: videos.createdAt,
                    category: videos.category,
                })
                .from(videos)
                .where(
                    and(
                        eq(videos.creatorId, user.id),
                        eq(videos.isActive, true),
                        eq(videos.moderationStatus, 'approved')
                    )
                )
                .orderBy(desc(videos.createdAt))
                .limit(6);
        } catch (error) {
            console.error('Error fetching creator videos:', error);
        }

        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            displayName: user.creatorProfile?.displayName || user.username,
            bio: user.creatorProfile?.bio || '',
            category: creatorVideos[0]?.category || 'General',
            followerCount,
            videoCount: user.creatorProfile?.videoCount || 0,
            totalViews: user.creatorProfile?.totalViews || 0,
            totalEarnings: user.creatorProfile?.totalEarnings || '0.00',
            socialLinks: user.creatorProfile?.socialLinks || [],
            isVerified: false,
            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
            featuredVideos: creatorVideos.map((video) => ({
                ...video,
                createdAt: video.createdAt instanceof Date
                    ? video.createdAt.toISOString()
                    : new Date(video.createdAt as unknown as string).toISOString(),
            })),
        };
    } catch (error) {
        console.error('Error fetching creator:', error);
        return null;
    }
}

export default async function CreatorProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const creatorData = await getCreatorData(username);

    if (!creatorData) {
        notFound();
    }

    async function followCreatorAction(_formData: FormData): Promise<void> {
        'use server';
        const { userId } = await auth();
        if (!userId) {
            redirect(`/sign-in?redirect_url=/creator/${username}`);
        }

        if (!creatorData) {
            throw new Error('Creator not found');
        }

        try {
            const userRepository = new UserRepository();
            const follower = await userRepository.findByClerkId(userId);

            if (!follower) {
                throw new Error('User not found');
            }

            // Check if already following
            const existing = await db
                .select()
                .from(creatorFollows)
                .where(
                    and(
                        eq(creatorFollows.followerId, follower.id),
                        eq(creatorFollows.creatorId, creatorData.id)
                    )
                )
                .limit(1);

            if (existing.length === 0) {
                // Add follow
                await db.insert(creatorFollows).values({
                    followerId: follower.id,
                    creatorId: creatorData.id,
                    createdAt: new Date(),
                });
            }
        } catch (error) {
            console.error('Error following creator:', error);
        }
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatDuration = (seconds: number): string => {
        if (!seconds || Number.isNaN(seconds)) {
            return '0:00';
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0');

        return `${mins}:${secs}`;
    };

    const formatDate = (isoDate: string): string => {
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            year: 'numeric',
        }).format(new Date(isoDate));
    };

    const getSocialIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('twitter') || p.includes('x')) return <Twitter size={18} />;
        if (p.includes('instagram')) return <Instagram size={18} />;
        if (p.includes('youtube')) return <Youtube size={18} />;
        return <Globe size={18} />;
    };

    return (
        <div className="min-h-screen bg-neutral-gray text-primary-navy pb-20">
            <div className="relative min-h-[420px] md:h-[480px] w-full overflow-hidden bg-neutral-white border-b border-neutral-light-gray">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#f8fafc,transparent)]" aria-hidden />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[520px] bg-primary-neon-yellow/20 blur-[180px] rounded-full opacity-60" aria-hidden />

                <div className="container relative h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary-neon-yellow to-primary-light-yellow rounded-[2.8rem] blur-lg opacity-20 group-hover:opacity-40 transition duration-700" aria-hidden />
                            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden border-[10px] border-white shadow-2xl shadow-neutral-gray/60">
                                <Image
                                    src={creatorData.avatar || '/images/default-avatar.png'}
                                    alt={`${creatorData.displayName}'s avatar`}
                                    width={224}
                                    height={224}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                            </div>
                            {creatorData.isVerified && (
                                <div className="absolute -bottom-2 -right-2 bg-primary-neon-yellow text-primary-navy p-3 rounded-2xl shadow-xl ring-8 ring-white">
                                    <ShieldCheckIcon className="w-7 h-7" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left mb-6">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary-navy">
                                        {creatorData.displayName}
                                    </h1>
                                    {creatorData.isVerified && (
                                        <span className="px-4 py-2 rounded-full bg-neutral-gray border border-neutral-light-gray text-neutral-dark-gray text-[11px] font-bold uppercase tracking-[0.18em] inline-flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-accent-green" /> Verified Creator
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-neutral-dark-gray font-semibold">@{creatorData.username}</p>
                            </div>

                            {creatorData.bio && (
                                <p className="max-w-3xl mx-auto md:mx-0 text-lg text-neutral-dark leading-relaxed font-medium italic">
                                    “{creatorData.bio}”
                                </p>
                            )}

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-neutral-light-gray shadow-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary-neon-yellow shadow-[0_0_12px_rgba(203,229,63,0.9)]" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-primary-navy">{creatorData.category}</span>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-neutral-light-gray shadow-sm text-sm font-semibold text-neutral-dark-gray">
                                    Member since {formatDate(creatorData.createdAt)}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto pb-6">
                            <form action={followCreatorAction} className="group relative w-full md:w-72">
                                <div className="absolute -inset-2 bg-primary-neon-yellow rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500" aria-hidden />
                                <button className="relative flex w-full items-center justify-center gap-3 bg-primary-neon-yellow hover:bg-primary-light-yellow text-primary-navy font-bold text-lg py-5 px-10 rounded-2xl transition-all duration-500 transform group-hover:-translate-y-1 shadow-2xl shadow-primary-neon-yellow/50">
                                    <UserPlusIcon className="w-6 h-6 group-hover:animate-bounce" />
                                    Follow Creator
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Followers', value: formatNumber(creatorData.followerCount), icon: <Users size={20} /> },
                        { label: 'Total Content', value: formatNumber(creatorData.videoCount), icon: <Video size={20} /> },
                        { label: 'Community Reach', value: formatNumber(creatorData.totalViews), icon: <Eye size={20} /> },
                        { label: 'Est. Earnings', value: `₹${creatorData.totalEarnings}`, icon: <IndianRupee size={20} /> },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="group relative p-10 rounded-[2.25rem] bg-white border border-neutral-light-gray hover:border-primary-neon-yellow/60 hover:shadow-[0_26px_52px_-18px_rgba(0,0,0,0.08)] transition-all duration-500"
                        >
                            <div className="absolute top-6 right-6 p-3 bg-neutral-gray rounded-2xl text-neutral-dark-gray group-hover:bg-primary-neon-yellow group-hover:text-primary-navy transition-all duration-300">
                                {stat.icon}
                            </div>
                            <p className="text-neutral-dark-gray font-bold uppercase tracking-[0.22em] text-[10px] mb-3">
                                {stat.label}
                            </p>
                            <h3 className="text-4xl font-bold text-primary-navy">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {creatorData.socialLinks && creatorData.socialLinks.length > 0 && (
                    <section className="bg-white p-10 rounded-[2.5rem] border border-neutral-light-gray shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-neutral-light-gray pb-6">
                            <h2 className="text-2xl font-bold text-primary-navy flex items-center gap-3">
                                <Share2 size={24} className="text-primary-neon-yellow" />
                                Connect
                            </h2>
                            <span className="text-[10px] font-bold text-neutral-dark-gray uppercase tracking-[0.32em]">Socials</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {creatorData.socialLinks.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-neutral-gray border border-neutral-light-gray text-neutral-dark hover:border-accent-pink hover:bg-accent-pink/5 hover:text-primary-navy transition-all duration-300 font-semibold capitalize"
                                >
                                    <span className="text-neutral-dark-gray group-hover:text-primary-navy">
                                        {getSocialIcon(link.platform)}
                                    </span>
                                    {link.platform}
                                    <ExternalLink className="w-4 h-4 text-neutral-dark-gray" />
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-10">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-5">
                            <div className="w-2 h-10 bg-primary-neon-yellow rounded-full shadow-[0_0_20px_rgba(203,229,63,0.8)]" />
                            <h2 className="text-3xl font-bold text-primary-navy tracking-tight">Featured Content</h2>
                        </div>
                        <div className="text-[10px] font-bold text-neutral-dark-gray uppercase tracking-[0.32em]">Latest 6</div>
                    </div>

                    {creatorData.featuredVideos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {creatorData.featuredVideos.map((video) => (
                                <Link
                                    key={video.id}
                                    href={`/watch/${video.id}`}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-6 bg-neutral-light-gray border border-neutral-light-gray transition-all duration-700 group-hover:shadow-[0_36px_72px_-20px_rgba(0,0,0,0.14)] group-hover:-translate-y-2">
                                        <Image
                                            src={video.thumbnailUrl || '/images/default-thumbnail.png'}
                                            alt={video.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 bg-black/5 backdrop-blur-[1px]">
                                            <PlayCircle size={64} className="text-neutral-white drop-shadow-2xl" strokeWidth={1.2} />
                                        </div>

                                        <div className="absolute bottom-5 right-5">
                                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/30 text-xs font-bold text-primary-navy uppercase tracking-[0.16em] shadow-2xl">
                                                <Clock size={16} className="text-accent-green" /> {formatDuration(video.duration)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 px-2">
                                        <h4 className="text-xl font-bold text-primary-navy group-hover:text-accent-green transition-colors leading-tight line-clamp-2">
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-dark-gray uppercase tracking-[0.18em]">
                                            <span>{formatNumber(video.viewCount)} views</span>
                                            <span className="text-neutral-dark-gray/70">{formatDate(video.createdAt)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-16 rounded-[2.5rem] border border-neutral-light-gray border-dashed text-center">
                            <p className="text-neutral-dark-gray font-semibold uppercase tracking-[0.22em]">No featured content available yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}