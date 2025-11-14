"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Video } from "@/types";

export interface SearchResult {
 id: string;
 title: string;
 type: 'video' | 'creator' | 'series';
 thumbnail?: string;
 url: string;
 creator?: {
 username: string;
 displayName: string;
 avatar?: string;
 };
 creditCost?: number;
 duration?: number;

 totalPrice?: number;
 videoCount?: number;
 category?: string;
}

interface SearchResultsProps {
 results: SearchResult[];
 loading: boolean;
 error: string | null;
 query: string;
 isOpen: boolean;
 onClose: () => void;
 onResultClick: (result: SearchResult) => void;
 selectedIndex: number;
 onKeyboardNavigation: (direction: 'up' | 'down' | 'enter' | 'escape') => void;
}

export default function SearchResults({
 results,
 loading,
 error,
 query,
 isOpen,
 onClose,
 onResultClick,
 selectedIndex,
 onKeyboardNavigation,
}: SearchResultsProps) {
 const resultsRef = useRef<HTMLDivElement>(null);
 const selectedItemRef = useRef<HTMLAnchorElement>(null);

 useEffect(() => {
 if (selectedItemRef.current && selectedIndex >= 0) {
 selectedItemRef.current.scrollIntoView({
 behavior: 'smooth',
 block: 'nearest',
 });
 }
 }, [selectedIndex]);

 useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
 if (!isOpen) return;

 switch (event.key) {
 case 'ArrowUp':
 event.preventDefault();
 onKeyboardNavigation('up');
 break;
 case 'ArrowDown':
 event.preventDefault();
 onKeyboardNavigation('down');
 break;
 case 'Enter':
 event.preventDefault();
 onKeyboardNavigation('enter');
 break;
 case 'Escape':
 event.preventDefault();
 onKeyboardNavigation('escape');
 break;
 }
 };

 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [isOpen, onKeyboardNavigation]);

 if (!isOpen) return null;

 const formatDuration = (seconds: number): string => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
 };

 return (
 <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-neutral-light-gray rounded-lg shadow-lg max-h-96 overflow-y-auto">
 {loading && (
 <div className="p-4 text-center">
 <div className="inline-flex items-center space-x-2">
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-navy"></div>
 <span className="text-sm text-neutral-dark-gray">Searching...</span>
 </div>
 </div>
 )}

 {error && (
 <div className="p-4 text-center">
 <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
 <div className="font-medium">Search Error</div>
 <div className="mt-1">{error}</div>
 <button
 onClick={() => window.location.reload()}
 className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
 >
 Try again
 </button>
 </div>
 </div>
 )}

 {!loading && !error && results.length === 0 && query && (
 <div className="p-4 text-center">
 <div className="text-sm text-neutral-dark-gray bg-neutral-light-gray/50 rounded-lg p-3">
 <div className="font-medium">No results found</div>
 <div className="mt-1">
 No videos or creators match &quot;{query}&quot;. Try different keywords or browse our categories.
 </div>
 <Link
 href="/discover"
 className="mt-2 inline-block text-xs text-primary-navy hover:text-primary-navy/80 underline"
 onClick={onClose}
 >
 Browse all videos
 </Link>
 </div>
 </div>
 )}

 {!loading && !error && results.length > 0 && (
 <div className="py-2">
 <div className="px-3 py-2 text-xs font-medium text-neutral-dark-gray border-b border-neutral-light-gray">
 {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
 </div>
 
 {results.map((result, index) => (
 <Link
 key={result.id}
 href={result.url}
 ref={index === selectedIndex ? selectedItemRef : null}
 className={`flex items-center space-x-3 px-3 py-3 hover:bg-neutral-light-gray/50 transition-colors duration-150 border-b border-neutral-light-gray/50 last:border-b-0 ${
 index === selectedIndex ? 'bg-primary-neon-yellow/20' : ''
 }`}
 onClick={() => {
 onResultClick(result);
 onClose();
 }}
 role="option"
 aria-selected={index === selectedIndex}
 >
 {}
 <div className="flex-shrink-0">
 {result.type === 'video' ? (
 <div className="relative w-16 h-12 bg-neutral-light-gray rounded overflow-hidden">
 {result.thumbnail ? (
 <img
 src={result.thumbnail}
 alt={result.title}
 className="w-full h-full object-cover"
 loading="lazy"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <svg className="w-6 h-6 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
 </svg>
 </div>
 )}
 {result.duration && (
 <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
 {formatDuration(result.duration)}
 </div>
 )}
 </div>
 ) : result.type === 'series' ? (
 <div className="relative w-16 h-12 bg-neutral-light-gray rounded overflow-hidden">
 {result.thumbnail ? (
 <img
 src={result.thumbnail}
 alt={result.title}
 className="w-full h-full object-cover"
 loading="lazy"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20">
 <svg className="w-6 h-6 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
 </svg>
 </div>
 )}
 {result.videoCount && (
 <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded flex items-center space-x-1">
 <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
 <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
 </svg>
 <span>{result.videoCount}</span>
 </div>
 )}
 {}
 <div className="absolute top-1 left-1 bg-accent-pink/90 text-white text-xs px-1 rounded">
 SERIES
 </div>
 </div>
 ) : (
 <div className="w-12 h-12 bg-neutral-light-gray rounded-full overflow-hidden">
 {result.creator?.avatar ? (
 <img
 src={result.creator.avatar}
 alt={result.creator.displayName || result.creator.username}
 className="w-full h-full object-cover"
 loading="lazy"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <svg className="w-6 h-6 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 </div>
 )}
 </div>
 )}
 </div>

 {}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium text-primary-navy truncate">
 {result.title}
 </h4>
 
 {(result.type === 'video' || result.type === 'series') && result.creator && (
 <p className="text-xs text-neutral-dark-gray mt-1">
 by {result.creator.displayName || result.creator.username}
 </p>
 )}
 
 <div className="flex items-center space-x-2 mt-1">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
 result.type === 'video' 
 ? 'bg-blue-100 text-blue-800' 
 : result.type === 'series'
 ? 'bg-purple-100 text-purple-800'
 : 'bg-green-100 text-green-800'
 }`}>
 {result.type === 'video' ? 'Video' : result.type === 'series' ? 'Series' : 'Creator'}
 </span>
 
 {result.type === 'video' && result.creditCost && (
 <span className="text-xs text-accent-pink font-medium">
 {result.creditCost} credits
 </span>
 )}
 
 {result.type === 'series' && result.totalPrice && (
 <span className="text-xs text-accent-pink font-medium">
 ₹{result.totalPrice}
 </span>
 )}
 
 {result.type === 'series' && result.videoCount && (
 <span className="text-xs text-neutral-dark-gray">
 {result.videoCount} videos
 </span>
 )}
 
 {result.category && (
 <span className="text-xs text-neutral-dark-gray capitalize">
 {result.category}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>

 {}
 {index === selectedIndex && (
 <div className="flex-shrink-0">
 <svg className="w-4 h-4 text-primary-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 )}
 </Link>
 ))}
 </div>
 )}
 </div>
 );
}