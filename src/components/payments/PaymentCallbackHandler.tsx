'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentCallbackHandlerProps {
 onSuccess?: (paymentId: string) => void;
 onFailure?: (error: string) => void;
}

type CallbackState = 'processing' | 'success' | 'failure' | 'idle';

export default function PaymentCallbackHandler({
 onSuccess,
 onFailure,
}: PaymentCallbackHandlerProps) {
 const [state, setState] = useState<CallbackState>('idle');
 const [message, setMessage] = useState<string>('');
 const router = useRouter();
 const searchParams = useSearchParams();

 const handlePaymentSuccess = useCallback(async (paymentId: string) => {
 try {

 setState('success');
 setMessage('Payment completed successfully!');
 
 if (onSuccess) {
 onSuccess(paymentId);
 }

 setTimeout(() => {
 router.push('/dashboard');
 }, 3000);
 } catch (error) {
 setState('failure');
 setMessage('Payment verification failed');
 
 if (onFailure) {
 onFailure('Payment verification failed');
 }
 }
 }, [onSuccess, onFailure, router]);

 const handlePaymentFailure = useCallback((error: string) => {
 setState('failure');
 setMessage(error);
 
 if (onFailure) {
 onFailure(error);
 }

 setTimeout(() => {
 router.push('/dashboard');
 }, 5000);
 }, [onFailure, router]);

 useEffect(() => {
 const paymentId = searchParams.get('payment_id');
 const status = searchParams.get('status');
 const error = searchParams.get('error');

 if (paymentId && status) {
 setState('processing');
 
 if (status === 'success') {
 handlePaymentSuccess(paymentId);
 } else if (status === 'failure') {
 handlePaymentFailure(error || 'Payment failed');
 }
 }
 }, [searchParams, handlePaymentSuccess, handlePaymentFailure]);

 if (state === 'idle') {
 return null;
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
 <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
 {state === 'processing' && (
 <>
 <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-purple-600" />
 <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h2>
 <p className="text-gray-600">Please wait while we verify your payment...</p>
 </>
 )}

 {state === 'success' && (
 <>
 <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
 <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
 <p className="text-gray-600 mb-6">{message}</p>
 <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
 </>
 )}

 {state === 'failure' && (
 <>
 <XCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
 <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
 <p className="text-gray-600 mb-6">{message}</p>
 <div className="space-y-3">
 <button
 onClick={() => router.push('/dashboard')}
 className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
 >
 Go to Dashboard
 </button>
 <button
 onClick={() => router.back()}
 className="w-full text-purple-600 py-2 px-4 rounded-lg border border-purple-600 hover:bg-purple-50 transition-colors"
 >
 Try Again
 </button>
 </div>
 </>
 )}
 </div>
 </div>
 );
}