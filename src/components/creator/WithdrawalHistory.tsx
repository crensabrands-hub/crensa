"use client";

import { useState, useEffect } from "react";
import { CoinBalance } from "@/components/wallet/CoinBalance";
import { coinsToRupees } from "@/lib/utils/coin-utils";

interface Withdrawal {
    id: string;
    coins: number;
    rupees: number;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface WithdrawalHistoryProps {
    limit?: number;
    showTitle?: boolean;
}

export function WithdrawalHistory({ limit, showTitle = true }: WithdrawalHistoryProps) {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/creator/withdraw');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch withdrawal history');
                }

                if (data.success) {
                    const withdrawalList = limit ? data.withdrawals.slice(0, limit) : data.withdrawals;
                    setWithdrawals(withdrawalList);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load withdrawal history');
                console.error('Error fetching withdrawals:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWithdrawals();
    }, [limit]);

    const getStatusBadge = (status: string) => {
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {showTitle && (
                    <h3 className="text-xl font-semibold text-primary-navy">
                        Withdrawal History
                    </h3>
                )}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                {showTitle && (
                    <h3 className="text-xl font-semibold text-primary-navy">
                        Withdrawal History
                    </h3>
                )}
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-outline">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (withdrawals.length === 0) {
        return (
            <div className="space-y-4">
                {showTitle && (
                    <h3 className="text-xl font-semibold text-primary-navy">
                        Withdrawal History
                    </h3>
                )}
                <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
                    <svg
                        className="w-16 h-16 text-neutral-dark-gray mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-neutral-dark-gray">No withdrawal history yet</p>
                    <p className="text-sm text-neutral-dark-gray mt-2">
                        Your withdrawal requests will appear here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showTitle && (
                <h3 className="text-xl font-semibold text-primary-navy">
                    Withdrawal History
                </h3>
            )}

            <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                    <div
                        key={withdrawal.id}
                        className="bg-white border border-neutral-light-gray rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <CoinBalance balance={withdrawal.coins} size="medium" />
                                    <span className="text-neutral-dark-gray">→</span>
                                    <span className="text-lg font-bold text-accent-green">
                                        ₹{withdrawal.rupees.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-dark-gray">
                                    {withdrawal.description}
                                </p>
                            </div>
                            <div className="ml-4">
                                {getStatusBadge(withdrawal.status)}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-dark-gray pt-3 border-t border-neutral-light-gray">
                            <div className="flex items-center gap-4">
                                <span>
                                    Requested: {new Date(withdrawal.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                                {withdrawal.status === 'completed' && (
                                    <span>
                                        Completed: {new Date(withdrawal.updatedAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono text-xs">ID: {withdrawal.id.slice(0, 8)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {limit && withdrawals.length >= limit && (
                <div className="text-center pt-4">
                    <button className="btn-outline">
                        View All Withdrawals
                    </button>
                </div>
            )}
        </div>
    );
}
