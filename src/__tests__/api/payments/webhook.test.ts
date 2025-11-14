import { POST } from '@/app/api/payments/webhook/route';
import crypto from 'crypto';

jest.mock('@/lib/razorpay/config', () => ({
 razorpayConfig: {
 webhookSecret: 'test_webhook_secret',
 },
}));

describe('/api/payments/webhook', () => {
 const webhookSecret = 'test_webhook_secret';

 beforeEach(() => {
 jest.clearAllMocks();

 jest.spyOn(console, 'log').mockImplementation();
 jest.spyOn(console, 'error').mockImplementation();
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 const createWebhookSignature = (body: string): string => {
 return crypto
 .createHmac('sha256', webhookSecret)
 .update(body)
 .digest('hex');
 };

 const createMockRequest = (body: string, signature?: string) => {
 return {
 text: async () => body,
 headers: {
 get: (name: string) => {
 if (name === 'x-razorpay-signature') {
 return signature;
 }
 return null;
 },
 },
 } as any;
 };

 const createMockWebhookEvent = (eventType: string) => {
 return {
 entity: 'event',
 account_id: 'acc_123',
 event: eventType,
 contains: ['payment'],
 payload: {
 payment: {
 entity: {
 id: 'pay_123',
 amount: 10000,
 currency: 'INR',
 status: 'captured',
 order_id: 'order_123',
 method: 'card',
 captured: true,
 notes: {
 userId: 'user_123',
 credits: '1000',
 createdAt: '2024-01-01T00:00:00.000Z',
 },
 created_at: 1640995200,
 },
 },
 },
 created_at: 1640995200,
 };
 };

 it('should process payment.captured webhook successfully', async () => {
 const webhookEvent = createMockWebhookEvent('payment.captured');
 const body = JSON.stringify(webhookEvent);
 const signature = createWebhookSignature(body);

 const request = createMockRequest(body, signature);

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.status).toBe('success');
 expect(console.log).toHaveBeenCalledWith('Payment captured:', expect.objectContaining({
 paymentId: 'pay_123',
 orderId: 'order_123',
 amount: 10000,
 userId: 'user_123',
 credits: '1000',
 }));
 });

 it('should process payment.failed webhook successfully', async () => {
 const webhookEvent = createMockWebhookEvent('payment.failed');
 const body = JSON.stringify(webhookEvent);
 const signature = createWebhookSignature(body);

 const request = createMockRequest(body, signature);

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.status).toBe('success');
 expect(console.log).toHaveBeenCalledWith('Payment failed:', expect.objectContaining({
 paymentId: 'pay_123',
 orderId: 'order_123',
 userId: 'user_123',
 }));
 });

 it('should handle unhandled webhook events', async () => {
 const webhookEvent = createMockWebhookEvent('unknown.event');
 const body = JSON.stringify(webhookEvent);
 const signature = createWebhookSignature(body);

 const request = createMockRequest(body, signature);

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.status).toBe('success');
 expect(console.log).toHaveBeenCalledWith('Unhandled webhook event: unknown.event');
 });

 it('should return 400 for missing signature', async () => {
 const webhookEvent = createMockWebhookEvent('payment.captured');
 const body = JSON.stringify(webhookEvent);

 const request = createMockRequest(body);

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Missing webhook signature');
 });

 it('should return 400 for invalid signature', async () => {
 const webhookEvent = createMockWebhookEvent('payment.captured');
 const body = JSON.stringify(webhookEvent);

 const request = createMockRequest(body, 'invalid_signature');

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid webhook signature');
 expect(console.error).toHaveBeenCalledWith('Invalid webhook signature');
 });

 it('should handle malformed JSON gracefully', async () => {
 const body = 'invalid json';
 const signature = createWebhookSignature(body);

 const request = createMockRequest(body, signature);

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(500);
 expect(data.error).toBe('Webhook processing failed');
 expect(console.error).toHaveBeenCalledWith('Webhook processing error:', expect.any(Error));
 });
});