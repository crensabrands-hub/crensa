

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuthContext } from '@/contexts/AuthContext'
import MembershipPlans from '@/components/membership/MembershipPlans'
import type { User, MemberProfile } from '@/lib/database/schema'

jest.mock('@/contexts/AuthContext')
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>

jest.mock('@/components/payments/PaymentModal', () => {
 return function MockPaymentModal({ isOpen, onClose, onPaymentSuccess }: any) {
 if (!isOpen) return null
 return (
 <div data-testid="payment-modal">
 <button onClick={onClose}>Close</button>
 <button onClick={() => onPaymentSuccess({ razorpay_payment_id: 'pay_123' })}>
 Success
 </button>
 </div>
 )
 }
})

describe('MembershipPlans', () => {
 const mockUser: User & { memberProfile: MemberProfile } = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 avatar: null,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 memberProfile: {
 id: 'profile-123',
 userId: 'user-123',
 walletBalance: '50.00',
 membershipStatus: 'free' as const,
 membershipExpiry: null,
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 }
 }

 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })
 })

 afterEach(() => {
 jest.clearAllMocks()
 })

 it('should render membership plans', () => {
 render(<MembershipPlans />)

 expect(screen.getByText('Monthly Premium')).toBeInTheDocument()
 expect(screen.getByText('Quarterly Premium')).toBeInTheDocument()
 expect(screen.getByText('Yearly Premium')).toBeInTheDocument()
 })

 it('should show most popular badge for quarterly plan', () => {
 render(<MembershipPlans />)

 expect(screen.getByText('Most Popular')).toBeInTheDocument()
 })

 it('should display plan features', () => {
 render(<MembershipPlans />)

 expect(screen.getByText('Access to all exclusive content')).toBeInTheDocument()
 expect(screen.getByText('Ad-free viewing experience')).toBeInTheDocument()
 expect(screen.getByText('Priority customer support')).toBeInTheDocument()
 })

 it('should show discount information', () => {
 render(<MembershipPlans />)

 expect(screen.getByText('Save 11%')).toBeInTheDocument()
 expect(screen.getByText('Save 16%')).toBeInTheDocument()
 })

 it('should open payment modal when plan is selected', async () => {
 render(<MembershipPlans />)

 const monthlyButton = screen.getByText('Choose Monthly Premium')
 fireEvent.click(monthlyButton)

 await waitFor(() => {
 expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
 })
 })

 it('should close payment modal when cancelled', async () => {
 render(<MembershipPlans />)

 const monthlyButton = screen.getByText('Choose Monthly Premium')
 fireEvent.click(monthlyButton)

 await waitFor(() => {
 expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
 })

 const closeButton = screen.getByText('Close')
 fireEvent.click(closeButton)

 await waitFor(() => {
 expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
 })
 })

 it('should handle successful payment', async () => {
 render(<MembershipPlans />)

 const monthlyButton = screen.getByText('Choose Monthly Premium')
 fireEvent.click(monthlyButton)

 await waitFor(() => {
 expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
 })

 const successButton = screen.getByText('Success')
 fireEvent.click(successButton)

 await waitFor(() => {
 expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
 })
 })

 it('should disable buttons for premium users', () => {
 const premiumUser = {
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile,
 membershipStatus: 'premium' as const,
 membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
 }
 }

 mockUseAuthContext.mockReturnValue({
 userProfile: premiumUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 render(<MembershipPlans />)

 const buttons = screen.getAllByText('Current Plan')
 expect(buttons).toHaveLength(3)
 buttons.forEach(button => {
 expect(button).toBeDisabled()
 })
 })

 it('should render comparison table when showComparison is true', () => {
 render(<MembershipPlans showComparison={true} />)

 expect(screen.getByText('Features')).toBeInTheDocument()
 expect(screen.getByText('Free')).toBeInTheDocument()
 expect(screen.getByText('Access to exclusive content')).toBeInTheDocument()
 })

 it('should show upgrade buttons in comparison table', () => {
 render(<MembershipPlans showComparison={true} />)

 const upgradeButtons = screen.getAllByText('Upgrade')
 expect(upgradeButtons.length).toBeGreaterThan(0)
 })

 it('should handle plan selection in comparison mode', async () => {
 render(<MembershipPlans showComparison={true} />)

 const upgradeButtons = screen.getAllByText('Upgrade')
 fireEvent.click(upgradeButtons[0])

 await waitFor(() => {
 expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
 })
 })
})