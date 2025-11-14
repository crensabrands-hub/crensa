"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import type {
 CreditDeductionResult,
 WalletBalance,
 InsufficientCreditsError,
 ViewingSession,
} from "@/types";

interface UseCreditDeductionReturn {
 deductCredits: (
 videoId: string
 ) => Promise<CreditDeductionResult & { viewingSession?: ViewingSession }>;
 getWalletBalance: () => Promise<WalletBalance | null>;
 isProcessing: boolean;
 error: string | InsufficientCreditsError | null;
 clearError: () => void;
}

export function useCreditDeduction(): UseCreditDeductionReturn {
 const { userProfile } = useAuthContext();
 const [isProcessing, setIsProcessing] = useState(false);
 const [error, setError] = useState<string | InsufficientCreditsError | null>(
 null
 );

 const getWalletBalance =
 useCallback(async (): Promise<WalletBalance | null> => {
 if (!userProfile) return null;

 try {
 const response = await fetch("/api/wallet/balance");

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 return await response.json();
 } catch (err) {
 console.error("Error fetching wallet balance:", err);
 setError(
 err instanceof Error ? err.message : "Failed to fetch balance"
 );
 return null;
 }
 }, [userProfile]);

 const deductCredits = useCallback(
 async (
 videoId: string
 ): Promise<CreditDeductionResult & { viewingSession?: ViewingSession }> => {
 if (!userProfile) {
 const result = {
 success: false,
 newBalance: 0,
 error: "User not authenticated",
 };
 setError(result.error);
 return result;
 }

 setIsProcessing(true);
 setError(null);

 try {
 const response = await fetch(`/api/videos/${videoId}/watch`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 });

 const data = await response.json();

 if (!response.ok) {
 const result = {
 success: false,
 newBalance: data.balance || 0,
 error: data.error || "Failed to process payment",
 };
 setError(result.error);
 return result;
 }

 if (data.alreadyWatched) {
 return {
 success: true,
 newBalance: data.newBalance || 0,
 alreadyWatched: true,
 };
 }

 return {
 success: true,
 newBalance: data.newBalance,
 transactionId: data.transactionId,
 viewingSession: data.viewingSession,
 };
 } catch (err) {
 console.error("Error deducting credits:", err);
 const result = {
 success: false,
 newBalance: 0,
 error: err instanceof Error ? err.message : "Network error",
 };
 setError(result.error);
 return result;
 } finally {
 setIsProcessing(false);
 }
 },
 [userProfile]
 );

 const clearError = useCallback(() => {
 setError(null);
 }, []);

 return {
 deductCredits,
 getWalletBalance,
 isProcessing,
 error,
 clearError,
 };
}
