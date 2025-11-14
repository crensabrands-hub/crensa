import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WithdrawalForm } from '@/components/creator/WithdrawalForm';

global.fetch = jest.fn();

describe('WithdrawalForm', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('renders withdrawal form with available balance', () => {
 render(<WithdrawalForm availableCoins={5000} />);
 
 expect(screen.getByText('Request Withdrawal')).toBeInTheDocument();
 expect(screen.getByText('Available Balance')).toBeInTheDocument();
 expect(screen.getByText('5,000')).toBeInTheDocument();
 });

 it('shows coin to rupee conversion', () => {
 render(<WithdrawalForm availableCoins={5000} />);

 expect(screen.getByText(/₹250\.00/)).toBeInTheDocument();
 });

 it('validates minimum withdrawal amount', async () => {
 render(<WithdrawalForm availableCoins={5000} />);
 
 const input = screen.getByRole('spinbutton');
 fireEvent.change(input, { target: { value: '1000' } });

 await waitFor(() => {
 expect(screen.getByText(/Minimum withdrawal is 2000 coins/)).toBeInTheDocument();
 });
 });

 it('validates maximum withdrawal amount', async () => {
 render(<WithdrawalForm availableCoins={5000} />);
 
 const input = screen.getByRole('spinbutton');
 fireEvent.change(input, { target: { value: '6000' } });
 
 await waitFor(() => {
 expect(screen.getByText(/Insufficient balance/)).toBeInTheDocument();
 });
 });

 it('shows confirmation modal before withdrawal', async () => {
 render(<WithdrawalForm availableCoins={5000} />);
 
 const input = screen.getByRole('spinbutton');
 fireEvent.change(input, { target: { value: '3000' } });
 
 const continueButton = screen.getByText('Continue');
 fireEvent.click(continueButton);
 
 await waitFor(() => {
 expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
 expect(screen.getByText('3,000')).toBeInTheDocument();
 expect(screen.getByText(/₹150\.00/)).toBeInTheDocument();
 });
 });

 it('submits withdrawal request successfully', async () => {
 const mockResponse = {
 success: true,
 withdrawalId: 'test-123',
 coins: 3000,
 rupees: 150,
 status: 'pending',
 message: 'Withdrawal request submitted successfully',
 estimatedProcessingTime: '3-5 business days'
 };

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse
 });

 const onSuccess = jest.fn();
 render(<WithdrawalForm availableCoins={5000} onWithdrawalSuccess={onSuccess} />);

 const input = screen.getByRole('spinbutton');
 fireEvent.change(input, { target: { value: '3000' } });

 const continueButton = screen.getByText('Continue');
 fireEvent.click(continueButton);

 await waitFor(() => {
 expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
 });
 
 const confirmButton = screen.getByText('Confirm Withdrawal');
 fireEvent.click(confirmButton);

 await waitFor(() => {
 expect(screen.getByText('Withdrawal Request Submitted')).toBeInTheDocument();
 expect(screen.getByText('test-123')).toBeInTheDocument();
 expect(onSuccess).toHaveBeenCalledWith(3000, 150);
 });
 });

 it('handles withdrawal errors', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Insufficient balance' })
 });

 render(<WithdrawalForm availableCoins={5000} />);
 
 const input = screen.getByRole('spinbutton');
 fireEvent.change(input, { target: { value: '3000' } });
 
 const continueButton = screen.getByText('Continue');
 fireEvent.click(continueButton);
 
 await waitFor(() => {
 expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
 });
 
 const confirmButton = screen.getByText('Confirm Withdrawal');
 fireEvent.click(confirmButton);
 
 await waitFor(() => {
 expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
 });
 });

 it('allows canceling withdrawal', async () => {
 const onCancel = jest.fn();
 render(<WithdrawalForm availableCoins={5000} onCancel={onCancel} />);
 
 const cancelButton = screen.getByText('Cancel');
 fireEvent.click(cancelButton);
 
 expect(onCancel).toHaveBeenCalled();
 });

 it('shows remaining balance after withdrawal', async () => {
 render(<WithdrawalForm availableCoins={5000} />);
 
 const input = screen.getByRole('spinbutton');
 fireEvent.change(input, { target: { value: '3000' } });
 
 const continueButton = screen.getByText('Continue');
 fireEvent.click(continueButton);
 
 await waitFor(() => {
 expect(screen.getByText('Remaining Balance:')).toBeInTheDocument();
 expect(screen.getByText('2,000')).toBeInTheDocument(); // 5000 - 3000
 });
 });
});
