import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CoinInput from '../CoinInput'
import { MIN_COIN_PRICE, MAX_COIN_PRICE } from '@/lib/utils/coin-utils'

describe('CoinInput', () => {
 const mockOnChange = jest.fn()

 beforeEach(() => {
 mockOnChange.mockClear()
 })

 describe('Rendering', () => {
 it('should render with default props', () => {
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 expect(input).toBeInTheDocument()
 expect(input).toHaveValue('100')
 })

 it('should render with label', () => {
 render(<CoinInput value={100} onChange={mockOnChange} label="Price" />)
 
 expect(screen.getByText('Price')).toBeInTheDocument()
 })

 it('should render with required indicator', () => {
 render(<CoinInput value={100} onChange={mockOnChange} label="Price" required />)
 
 expect(screen.getByText('*')).toBeInTheDocument()
 })

 it('should render coin icon', () => {
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const icon = screen.getByRole('img', { name: /coins/i })
 expect(icon).toBeInTheDocument()
 expect(icon).toHaveTextContent('🪙')
 })

 it('should render "coins" label', () => {
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 expect(screen.getByText('coins')).toBeInTheDocument()
 })

 it('should render placeholder', () => {
 render(<CoinInput value={0} onChange={mockOnChange} placeholder="Enter amount" />)
 
 const input = screen.getByPlaceholderText('Enter amount')
 expect(input).toBeInTheDocument()
 })
 })

 describe('Rupee Equivalent Display', () => {
 it('should show rupee equivalent by default', () => {
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 expect(screen.getByText('Rupee equivalent:')).toBeInTheDocument()
 expect(screen.getByText('₹5.00')).toBeInTheDocument()
 })

 it('should hide rupee equivalent when showRupeeEquivalent is false', () => {
 render(<CoinInput value={100} onChange={mockOnChange} showRupeeEquivalent={false} />)
 
 expect(screen.queryByText('Rupee equivalent:')).not.toBeInTheDocument()
 })

 it('should update rupee equivalent when value changes', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '200')
 
 expect(screen.getByText('₹10.00')).toBeInTheDocument()
 })

 it('should not show rupee equivalent for empty input', () => {
 render(<CoinInput value={0} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 fireEvent.change(input, { target: { value: '' } })
 
 expect(screen.queryByText('Rupee equivalent:')).not.toBeInTheDocument()
 })
 })

 describe('Input Validation', () => {
 it('should accept valid numeric input', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={0} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '150')
 
 expect(mockOnChange).toHaveBeenCalledWith(150)
 })

 it('should reject non-numeric input', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, 'abc')

 expect(input).toHaveValue('')
 })

 it('should show error for value below minimum', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} min={10} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '5')
 
 await waitFor(() => {
 expect(screen.getByText(/Minimum is 10 coins/i)).toBeInTheDocument()
 })
 })

 it('should show error for value above maximum', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} max={500} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '1000')
 
 await waitFor(() => {
 expect(screen.getByText(/Maximum is 500 coins/i)).toBeInTheDocument()
 })
 })

 it('should validate against default min (1) and max (2000)', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')

 await user.clear(input)
 await user.type(input, '0')
 await waitFor(() => {
 expect(screen.getByText(/Minimum is 1 coin/i)).toBeInTheDocument()
 })

 await user.clear(input)
 await user.type(input, '3000')
 await waitFor(() => {
 expect(screen.getByText(/Maximum is 2,000 coins/i)).toBeInTheDocument()
 })
 })

 it('should clamp value to minimum on blur', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} min={10} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '5')
 fireEvent.blur(input)
 
 await waitFor(() => {
 expect(input).toHaveValue('10')
 expect(mockOnChange).toHaveBeenCalledWith(10)
 })
 })

 it('should clamp value to maximum on blur', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} max={500} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '1000')
 fireEvent.blur(input)
 
 await waitFor(() => {
 expect(input).toHaveValue('500')
 expect(mockOnChange).toHaveBeenCalledWith(500)
 })
 })
 })

 describe('Error Display', () => {
 it('should display external error prop', () => {
 render(<CoinInput value={100} onChange={mockOnChange} error="Custom error message" />)
 
 expect(screen.getByText('Custom error message')).toBeInTheDocument()
 })

 it('should prioritize external error over internal validation error', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} error="External error" />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '5000')
 
 expect(screen.getByText('External error')).toBeInTheDocument()
 expect(screen.queryByText(/Maximum/i)).not.toBeInTheDocument()
 })

 it('should show error icon', () => {
 render(<CoinInput value={100} onChange={mockOnChange} error="Error message" />)
 
 const errorIcon = screen.getByRole('alert').querySelector('svg')
 expect(errorIcon).toBeInTheDocument()
 })

 it('should hide rupee equivalent when error is shown', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 await user.type(input, '5000')
 
 await waitFor(() => {
 expect(screen.queryByText('Rupee equivalent:')).not.toBeInTheDocument()
 })
 })
 })

 describe('Disabled State', () => {
 it('should render as disabled', () => {
 render(<CoinInput value={100} onChange={mockOnChange} disabled />)
 
 const input = screen.getByRole('textbox')
 expect(input).toBeDisabled()
 })

 it('should not accept input when disabled', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} disabled />)
 
 const input = screen.getByRole('textbox')
 await user.type(input, '200')
 
 expect(input).toHaveValue('100')
 expect(mockOnChange).not.toHaveBeenCalled()
 })

 it('should apply disabled styling', () => {
 render(<CoinInput value={100} onChange={mockOnChange} disabled />)
 
 const input = screen.getByRole('textbox')
 expect(input).toHaveClass('bg-gray-100', 'text-gray-500', 'cursor-not-allowed')
 })
 })

 describe('Empty Input Handling', () => {
 it('should allow empty input', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 
 expect(input).toHaveValue('')
 })

 it('should reset to 0 on blur if empty', async () => {
 const user = userEvent.setup()
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 await user.clear(input)
 fireEvent.blur(input)
 
 await waitFor(() => {
 expect(input).toHaveValue('0')
 expect(mockOnChange).toHaveBeenCalledWith(0)
 })
 })
 })

 describe('Accessibility', () => {
 it('should have proper ARIA attributes', () => {
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 expect(input).toHaveAttribute('aria-invalid', 'false')
 })

 it('should set aria-invalid when error exists', () => {
 render(<CoinInput value={100} onChange={mockOnChange} error="Error" />)
 
 const input = screen.getByRole('textbox')
 expect(input).toHaveAttribute('aria-invalid', 'true')
 })

 it('should link error message with aria-describedby', () => {
 render(<CoinInput value={100} onChange={mockOnChange} error="Error message" />)
 
 const input = screen.getByRole('textbox')
 expect(input).toHaveAttribute('aria-describedby', 'coin-input-error')
 
 const errorElement = screen.getByRole('alert')
 expect(errorElement).toHaveAttribute('id', 'coin-input-error')
 })

 it('should link rupee equivalent with aria-describedby when no error', () => {
 render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 expect(input).toHaveAttribute('aria-describedby', 'coin-input-equivalent')
 })
 })

 describe('Value Synchronization', () => {
 it('should update input when value prop changes', () => {
 const { rerender } = render(<CoinInput value={100} onChange={mockOnChange} />)
 
 const input = screen.getByRole('textbox')
 expect(input).toHaveValue('100')
 
 rerender(<CoinInput value={200} onChange={mockOnChange} />)
 expect(input).toHaveValue('200')
 })
 })

 describe('Custom Styling', () => {
 it('should apply custom className', () => {
 render(<CoinInput value={100} onChange={mockOnChange} className="custom-class" />)
 
 const container = screen.getByRole('textbox').closest('div')?.parentElement
 expect(container).toHaveClass('custom-class')
 })
 })
})
