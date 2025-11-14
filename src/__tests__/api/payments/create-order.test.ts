import { POST } from '@/app/api/payments/create-order/route';
import { auth } from '@clerk/nextjs/server';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/razorpay/config', () => ({
 razorpayInstance: {
 orders: {
 create: jest.fn(),
 },
 },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/payments/create-order', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 const createMockRequest = (body: any) => {
 return {
 json: async () => body,
 } as any;
 };

 it('should create payment order successfully', async () => {

 mockAuth.mockResolvedValue({ userId: 'user_123' });

 const mockOrder = {
 id: 'order_123',
 amount: 10000,
 currency: 'INR',
 };

 const { razorpayInstance } = require('@/lib/razorpay/config');
 razorpayInstance.orders.create.mockResolvedValue(mockOrder);

 const request = createMockRequest({
 amount: 100,
 credits: 1000,
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data).toEqual({
 orderId: 'order_123',
 amount: 10000,
 currency: 'INR',
 keyId: 'test_key_id',
 });

 expect(razorpayInstance.orders.create).toHaveBeenCalledWith({
 amount: 10000,
 currency: 'INR',
 receipt: expect.stringMatching(/^receipt_/),
 notes: {
 userId: 'user_123',
 credits: '1000',
 createdAt: expect.any(String),
 },
 });
 });

 it('should return 401 for unauthenticated user', async () => {

 mockAuth.mockResolvedValue({ userId: null });

 const request = createMockRequest({
 amount: 100,
 credits: 1000,
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.error).toBe('Unauthorized');
 });

 it('should return 400 for invalid amount', async () => {
 mockAuth.mockResolvedValue({ userId: 'user_123' });

 const request = createMockRequest({
 amount: 0,
 credits: 1000,
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid amount');
 });

 it('should handle Razorpay API errors', async () => {
 mockAuth.mockResolvedValue({ userId: 'user_123' });

 const { razorpayInstance } = require('@/lib/razorpay/config');
 razorpayInstance.orders.create.mockRejectedValue(new Error('Razorpay API error'));

 const request = createMockRequest({
 amount: 100,
 credits: 1000,
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(500);
 expect(data.error).toBe('Failed to create payment order');
 });
});