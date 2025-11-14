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

jest.mock('next/image', () => {
 return function MockImage({ src, alt, onError, ...props }: any) {
 return (
 <img
 src={src}
 alt={alt}
 onError={onError}
 {...props}
 />
 )
 }
})

const mockTestimonial: Testimonial = {
 name: 'John Doe',
 role: 'creator',
 avatar: '/test-avatar.jpg',
 content: 'This is a test testimonial content that should wrap properly on different screen sizes and maintain proper spacing.',
 rating: 5
}

describe('TestimonialCard Responsive Integration', () => {
 it('renders with all responsive classes applied correctly', () => {
 const { container } = render(<TestimonialCard testimonial={mockTestimonial} />)
 const article = container.querySelector('article')

 expect(article).toHaveClass('card', 'card-hover', 'border-2')
 expect(article).toHaveClass('!p-4', 'sm:!p-6', 'md:!p-8')
 })

 it('maintains backward compatibility with existing tests', () => {
 const { container } = render(<TestimonialCard testimonial={mockTestimonial} />)
 const article = container.querySelector('article')

 expect(article).toHaveClass('card', 'card-hover', 'border-2')
 expect(article).toHaveClass('border-accent-pink/20')
 })

 it('applies responsive text sizing throughout the component', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)

 const badge = screen.getByText('Creator')
 expect(badge).toHaveClass('text-xs', 'sm:text-sm')
 expect(badge).toHaveClass('px-2', 'py-1', 'sm:px-3', 'sm:py-1')

 const blockquote = screen.getByRole('blockquote')
 expect(blockquote).toHaveClass('text-sm', 'sm:text-base', 'md:text-lg')
 expect(blockquote).toHaveClass('px-2', 'sm:px-0')

 const userName = screen.getByText('John Doe')
 expect(userName).toHaveClass('text-sm', 'sm:text-base')

 const userRole = screen.getByText('creator')
 expect(userRole).toHaveClass('text-xs', 'sm:text-sm')
 })

 it('applies responsive spacing and margins correctly', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)

 const badgeContainer = screen.getByText('Creator').closest('div')
 expect(badgeContainer).toHaveClass('mb-4', 'sm:mb-6')

 const blockquote = screen.getByRole('blockquote')
 expect(blockquote).toHaveClass('mb-4', 'sm:mb-6')

 const userInfo = screen.getByText('John Doe').closest('div')
 expect(userInfo?.parentElement).toHaveClass('px-2', 'sm:px-0')
 })

 it('applies responsive avatar sizing', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)
 
 const userInfo = screen.getByText('John Doe').closest('div')
 const avatar = userInfo?.previousElementSibling
 
 expect(avatar).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12')
 })

 it('handles viewer role with responsive styling', () => {
 const viewerTestimonial: Testimonial = {
 ...mockTestimonial,
 role: 'viewer'
 }
 
 render(<TestimonialCard testimonial={viewerTestimonial} />)
 const badge = screen.getByText('Viewer')

 expect(badge).toHaveClass('text-xs', 'sm:text-sm')
 expect(badge).toHaveClass('bg-accent-teal', 'text-white')
 expect(badge).toHaveClass('px-2', 'py-1', 'sm:px-3', 'sm:py-1')
 })

 it('maintains proper content hierarchy with responsive design', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)

 const userName = screen.getByText('John Doe')
 expect(userName.tagName).toBe('H4')
 
 const quote = screen.getByRole('blockquote')
 expect(quote).toBeInTheDocument()

 const article = screen.getByRole('article')
 expect(article).toHaveAttribute('aria-labelledby', 'testimonial-john-doe')
 })

 it('handles long content with responsive text wrapping', () => {
 const longTestimonial: Testimonial = {
 ...mockTestimonial,
 content: 'This is a very long testimonial that should wrap properly and maintain good readability even when the content extends to multiple lines and contains a lot of text that needs to be displayed responsively across different screen sizes.'
 }
 
 render(<TestimonialCard testimonial={longTestimonial} />)
 
 const quote = screen.getByRole('blockquote')
 expect(quote).toHaveClass('leading-relaxed')
 expect(quote).toHaveClass('text-sm', 'sm:text-base', 'md:text-lg')
 expect(quote).toHaveClass('px-2', 'sm:px-0') // Ensures text doesn't stick to borders
 })

 it('applies custom className while preserving responsive classes', () => {
 const { container } = render(
 <TestimonialCard testimonial={mockTestimonial} className="custom-responsive-class" />
 )
 const article = container.querySelector('article')

 expect(article).toHaveClass('custom-responsive-class')

 expect(article).toHaveClass('!p-4', 'sm:!p-6', 'md:!p-8')
 expect(article).toHaveClass('card', 'card-hover')
 })

 it('ensures text does not stick to card borders on mobile', () => {
 render(<TestimonialCard testimonial={mockTestimonial} />)

 const blockquote = screen.getByRole('blockquote')
 expect(blockquote).toHaveClass('px-2', 'sm:px-0')

 const userInfo = screen.getByText('John Doe').closest('div')
 expect(userInfo?.parentElement).toHaveClass('px-2', 'sm:px-0')

 const article = screen.getByRole('article')
 expect(article).toHaveClass('!p-4', 'sm:!p-6', 'md:!p-8')
 })
})