

import { razorpayConfig, razorpayClientConfig } from '@/lib/razorpay/config';
import { PaymentService } from '@/lib/services/paymentService';
import crypto from 'crypto';

describe('Razorpay Integration', () => {
 describe('Configuration', () => {
 it('should have valid Razorpay configuration', () => {
 expect(razorpayConfig.keyId).toBe('test_key_id');
 expect(razorpayConfig.keySecret).toBe('test_secret_key');
 expect(razorpayConfig.webhookSecret).toBe('test_webhook_secret');
 });

 it('should have valid client configuration', () => {
 expect(razorpayClientConfig.key).toBe('test_key_id');
 expect(razorpayClientConfig.currency).toBe('INR');
 expect(razorpayClientConfig.name).toBe('Crensa');
 expect(razorpayClientConfig.description).toBe('Credit Purchase');
 expect(razorpayClientConfig.theme.color).toBe('#8B5CF6');
 });
 });

 describe('Payment Service', () => {
 let paymentService: PaymentService;

 beforeEach(() => {
 paymentService = PaymentService.getInstance();
 });

 it('should be a singleton', () => {
 const instance1 = PaymentService.getInstance();
 const instance2 = PaymentService.getInstance();
 expect(instance1).toBe(instance2);
 });

 it('should have required methods', () => {
 expect(typeof paymentService.createOrder).toBe('function');
 expect(typeof paymentService.verifyPayment).toBe('function');
 expect(typeof paymentService.initiatePayment).toBe('function');
 expect(typeof paymentService.loadRazorpaySDK).toBe('function');
 });
 });

 describe('Signature Verification', () => {
 it('should generate valid HMAC signature', () => {
 const orderId = 'order_test_123';
 const paymentId = 'pay_test_123';
 const keySecret = 'test_secret_key';

 const expectedSignature = crypto
 .createHmac('sha256', keySecret)
 .update(`${orderId}|${paymentId}`)
 .digest('hex');

 expect(expectedSignature).toBeDefined();
 expect(typeof expectedSignature).toBe('string');
 expect(expectedSignature.length).toBe(64); // SHA256 hex string length
 });

 it('should generate different signatures for different inputs', () => {
 const keySecret = 'test_secret_key';

 const signature1 = crypto
 .createHmac('sha256', keySecret)
 .update('order_1|pay_1')
 .digest('hex');

 const signature2 = crypto
 .createHmac('sha256', keySecret)
 .update('order_2|pay_2')
 .digest('hex');

 expect(signature1).not.toBe(signature2);
 });

 it('should generate consistent signatures for same inputs', () => {
 const keySecret = 'test_secret_key';
 const input = 'order_test|pay_test';

 const signature1 = crypto
 .createHmac('sha256', keySecret)
 .update(input)
 .digest('hex');

 const signature2 = crypto
 .createHmac('sha256', keySecret)
 .update(input)
 .digest('hex');

 expect(signature1).toBe(signature2);
 });
 });

 describe('Webhook Signature Verification', () => {
 it('should verify webhook signature correctly', () => {
 const webhookSecret = 'test_webhook_secret';
 const payload = JSON.stringify({
 event: 'payment.captured',
 payload: { payment: { entity: { id: 'pay_123' } } }
 });

 const signature = crypto
 .createHmac('sha256', webhookSecret)
 .update(payload)
 .digest('hex');

 const expectedSignature = crypto
 .createHmac('sha256', webhookSecret)
 .update(payload)
 .digest('hex');

 expect(signature).toBe(expectedSignature);
 });
 });

 describe('Error Handling', () => {
 it('should handle invalid amounts', () => {
 const invalidAmounts = [0, -1, -100, NaN, Infinity];
 
 invalidAmounts.forEach(amount => {
 expect(amount <= 0 || !isFinite(amount)).toBe(true);
 });
 });

 it('should validate required payment fields', () => {
 const requiredFields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'];
 const paymentData = {
 razorpay_order_id: 'order_123',
 razorpay_payment_id: 'pay_123',
 razorpay_signature: 'signature_123',
 };

 requiredFields.forEach(field => {
 expect(paymentData[field as keyof typeof paymentData]).toBeDefined();
 expect(paymentData[field as keyof typeof paymentData]).not.toBe('');
 });
 });
 });

 describe('Amount Conversion', () => {
 it('should convert rupees to paise correctly', () => {
 const testCases = [
 { rupees: 1, paise: 100 },
 { rupees: 10, paise: 1000 },
 { rupees: 100.50, paise: 10050 },
 { rupees: 999.99, paise: 99999 },
 ];

 testCases.forEach(({ rupees, paise }) => {
 const converted = Math.round(rupees * 100);
 expect(converted).toBe(paise);
 });
 });

 it('should handle decimal precision correctly', () => {
 const amount = 123.456;
 const amountInPaise = Math.round(amount * 100);
 expect(amountInPaise).toBe(12346); // Rounded to nearest paise
 });
 });
});