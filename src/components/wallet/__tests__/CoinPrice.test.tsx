import { render, screen } from '@testing-library/react'
import CoinPrice from '../CoinPrice'

describe('CoinPrice Component', () => {
 describe('Basic Rendering', () => {
 it('should render coin price with default props', () => {
 render(<CoinPrice coins={50} />)
 
 expect(screen.getByText('🪙')).toBeInTheDocument()
 expect(screen.getByText('50')).toBeInTheDocument()
 expect(screen.getByText('coins')).toBeInTheDocument()
 })

 it('should format large numbers with locale formatting', () => {
 render(<CoinPrice coins={123456} />)
 
 expect(screen.getByText('1,23,456')).toBeInTheDocument()
 })

 it('should handle zero price', () => {
 render(<CoinPrice coins={0} />)
 
 expect(screen.getByText('0')).toBeInTheDocument()
 })
 })

 describe('Size Variants', () => {
 it('should render small size variant', () => {
 render(<CoinPrice coins={100} size="small" />)
 
 const amount = screen.getByText('100')
 expect(amount).toHaveClass('text-sm')
 })

 it('should render medium size variant', () => {
 render(<CoinPrice coins={100} size="medium" />)
 
 const amount = screen.getByText('100')
 expect(amount).toHaveClass('text-base')
 })

 it('should render large size variant', () => {
 render(<CoinPrice coins={100} size="large" />)
 
 const amount = screen.getByText('100')
 expect(amount).toHaveClass('text-xl')
 })
 })

 describe('Display Variants', () => {
 it('should render default variant', () => {
 const { container } = render(<CoinPrice coins={100} variant="default" />)
 
 expect(screen.getByText('coins')).toBeInTheDocument()
 expect(container.querySelector('.bg-purple-100')).not.toBeInTheDocument()
 })

 it('should render badge variant', () => {
 const { container } = render(<CoinPrice coins={100} variant="badge" />)
 
 const badge = container.querySelector('.bg-purple-100')
 expect(badge).toBeInTheDocument()
 expect(badge).toHaveClass('rounded-full')
 expect(screen.queryByText('coins')).not.toBeInTheDocument()
 })

 it('should render inline variant', () => {
 render(<CoinPrice coins={100} variant="inline" />)

 expect(screen.queryByText('coins')).not.toBeInTheDocument()
 })
 })

 describe('Rupee Equivalent', () => {
 it('should show rupee equivalent when enabled', () => {
 render(<CoinPrice coins={100} showRupeeEquivalent />)

 expect(screen.getByText(/₹5\.00/)).toBeInTheDocument()
 })

 it('should not show rupee equivalent by default', () => {
 render(<CoinPrice coins={100} />)
 
 expect(screen.queryByText(/₹/)).not.toBeInTheDocument()
 })

 it('should calculate correct rupee equivalent for various amounts', () => {
 const { rerender } = render(<CoinPrice coins={1000} showRupeeEquivalent />)
 expect(screen.getByText(/₹50\.00/)).toBeInTheDocument()

 rerender(<CoinPrice coins={200} showRupeeEquivalent />)
 expect(screen.getByText(/₹10\.00/)).toBeInTheDocument()

 rerender(<CoinPrice coins={50} showRupeeEquivalent />)
 expect(screen.getByText(/₹2\.50/)).toBeInTheDocument()

 rerender(<CoinPrice coins={1} showRupeeEquivalent />)
 expect(screen.getByText(/₹0\.05/)).toBeInTheDocument()
 })

 it('should show rupee equivalent in parentheses', () => {
 render(<CoinPrice coins={100} showRupeeEquivalent />)
 
 expect(screen.getByText(/\(₹5\.00\)/)).toBeInTheDocument()
 })
 })

 describe('Custom Styling', () => {
 it('should apply custom className', () => {
 const { container } = render(
 <CoinPrice coins={100} className="custom-class" />
 )
 
 expect(container.querySelector('.custom-class')).toBeInTheDocument()
 })
 })

 describe('Accessibility', () => {
 it('should have proper aria-label for coin icon', () => {
 render(<CoinPrice coins={100} />)
 
 const icon = screen.getByLabelText('coins')
 expect(icon).toBeInTheDocument()
 })
 })

 describe('Edge Cases', () => {
 it('should handle very small coin amounts', () => {
 render(<CoinPrice coins={1} showRupeeEquivalent />)
 
 expect(screen.getByText('1')).toBeInTheDocument()
 expect(screen.getByText(/₹0\.05/)).toBeInTheDocument()
 })

 it('should handle maximum coin amounts', () => {
 render(<CoinPrice coins={2000} showRupeeEquivalent />)
 
 expect(screen.getByText('2,000')).toBeInTheDocument()
 expect(screen.getByText(/₹100\.00/)).toBeInTheDocument()
 })

 it('should handle decimal coin amounts by displaying them', () => {

 render(<CoinPrice coins={99.99} />)
 
 expect(screen.getByText('99.99')).toBeInTheDocument()
 })
 })

 describe('Combined Props', () => {
 it('should work with all props combined', () => {
 const { container } = render(
 <CoinPrice
 coins={500}
 size="large"
 showRupeeEquivalent
 variant="badge"
 className="my-custom-class"
 />
 )
 
 expect(screen.getByText('500')).toBeInTheDocument()
 expect(screen.getByText(/₹25\.00/)).toBeInTheDocument()
 expect(container.querySelector('.bg-purple-100')).toBeInTheDocument()
 expect(container.querySelector('.my-custom-class')).toBeInTheDocument()
 })
 })
})
