'use client';

import PaymentCallbackHandler from '@/components/payments/PaymentCallbackHandler';

export default function PaymentCallbackPage() {
 return (
 <PaymentCallbackHandler
 onSuccess={(paymentId) => {
 console.log('Payment successful:', paymentId);

 }}
 onFailure={(error) => {
 console.error('Payment failed:', error);

 }}
 />
 );
}