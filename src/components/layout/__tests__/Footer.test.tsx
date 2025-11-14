import { render, screen } from '@testing-library/react'
import Footer from '../Footer'
import { FooterContent } from '@/types'

const mockFooterContent: FooterContent = {
 tagline: 'Crensa',
 description: 'Test description for footer',
 contactEmail: 'test@crensa.com',
 socialLinks: [
 {
 name: 'Twitter',
 url: 'https://twitter.com/crensa',
 icon: '𝕏'
 },
 {
 name: 'Instagram',
 url: 'https://instagram.com/crensa',
 icon: '📷'
 }
 ],
 sections: [
 {
 title: 'Platform',
 links: [
 { label: 'How It Works', href: '#how-it-works' },
 { label: 'Pricing', href: '/pricing' }
 ]
 },
 {
 title: 'Resources',
 links: [
 { label: 'Help Center', href: '/help' },
 { label: 'Creator Guide', href: '/creator-guide' }
 ]
 }
 ],
 finalCta: {
 title: 'Ready to Start Earning?',
 description: 'Join Crensa today and turn your creativity into a sustainable income stream.',
 buttonText: 'Get Started Now',
 buttonLink: '/signup'
 },
 legal: {
 copyright: '© 2024 Crensa. All rights reserved.',
 links: [
 { label: 'Privacy Policy', href: '/privacy' },
 { label: 'Terms of Service', href: '/terms' }
 ]
 }
}

describe('Footer', () => {
 it('renders footer with all sections', () => {
 render(<Footer content={mockFooterContent} />)

 expect(screen.getByText('Ready to Start Earning?')).toBeInTheDocument()
 expect(screen.getByText('Join Crensa today and turn your creativity into a sustainable income stream.')).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Get Started Now' })).toBeInTheDocument()

 expect(screen.getByText('Crensa')).toBeInTheDocument()
 expect(screen.getByText('Test description for footer')).toBeInTheDocument()

 expect(screen.getByText('Contact Us')).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'test@crensa.com' })).toBeInTheDocument()

 expect(screen.getByText('Follow Us')).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Follow us on Twitter' })).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Follow us on Instagram' })).toBeInTheDocument()
 })

 it('renders footer sections with links', () => {
 render(<Footer content={mockFooterContent} />)

 expect(screen.getByText('Platform')).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'How It Works' })).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Pricing' })).toBeInTheDocument()

 expect(screen.getByText('Resources')).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Help Center' })).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Creator Guide' })).toBeInTheDocument()
 })

 it('renders legal section with copyright and links', () => {
 render(<Footer content={mockFooterContent} />)

 const currentYear = new Date().getFullYear()
 expect(screen.getByText(`© ${currentYear} Crensa. All rights reserved.`)).toBeInTheDocument()

 expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
 expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument()
 })

 it('has correct link attributes for external social links', () => {
 render(<Footer content={mockFooterContent} />)
 
 const twitterLink = screen.getByRole('link', { name: 'Follow us on Twitter' })
 expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/crensa')
 expect(twitterLink).toHaveAttribute('target', '_blank')
 expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
 })

 it('has correct mailto link for contact email', () => {
 render(<Footer content={mockFooterContent} />)
 
 const emailLink = screen.getByRole('link', { name: 'test@crensa.com' })
 expect(emailLink).toHaveAttribute('href', 'mailto:test@crensa.com')
 })

 it('renders responsive layout classes', () => {
 const { container } = render(<Footer content={mockFooterContent} />)

 const mainGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5')
 expect(mainGrid).toBeInTheDocument()

 const legalFlex = container.querySelector('.flex.flex-col.md\\:flex-row')
 expect(legalFlex).toBeInTheDocument()
 })
})