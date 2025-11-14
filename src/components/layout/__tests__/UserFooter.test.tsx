import React from 'react'
import { render, screen } from '@testing-library/react'
import UserFooter from '../UserFooter'

describe('UserFooter', () => {
 it('renders the footer with brand name', () => {
 render(<UserFooter />)
 
 expect(screen.getByText('Crensa')).toBeInTheDocument()
 })

 it('renders all user-focused footer links', () => {
 render(<UserFooter />)

 expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about')
 expect(screen.getByRole('link', { name: 'Browse Content' })).toHaveAttribute('href', '/browse')
 expect(screen.getByRole('link', { name: 'Help & Support' })).toHaveAttribute('href', '/help')
 expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
 expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
 expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact')
 expect(screen.getByRole('link', { name: 'Community Guidelines' })).toHaveAttribute('href', '/community-guidelines')
 })

 it('displays current year in copyright', () => {
 render(<UserFooter />)
 
 const currentYear = new Date().getFullYear()
 expect(screen.getByText(`© ${currentYear} Crensa. All rights reserved.`)).toBeInTheDocument()
 })

 it('has proper navigation landmark', () => {
 render(<UserFooter />)
 
 const nav = screen.getByRole('navigation', { name: 'Footer navigation' })
 expect(nav).toBeInTheDocument()
 })

 it('applies custom className when provided', () => {
 const { container } = render(<UserFooter className="custom-class" />)
 
 const footer = container.querySelector('footer')
 expect(footer).toHaveClass('custom-class')
 })

 it('has responsive layout classes', () => {
 const { container } = render(<UserFooter />)
 
 const footer = container.querySelector('footer')
 expect(footer).toHaveClass('bg-neutral-white', 'border-t', 'border-neutral-gray')
 })

 it('has hover states on links', () => {
 render(<UserFooter />)
 
 const link = screen.getByRole('link', { name: 'About Us' })
 expect(link).toHaveClass('hover:text-accent-pink')
 })

 it('renders brand logo with gradient', () => {
 const { container } = render(<UserFooter />)
 
 const logo = container.querySelector('.bg-gradient-primary')
 expect(logo).toBeInTheDocument()
 expect(logo).toHaveTextContent('C')
 })
})
