'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { paymentService, PaymentOptions, RazorpaySuccessResponse, RazorpayErrorResponse } from '@/lib/services/paymentService';

interface PaymentModalProps {
 isOpen: boolean;
 onClose: () => void;
 amount: number;
 coins: number;
 userDetails: {
 name: string;
 email: string;
 contact: string;
 };
 onPaymentSuccess: (response: RazorpaySuccessResponse) => void;
 onPaymentFailure: (error: RazorpayErrorResponse) => void;
}

type PaymentState = 'idle' | 'loading' | 'processing' | 'success' | 'error';

export default function PaymentModal({
 isOpen,
 onClose,
 amount,
 coins,
 userDetails,
 onPaymentSuccess,
 onPaymentFailure,
}: PaymentModalProps) {
 const [paymentState, setPaymentState] = useState<PaymentState>('idle');
 const [error, setError] = useState<string | null>(null);
 const [sdkLoaded, setSdkLoaded] = useState(false);

 useEffect(() => {
 if (isOpen && !sdkLoaded) {
 setPaymentState('loading');
 paymentService
 .loadRazorpaySDK()
 .then(() => {
 setSdkLoaded(true);
 setPaymentState('idle');
 })
 .catch((error) => {
 setError('Failed to load payment system');
 setPaymentState('error');
 });
 }
 }, [isOpen, sdkLoaded]);

 const handlePayment = async () => {
 if (!sdkLoaded) {
 setError('Payment system not ready');
 return;
 }

 setPaymentState('processing');
 setError(null);

 const paymentOptions: PaymentOptions = {
 amount,
 coins,
 userDetails,
 onSuccess: (response) => {
 setPaymentState('success');
 onPaymentSuccess(response);

 setTimeout(() => {
 onClose();
 setPaymentState('idle');
 }, 2000);
 },
 onFailure: (error) => {
 setPaymentState('error');
 setError(error.description);
 onPaymentFailure(error);
 },
 };

 try {
 await paymentService.initiatePayment(paymentOptions);
 } catch (error) {
 setPaymentState('error');
 setError(error instanceof Error ? error.message : 'Payment failed');
 }
 };

 const handleClose = () => {
 if (paymentState !== 'processing') {
 onClose();
 setPaymentState('idle');
 setError(null);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
 {}
 {paymentState !== 'processing' && (
 <button
 onClick={handleClose}
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
 >
 <X className="w-6 h-6" />
 </button>
 )}

 {}
 <div className="text-center mb-6">
 <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <CreditCard className="w-8 h-8 text-purple-600" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Coins</h2>
 <p className="text-gray-600">Add coins to your wallet to watch content</p>
 </div>

 {}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <div className="flex justify-between items-center mb-2">
 <span className="text-gray-600">Coins</span>
 <span className="font-semibold">🪙 {coins.toLocaleString()}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Amount</span>
 <span className="font-semibold text-lg">₹{amount.toFixed(2)}</span>
 </div>
 </div>

 {}
 {paymentState === 'loading' && (
 <div className="text-center py-8">
 <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
 <p className="text-gray-600">Loading payment system...</p>
 </div>
 )}

 {paymentState === 'success' && (
 <div className="text-center py-8">
 <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
 <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
 <p className="text-gray-600">Coins have been added to your wallet</p>
 </div>
 )}

 {paymentState === 'error' && (
 <div className="text-center py-4">
 <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
 <p className="text-gray-600 mb-4">{error}</p>
 <button
 onClick={() => {
 setPaymentState('idle');
 setError(null);
 }}
 className="text-purple-600 hover:text-purple-700 font-medium"
 >
 Try Again
 </button>
 </div>
 )}

 {paymentState === 'processing' && (
 <div className="text-center py-8">
 <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
 <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
 <p className="text-gray-600">Please complete the payment in the popup window</p>
 </div>
 )}

 {}
 {(paymentState === 'idle' || paymentState === 'error') && (
 <button
 onClick={handlePayment}
 disabled={!sdkLoaded}
 className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {sdkLoaded ? `Pay ₹${amount.toFixed(2)}` : 'Loading...'}
 </button>
 )}

 {}
 <p className="text-xs text-gray-500 text-center mt-4">
 Payments are processed securely by Razorpay
 </p>
 </div>
 </div>
 );
}