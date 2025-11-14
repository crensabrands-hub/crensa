import { render, screen } from '@testing-library/react'
import CreatorFooter from '../CreatorFooter'

describe('CreatorFooter', () => {
 it('renders the footer with brand name', () => {
 render(<CreatorFooter />)
 expect(screen.getByText('Crensa Creator')).toBeInTheDocument()
 })

 it('renders all required footer links', () => {
 render(<CreatorFooter />)
 
 const expectedLinks = [
 'Creator Resources',
 'Creator Guidelines',
 'Analytics Dashboard',
 'Earnings & Payouts',
 'Creator Support',
 'Terms of Service',
 'Privacy Policy',
 ]

 expectedLinks.forEach((linkText) => {
 expect(screen.getByText(linkText)).toBeInTheDocument()
 })
 })

 it('renders correct href for each link', () => {
 render(<CreatorFooter />)
 
 const linkMappings = [
 { text: 'Creator Resources', href: '/creator/resources' },
 { text: 'Creator Guidelines', href: '/creator/guidelines' },
 { text: 'Analytics Dashboard', href: '/creator/analytics' },
 { text: 'Earnings & Payouts', href: '/creator/earnings' },
 { text: 'Creator Support', href: '/creator/support' },
 { text: 'Terms of Service', href: '/terms' },
 { text: 'Privacy Policy', href: '/privacy' },
 ]

 linkMappings.forEach(({ text, href }) => {
 const link = screen.getByText(text).closest('a')
 expect(link).toHaveAttribute('href', href)
 })
 })

 it('renders copyright with current year', () => {
 render(<CreatorFooter />)
 const currentYear = new Date().getFullYear()
 expect(screen.getByText(`© ${currentYear} Crensa. All rights reserved.`)).toBeInTheDocument()
 })

 it('applies custom className when provided', () => {
 const { container } = render(<CreatorFooter className="custom-class" />)
 const footer = container.querySelector('footer')
 expect(footer).toHaveClass('custom-class')
 })

 it('has proper accessibility attributes', () => {
 render(<CreatorFooter />)
 const nav = screen.getByRole('navigation', { name: /creator footer navigation/i })
 expect(nav).toBeInTheDocument()
 })

 it('renders responsive layout classes', () => {
 const { container } = render(<CreatorFooter />)
 const footer = container.querySelector('footer')
 expect(footer).toHaveClass('bg-neutral-white', 'border-t', 'border-neutral-gray')
 
 const mainContent = container.querySelector('.flex.flex-col.md\\:flex-row')
 expect(mainContent).toBeInTheDocument()
 })

 it('renders brand logo with correct styling', () => {
 const { container } = render(<CreatorFooter />)
 const logo = container.querySelector('.w-8.h-8.bg-gradient-primary')
 expect(logo).toBeInTheDocument()
 expect(logo?.textContent).toBe('C')
 })
})
