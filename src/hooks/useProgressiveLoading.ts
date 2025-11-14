

import { useState, useEffect, useCallback } from 'react';
import { getMobileLoadingStrategy, isSlowConnection } from '@/lib/mobile-optimization';
import { calculateOptimalLoadingDuration } from '@/lib/performance';

interface ProgressiveLoadingOptions {
 stages?: string[];
 duration?: number;
 skipOnFastConnection?: boolean;
 onStageChange?: (stage: string, progress: number) => void;
 onComplete?: () => void;
}

interface ProgressiveLoadingState {
 currentStage: string;
 progress: number;
 isComplete: boolean;
 isLoading: boolean;
}

export const useProgressiveLoading = (options: ProgressiveLoadingOptions = {}) => {
 const {
 stages = ['initial', 'layout', 'content', 'complete'],
 duration,
 skipOnFastConnection = true,
 onStageChange,
 onComplete,
 } = options;

 const [state, setState] = useState<ProgressiveLoadingState>({
 currentStage: stages[0],
 progress: 0,
 isComplete: false,
 isLoading: true,
 });

 const loadingStrategy = getMobileLoadingStrategy();
 const optimalDuration = duration || calculateOptimalLoadingDuration();

 useEffect(() => {

 if (skipOnFastConnection && !isSlowConnection()) {
 setState({
 currentStage: stages[stages.length - 1],
 progress: 100,
 isComplete: true,
 isLoading: false,
 });
 onComplete?.();
 return;
 }

 const stageInterval = optimalDuration / stages.length;
 let currentStageIndex = 0;
 let startTime = Date.now();

 const updateProgress = () => {
 const elapsed = Date.now() - startTime;
 const totalProgress = Math.min((elapsed / optimalDuration) * 100, 100);

 const expectedStageIndex = Math.floor(elapsed / stageInterval);
 const actualStageIndex = Math.min(expectedStageIndex, stages.length - 1);
 
 if (actualStageIndex !== currentStageIndex) {
 currentStageIndex = actualStageIndex;
 onStageChange?.(stages[currentStageIndex], totalProgress);
 }

 const newState = {
 currentStage: stages[currentStageIndex],
 progress: totalProgress,
 isComplete: totalProgress >= 100,
 isLoading: totalProgress < 100,
 };

 setState(newState);

 if (totalProgress >= 100) {
 onComplete?.();
 } else {
 requestAnimationFrame(updateProgress);
 }
 };

 const animationId = requestAnimationFrame(updateProgress);

 return () => {
 cancelAnimationFrame(animationId);
 };
 }, [stages, optimalDuration, skipOnFastConnection, onStageChange, onComplete]);

 const skipToStage = useCallback((stageName: string) => {
 const stageIndex = stages.indexOf(stageName);
 if (stageIndex === -1) return;

 const progress = ((stageIndex + 1) / stages.length) * 100;
 setState({
 currentStage: stageName,
 progress,
 isComplete: stageIndex === stages.length - 1,
 isLoading: stageIndex < stages.length - 1,
 });
 }, [stages]);

 const complete = useCallback(() => {
 setState({
 currentStage: stages[stages.length - 1],
 progress: 100,
 isComplete: true,
 isLoading: false,
 });
 onComplete?.();
 }, [stages, onComplete]);

 return {
 ...state,
 skipToStage,
 complete,
 loadingStrategy,
 };
};

export const useSkeletonLoading = (duration?: number) => {
 const [isVisible, setIsVisible] = useState(true);
 const loadingStrategy = getMobileLoadingStrategy();
 const skeletonDuration = duration || loadingStrategy.skeletonDuration;

 useEffect(() => {
 const timer = setTimeout(() => {
 setIsVisible(false);
 }, skeletonDuration);

 return () => clearTimeout(timer);
 }, [skeletonDuration]);

 const hide = useCallback(() => {
 setIsVisible(false);
 }, []);

 return {
 isVisible,
 hide,
 duration: skeletonDuration,
 };
};

export const useLazyComponentLoading = (threshold: number = 0.1) => {
 const [shouldLoad, setShouldLoad] = useState(false);
 const [element, setElement] = useState<Element | null>(null);

 const ref = useCallback((node: Element | null) => {
 if (node) setElement(node);
 }, []);

 useEffect(() => {
 if (!element) return;

 const loadingStrategy = getMobileLoadingStrategy();
 const observerThreshold = loadingStrategy.lazyLoadThreshold || threshold;

 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) {
 setShouldLoad(true);
 observer.disconnect();
 }
 },
 { 
 threshold: observerThreshold,
 rootMargin: '50px' // Start loading slightly before element is visible
 }
 );

 observer.observe(element);

 return () => observer.disconnect();
 }, [element, threshold]);

 return { ref, shouldLoad };
};

export const useAdaptiveLoading = () => {
 const [config, setConfig] = useState({
 enableHeavyAnimations: true,
 preloadImages: true,
 imageQuality: 85,
 pollingInterval: 5000,
 enableAggressiveCaching: false,
 });

 useEffect(() => {
 const updateConfig = async () => {
 const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
 const isSlowConn = isSlowConnection();

 let batteryInfo = { lowBattery: false, charging: true };
 if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
 try {
 const battery = await (navigator as any).getBattery();
 batteryInfo = {
 lowBattery: battery.level < 0.2,
 charging: battery.charging,
 };
 } catch {

 }
 }

 setConfig({
 enableHeavyAnimations: !batteryInfo.lowBattery && !isSlowConn,
 preloadImages: !isMobile && !isSlowConn,
 imageQuality: batteryInfo.lowBattery || isSlowConn ? 70 : 85,
 pollingInterval: batteryInfo.lowBattery ? 10000 : 5000,
 enableAggressiveCaching: isMobile || isSlowConn,
 });
 };

 updateConfig();
 }, []);

 return config;
};

export const useLoadingTransition = (isLoading: boolean, duration: number = 300) => {
 const [isVisible, setIsVisible] = useState(isLoading);
 const [shouldRender, setShouldRender] = useState(isLoading);

 useEffect(() => {
 if (isLoading) {
 setShouldRender(true);
 setIsVisible(true);
 } else {
 setIsVisible(false);
 const timer = setTimeout(() => {
 setShouldRender(false);
 }, duration);
 return () => clearTimeout(timer);
 }
 }, [isLoading, duration]);

 return {
 shouldRender,
 isVisible,
 transitionClasses: `transition-opacity duration-${duration} ${
 isVisible ? 'opacity-100' : 'opacity-0'
 }`,
 };
};