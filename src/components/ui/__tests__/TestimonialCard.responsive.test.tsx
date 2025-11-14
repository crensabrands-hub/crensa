import { render, screen } from '@testing-library/react'
import { TestimonialCard } from '../TestimonialCard'
import { Testimonial } from '@/types'

jest.mock('@/lib/performance', () => ({
 optimizedImageProps: {
 loading: 'lazy' as const,
 placeholder: 'blur' as const,
 }
}))

jest.mock('@/lib/accessibility', () => ({
 generateAriaLabel: {
 rating: (rating: number) => `Rating: ${rating} out of 5 stars`
 }
}))

const mockTestimonial: Testimonial = {
 name: 'John Doe',
 role: 'creator',
 avatar: '/test-avatar.jpg',
 content: 'This is a test testimonial content that should wrap properly on different screen sizes.',
 rating: 5
}

describe('TestimonialCard Responsive Design', () => {
 it('renders with proper responsive padding classes', () => {
 const { container } = render(<TestimonialCard testimonial={mockTestimonial} />)
 const article = container.querySelector('article')
 
 expect(article).toHaveClass('p-4', 'sm:p-6', 'md:p-8')
 })

 it('renders role badge with responsive text sizes', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)
 const badge = screen.getByText('Creator')
 
 expect(badge).toHaveClass('text-xs', 'sm:text-sm')
 expect(badge).toHaveClass('px-2', 'py-1', 'sm:px-3', 'sm:py-1')
 })

 it('renders testimonial content with responsive text and padding', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)
 const blockquote = screen.getByRole('blockquote')
 
 expect(blockquote).toHaveClass('text-sm', 'sm:text-base', 'md:text-lg')
 expect(blockquote).toHaveClass('px-2', 'sm:px-0')
 expect(blockquote).toHaveClass('mb-4', 'sm:mb-6')
 })

 it('renders user info with responsive sizing', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)
 const userInfo = screen.getByText('John Doe').closest('div')
 const avatar = userInfo?.previousElementSibling
 
 expect(userInfo?.parentElement).toHaveClass('px-2', 'sm:px-0')
 expect(avatar).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12')
 })

 it('renders user name and role with responsive text sizes', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)
 const userName = screen.getByText('John Doe')
 const userRole = screen.getByText('creator')
 
 expect(userName).toHaveClass('text-sm', 'sm:text-base')
 expect(userRole).toHaveClass('text-xs', 'sm:text-sm')
 })

 it('maintains proper spacing between elements on different screen sizes', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)
 const badgeContainer = screen.getByText('Creator').closest('div')
 
 expect(badgeContainer).toHaveClass('mb-4', 'sm:mb-6')
 })

 it('handles viewer role correctly with responsive styling', () => {
 const viewerTestimonial: Testimonial = {
 ...mockTestimonial,
 role: 'viewer'
 }
 
 render(<TestimonialCard testimonial={viewerTestimonial} />)
 const badge = screen.getByText('Viewer')
 
 expect(badge).toHaveClass('text-xs', 'sm:text-sm')
 expect(badge).toHaveClass('bg-accent-teal')
 })

 it('applies custom className while maintaining responsive classes', () => {
 const { container } = render(
 <TestimonialCard testimonial={mockTestimonial} className="custom-class" />
 )
 const article = container.querySelector('article')
 
 expect(article).toHaveClass('custom-class')
 expect(article).toHaveClass('p-4', 'sm:p-6', 'md:p-8')
 })
})