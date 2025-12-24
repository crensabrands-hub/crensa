"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedHeroSection() {
  return (
    <div className="bg-white">
      {/* ========================================================= */
      /* ==========   HOME PAGE (FEATURED SECTION)   ============= */
      /* ========================================================= */}

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-3">

        {/* Large Card */}
        <section className="lg:col-span-2 rounded-2xl bg-gray-50 p-4 md:p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[45%]">
            <Link href="/watch/demo" className="block relative h-[380px] w-full rounded-xl overflow-hidden group">
              <Image
                src="/images/image.png"
                alt="Queen Mom Rules"
                fill
                className="object-cover cursor-pointer group-hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Link href="/watch/demo" className="hover:text-red-500 transition-colors">
                <h1 className="text-2xl font-bold text-gray-900">Queen Mom Rules</h1>
              </Link>
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
            <Link
              key={num}
              href="/watch/demo"
              className="flex gap-4 bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-all group overflow-hidden"
            >
              <div className="relative h-36 w-24 overflow-hidden rounded-lg flex-shrink-0">
                <Image
                  src="/images/image.png"
                  alt={`Demo Story ${num}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                    Demo Story {num}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">53 Episodes</p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                    Small description for the example card…
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-pink-600">
                  {["Drama", "Romance"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold border border-pink-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </aside>

      </main>
    </div>
  );
}
