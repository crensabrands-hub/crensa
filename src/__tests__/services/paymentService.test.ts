
jest.mock('@/lib/razorpay/config', () => ({
 razorpayClientConfig: {
 key: 'test_key_id',
 currency: 'INR',
 name: 'Crensa',
 description: 'Credit Purchase',
 theme: {
 color: '#8B5CF6',
 },
 },
}));

import { PaymentService, paymentService } from '@/lib/services/paymentService';

global.fetch = jest.fn();

const mockRazorpay = {
 open: jest.fn(),
};

Object.defineProperty(window, 'Razorpay', {
 value: jest.fn().mockImplementation(() => mockRazorpay),
 writable: true,
});

describe('PaymentService', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (fetch as jest.MockedFunction<typeof fetch>).mockClear();
 });

 describe('createOrder', () => {
 it('should create order successfully', async () => {
 const mockResponse = {
 orderId: 'order_123',
 amount: 10000,
 currency: 'INR',
 keyId: 'test_key',
 };

 (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse,
 } as Response);

 const result = await paymentService.createOrder(100, 2000);

 expect(fetch).toHaveBeenCalledWith('/api/payments/create-order', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 amount: 100,
 coins: 2000,
 currency: 'INR',
 }),
 });

 expect(result).toEqual(mockResponse);
 });

 it('should handle API errors', async () => {
 (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Invalid amount' }),
 } as Response);

 await expect(paymentService.createOrder(0, 2000)).rejects.toThrow('Invalid amount');
 });

 it('should handle network errors', async () => {
 (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

 await expect(paymentService.createOrder(100, 2000)).rejects.toThrow('Network error');
 });
 });

 describe('verifyPayment', () => {
 it('should verify payment successfully', async () => {
 const mockResponse = { success: true };

 (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse,
 } as Response);

 const paymentData = {
 razorpay_order_id: 'order_123',
 razorpay_payment_id: 'pay_123',
 razorpay_signature: 'signature_123',
 };

 const result = await paymentService.verifyPayment(paymentData);

 expect(fetch).toHaveBeenCalledWith('/api/payments/verify', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(paymentData),
 });

 expect(result).toBe(true);
 });

 it('should handle verification failure', async () => {
 (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Invalid signature' }),
 } as Response);

 const paymentData = {
 razorpay_order_id: 'order_123',
 razorpay_payment_id: 'pay_123',
 razorpay_signature: 'invalid_signature',
 };

 await expect(paymentService.verifyPayment(paymentData)).rejects.toThrow('Invalid signature');
 });
 });

 describe('loadRazorpaySDK', () => {
 it('should resolve immediately if Razorpay is already loaded', async () => {
 window.Razorpay = jest.fn();

 await expect(paymentService.loadRazorpaySDK()).resolves.toBeUndefined();
 });

 it('should load Razorpay SDK dynamically', async () => {

 delete (window as any).Razorpay;

 const mockScript = {
 src: '',
 onload: null as (() => void) | null,
 onerror: null as (() => void) | null,
 };

 const mockAppendChild = jest.fn();
 
 jest.spyOn(document, 'createElement').mockReturnValue(mockScript as any);
 jest.spyOn(document.head, 'appendChild').mockImplementation(mockAppendChild);

 const loadPromise = paymentService.loadRazorpaySDK();

 if (mockScript.onload) {
 mockScript.onload();
 }

 await expect(loadPromise).resolves.toBeUndefined();

 expect(document.createElement).toHaveBeenCalledWith('script');
 expect(mockScript.src).toBe('https://checkout.razorpay.com/v1/checkout.js');
 expect(mockAppendChild).toHaveBeenCalledWith(mockScript);
 });

 it('should reject if script fails to load', async () => {
 delete (window as any).Razorpay;

 const mockScript = {
 src: '',
 onload: null as (() => void) | null,
 onerror: null as (() => void) | null,
 };

 jest.spyOn(document, 'createElement').mockReturnValue(mockScript as any);
 jest.spyOn(document.head, 'appendChild').mockImplementation(jest.fn());

 const loadPromise = paymentService.loadRazorpaySDK();

 if (mockScript.onerror) {
 mockScript.onerror();
 }

 await expect(loadPromise).rejects.toThrow('Failed to load Razorpay SDK');
 });
 });

 describe('singleton pattern', () => {
 it('should return the same instance', () => {
 const instance1 = PaymentService.getInstance();
 const instance2 = PaymentService.getInstance();

 expect(instance1).toBe(instance2);
 expect(instance1).toBe(paymentService);
 });
 });
});