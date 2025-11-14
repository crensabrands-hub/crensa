"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const AnimatedTextLoader = ({
 text = "CRENSA",
 className = "",
}: {
 text?: string;
 className?: string;
}) => {
 const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

 useEffect(() => {
 let animationFrame: number;
 let startTime = Date.now();

 const animate = () => {
 const elapsed = Date.now() - startTime;
 const progress = (elapsed % 3000) / 3000; // 3 second loop

 const angle = progress * Math.PI * 2;
 const radius = 30; // percentage
 const cx = 50 + Math.cos(angle) * radius;
 const cy = 50 + Math.sin(angle) * radius;

 setMaskPosition({
 cx: `${cx}%`,
 cy: `${cy}%`,
 });

 animationFrame = requestAnimationFrame(animate);
 };

 animate();

 return () => {
 if (animationFrame) {
 cancelAnimationFrame(animationFrame);
 }
 };
 }, []);

 return (
 <div className={`flex items-center justify-center w-full ${className}`}>
 <svg
 viewBox="0 0 300 100"
 xmlns="http://www.w3.org/2000/svg"
 className="select-none w-full h-auto"
 style={{ maxWidth: "400px" }}
 >
 <defs>
 {}
 <linearGradient
 id="loaderGradient"
 gradientUnits="userSpaceOnUse"
 x1="0%"
 y1="0%"
 x2="100%"
 y2="100%"
 >
 <stop offset="0%" stopColor="#f59e0b" /> {}
 <stop offset="25%" stopColor="#ec4899" /> {}
 <stop offset="50%" stopColor="#3b82f6" /> {}
 <stop offset="75%" stopColor="#10b981" /> {}
 <stop offset="100%" stopColor="#8b5cf6" /> {}
 </linearGradient>

 {}
 <motion.radialGradient
 id="loaderRevealMask"
 gradientUnits="userSpaceOnUse"
 r="25%"
 animate={maskPosition}
 transition={{ duration: 0, ease: "easeOut" }}
 >
 <stop offset="0%" stopColor="white" />
 <stop offset="100%" stopColor="black" />
 </motion.radialGradient>

 <mask id="loaderTextMask">
 <rect
 x="0"
 y="0"
 width="100%"
 height="100%"
 fill="url(#loaderRevealMask)"
 />
 </mask>
 </defs>

 {}
 <text
 x="50%"
 y="50%"
 textAnchor="middle"
 dominantBaseline="middle"
 strokeWidth="0.5"
 className="fill-transparent stroke-neutral-900 font-[helvetica] text-7xl font-bold"
 style={{ opacity: 0.2 }}
 >
 {text}
 </text>

 {}
 <motion.text
 x="50%"
 y="50%"
 textAnchor="middle"
 dominantBaseline="middle"
 strokeWidth="0.5"
 className="fill-transparent stroke-neutral-800 font-[helvetica] text-7xl font-bold"
 initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
 animate={{
 strokeDashoffset: 0,
 strokeDasharray: 1000,
 }}
 transition={{
 duration: 4,
 ease: "easeInOut",
 }}
 >
 {text}
 </motion.text>

 {}
 <text
 x="50%"
 y="50%"
 textAnchor="middle"
 dominantBaseline="middle"
 stroke="url(#loaderGradient)"
 strokeWidth="1"
 mask="url(#loaderTextMask)"
 className="fill-transparent font-[helvetica] text-7xl font-bold"
 >
 {text}
 </text>
 </svg>
 </div>
 );
};
