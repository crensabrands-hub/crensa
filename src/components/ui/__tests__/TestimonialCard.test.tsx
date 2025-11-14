import { render, screen, fireEvent } from '@testing-library/react'
import { TestimonialCard } from '../TestimonialCard'
import { Testimonial } from '@/types'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'

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

const mockCreatorTestimonial: Testimonial = {
 name: 'Sarah Chen',
 role: 'creator',
 avatar: '/images/testimonials/sarah.svg',
 content: 'Crensa has completely changed how I think about content creation.',
 rating: 5
}

const mockViewerTestimonial: Testimonial = {
 name: 'Mike Rodriguez',
 role: 'viewer',
 avatar: '/images/testimonials/mike.svg',
 content: 'I love supporting creators directly.',
 rating: 4
}

describe('TestimonialCard', () => {
 it('renders testimonial content correctly', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
 expect(screen.getByText('Creator')).toBeInTheDocument()
 expect(screen.getByText(/Crensa has completely changed how I think about content creation/)).toBeInTheDocument()
 })

 it('displays correct role badge for creator', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const badge = screen.getByText('Creator')
 expect(badge).toHaveClass('bg-accent-pink', 'text-white')
 })

 it('displays correct role badge for viewer', () => {
 render(<TestimonialCard testimonial={mockViewerTestimonial} />)

 const badge = screen.getByText('Viewer')
 expect(badge).toHaveClass('bg-accent-teal', 'text-white')
 })

 it('applies correct border styling for creator', () => {
 const { container } = render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const card = container.firstChild
 expect(card).toHaveClass('border-accent-pink/20')
 })

 it('applies correct border styling for viewer', () => {
 const { container } = render(<TestimonialCard testimonial={mockViewerTestimonial} />)

 const card = container.firstChild
 expect(card).toHaveClass('border-accent-teal/20')
 })

 it('renders star rating component', () => {
 const { container } = render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const stars = container.querySelectorAll('svg')
 expect(stars.length).toBeGreaterThan(0) // Should have star SVGs
 })

 it('renders user avatar with correct alt text', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const avatar = screen.getByAltText("Sarah Chen's avatar")
 expect(avatar).toBeInTheDocument()
 expect(avatar).toHaveAttribute('src', '/images/testimonials/sarah.svg')
 })

 it('handles avatar image error with fallback', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const avatar = screen.getByAltText("Sarah Chen's avatar")

 fireEvent.error(avatar)

 expect(avatar.style.display).toBe('none')
 })

 it('applies custom className', () => {
 const { container } = render(
 <TestimonialCard testimonial={mockCreatorTestimonial} className="custom-class" />
 )

 expect(container.firstChild).toHaveClass('custom-class')
 })

 it('renders testimonial content as blockquote', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const quote = screen.getByRole('blockquote')
 expect(quote).toBeInTheDocument()
 expect(quote).toHaveTextContent(/Crensa has completely changed how I think about content creation/)
 })

 it('displays user role with correct styling', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const roleText = screen.getByText('creator')
 expect(roleText).toHaveClass('text-accent-pink', 'capitalize')
 })

 it('has proper card structure and styling', () => {
 const { container } = render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const card = container.firstChild
 expect(card).toHaveClass('card', 'card-hover', 'border-2')
 })

 it('handles different rating values', () => {
 const testimonialWithLowRating = { ...mockCreatorTestimonial, rating: 2 }
 const { container } = render(<TestimonialCard testimonial={testimonialWithLowRating} />)

 const filledStars = container.querySelectorAll('svg.text-accent-pink')
 expect(filledStars).toHaveLength(2)
 })

 it('capitalizes role text correctly', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const roleText = screen.getByText('creator')
 expect(roleText).toHaveClass('capitalize')
 })

 it('has proper semantic structure', () => {
 render(<TestimonialCard testimonial={mockCreatorTestimonial} />)

 const userName = screen.getByText('Sarah Chen')
 expect(userName.tagName).toBe('H4')

 const quote = screen.getByRole('blockquote')
 expect(quote).toBeInTheDocument()
 })

 it('handles long testimonial content', () => {
 const longTestimonial = {
 ...mockCreatorTestimonial,
 content: 'This is a very long testimonial that should wrap properly and maintain good readability even when the content extends to multiple lines and contains a lot of text.'
 }

 render(<TestimonialCard testimonial={longTestimonial} />)

 const quote = screen.getByRole('blockquote')
 expect(quote).toHaveClass('leading-relaxed')
 })
})