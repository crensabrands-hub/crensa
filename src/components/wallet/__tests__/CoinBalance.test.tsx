import { render, screen, fireEvent } from '@testing-library/react'
import CoinBalance from '../CoinBalance'

describe('CoinBalance Component', () => {
 describe('Basic Rendering', () => {
 it('should render coin balance with default props', () => {
 render(<CoinBalance balance={1000} />)
 
 expect(screen.getByText('🪙')).toBeInTheDocument()
 expect(screen.getByText('1,000')).toBeInTheDocument()
 expect(screen.getByText('coins')).toBeInTheDocument()
 })

 it('should format large numbers with locale formatting', () => {
 render(<CoinBalance balance={1234567} />)
 
 expect(screen.getByText('12,34,567')).toBeInTheDocument()
 })

 it('should handle zero balance', () => {
 render(<CoinBalance balance={0} />)
 
 expect(screen.getByText('0')).toBeInTheDocument()
 })
 })

 describe('Size Variants', () => {
 it('should render small size variant', () => {
 const { container } = render(<CoinBalance balance={100} size="small" />)
 
 const amount = screen.getByText('100')
 expect(amount).toHaveClass('text-sm')
 })

 it('should render medium size variant', () => {
 const { container } = render(<CoinBalance balance={100} size="medium" />)
 
 const amount = screen.getByText('100')
 expect(amount).toHaveClass('text-lg')
 })

 it('should render large size variant', () => {
 const { container } = render(<CoinBalance balance={100} size="large" />)
 
 const amount = screen.getByText('100')
 expect(amount).toHaveClass('text-2xl')
 })
 })

 describe('Rupee Equivalent', () => {
 it('should show rupee equivalent when enabled', () => {
 render(<CoinBalance balance={100} showRupeeEquivalent />)

 expect(screen.getByText('₹5.00')).toBeInTheDocument()
 })

 it('should not show rupee equivalent by default', () => {
 render(<CoinBalance balance={100} />)
 
 expect(screen.queryByText(/₹/)).not.toBeInTheDocument()
 })

 it('should calculate correct rupee equivalent for various amounts', () => {
 const { rerender } = render(<CoinBalance balance={1000} showRupeeEquivalent />)
 expect(screen.getByText('₹50.00')).toBeInTheDocument()

 rerender(<CoinBalance balance={200} showRupeeEquivalent />)
 expect(screen.getByText('₹10.00')).toBeInTheDocument()

 rerender(<CoinBalance balance={50} showRupeeEquivalent />)
 expect(screen.getByText('₹2.50')).toBeInTheDocument()
 })
 })

 describe('Click Interaction', () => {
 it('should call onClick when clicked', () => {
 const handleClick = jest.fn()
 render(<CoinBalance balance={100} onClick={handleClick} />)
 
 const element = screen.getByRole('button')
 fireEvent.click(element)
 
 expect(handleClick).toHaveBeenCalledTimes(1)
 })

 it('should be keyboard accessible', () => {
 const handleClick = jest.fn()
 render(<CoinBalance balance={100} onClick={handleClick} />)
 
 const element = screen.getByRole('button')

 fireEvent.keyDown(element, { key: 'Enter' })
 expect(handleClick).toHaveBeenCalledTimes(1)

 fireEvent.keyDown(element, { key: ' ' })
 expect(handleClick).toHaveBeenCalledTimes(2)
 })

 it('should not be clickable when onClick is not provided', () => {
 render(<CoinBalance balance={100} />)
 
 expect(screen.queryByRole('button')).not.toBeInTheDocument()
 })

 it('should have cursor-pointer class when clickable', () => {
 const { container } = render(<CoinBalance balance={100} onClick={() => {}} />)
 
 const element = screen.getByRole('button')
 expect(element).toHaveClass('cursor-pointer')
 })
 })

 describe('Custom Styling', () => {
 it('should apply custom className', () => {
 const { container } = render(
 <CoinBalance balance={100} className="custom-class" />
 )
 
 expect(container.querySelector('.custom-class')).toBeInTheDocument()
 })
 })

 describe('Animation', () => {
 it('should render with animation by default', () => {
 const { container } = render(<CoinBalance balance={100} />)

 expect(container.firstChild).toBeTruthy()
 })

 it('should render without animation when disabled', () => {
 const { container } = render(<CoinBalance balance={100} animated={false} />)
 
 expect(container.firstChild).toBeTruthy()
 })
 })

 describe('Accessibility', () => {
 it('should have proper aria-label for coin icon', () => {
 render(<CoinBalance balance={100} />)
 
 const icon = screen.getByLabelText('coins')
 expect(icon).toBeInTheDocument()
 })

 it('should have proper role when clickable', () => {
 render(<CoinBalance balance={100} onClick={() => {}} />)
 
 expect(screen.getByRole('button')).toBeInTheDocument()
 })

 it('should have tabIndex when clickable', () => {
 render(<CoinBalance balance={100} onClick={() => {}} />)
 
 const element = screen.getByRole('button')
 expect(element).toHaveAttribute('tabIndex', '0')
 })
 })
})
