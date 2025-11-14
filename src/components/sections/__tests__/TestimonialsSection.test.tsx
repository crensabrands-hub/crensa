import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { TestimonialsSection } from '../TestimonialsSection'
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
import { afterEach } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, initial, animate, exit, transition, whileInView, viewport, ...props }: any) => 
 <div {...props}>{children}</div>,
 h2: ({ children, initial, whileInView, transition, viewport, ...props }: any) => 
 <h2 {...props}>{children}</h2>,
 },
 AnimatePresence: ({ children }: any) => <div>{children}</div>,
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

const mockTestimonials: Testimonial[] = [
 {
 name: 'Sarah Chen',
 role: 'creator',
 avatar: '/images/testimonials/sarah.svg',
 content: 'Crensa has completely changed how I think about content creation.',
 rating: 5
 },
 {
 name: 'Mike Rodriguez',
 role: 'viewer',
 avatar: '/images/testimonials/mike.svg',
 content: 'I love supporting creators directly.',
 rating: 4
 },
 {
 name: 'Emma Thompson',
 role: 'creator',
 avatar: '/images/testimonials/emma.svg',
 content: 'The analytics are game-changers.',
 rating: 5
 }
]

describe('TestimonialsSection', () => {
 beforeEach(() => {
 jest.clearAllTimers()
 jest.useFakeTimers()
 })

 afterEach(() => {
 jest.runOnlyPendingTimers()
 jest.useRealTimers()
 })

 it('renders testimonials section with title', () => {
 render(
 <TestimonialsSection 
 title="What Our Community Says" 
 testimonials={mockTestimonials} 
 />
 )

 expect(screen.getByText('What Our Community Says')).toBeInTheDocument()
 expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
 })

 it('displays first testimonial by default', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
 expect(screen.getByText(/Crensa has completely changed how I think about content creation/)).toBeInTheDocument()
 })

 it('renders navigation controls when multiple testimonials exist', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument()
 expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument()

 const dots = screen.getAllByLabelText(/Go to testimonial \d+/)
 expect(dots).toHaveLength(3)
 })

 it('does not render navigation controls for single testimonial', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={[mockTestimonials[0]]} 
 />
 )

 expect(screen.queryByLabelText('Previous testimonial')).not.toBeInTheDocument()
 expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument()
 })

 it('navigates to next testimonial when next button is clicked', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 const nextButton = screen.getByLabelText('Next testimonial')
 fireEvent.click(nextButton)

 expect(screen.getByText('Mike Rodriguez')).toBeInTheDocument()
 expect(screen.getByText(/I love supporting creators directly/)).toBeInTheDocument()
 })

 it('navigates to previous testimonial when previous button is clicked', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 const prevButton = screen.getByLabelText('Previous testimonial')
 fireEvent.click(prevButton)

 expect(screen.getByText('Emma Thompson')).toBeInTheDocument()
 })

 it('navigates to specific testimonial when dot is clicked', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 const thirdDot = screen.getByLabelText('Go to testimonial 3')
 fireEvent.click(thirdDot)

 expect(screen.getByText('Emma Thompson')).toBeInTheDocument()
 })

 it('auto-rotates testimonials by default', async () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials}
 autoRotateInterval={1000}
 />
 )

 expect(screen.getByText('Sarah Chen')).toBeInTheDocument()

 act(() => {
 jest.advanceTimersByTime(1000)
 })

 await waitFor(() => {
 expect(screen.getByText('Mike Rodriguez')).toBeInTheDocument()
 })
 })

 it('pauses auto-rotation when user interacts', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials}
 autoRotateInterval={1000}
 />
 )

 const nextButton = screen.getByLabelText('Next testimonial')
 fireEvent.click(nextButton)

 act(() => {
 jest.advanceTimersByTime(1000)
 })

 expect(screen.getByText('Mike Rodriguez')).toBeInTheDocument()
 })

 it('toggles auto-play when play/pause button is clicked', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 const pauseButton = screen.getByLabelText('Pause auto-play')
 fireEvent.click(pauseButton)

 expect(screen.getByLabelText('Resume auto-play')).toBeInTheDocument()
 })

 it('renders empty state gracefully', () => {
 const { container } = render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={[]} 
 />
 )

 expect(container.firstChild).toBeNull()
 })

 it('applies custom className', () => {
 const { container } = render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials}
 className="custom-class"
 />
 )

 expect(container.firstChild).toHaveClass('custom-class')
 })

 it('has proper accessibility attributes', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 const nextButton = screen.getByLabelText('Next testimonial')
 const prevButton = screen.getByLabelText('Previous testimonial')
 const dots = screen.getAllByLabelText(/Go to testimonial \d+/)

 expect(nextButton).toBeInTheDocument()
 expect(prevButton).toBeInTheDocument()
 expect(dots).toHaveLength(3)
 })

 it('handles keyboard navigation', () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials} 
 />
 )

 const nextButton = screen.getByLabelText('Next testimonial')

 nextButton.focus()
 fireEvent.keyDown(nextButton, { key: 'Enter' })

 expect(screen.getByText('Mike Rodriguez')).toBeInTheDocument()
 })

 it('resumes auto-play after user interaction timeout', async () => {
 render(
 <TestimonialsSection 
 title="Testimonials" 
 testimonials={mockTestimonials}
 autoRotateInterval={1000}
 />
 )

 const nextButton = screen.getByLabelText('Next testimonial')
 fireEvent.click(nextButton)

 act(() => {
 jest.advanceTimersByTime(3000)
 })

 act(() => {
 jest.advanceTimersByTime(1000)
 })

 await waitFor(() => {
 expect(screen.getByText('Emma Thompson')).toBeInTheDocument()
 })
 })
})