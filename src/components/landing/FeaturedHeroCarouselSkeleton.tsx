'use client';

export default function FeaturedHeroCarouselSkeleton() {
 return (
 <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-gray/20 to-neutral-gray/10 animate-pulse">
 {}
 <div className="absolute inset-0 bg-neutral-gray/30" />
 
 {}
 <div className="relative z-10 h-full flex items-center">
 <div className="container mx-auto px-6 md:px-8">
 <div className="max-w-2xl">
 {}
 <div className="flex gap-2 mb-4">
 <div className="w-16 h-6 bg-neutral-gray/40 rounded-full" />
 <div className="w-20 h-6 bg-neutral-gray/40 rounded-full" />
 </div>

 {}
 <div className="space-y-3 mb-4">
 <div className="w-full h-8 md:h-12 bg-neutral-gray/40 rounded-lg" />
 <div className="w-3/4 h-8 md:h-12 bg-neutral-gray/40 rounded-lg" />
 </div>

 {}
 <div className="space-y-2 mb-6">
 <div className="w-full h-5 bg-neutral-gray/30 rounded" />
 <div className="w-5/6 h-5 bg-neutral-gray/30 rounded" />
 <div className="w-2/3 h-5 bg-neutral-gray/30 rounded" />
 </div>

 {}
 <div className="flex items-center gap-3 mb-8">
 <div className="w-10 h-10 bg-neutral-gray/40 rounded-full" />
 <div className="w-32 h-5 bg-neutral-gray/30 rounded" />
 </div>

 {}
 <div className="w-40 h-12 bg-neutral-gray/40 rounded-xl" />
 </div>
 </div>
 </div>

 {}
 <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-gray/30 rounded-full" />
 <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-neutral-gray/30 rounded-full" />

 {}
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
 {[...Array(3)].map((_, index) => (
 <div key={index} className="w-3 h-3 bg-neutral-gray/40 rounded-full" />
 ))}
 </div>
 </div>
 );
}