"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { errorReportingService } from "@/lib/services/errorReportingService";

interface GracefulDegradationProps {
 children: ReactNode;
 fallback: ReactNode;
 featureName: string;
 enableRetry?: boolean;
 retryDelay?: number;
 maxRetries?: number;
 onFeatureFailure?: (error: Error) => void;
 onFeatureRestore?: () => void;
}

interface FeatureState {
 isWorking: boolean;
 error: Error | null;
 retryCount: number;
 isRetrying: boolean;
 lastFailureTime?: Date;
}

export function GracefulDegradation({
 children,
 fallback,
 featureName,
 enableRetry = true,
 retryDelay = 5000,
 maxRetries = 3,
 onFeatureFailure,
 onFeatureRestore,
}: GracefulDegradationProps) {
 const [featureState, setFeatureState] = useState<FeatureState>({
 isWorking: true,
 error: null,
 retryCount: 0,
 isRetrying: false,
 });

 const handleFeatureError = (error: Error) => {
 setFeatureState((prev) => ({
 ...prev,
 isWorking: false,
 error,
 lastFailureTime: new Date(),
 }));

 errorReportingService.captureException(error, {
 component: "graceful-degradation",
 action: "feature-failure",
 });

 if (onFeatureFailure) {
 onFeatureFailure(error);
 }

 if (enableRetry && featureState.retryCount < maxRetries) {
 setTimeout(() => {
 attemptFeatureRestore();
 }, retryDelay);
 }
 };

 const attemptFeatureRestore = () => {
 if (featureState.retryCount >= maxRetries) {
 return;
 }

 setFeatureState((prev) => ({
 ...prev,
 isRetrying: true,
 retryCount: prev.retryCount + 1,
 }));

 errorReportingService.captureMessage(
 `Attempting to restore feature: ${featureName}`,
 "low",
 {
 component: "graceful-degradation",
 action: "feature-restore-attempt",
 }
 );

 setTimeout(() => {
 setFeatureState((prev) => ({
 ...prev,
 isWorking: true,
 error: null,
 isRetrying: false,
 }));

 if (onFeatureRestore) {
 onFeatureRestore();
 }

 errorReportingService.captureMessage(
 `Feature restored successfully: ${featureName}`,
 "low",
 {
 component: "graceful-degradation",
 action: "feature-restored",
 }
 );
 }, 1000);
 };

 const manualRetry = () => {
 setFeatureState((prev) => ({
 ...prev,
 retryCount: 0,
 }));
 attemptFeatureRestore();
 };

 useEffect(() => {
 const handleError = (event: ErrorEvent) => {

 if (event.error && featureState.isWorking) {
 handleFeatureError(event.error);
 }
 };

 const handleUnhandledRejection = (event: PromiseRejectionEvent) => {

 if (event.reason && featureState.isWorking) {
 const error =
 event.reason instanceof Error
 ? event.reason
 : new Error(String(event.reason));
 handleFeatureError(error);
 }
 };

 window.addEventListener("error", handleError);
 window.addEventListener("unhandledrejection", handleUnhandledRejection);

 return () => {
 window.removeEventListener("error", handleError);
 window.removeEventListener(
 "unhandledrejection",
 handleUnhandledRejection
 );
 };
 }, [featureState.isWorking, handleFeatureError]);

 if (!featureState.isWorking) {
 return (
 <div className="relative">
 {fallback}

 {}
 <div className="absolute top-0 right-0 m-2">
 <div className="bg-orange-100 border border-orange-200 rounded-lg p-2 text-xs">
 <div className="flex items-center space-x-1">
 <svg
 className="w-3 h-3 text-orange-500"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path
 fillRule="evenodd"
 d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
 clipRule="evenodd"
 />
 </svg>
 <span className="text-orange-700">
 {featureName} temporarily unavailable
 </span>
 </div>

 {enableRetry && featureState.retryCount < maxRetries && (
 <button
 onClick={manualRetry}
 disabled={featureState.isRetrying}
 className="mt-1 text-orange-600 hover:text-orange-800 underline disabled:opacity-50"
 >
 {featureState.isRetrying ? "Retrying..." : "Try again"}
 </button>
 )}
 </div>
 </div>
 </div>
 );
 }

 return <>{children}</>;
}

export function withGracefulDegradation<P extends object>(
 Component: React.ComponentType<P>,
 fallbackComponent: React.ComponentType<P>,
 featureName: string,
 options: Partial<GracefulDegradationProps> = {}
) {
 return function GracefullyDegradedComponent(props: P) {
 return (
 <GracefulDegradation
 featureName={featureName}
 fallback={React.createElement(fallbackComponent, props)}
 {...options}
 >
 <Component {...props} />
 </GracefulDegradation>
 );
 };
}

export function useFeatureAvailability(featureName: string) {
 const [isAvailable, setIsAvailable] = useState(true);
 const [error, setError] = useState<Error | null>(null);

 const markFeatureUnavailable = (error: Error) => {
 setIsAvailable(false);
 setError(error);

 errorReportingService.captureException(error, {
 component: "feature-availability",
 action: "feature-marked-unavailable",
 });
 };

 const markFeatureAvailable = () => {
 setIsAvailable(true);
 setError(null);

 errorReportingService.captureMessage(
 `Feature marked as available: ${featureName}`,
 "low",
 {
 component: "feature-availability",
 action: "feature-marked-available",
 }
 );
 };

 return {
 isAvailable,
 error,
 markFeatureUnavailable,
 markFeatureAvailable,
 };
}
