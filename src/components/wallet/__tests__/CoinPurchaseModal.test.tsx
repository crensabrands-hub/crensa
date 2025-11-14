import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CoinPurchaseModal from '../CoinPurchaseModal'

const mockUser = {
 id: 'user-123',
 fullName: 'Test User',
 firstName: 'Test',
 primaryEmailAddress: { emailAddress: 'test@example.com' },
 primaryPhoneNumber: { phoneNumber: '+919876543210' }
}

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => ({
 user: mockUser,
 userProfile: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })
}))

const mockLoadRazorpaySDK = jest.fn()
const mockInitiatePayment = jest.fn()

jest.mock('@/lib/services/paymentService', () => ({
 paymentService: {
 loadRazorpaySDK: () => mockLoadRazorpaySDK(),
 initiatePayment: (options: any) => mockInitiatePayment(options)
 }
}))

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>
 },
 AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('CoinPurchaseModal', () => {
 const mockOnClose = jest.fn()
 const mockOnPurchaseComplete = jest.fn()
 const mockUser = {
 id: 'user-123',
 fullName: 'Test User',
 firstName: 'Test',
 primaryEmailAddress: { emailAddress: 'test@example.com' },
 primaryPhoneNumber: { phoneNumber: '+919876543210' }
 }

 const mockPackages = [
 {
 id: 'pkg-1',
 name: 'Starter Pack',
 coinAmount: 200,
 rupeePrice: 10,
 bonusCoins: 0,
 isPopular: false,
 totalCoins: 200
 },
 {
 id: 'pkg-2',
 name: 'Popular Pack',
 coinAmount: 1000,
 rupeePrice: 50,
 bonusCoins: 50,
 isPopular: true,
 totalCoins: 1050
 },
 {
 id: 'pkg-3',
 name: 'Premium Pack',
 coinAmount: 2500,
 rupeePrice: 125,
 bonusCoins: 150,
 isPopular: false,
 totalCoins: 2650
 }
 ]

 beforeEach(() => {
 jest.clearAllMocks()
 
 mockLoadRazorpaySDK.mockResolvedValue(undefined)
 mockInitiatePayment.mockImplementation(() => Promise.resolve())

 global.fetch = jest.fn().mockResolvedValue({
 ok: true,
 json: async () => ({ packages: mockPackages })
 })
 })

 afterEach(() => {
 jest.restoreAllMocks()
 })

 describe('Modal Rendering', () => {
 it('should not render when isOpen is false', () => {
 render(
 <CoinPurchaseModal
 isOpen={false}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 expect(screen.queryByText('Purchase Coins')).not.toBeInTheDocument()
 })

 it('should render when isOpen is true', () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 expect(screen.getByText('Purchase Coins')).toBeInTheDocument()
 })

 it('should display current balance', () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={1250}
 />
 )

 expect(screen.getByText('Current Balance')).toBeInTheDocument()
 expect(screen.getByText('1,250')).toBeInTheDocument()
 })

 it('should show close button', () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 const closeButton = screen.getByLabelText('Close modal')
 expect(closeButton).toBeInTheDocument()
 })
 })

 describe('Package Loading', () => {
 it('should show loading state initially', () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 expect(screen.getByText('Loading coin packages...')).toBeInTheDocument()
 })

 it('should load packages from API', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith('/api/coins/packages')
 })
 })

 it('should display packages after loading', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 expect(screen.getByText('Popular Pack')).toBeInTheDocument()
 expect(screen.getByText('Premium Pack')).toBeInTheDocument()
 })
 })

 it('should show error state if loading fails', async () => {
 global.fetch = jest.fn().mockResolvedValue({
 ok: false,
 json: async () => ({ error: 'Failed to load' })
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Purchase Failed')).toBeInTheDocument()
 })
 })
 })

 describe('Package Display', () => {
 it('should display package details correctly', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('200')).toBeInTheDocument()
 expect(screen.getByText('₹10.00')).toBeInTheDocument()
 })
 })

 it('should highlight popular packages', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('POPULAR')).toBeInTheDocument()
 })
 })

 it('should display bonus coins when available', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('+50 bonus coins')).toBeInTheDocument()
 expect(screen.getByText('+150 bonus coins')).toBeInTheDocument()
 })
 })
 })

 describe('Package Selection', () => {
 it('should allow selecting a package', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 await waitFor(() => {
 expect(screen.getByText('Pay ₹10.00')).toBeInTheDocument()
 })
 })

 it('should show purchase button only when package is selected', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Select a Package')).toBeInTheDocument()
 })

 expect(screen.queryByText(/^Pay ₹/)).not.toBeInTheDocument()

 const popularPackButton = screen.getByText('Popular Pack').closest('button')
 fireEvent.click(popularPackButton!)

 await waitFor(() => {
 expect(screen.getByText('Pay ₹50.00')).toBeInTheDocument()
 })
 })
 })

 describe('Payment Flow', () => {
 it('should load Razorpay SDK on mount', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(mockLoadRazorpaySDK).toHaveBeenCalled()
 })
 })

 it('should initiate payment when purchase button is clicked', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 await waitFor(() => {
 expect(screen.getByText('Pay ₹10.00')).toBeInTheDocument()
 })

 const payButton = screen.getByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(mockInitiatePayment).toHaveBeenCalledWith(
 expect.objectContaining({
 amount: 10,
 coins: 200,
 userDetails: expect.objectContaining({
 name: 'Test User',
 email: 'test@example.com'
 })
 })
 )
 })
 })

 it('should show processing state during payment', async () => {
 mockInitiatePayment.mockImplementation(() => {
 return new Promise(() => {}) // Never resolves
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(screen.getByText('Processing Payment')).toBeInTheDocument()
 expect(screen.getByText('Please complete the payment in the popup window')).toBeInTheDocument()
 })
 })
 })

 describe('Success State', () => {
 it('should show success message after successful payment', async () => {
 mockInitiatePayment.mockImplementation(({ onSuccess }) => {
 onSuccess({
 razorpay_payment_id: 'pay_123',
 razorpay_order_id: 'order_123',
 razorpay_signature: 'sig_123'
 })
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(screen.getByText('Purchase Successful!')).toBeInTheDocument()
 expect(screen.getByText('200 coins have been added to your wallet')).toBeInTheDocument()
 })
 })

 it('should call onPurchaseComplete after successful payment', async () => {
 mockInitiatePayment.mockImplementation(({ onSuccess }) => {
 onSuccess({
 razorpay_payment_id: 'pay_123',
 razorpay_order_id: 'order_123',
 razorpay_signature: 'sig_123'
 })
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(mockOnPurchaseComplete).toHaveBeenCalledWith(200)
 })
 })

 it('should display updated balance after purchase', async () => {
 mockInitiatePayment.mockImplementation(({ onSuccess }) => {
 onSuccess({
 razorpay_payment_id: 'pay_123',
 razorpay_order_id: 'order_123',
 razorpay_signature: 'sig_123'
 })
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(screen.getByText('New Balance')).toBeInTheDocument()
 expect(screen.getByText('700')).toBeInTheDocument() // 500 + 200
 })
 })
 })

 describe('Error Handling', () => {
 it('should show error message on payment failure', async () => {
 mockInitiatePayment.mockImplementation(({ onFailure }) => {
 onFailure({
 code: 'PAYMENT_FAILED',
 description: 'Payment was declined',
 source: 'gateway',
 step: 'payment',
 reason: 'Insufficient funds',
 metadata: {}
 })
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(screen.getByText('Purchase Failed')).toBeInTheDocument()
 expect(screen.getByText('Payment was declined')).toBeInTheDocument()
 })
 })

 it('should allow retry after error', async () => {
 mockInitiatePayment.mockImplementation(({ onFailure }) => {
 onFailure({
 code: 'PAYMENT_FAILED',
 description: 'Payment failed',
 source: 'gateway',
 step: 'payment',
 reason: 'Error',
 metadata: {}
 })
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(screen.getByText('Purchase Failed')).toBeInTheDocument()
 })

 const retryButton = screen.getByText('Try Again')
 fireEvent.click(retryButton)

 await waitFor(() => {
 expect(screen.getByText('Select a Package')).toBeInTheDocument()
 })
 })
 })

 describe('Modal Interactions', () => {
 it('should close modal when close button is clicked', async () => {
 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 const closeButton = screen.getByLabelText('Close modal')
 fireEvent.click(closeButton)

 expect(mockOnClose).toHaveBeenCalled()
 })

 it('should not allow closing during payment processing', async () => {
 mockInitiatePayment.mockImplementation(() => {
 return new Promise(() => {}) // Never resolves
 })

 render(
 <CoinPurchaseModal
 isOpen={true}
 onClose={mockOnClose}
 onPurchaseComplete={mockOnPurchaseComplete}
 currentBalance={500}
 />
 )

 await waitFor(() => {
 expect(screen.getByText('Starter Pack')).toBeInTheDocument()
 })

 const starterPackButton = screen.getByText('Starter Pack').closest('button')
 fireEvent.click(starterPackButton!)

 const payButton = await screen.findByText('Pay ₹10.00')
 fireEvent.click(payButton)

 await waitFor(() => {
 expect(screen.getByText('Processing Payment')).toBeInTheDocument()
 })

 expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
 })
 })
})
