"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { MemberProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface WalletData {
 balance: number;
 transactions: Array<{
 id: string;
 type: 'credit' | 'debit';
 amount: number;
 description: string;
 timestamp: Date;
 status: 'completed' | 'pending' | 'failed';
 }>;
}

function WalletContent() {
 const { userProfile } = useAuthContext();
 const [walletData, setWalletData] = useState<WalletData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [rechargeAmount, setRechargeAmount] = useState<number>(100);

 useEffect(() => {
 const fetchWalletData = async () => {
 try {
 setLoading(true);
 const response = await fetch('/api/wallet/balance');
 const result = await response.json();
 
 if (response.ok) {
 setWalletData(result);
 } else {
 throw new Error(result.error || 'Failed to fetch wallet data');
 }
 } catch (err) {
 console.error('Error fetching wallet data:', err);
 setError(err instanceof Error ? err.message : 'Unknown error occurred');
 } finally {
 setLoading(false);
 }
 };

 if (userProfile) {
 fetchWalletData();
 }
 }, [userProfile]);

 const handleRecharge = async () => {
 try {
 const response = await fetch('/api/payments/create-order', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 amount: rechargeAmount,
 currency: 'INR',
 type: 'wallet_recharge'
 }),
 });

 const result = await response.json();
 
 if (response.ok) {

 console.log('Payment order created:', result);
 alert(`Recharge of ₹${rechargeAmount} initiated. This feature will be fully implemented soon.`);
 } else {
 throw new Error(result.error || 'Failed to create payment order');
 }
 } catch (err) {
 console.error('Error creating payment order:', err);
 alert('Failed to initiate recharge. Please try again.');
 }
 };

 if (loading) {
 return <LoadingScreen message="Loading wallet..." variant="dashboard" fullScreen={false} />;
 }

 if (error) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">Wallet</h1>
 <p className="text-neutral-dark-gray">Manage your wallet and transactions</p>
 </div>
 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
 <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-red-800">Error Loading Wallet</h3>
 <p className="text-red-600">{error}</p>
 <button 
 onClick={() => window.location.reload()} 
 className="mt-2 text-sm text-red-700 underline hover:text-red-800"
 >
 Try again
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {}
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">Wallet</h1>
 <p className="text-neutral-dark-gray">Manage your wallet and transactions</p>
 </div>

 {}
 <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-medium opacity-90">Current Balance</h2>
 <p className="text-3xl font-bold">₹{walletData?.balance?.toFixed(2) || '0.00'}</p>
 </div>
 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 </div>
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">Recharge Wallet</h3>
 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-1">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Recharge Amount (₹)
 </label>
 <input
 type="number"
 min="10"
 max="10000"
 step="10"
 value={rechargeAmount}
 onChange={(e) => setRechargeAmount(Number(e.target.value))}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Enter amount"
 />
 </div>
 <div className="flex items-end">
 <button
 onClick={handleRecharge}
 disabled={rechargeAmount < 10}
 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 Recharge Now
 </button>
 </div>
 </div>
 
 {}
 <div className="mt-4">
 <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
 <div className="flex flex-wrap gap-2">
 {[100, 200, 500, 1000, 2000].map((amount) => (
 <button
 key={amount}
 onClick={() => setRechargeAmount(amount)}
 className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
 >
 ₹{amount}
 </button>
 ))}
 </div>
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">Recent Transactions</h3>
 
 {walletData?.transactions && walletData.transactions.length > 0 ? (
 <div className="space-y-3">
 {walletData.transactions.map((transaction) => (
 <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
 <div className="flex items-center space-x-3">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
 transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
 }`}>
 <svg className={`w-4 h-4 ${
 transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
 d={transaction.type === 'credit' ? "M12 4v16m8-8H4" : "M20 12H4"} />
 </svg>
 </div>
 <div>
 <p className="font-medium text-gray-900">{transaction.description}</p>
 <p className="text-sm text-gray-500">
 {new Date(transaction.timestamp).toLocaleDateString()}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className={`font-semibold ${
 transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
 }`}>
 {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
 </p>
 <p className={`text-xs ${
 transaction.status === 'completed' ? 'text-green-600' : 
 transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
 }`}>
 {transaction.status}
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8">
 <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <p className="text-gray-500">No transactions yet</p>
 <p className="text-sm text-gray-400">Your transaction history will appear here</p>
 </div>
 )}
 </div>
 </div>
 );
}

export default function WalletPage() {
 return (
 <MemberProtectedRoute>
 <WalletContent />
 </MemberProtectedRoute>
 );
}