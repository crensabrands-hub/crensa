"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, BarChart2, Twitter, Instagram, Music, Youtube, X, Coins, Crown } from "lucide-react";

export default function WatchDemoPage() {
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [showUnlockModal, setShowUnlockModal] = useState(false);

    const handleEpisodeClick = (id: number, isLocked: boolean) => {
        if (isLocked) {
            setShowUnlockModal(true);
        } else {
            setCurrentEpisode(id);
        }
    };

    // ===== Dummy episodes data =====
    const episodes = Array.from({ length: 63 }).map((_, i) => ({
        id: i + 1,
        title: `Queen Mom Rules – Episode ${i + 1}`,
        video: (i + 1) <= 4 ? "/videos/Crensa1.mp4" : "/videos/Crensa2.mp4",
        description:
            "A CEO is humiliated and kicked out of her parents' anniversary dinner. Discover her journey of resilience and revenge in this gripping family drama.",
    }));

    const ep = episodes[currentEpisode - 1];

    const handleVideoEnded = () => {
        const nextEpisodeId = currentEpisode + 1;
        if (nextEpisodeId <= episodes.length) {
            const isLocked = nextEpisodeId > 10;
            handleEpisodeClick(nextEpisodeId, isLocked);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <div className="p-4 max-w-[1400px] mx-auto">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
                    <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="hover:text-pink-500 transition-colors">Family</span>
                    <span>/</span>
                    <span className="hover:text-pink-500 transition-colors">Queen Mom Rules</span>
                    <span>/</span>
                    <span className="text-gray-900 font-semibold">{ep.title}</span>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 lg:gap-8 items-start">

                    {/* LEFT: VIDEO PLAYER AREA */}
                    <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-video lg:h-[700px] lg:aspect-auto flex items-center justify-center">
                        <div className="h-full aspect-[9/16] bg-black relative max-w-full">
                            <video
                                key={ep.video}
                                src={ep.video}
                                controls
                                autoPlay
                                onEnded={handleVideoEnded}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* RIGHT: EPISODES SIDEBAR */}
                    <div className="bg-white lg:bg-[#f0f0f0] rounded-3xl overflow-hidden shadow-xl flex flex-col h-[500px] lg:h-[700px] mt-2 lg:mt-0 border border-gray-100 lg:border-none">

                        {/* Sidebar Header */}
                        <div className="bg-[#212121] px-6 py-4 flex items-center justify-between shadow-md">
                            <h2 className="text-white font-bold tracking-tight text-sm">
                                Episodes
                                <span className="text-gray-400 text-xs font-normal ml-2">({currentEpisode}/63)</span>
                            </h2>
                        </div>

                        {/* Pagination Tabs */}
                        <div className="bg-white lg:bg-[#f0f0f0] px-6 py-3 flex gap-6 text-[12px] font-bold border-b border-gray-200 lg:border-none">
                            <button className="text-pink-600 relative after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-[2px] after:bg-pink-600">
                                1-50
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                51-63
                            </button>
                        </div>

                        {/* Scrollable Episodes Grid */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                                {episodes.map((item) => {
                                    const isActive = currentEpisode === item.id;
                                    const isLocked = item.id > 10; // Locked after 10th episode

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleEpisodeClick(item.id, isLocked)}
                                            className={`
                        relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-300
                        ${isActive
                                                    ? "bg-pink-600 text-white shadow-lg shadow-pink-200 scale-105 z-10"
                                                    : "bg-white text-gray-700 shadow-sm hover:translate-y-[-1px] hover:shadow-md hover:border-pink-200 border border-transparent"
                                                }
                        ${isLocked ? "opacity-60 grayscale-[0.5] hover:opacity-80 hover:scale-105" : "cursor-pointer"}
                      `}
                                        >
                                            {isActive && (
                                                <div className="flex items-end gap-[1px] mb-0.5">
                                                    <div className="w-0.5 h-1.5 bg-white animate-[pulse_1s_infinite]"></div>
                                                    <div className="w-0.5 h-2.5 bg-white animate-[pulse_1.2s_infinite]"></div>
                                                    <div className="w-0.5 h-1 bg-white animate-[pulse_0.8s_infinite]"></div>
                                                </div>
                                            )}
                                            <span className={`text-xs ${isActive ? "font-black" : "font-bold"}`}>
                                                {item.id}
                                            </span>

                                            {isLocked && (
                                                <div className="absolute top-1 right-1">
                                                    <Lock className="w-2 h-2 text-[#ff4d4f] fill-[#ff4d4f]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Information Section */}
                <div className="mt-8 max-w-5xl">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{ep.title}</h1>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                        <span className="text-xs">★</span>
                        <span>{1000000 + currentEpisode * 5432}</span>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-screen-md">
                        {ep.title}. At her parents&apos; anniversary party, a successful CEO is dismissed as a low-class nobody, her diamond gift is called fake, and she&apos;s even banned from the table!
                    </p>

                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-xs font-bold text-gray-900">Genre:</span>
                        <div className="flex gap-2">
                            {["Family", "Strong Female Lead", "CEO"].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] rounded-full flex items-center gap-1 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    {tag} <span className="opacity-40 text-[8px]">›</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-900">Share:</span>
                        <div className="flex gap-2.5">
                            {/* Facebook */}
                            <button className="w-8 h-8 flex items-center justify-center bg-[#1877F2] rounded-full hover:opacity-90 transition-opacity">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </button>
                            {/* X (Twitter) */}
                            <button className="w-8 h-8 flex items-center justify-center bg-black rounded-full hover:opacity-90 transition-opacity">
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </button>
                            {/* Instagram */}
                            <button className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-[#F58529] via-[#D6249F] to-[#285AEB] rounded-full hover:opacity-90 transition-opacity">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </button>
                            {/* Copy Link */}
                            <button className="w-8 h-8 flex items-center justify-center bg-gray-500 rounded-full hover:opacity-90 transition-opacity">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M10.59 13.41c.41.39.41 1.03 0 1.42s-1.02.39-1.41 0c-1.84-1.84-1.84-4.84 0-6.69l3.54-3.53c1.84-1.85 4.85-1.85 6.69 0 1.85 1.84 1.85 4.85 0 6.69l-1.06 1.06c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41l1.06-1.06c1.07-1.07 1.07-2.82 0-3.89s-2.82-1.07-3.89 0l-3.54 3.53c-1.07 1.07-1.07 2.82 0 3.89zm-3.54 3.53c-1.07-1.07-1.07-2.82 0-3.89l1.06-1.06c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-1.06 1.06c-1.07 1.07-1.07 2.82 0 3.89s2.82 1.07 3.89 0l3.54-3.53c1.07-1.07 1.07-2.82 0-3.89-.41-.39-.41-1.03 0-1.42s1.02-.39 1.41 0c1.84 1.84 1.84 4.84 0 6.69l-3.54 3.53c-1.84 1.85-4.85 1.85-6.69 0-1.85-1.84-1.85-4.85 0-6.69z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= RECOMMENDED SECTION ================= */}
                <div className="mt-14">
                    <h2 className="text-xl font-bold text-gray-900 mb-5">
                        Recommended for you
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            {
                                title: "Fate Turned: My CEO Husband Shields Me",
                                episodes: 60,
                                tag: "Romance",
                            },
                            {
                                title: "Her Disguise, His Regret",
                                episodes: 76,
                                tag: "Destiny",
                            },
                            {
                                title: "A Heart Only for You",
                                episodes: 60,
                                tag: "Family",
                            },
                            {
                                title: "Don't Mock What You Can't Break",
                                episodes: 61,
                                tag: "Family",
                            },
                            {
                                title: "From the Countryside, With Claws",
                                episodes: 40,
                                tag: "Family",
                            },
                            {
                                title: "Daddy, The Plants Told Me Everything!",
                                episodes: 85,
                                tag: "Family",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="group cursor-pointer"
                            >
                                {/* Poster */}
                                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-gray-100">
                                    <Image
                                        src="/image.png"
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Episodes Badge */}
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        ▶ {item.episodes} Episodes
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="mt-2 text-xs font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
                                    {item.title}
                                </h3>

                                {/* Tag */}
                                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                    {item.tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ================= FOOTER SECTION ================= */}
            <footer className="bg-[#061b4d] text-white mt-20">
                {/* Top Section */}
                <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center font-bold text-black text-xl">
                                C
                            </div>
                            <span className="text-xl font-semibold">Crensa</span>
                        </div>

                        <p className="text-sm text-blue-200 leading-relaxed mb-8 max-w-sm">
                            The future of short-form video monetization. Join
                            thousands of creators earning what their content is truly worth.
                        </p>

                        <h4 className="text-xl font-bold color-white mb-2">Contact Us</h4>
                        <p className="text-blue-200 text-sm mb-8">dev@crensa.com</p>

                        <h4 className="text-xl font-bold color-white mb-4">Follow Us</h4>
                        <div className="flex gap-4">
                            {[Twitter, Instagram, Music, Youtube].map((Icon, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                                >
                                    <Icon size={18} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white">Platform</h4>
                        <ul className="space-y-4 text-blue-200 text-sm">
                            <li className="hover:text-white cursor-pointer transition-colors">How It Works</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Creator Tools</li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white">Resources</h4>
                        <ul className="space-y-4 text-blue-200 text-sm">
                            <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Creator Guide</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Community</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
                        <ul className="space-y-4 text-blue-200 text-sm">
                            <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Press Kit</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-200">
                        <span>© 2025 Crensa. All rights reserved.</span>

                        <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">Privacy Policy</span>
                            <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">Terms of Service</span>
                            <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">Cookie Policy</span>
                            <span className="hover:text-white cursor-pointer transition-colors whitespace-nowrap">Community Guidelines</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
            {showUnlockModal && <UnlockModal onClose={() => setShowUnlockModal(false)} />}
        </div>
    );
}

function UnlockModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Banner Image / Header */}
                <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        {/* Abstract circles or pattern */}
                        <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-white rounded-full opacity-20 blur-3xl"></div>
                    </div>
                    <Crown size={48} className="text-white relative z-10 drop-shadow-md" />
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock This Episode</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Proceed with coins or upgrade to Premium for unlimited access!
                    </p>

                    <div className="space-y-3">
                        {/* Option 1: Buy Coins */}
                        <button className="w-full bg-white border-2 border-amber-400 hover:bg-amber-50 group p-4 rounded-xl flex items-center justify-between transition-all relative overflow-hidden">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                                    <Coins size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Unlock with Coins</div>
                                    <div className="text-xs text-gray-500">Spend 50 coins for this episode</div>
                                </div>
                            </div>
                            <span className="text-amber-600 font-bold relative z-10">50¢</span>
                        </button>

                        {/* Option 2: Premium */}
                        <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 p-4 rounded-xl flex items-center justify-between text-white transition-opacity shadow-lg shadow-pink-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Crown size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold">Get Premium Access</div>
                                    <div className="text-xs text-white/80">Watch everything ad-free</div>
                                </div>
                            </div>
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                                Best Value
                            </span>
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        Secure payment powered by Crensa
                    </p>
                </div>
            </div>
        </div>
    );
}
