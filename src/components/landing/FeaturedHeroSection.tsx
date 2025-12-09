"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function CombinedDemoPage() {

  const [showWatch, setShowWatch] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  // ===== Dummy episodes data =====
  const episodes = Array.from({ length: 63 }).map((_, i) => ({
    id: i + 1,
    title: `Queen Mom Rules – Episode ${i + 1}`,
    video: `/videos/demo${(i % 3) + 1}.mp4`, // switches between demo1, demo2, demo3
    description:
      "This is a sample description for the episode. Replace it later with real data.",
  }));

  const ep = episodes[currentEpisode - 1];

  return (
    <div className="min-h-screen bg-white">
      {showWatch ? (
        /* ========================================================= */
        /* ===============      WATCH PAGE     ====================== */
        /* ========================================================= */
        <div className="p-4 max-w-7xl mx-auto">
          
          {/* Back */}
          <div
            className="text-sm text-gray-600 mb-4 cursor-pointer"
            onClick={() => setShowWatch(false)}
          >
            ← Back / Home / Family / Queen Mom Rules /{" "}
            <span className="font-semibold">{ep.title}</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">

            {/* VIDEO PLAYER */}
            <div className="w-full">
              <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
                <video
                  key={ep.video} 
                  src={ep.video}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* SIDEBAR – EPISODES */}
            <div className="bg-gray-50 rounded-xl p-4 h-fit lg:h-[520px] flex flex-col">
              <h2 className="font-semibold text-gray-900 mb-3">
                Episodes ({currentEpisode}/{episodes.length})
              </h2>

              {/* Tabs */}
              <div className="flex gap-4 text-sm border-b pb-2 mb-3">
                <span className="text-red-500 border-b border-red-500 pb-1 cursor-pointer">
                  1-50
                </span>
                <span className="cursor-pointer text-gray-600">51-63</span>
              </div>

              {/* Episodes List */}
              <div
                className="grid grid-cols-5 gap-2 overflow-y-auto pr-1"
                style={{ maxHeight: "420px" }}
              >
                {episodes.slice(0, 50).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentEpisode(item.id)}
                    className={`h-10 flex items-center justify-center rounded-md text-sm border cursor-pointer
                      ${
                        currentEpisode === item.id
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-white text-gray-800 hover:bg-gray-100"
                      }
                    `}
                  >
                    {item.id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-lg md:text-xl font-bold mt-6">{ep.title}</h1>

          {/* Views */}
          <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
            ⭐ <span>{100000 + currentEpisode * 321} views</span>
          </div>

          {/* Description */}
          <p className="mt-4 text-gray-700 text-sm leading-relaxed max-w-4xl">
            {ep.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap mt-4 gap-2">
            {["Family", "Strong Female Lead", "CEO"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="mt-6">
            <p className="font-semibold mb-2">Share:</p>
            <div className="flex gap-3 items-center text-2xl">
              <span className="cursor-pointer">🔵</span>
              <span className="cursor-pointer">⚫</span>
              <span className="cursor-pointer">🟣</span>
              <span className="cursor-pointer">🟡</span>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* ==========   HOME PAGE (FEATURED SECTION)   ============= */
        /* ========================================================= */

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-3">
          
          {/* Large Card */}
          <section className="lg:col-span-2 rounded-2xl bg-gray-50 p-4 md:p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-[45%]">
              <div className="relative h-[380px] w-full rounded-xl overflow-hidden">
                <Image
                  src="/images/image.png"
                  alt="Queen Mom Rules"
                  fill
                  className="object-cover cursor-pointer hover:opacity-90"
                  onClick={() => setShowWatch(true)}
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Queen Mom Rules</h1>
                <p className="mt-2 text-sm text-gray-500">63 Episodes</p>
                <p className="mt-4 text-sm text-gray-600">
                  A CEO is humiliated and kicked out of her parents’ anniversary dinner.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Family", "Strong Female Lead", "CEO"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-4 py-1 text-xs text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Side Cards */}
          <aside className="flex flex-col gap-4">
            {[1, 2].map((num) => (
              <div key={num} className="flex gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="relative h-36 w-24 overflow-hidden rounded-lg">
                  <Image
                    src="/images/image.png"
                    alt="Card"
                    fill
                    className="object-cover cursor-pointer hover:opacity-90"
                    onClick={() => setShowWatch(true)}
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Demo Story {num}</h3>
                    <p className="text-xs text-gray-500 mt-1">53 Episodes</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                      Small description for the example card…
                    </p>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Drama", "Romance"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-3 py-1 text-[10px] text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </aside>

        </main>
      )}
    </div>
  );
}
