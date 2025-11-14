"use client";

import { useState } from "react";
import { CoinBalance } from "@/components/wallet/CoinBalance";
import CoinInput from "@/components/wallet/CoinInput";
import { coinsToRupees } from "@/lib/utils/coin-utils";

interface WithdrawalFormProps {
 availableCoins: number;
 onWithdrawalSuccess?: (coins: number, rupees: number) => void;
 onCancel?: () => void;
}

interface WithdrawalResponse {
 success: boolean;
 withdrawalId?: string;
 coins: number;
 rupees: number;
 status: string;
 message: string;
 estimatedProcessingTime?: string;
}

export function WithdrawalForm({
 availableCoins,
 onWithdrawalSuccess,
 onCancel
}: WithdrawalFormProps) {
 const [coinAmount, setCoinAmount] = useState<number>(0);
 const [withdrawalMethod, setWithdrawalMethod] = useState<'bank_transfer' | 'upi' | 'paypal'>('bank_transfer');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [showConfirmation, setShowConfirmation] = useState(false);
 const [withdrawalResult, setWithdrawalResult] = useState<WithdrawalResponse | null>(null);

 const MIN_WITHDRAWAL_COINS = 2000; // 100 rupees
 const rupeeEquivalent = coinsToRupees(coinAmount);
 const isValidAmount = coinAmount >= MIN_WITHDRAWAL_COINS && coinAmount <= availableCoins;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 if (!isValidAmount) {
 setError(`Please enter a valid amount between ${MIN_WITHDRAWAL_COINS} and ${availableCoins} coins`);
 return;
 }

 setShowConfirmation(true);
 };

 const handleConfirmWithdrawal = async () => {
 setIsSubmitting(true);
 setError(null);

 try {
 const response = await fetch('/api/creator/withdraw', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 coinAmount,
 withdrawalMethod,
 }),
 });

 const data = await response.json();

 if (!response.ok) {
 throw new Error(data.error || 'Withdrawal request failed');
 }

 setWithdrawalResult(data);
 
 if (onWithdrawalSuccess) {
 onWithdrawalSuccess(data.coins, data.rupees);
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to process withdrawal');
 setShowConfirmation(false);
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleCancelConfirmation = () => {
 setShowConfirmation(false);
 };

 if (withdrawalResult) {
 return (
 <div className="space-y-6">
 <div className="text-center py-8">
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <h3 className="text-2xl font-bold text-primary-navy mb-2">
 Withdrawal Request Submitted
 </h3>
 <p className="text-neutral-dark-gray mb-6">
 {withdrawalResult.message}
 </p>

 <div className="bg-neutral-light-gray rounded-lg p-6 mb-6">
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Withdrawal ID:</span>
 <span className="font-mono text-sm text-primary-navy">{withdrawalResult.withdrawalId}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Coins Withdrawn:</span>
 <CoinBalance balance={withdrawalResult.coins} size="medium" />
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Rupee Equivalent:</span>
 <span className="text-xl font-bold text-accent-green">₹{withdrawalResult.rupees.toFixed(2)}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Status:</span>
 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
 {withdrawalResult.status}
 </span>
 </div>
 {withdrawalResult.estimatedProcessingTime && (
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Processing Time:</span>
 <span className="text-primary-navy">{withdrawalResult.estimatedProcessingTime}</span>
 </div>
 )}
 </div>
 </div>

 <button
 onClick={() => {
 setWithdrawalResult(null);
 setCoinAmount(0);
 if (onCancel) onCancel();
 }}
 className="btn-primary"
 >
 Done
 </button>
 </div>
 </div>
 );
 }

 if (showConfirmation) {
 return (
 <div className="space-y-6">
 <div>
 <h3 className="text-2xl font-bold text-primary-navy mb-2">
 Confirm Withdrawal
 </h3>
 <p className="text-neutral-dark-gray">
 Please review your withdrawal details before confirming.
 </p>
 </div>

 <div className="bg-neutral-light-gray rounded-lg p-6 space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Coins to Withdraw:</span>
 <CoinBalance balance={coinAmount} size="medium" />
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">You will receive:</span>
 <span className="text-2xl font-bold text-accent-green">₹{rupeeEquivalent.toFixed(2)}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Conversion Rate:</span>
 <span className="text-primary-navy">1 coin = ₹0.05</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Withdrawal Method:</span>
 <span className="text-primary-navy capitalize">{withdrawalMethod.replace('_', ' ')}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-neutral-dark-gray">Remaining Balance:</span>
 <CoinBalance balance={availableCoins - coinAmount} size="small" />
 </div>
 </div>

 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <p className="text-sm text-blue-800">
 <strong>Note:</strong> Withdrawal requests are processed within 3-5 business days. 
 You will receive a confirmation email once the payment is processed.
 </p>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
 <p className="text-sm text-red-800">{error}</p>
 </div>
 )}

 <div className="flex gap-4">
 <button
 onClick={handleCancelConfirmation}
 disabled={isSubmitting}
 className="btn-outline flex-1"
 >
 Cancel
 </button>
 <button
 onClick={handleConfirmWithdrawal}
 disabled={isSubmitting}
 className="btn-primary flex-1"
 >
 {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
 </button>
 </div>
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <h3 className="text-2xl font-bold text-primary-navy mb-2">
 Request Withdrawal
 </h3>
 <p className="text-neutral-dark-gray">
 Withdraw your coin earnings as rupees to your bank account.
 </p>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-teal/10 to-accent-green/10 rounded-lg p-6">
 <p className="text-sm text-neutral-dark-gray mb-2">Available Balance</p>
 <CoinBalance balance={availableCoins} size="large" showRupeeEquivalent />
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-2">
 Amount to Withdraw
 </label>
 <CoinInput
 value={coinAmount}
 onChange={setCoinAmount}
 min={MIN_WITHDRAWAL_COINS}
 max={availableCoins}
 showRupeeEquivalent
 error={
 coinAmount > 0 && coinAmount < MIN_WITHDRAWAL_COINS
 ? `Minimum withdrawal is ${MIN_WITHDRAWAL_COINS} coins (₹${coinsToRupees(MIN_WITHDRAWAL_COINS).toFixed(2)})`
 : coinAmount > availableCoins
 ? 'Insufficient balance'
 : undefined
 }
 />
 <p className="text-xs text-neutral-dark-gray mt-2">
 Minimum withdrawal: {MIN_WITHDRAWAL_COINS} coins (₹{coinsToRupees(MIN_WITHDRAWAL_COINS).toFixed(2)})
 </p>
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-2">
 Withdrawal Method
 </label>
 <select
 value={withdrawalMethod}
 onChange={(e) => setWithdrawalMethod(e.target.value as any)}
 className="w-full px-4 py-2 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal"
 >
 <option value="bank_transfer">Bank Transfer</option>
 <option value="upi">UPI</option>
 <option value="paypal">PayPal</option>
 </select>
 </div>

 {}
 {coinAmount > 0 && (
 <div className="bg-neutral-light-gray rounded-lg p-4">
 <div className="flex justify-between items-center mb-2">
 <span className="text-neutral-dark-gray">You will receive:</span>
 <span className="text-2xl font-bold text-accent-green">
 ₹{rupeeEquivalent.toFixed(2)}
 </span>
 </div>
 <p className="text-xs text-neutral-dark-gray">
 Conversion rate: 1 coin = ₹0.05 (20 coins = ₹1)
 </p>
 </div>
 )}

 {error && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
 <p className="text-sm text-red-800">{error}</p>
 </div>
 )}

 {}
 <div className="flex gap-4">
 {onCancel && (
 <button
 type="button"
 onClick={onCancel}
 className="btn-outline flex-1"
 >
 Cancel
 </button>
 )}
 <button
 type="submit"
 disabled={!isValidAmount || isSubmitting}
 className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Continue
 </button>
 </div>
 </form>
 );
}
