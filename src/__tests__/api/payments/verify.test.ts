import { POST } from '@/app/api/payments/verify/route';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/razorpay/config', () => ({
 razorpayConfig: {
 keySecret: 'test_secret_key',
 },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/payments/verify', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 const createMockRequest = (body: any) => {
 return {
 json: async () => body,
 } as any;
 };

 it('should verify payment successfully with valid signature', async () => {

 mockAuth.mockResolvedValue({ userId: 'user_123' });

 const orderId = 'order_123';
 const paymentId = 'pay_123';
 const keySecret = 'test_secret_key';
 
 const expectedSignature = crypto
 .createHmac('sha256', keySecret)
 .update(`${orderId}|${paymentId}`)
 .digest('hex');

 const request = createMockRequest({
 razorpay_order_id: orderId,
 razorpay_payment_id: paymentId,
 razorpay_signature: expectedSignature,
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data).toEqual({
 success: true,
 paymentId: paymentId,
 orderId: orderId,
 });
 });

 it('should return 401 for unauthenticated user', async () => {
 mockAuth.mockResolvedValue({ userId: null });

 const request = createMockRequest({
 razorpay_order_id: 'order_123',
 razorpay_payment_id: 'pay_123',
 razorpay_signature: 'invalid_signature',
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.error).toBe('Unauthorized');
 });

 it('should return 400 for missing required fields', async () => {
 mockAuth.mockResolvedValue({ userId: 'user_123' });

 const request = createMockRequest({
 razorpay_order_id: 'order_123',

 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Missing required payment verification fields');
 });

 it('should return 400 for invalid signature', async () => {
 mockAuth.mockResolvedValue({ userId: 'user_123' });

 const request = createMockRequest({
 razorpay_order_id: 'order_123',
 razorpay_payment_id: 'pay_123',
 razorpay_signature: 'invalid_signature',
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid payment signature');
 });
});