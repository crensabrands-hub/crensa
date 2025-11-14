

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import type { WalletBalance } from "@/types";

interface UseWalletBalanceReturn {
 balance: WalletBalance | null;
 isLoading: boolean;
 error: string | null;
 refreshBalance: () => Promise<void>;
 subscribeToUpdates: boolean;
 setSubscribeToUpdates: (subscribe: boolean) => void;
}

export function useWalletBalance(
 autoRefresh: boolean = true
): UseWalletBalanceReturn {
 const { userProfile } = useAuthContext();
 const [balance, setBalance] = useState<WalletBalance | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [subscribeToUpdates, setSubscribeToUpdates] = useState(autoRefresh);

 const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
 const eventSourceRef = useRef<EventSource | null>(null);

 const fetchBalance = useCallback(
 async (showLoading = true) => {
 if (!userProfile?.id) return;

 if (showLoading) {
 setIsLoading(true);
 }
 setError(null);

 try {
 const response = await fetch("/api/wallet/balance", {
 method: "GET",
 headers: {
 "Content-Type": "application/json",
 },
 });

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();
 setBalance(data);
 } catch (err) {
 console.error("Error fetching wallet balance:", err);
 setError(err instanceof Error ? err.message : "Failed to load balance");
 } finally {
 setIsLoading(false);
 }
 },
 [userProfile?.id]
 );

 const refreshBalance = useCallback(async () => {
 await fetchBalance(false);
 }, [fetchBalance]);

 const setupPolling = useCallback(() => {
 if (!subscribeToUpdates) return;

 if (refreshIntervalRef.current) {
 clearInterval(refreshIntervalRef.current);
 }

 refreshIntervalRef.current = setInterval(() => {
 fetchBalance(false);
 }, 30000);
 }, [fetchBalance, subscribeToUpdates]);

 const setupRealTimeUpdates = useCallback(() => {
 if (!userProfile?.id || !subscribeToUpdates) return;

 if (eventSourceRef.current) {
 eventSourceRef.current.close();
 }

 try {

 const eventSource = new EventSource(
 `/api/wallet/balance/stream?userId=${userProfile.id}`
 );

 eventSource.onmessage = (event) => {
 try {
 const data = JSON.parse(event.data);
 setBalance(data);
 } catch (error) {
 console.error("Error parsing SSE data:", error);
 }
 };

 eventSource.onerror = (error) => {
 console.error("SSE connection error:", error);
 eventSource.close();

 setupPolling();
 };

 eventSourceRef.current = eventSource;
 } catch (error) {
 console.error("Error setting up SSE:", error);

 setupPolling();
 }
 }, [userProfile?.id, subscribeToUpdates, setupPolling]);

 useEffect(() => {
 fetchBalance();
 }, [fetchBalance]);

 useEffect(() => {
 if (subscribeToUpdates && userProfile?.id) {
 setupRealTimeUpdates();
 } else {

 if (eventSourceRef.current) {
 eventSourceRef.current.close();
 eventSourceRef.current = null;
 }
 if (refreshIntervalRef.current) {
 clearInterval(refreshIntervalRef.current);
 refreshIntervalRef.current = null;
 }
 }

 return () => {
 if (eventSourceRef.current) {
 eventSourceRef.current.close();
 }
 if (refreshIntervalRef.current) {
 clearInterval(refreshIntervalRef.current);
 }
 };
 }, [subscribeToUpdates, setupRealTimeUpdates, setupPolling, userProfile?.id]);

 useEffect(() => {
 const handleWalletUpdate = (event: CustomEvent) => {
 if (event.detail && event.detail.userId === userProfile?.id) {
 setBalance(event.detail.balance);
 }
 };

 window.addEventListener(
 "walletBalanceUpdate",
 handleWalletUpdate as EventListener
 );

 return () => {
 window.removeEventListener(
 "walletBalanceUpdate",
 handleWalletUpdate as EventListener
 );
 };
 }, [userProfile?.id]);

 return {
 balance,
 isLoading,
 error,
 refreshBalance,
 subscribeToUpdates,
 setSubscribeToUpdates,
 };
}

export function triggerWalletBalanceUpdate(
 userId: string,
 balance: WalletBalance
) {
 const event = new CustomEvent("walletBalanceUpdate", {
 detail: { userId, balance },
 });
 window.dispatchEvent(event);
}

export function useWalletStats() {
 const { userProfile } = useAuthContext();
 const [stats, setStats] = useState<{
 totalSpent: number;
 totalPurchased: number;
 transactionCount: number;
 averageTransaction: number;
 } | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchStats = useCallback(async () => {
 if (!userProfile?.id) return;

 setIsLoading(true);
 setError(null);

 try {
 const response = await fetch("/api/wallet/stats");

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();
 setStats(data);
 } catch (err) {
 console.error("Error fetching wallet stats:", err);
 setError(err instanceof Error ? err.message : "Failed to load stats");
 } finally {
 setIsLoading(false);
 }
 }, [userProfile?.id]);

 useEffect(() => {
 fetchStats();
 }, [fetchStats]);

 return {
 stats,
 isLoading,
 error,
 refreshStats: fetchStats,
 };
}
