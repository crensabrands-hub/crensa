import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentModal from '../PaymentModal';
import { paymentService } from '@/lib/services/paymentService';

jest.mock('@/lib/services/paymentService', () => ({
 paymentService: {
 loadRazorpaySDK: jest.fn(),
 initiatePayment: jest.fn(),
 },
}));

describe('PaymentModal - Coin Terminology', () => {
 const mockOnClose = jest.fn();
 const mockOnPaymentSuccess = jest.fn();
 const mockOnPaymentFailure = jest.fn();

 const defaultProps = {
 isOpen: true,
 onClose: mockOnClose,
 amount: 50,
 coins: 1000,
 userDetails: {
 name: 'Test User',
 email: 'test@example.com',
 contact: '1234567890',
 },
 onPaymentSuccess: mockOnPaymentSuccess,
 onPaymentFailure: mockOnPaymentFailure,
 };

 beforeEach(() => {
 jest.clearAllMocks();
 (paymentService.loadRazorpaySDK as jest.Mock).mockResolvedValue(undefined);
 });

 it('should display "Purchase Coins" as the title', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText('Purchase Coins')).toBeInTheDocument();
 });
 });

 it('should display coin-related description text', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText('Add coins to your wallet to watch content')).toBeInTheDocument();
 });
 });

 it('should display coin amount with coin emoji', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText(/🪙 1,000/)).toBeInTheDocument();
 });
 });

 it('should display rupee amount', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText(/₹50\.00/)).toBeInTheDocument();
 });
 });

 it('should show success message with coin terminology', async () => {
 (paymentService.initiatePayment as jest.Mock).mockImplementation(({ onSuccess }) => {
 onSuccess({
 razorpay_payment_id: 'pay_123',
 razorpay_order_id: 'order_123',
 razorpay_signature: 'sig_123',
 });
 });

 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 const payButton = screen.getByRole('button', { name: /Pay ₹50\.00/i });
 expect(payButton).toBeInTheDocument();
 });

 const payButton = screen.getByRole('button', { name: /Pay ₹50\.00/i });
 fireEvent.click(payButton);

 await waitFor(() => {
 expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
 expect(screen.getByText('Coins have been added to your wallet')).toBeInTheDocument();
 });
 });

 it('should load Razorpay SDK when modal opens', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(paymentService.loadRazorpaySDK).toHaveBeenCalled();
 });
 });

 it('should call initiatePayment with correct coin amount', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 const payButton = screen.getByRole('button', { name: /Pay ₹50\.00/i });
 expect(payButton).toBeInTheDocument();
 });

 const payButton = screen.getByRole('button', { name: /Pay ₹50\.00/i });
 fireEvent.click(payButton);

 await waitFor(() => {
 expect(paymentService.initiatePayment).toHaveBeenCalledWith(
 expect.objectContaining({
 amount: 50,
 coins: 1000,
 userDetails: defaultProps.userDetails,
 })
 );
 });
 });

 it('should display Razorpay security note', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText('Payments are processed securely by Razorpay')).toBeInTheDocument();
 });
 });

 it('should handle payment failure with error message', async () => {
 const errorMessage = 'Payment was cancelled by user';
 (paymentService.initiatePayment as jest.Mock).mockImplementation(({ onFailure }) => {
 onFailure({
 code: 'PAYMENT_CANCELLED',
 description: errorMessage,
 source: 'user',
 step: 'payment',
 reason: 'User cancelled',
 metadata: {},
 });
 });

 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 const payButton = screen.getByRole('button', { name: /Pay ₹50\.00/i });
 expect(payButton).toBeInTheDocument();
 });

 const payButton = screen.getByRole('button', { name: /Pay ₹50\.00/i });
 fireEvent.click(payButton);

 await waitFor(() => {
 expect(screen.getByText('Payment Failed')).toBeInTheDocument();
 expect(screen.getByText(errorMessage)).toBeInTheDocument();
 });
 });

 it('should not render when isOpen is false', () => {
 const { container } = render(<PaymentModal {...defaultProps} isOpen={false} />);
 expect(container.firstChild).toBeNull();
 });

 it('should close modal when close button is clicked', async () => {
 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText('Purchase Coins')).toBeInTheDocument();
 });

 const closeButtons = screen.getAllByRole('button');
 const closeButton = closeButtons.find(button => button.querySelector('svg.lucide-x'));
 
 expect(closeButton).toBeInTheDocument();
 fireEvent.click(closeButton!);

 expect(mockOnClose).toHaveBeenCalled();
 });

 it('should show loading state when SDK is not loaded', async () => {
 (paymentService.loadRazorpaySDK as jest.Mock).mockImplementation(
 () => new Promise(() => {}) // Never resolves
 );

 render(<PaymentModal {...defaultProps} />);
 
 await waitFor(() => {
 expect(screen.getByText('Loading payment system...')).toBeInTheDocument();
 });
 });
});
