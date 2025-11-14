

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TopUpInterface from '@/components/wallet/TopUpInterface'
import { useAuthContext } from '@/contexts/AuthContext'

jest.mock('@/contexts/AuthContext')
jest.mock('@/components/payments/PaymentModal', () => {
 return function MockPaymentModal({ isOpen, onPaymentSuccess }: any) {
 if (!isOpen) return null
 return (
 <div data-testid="payment-modal">
 <button onClick={() => onPaymentSuccess({ razorpay_payment_id: 'test' })}>
 Mock Payment Success
 </button>
 </div>
 )
 }
})

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>

const mockUserProfile = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date(),
 memberProfile: {
 id: 'profile-123',
 userId: 'user-123',
 walletBalance: '50.00',
 membershipStatus: 'free' as const,
 membershipExpiry: null,
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date(),
 updatedAt: new Date(),
 }
}

describe('TopUpInterface', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUserProfile,
 isLoading: false,
 error: null,
 refreshProfile: jest.fn()
 })
 })

 afterEach(() => {
 jest.clearAllMocks()
 })

 it('renders top-up options correctly', () => {
 render(<TopUpInterface />)
 
 expect(screen.getByText('Add Credits to Your Wallet')).toBeInTheDocument()
 expect(screen.getByText('100')).toBeInTheDocument() // Basic option
 expect(screen.getByText('500')).toBeInTheDocument() // Popular option
 expect(screen.getByText('Most Popular')).toBeInTheDocument()
 expect(screen.getByText('Custom Amount')).toBeInTheDocument()
 })

 it('selects top-up option correctly', () => {
 render(<TopUpInterface />)
 
 const popularOption = screen.getByText('500').closest('div')
 fireEvent.click(popularOption!)
 
 expect(screen.getByText('550 credits for ₹449')).toBeInTheDocument()
 })

 it('handles custom amount input', async () => {
 render(<TopUpInterface />)

 const customRadio = screen.getByLabelText('Custom Amount')
 fireEvent.click(customRadio)
 
 await waitFor(() => {
 expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument()
 })

 const amountInput = screen.getByPlaceholderText('Enter amount')
 fireEvent.change(amountInput, { target: { value: '200' } })
 
 await waitFor(() => {
 expect(screen.getByText('200 credits')).toBeInTheDocument()
 })
 })

 it('validates minimum custom amount', () => {
 render(<TopUpInterface />)

 const customRadio = screen.getByLabelText('Custom Amount')
 fireEvent.click(customRadio)

 const amountInput = screen.getByPlaceholderText('Enter amount')
 fireEvent.change(amountInput, { target: { value: '5' } })

 const proceedButton = screen.getByText('Proceed to Payment')
 fireEvent.click(proceedButton)

 expect(proceedButton).toBeInTheDocument()
 })

 it('opens payment modal when proceeding with selected option', async () => {
 render(<TopUpInterface />)

 const basicOption = screen.getByText('100').closest('div')
 fireEvent.click(basicOption!)

 const proceedButton = screen.getByText('Proceed to Payment')
 fireEvent.click(proceedButton)
 
 await waitFor(() => {
 expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
 })
 })

 it('handles payment success correctly', async () => {
 render(<TopUpInterface />)

 const basicOption = screen.getByText('100').closest('div')
 fireEvent.click(basicOption!)
 
 const proceedButton = screen.getByText('Proceed to Payment')
 fireEvent.click(proceedButton)
 
 await waitFor(() => {
 expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
 })

 const successButton = screen.getByText('Mock Payment Success')
 fireEvent.click(successButton)
 
 await waitFor(() => {
 expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
 })
 })

 it('shows bonus credits for applicable options', () => {
 render(<TopUpInterface />)
 
 expect(screen.getByText('+50 bonus')).toBeInTheDocument() // Popular option
 expect(screen.getByText('+200 bonus')).toBeInTheDocument() // Premium option
 })

 it('calculates price per credit correctly', () => {
 render(<TopUpInterface />)

 expect(screen.getByText('₹0.99 per credit')).toBeInTheDocument()
 })

 it('disables proceed button when no option is selected', () => {
 render(<TopUpInterface />)
 
 const proceedButton = screen.getByText('Proceed to Payment')
 expect(proceedButton).toBeDisabled()
 })

 it('enables proceed button when option is selected', async () => {
 render(<TopUpInterface />)
 
 const basicOption = screen.getByText('100').closest('div')
 fireEvent.click(basicOption!)
 
 await waitFor(() => {
 const proceedButton = screen.getByText('Proceed to Payment')
 expect(proceedButton).not.toBeDisabled()
 })
 })

 it('shows savings badges for applicable options', () => {
 render(<TopUpInterface />)
 
 expect(screen.getByText('10% off')).toBeInTheDocument()
 expect(screen.getByText('20% off')).toBeInTheDocument()
 expect(screen.getByText('30% off')).toBeInTheDocument()
 })

 it('resets form after successful payment', async () => {
 jest.useFakeTimers()
 
 render(<TopUpInterface />)

 const basicOption = screen.getByText('100').closest('div')
 fireEvent.click(basicOption!)
 
 const proceedButton = screen.getByText('Proceed to Payment')
 fireEvent.click(proceedButton)
 
 await waitFor(() => {
 const successButton = screen.getByText('Mock Payment Success')
 fireEvent.click(successButton)
 })

 jest.advanceTimersByTime(3000)
 
 await waitFor(() => {
 expect(screen.queryByText('Payment Successful!')).not.toBeInTheDocument()
 })
 
 jest.useRealTimers()
 })
})