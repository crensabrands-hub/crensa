'use client';

import { TrendingShow } from '@/types';
import { Play, Users, Clock, Star, DollarSign } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TrendingShowCardProps {
    show: TrendingShow;
    className?: string;
}

export default function TrendingShowCard({ show, className = '' }: TrendingShowCardProps) {
    const [imageError, setImageError] = useState(false);

    const formatViewCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return '';
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    const formatCoinPrice = (coins: number): string => {
        return coins === 0 ? 'Free' : `🪙 ${coins.toLocaleString('en-IN')}`;
    };

    const getShowUrl = (): string => {
        return show.type === 'series' ? `/series/${show.id}` : `/watch/${show.id}`;
    };

    return (
        <Link href={getShowUrl()} className={`group block ${className}`}>
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {!imageError && show.thumbnailUrl ? (
                        <Image
                            src={show.thumbnailUrl}
                            alt={show.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-navy/20 to-accent-pink/20 flex items-center justify-center">
                            <Play className="w-12 h-12 text-primary-navy/60" data-testid="play-icon" />
                        </div>
                    )}

                    { }
                    <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${show.type === 'series'
                                ? 'bg-accent-pink text-white'
                                : 'bg-primary-navy text-white'
                            }`}>
                            {show.type === 'series' ? 'Series' : 'Video'}
                        </span>
                    </div>

                    { }
                    <div className="absolute top-3 right-3">
                        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            {show.type === 'series' ? (
                                <>
                                    <Users className="w-3 h-3" />
                                    {show.videoCount} videos
                                </>
                            ) : (
                                <>
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(show.duration)}
                                </>
                            )}
                        </div>
                    </div>

                    { }
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-6 h-6 text-primary-navy ml-1" />
                        </div>
                    </div>
                </div>

                { }
                <div className="p-4 h-48 flex flex-col">
                    { }
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-accent-pink transition-colors h-14 overflow-hidden">
                        {show.title}
                    </h3>

                    { }
                    <p className="text-gray-600 text-sm mb-3 h-5">
                        by {show.creatorName}
                    </p>

                    { }
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3 h-5">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{formatViewCount(show.viewCount)} views</span>
                            </div>

                            {show.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" data-testid="star-icon" />
                                    <span>{show.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    { }
                    <div className="flex items-center justify-between mt-auto h-8">
                        <div className="flex items-center gap-1 text-purple-600 font-semibold">
                            <span>{formatCoinPrice(show.price)}</span>
                        </div>

                        { }
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {show.category}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}