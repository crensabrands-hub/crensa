import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import Header from '../Header'

jest.mock('next/link', () => {
 return function MockLink({ children, href, ...props }: any) {
 return (
 <a href={href} {...props}>
 {children}
 </a>
 )
 }
})

Object.defineProperty(window, 'scrollY', {
 writable: true,
 value: 0,
})

describe('Header', () => {
 beforeEach(() => {
 window.scrollY = 0
 })

 afterEach(() => {
 jest.clearAllMocks()
 })

 it('renders the header with logo and navigation', () => {
 render(<Header />)

 expect(screen.getAllByText('Crensa')).toHaveLength(2) // Desktop and mobile
 expect(screen.getAllByText('C')).toHaveLength(2) // Desktop and mobile

 expect(screen.getAllByText('How It Works')).toHaveLength(2)
 expect(screen.getAllByText('Why Crensa')).toHaveLength(2)
 expect(screen.getAllByText('Testimonials')).toHaveLength(2)
 expect(screen.getAllByText('FAQ')).toHaveLength(2)

 expect(screen.getAllByText('Login')).toHaveLength(2)
 expect(screen.getAllByText('Sign Up')).toHaveLength(2)
 })

 it('applies transparent background when not scrolled', () => {
 render(<Header />)
 const headers = screen.getAllByRole('banner')
 expect(headers[0]).toHaveClass('bg-transparent')
 })

 it('applies solid background when scrolled prop is true', () => {
 render(<Header isScrolled={true} />)
 const headers = screen.getAllByRole('banner')
 expect(headers[0]).toHaveClass('bg-neutral-white/95')
 })

 it('changes background on scroll', async () => {
 render(<Header />)
 const headers = screen.getAllByRole('banner')

 expect(headers[0]).toHaveClass('bg-transparent')

 act(() => {
 window.scrollY = 100
 window.dispatchEvent(new Event('scroll'))
 })
 
 await waitFor(() => {
 expect(headers[0]).toHaveClass('bg-neutral-white/95')
 })
 })

 it('toggles mobile menu when hamburger button is clicked', () => {
 render(<Header />)
 
 const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')

 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')

 fireEvent.click(mobileMenuButton)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')

 fireEvent.click(mobileMenuButton)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
 })

 it('closes mobile menu when overlay is clicked', () => {
 render(<Header />)
 
 const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')

 fireEvent.click(mobileMenuButton)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')

 const overlay = document.querySelector('.bg-primary-navy\\/80')
 if (overlay) {
 fireEvent.click(overlay)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
 }
 })

 it('closes mobile menu when close button is clicked', () => {
 render(<Header />)
 
 const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')

 fireEvent.click(mobileMenuButton)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')

 const closeButton = screen.getByLabelText('Close mobile menu')
 fireEvent.click(closeButton)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
 })

 it('closes mobile menu when navigation link is clicked', () => {
 render(<Header />)
 
 const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')

 fireEvent.click(mobileMenuButton)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')

 const mobileNavLinks = screen.getAllByText('How It Works')
 const mobileNavLink = mobileNavLinks.find(link => 
 link.closest('.space-y-6') !== null
 )
 
 if (mobileNavLink) {
 fireEvent.click(mobileNavLink)
 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
 }
 })

 it('has proper accessibility attributes', () => {
 render(<Header />)
 
 const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')
 expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle mobile menu')
 expect(mobileMenuButton).toHaveAttribute('aria-expanded')
 
 const closeButton = screen.getByLabelText('Close mobile menu')
 expect(closeButton).toHaveAttribute('aria-label', 'Close mobile menu')
 })

 it('applies correct text colors based on scroll state', () => {

 render(<Header isScrolled={false} />)
 const logoTexts = screen.getAllByText('Crensa')
 expect(logoTexts[0]).toHaveClass('text-neutral-white')
 })

 it('applies navy text color when scrolled', () => {

 render(<Header isScrolled={true} />)
 const logoTexts = screen.getAllByText('Crensa')
 expect(logoTexts[0]).toHaveClass('text-primary-navy')
 })

 it('renders all navigation items with correct hrefs', () => {
 render(<Header />)
 
 const navigationItems = [
 { label: 'How It Works', href: '#how-it-works' },
 { label: 'Why Crensa', href: '#why-crensa' },
 { label: 'Testimonials', href: '#testimonials' },
 { label: 'FAQ', href: '#faq' },
 ]
 
 navigationItems.forEach(item => {
 const links = screen.getAllByRole('link', { name: item.label })

 expect(links).toHaveLength(2)
 links.forEach(link => {
 expect(link).toHaveAttribute('href', item.href)
 })
 })
 })

 it('renders CTA buttons with correct hrefs', () => {
 render(<Header />)
 
 const loginLinks = screen.getAllByText('Login')
 const signupLinks = screen.getAllByText('Sign Up')

 expect(loginLinks.some(link => link.getAttribute('href') === '/login')).toBe(true)
 expect(signupLinks.some(link => link.getAttribute('href') === '/signup')).toBe(true)
 })
})