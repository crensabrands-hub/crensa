import React, { lazy } from 'react';

export const LazyFeatureSection = lazy(() => 
 import('@/components/sections').then(module => ({ 
 default: module.FeatureSection 
 }))
);

export const LazyWhyJoinNowSection = lazy(() => 
 import('@/components/sections').then(module => ({ 
 default: module.WhyJoinNowSection 
 }))
);

export const LazyHowItWorksSection = lazy(() => 
 import('@/components/sections').then(module => ({ 
 default: module.HowItWorksSection 
 }))
);

export const LazyTestimonialsSection = lazy(() => 
 import('@/components/sections').then(module => ({ 
 default: module.TestimonialsSection 
 }))
);

export const LazyFAQSection = lazy(() => 
 import('@/components/sections').then(module => ({ 
 default: module.FAQSection 
 }))
);

export { SectionSkeleton } from '@/components/ui/LoadingScreen';