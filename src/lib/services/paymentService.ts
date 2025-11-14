import { razorpayClientConfig } from '@/lib/razorpay/client-config';

export interface PaymentOptions {
 amount: number;
 coins: number;
 userDetails: {
 name: string;
 email: string;
 contact: string;
 };
 onSuccess: (response: RazorpaySuccessResponse) => void;
 onFailure: (error: RazorpayErrorResponse) => void;
}

export interface RazorpaySuccessResponse {
 razorpay_payment_id: string;
 razorpay_order_id: string;
 razorpay_signature: string;
}

export interface RazorpayErrorResponse {
 code: string;
 description: string;
 source: string;
 step: string;
 reason: string;
 metadata: Record<string, any>;
}

export interface CreateOrderResponse {
 orderId: string;
 amount: number;
 currency: string;
 keyId: string;
}

export class PaymentService {
 private static instance: PaymentService;

 public static getInstance(): PaymentService {
 if (!PaymentService.instance) {
 PaymentService.instance = new PaymentService();
 }
 return PaymentService.instance;
 }

 async createOrder(amount: number, coins: number): Promise<CreateOrderResponse> {
 try {
 const response = await fetch('/api/payments/create-order', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 amount,
 coins,
 currency: 'INR',
 }),
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Failed to create order');
 }

 return await response.json();
 } catch (error) {
 console.error('Error creating payment order:', error);
 throw new Error(
 error instanceof Error ? error.message : 'Failed to create payment order'
 );
 }
 }

 async verifyPayment(paymentData: RazorpaySuccessResponse): Promise<boolean> {
 try {
 const response = await fetch('/api/payments/verify', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(paymentData),
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Payment verification failed');
 }

 const result = await response.json();
 return result.success;
 } catch (error) {
 console.error('Error verifying payment:', error);
 throw new Error(
 error instanceof Error ? error.message : 'Payment verification failed'
 );
 }
 }

 async initiatePayment(options: PaymentOptions): Promise<void> {
 try {

 if (typeof window === 'undefined' || !window.Razorpay) {
 throw new Error('Razorpay SDK not loaded');
 }

 const orderData = await this.createOrder(options.amount, options.coins);

 const razorpayOptions = {
 ...razorpayClientConfig,
 amount: orderData.amount,
 order_id: orderData.orderId,
 handler: async (response: RazorpaySuccessResponse) => {
 try {

 const isVerified = await this.verifyPayment(response);
 
 if (isVerified) {
 options.onSuccess(response);
 } else {
 options.onFailure({
 code: 'VERIFICATION_FAILED',
 description: 'Payment verification failed',
 source: 'server',
 step: 'verification',
 reason: 'Invalid signature',
 metadata: { response },
 });
 }
 } catch (error) {
 options.onFailure({
 code: 'VERIFICATION_ERROR',
 description: error instanceof Error ? error.message : 'Verification error',
 source: 'server',
 step: 'verification',
 reason: 'Server error',
 metadata: { error },
 });
 }
 },
 prefill: {
 name: options.userDetails.name,
 email: options.userDetails.email,
 contact: options.userDetails.contact,
 },
 modal: {
 ondismiss: () => {
 options.onFailure({
 code: 'PAYMENT_CANCELLED',
 description: 'Payment was cancelled by user',
 source: 'user',
 step: 'payment',
 reason: 'User cancelled',
 metadata: {},
 });
 },
 },
 };

 const razorpay = new window.Razorpay(razorpayOptions);
 razorpay.open();
 } catch (error) {
 console.error('Error initiating payment:', error);
 options.onFailure({
 code: 'INITIATION_ERROR',
 description: error instanceof Error ? error.message : 'Failed to initiate payment',
 source: 'client',
 step: 'initiation',
 reason: 'Setup error',
 metadata: { error },
 });
 }
 }

 loadRazorpaySDK(): Promise<void> {
 return new Promise((resolve, reject) => {
 if (typeof window !== 'undefined' && window.Razorpay) {
 resolve();
 return;
 }

 const script = document.createElement('script');
 script.src = 'https://checkout.razorpay.com/v1/checkout.js';
 script.onload = () => resolve();
 script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
 document.head.appendChild(script);
 });
 }
}

declare global {
 interface Window {
 Razorpay: any;
 }
}

export const paymentService = PaymentService.getInstance();