import Razorpay from 'razorpay';

export const razorpayConfig = {
 keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
 keySecret: process.env.RAZORPAY_KEY_SECRET!,
 webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_webhook_secret',
};

if (typeof window === 'undefined') {
 if (!razorpayConfig.keyId) {
 throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is required');
 }

 if (!razorpayConfig.keySecret) {
 throw new Error('RAZORPAY_KEY_SECRET is required');
 }

 if (process.env.NODE_ENV === 'production' && (!razorpayConfig.webhookSecret || razorpayConfig.webhookSecret === 'your_webhook_secret_here')) {
 throw new Error('RAZORPAY_WEBHOOK_SECRET is required in production');
 }
}

export const razorpayInstance: Razorpay | null = typeof window === 'undefined' ? new Razorpay({
 key_id: razorpayConfig.keyId,
 key_secret: razorpayConfig.keySecret,
}) : null;

export function getRazorpayInstance(): Razorpay {
 if (!razorpayInstance) {
 throw new Error('Razorpay instance not available. This should only be called on server-side.');
 }
 return razorpayInstance;
}