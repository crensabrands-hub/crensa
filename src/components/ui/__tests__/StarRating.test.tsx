import { render, screen } from '@testing-library/react'
import { StarRating } from '../StarRating'

describe('StarRating', () => {
 it('renders correct number of stars by default', () => {
 const { container } = render(<StarRating rating={3} />)
 
 const stars = container.querySelectorAll('svg')
 expect(stars).toHaveLength(5) // Default maxRating is 5
 })

 it('renders custom number of stars', () => {
 const { container } = render(<StarRating rating={3} maxRating={10} />)
 
 const stars = container.querySelectorAll('svg')
 expect(stars).toHaveLength(10)
 })

 it('fills correct number of stars based on rating', () => {
 const { container } = render(<StarRating rating={3} />)
 
 const filledStars = container.querySelectorAll('.text-accent-pink')
 const emptyStars = container.querySelectorAll('.text-neutral-gray')
 
 expect(filledStars).toHaveLength(3)
 expect(emptyStars).toHaveLength(2)
 })

 it('handles zero rating', () => {
 const { container } = render(<StarRating rating={0} />)
 
 const filledStars = container.querySelectorAll('.text-accent-pink')
 const emptyStars = container.querySelectorAll('.text-neutral-gray')
 
 expect(filledStars).toHaveLength(0)
 expect(emptyStars).toHaveLength(5)
 })

 it('handles full rating', () => {
 const { container } = render(<StarRating rating={5} />)
 
 const filledStars = container.querySelectorAll('.text-accent-pink')
 const emptyStars = container.querySelectorAll('.text-neutral-gray')
 
 expect(filledStars).toHaveLength(5)
 expect(emptyStars).toHaveLength(0)
 })

 it('applies correct size classes', () => {
 const { container: smallContainer } = render(<StarRating rating={3} size="sm" />)
 const { container: mediumContainer } = render(<StarRating rating={3} size="md" />)
 const { container: largeContainer } = render(<StarRating rating={3} size="lg" />)
 
 expect(smallContainer.querySelector('.w-4')).toBeInTheDocument()
 expect(mediumContainer.querySelector('.w-5')).toBeInTheDocument()
 expect(largeContainer.querySelector('.w-6')).toBeInTheDocument()
 })

 it('applies custom className', () => {
 const { container } = render(<StarRating rating={3} className="custom-class" />)
 
 expect(container.firstChild).toHaveClass('custom-class')
 })

 it('handles decimal ratings by flooring', () => {
 const { container } = render(<StarRating rating={3.7} />)
 
 const filledStars = container.querySelectorAll('.text-accent-pink')
 expect(filledStars).toHaveLength(3) // Should floor 3.7 to 3
 })

 it('handles rating higher than maxRating', () => {
 const { container } = render(<StarRating rating={7} maxRating={5} />)
 
 const filledStars = container.querySelectorAll('.text-accent-pink')
 expect(filledStars).toHaveLength(5) // Should cap at maxRating
 })

 it('has proper accessibility structure', () => {
 const { container } = render(<StarRating rating={3} />)
 
 const starContainer = container.firstChild
 expect(starContainer).toHaveClass('flex', 'items-center', 'gap-1')
 })
})