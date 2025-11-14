"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTextLoader } from "@/components/ui/AnimatedTextLoader";

export function AppPreloader() {
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {

 const timer = setTimeout(() => {
 setIsLoading(false);
 }, 1500); // Show for 1.5 seconds

 return () => clearTimeout(timer);
 }, []);

 return (
 <AnimatePresence>
 {isLoading && (
 <motion.div
 initial={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.3 }}
 className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-neutral-gray via-white to-neutral-light-gray"
 >
 <div className="w-full max-w-md px-8">
 <AnimatedTextLoader text="CRENSA" />
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
