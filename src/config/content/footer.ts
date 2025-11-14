import { FooterContent } from '@/types'
import { environmentConfig } from '../environment'

export const footerContent: FooterContent = {
 tagline: 'Crensa',
 description: 'The future of short-form video monetization. Join thousands of creators earning what their content is truly worth.',
 contactEmail: environmentConfig.supportEmail,
 socialLinks: [
 {
 name: 'Twitter',
 url: environmentConfig.socialLinks.twitter,
 icon: 'twitter'
 },
 {
 name: 'Instagram',
 url: environmentConfig.socialLinks.instagram,
 icon: 'instagram'
 },
 {
 name: 'TikTok',
 url: environmentConfig.socialLinks.tiktok,
 icon: 'tiktok'
 },
 {
 name: 'YouTube',
 url: environmentConfig.socialLinks.youtube,
 icon: 'youtube'
 }
 ],
 sections: [
 {
 title: 'Platform',
 links: [
 { label: 'How It Works', href: '#how-it-works' },
 { label: 'Pricing', href: '/pricing' },
 { label: 'Features', href: '#why-crensa' },
 { label: 'Creator Tools', href: '/creator-tools' }
 ]
 },
 {
 title: 'Resources',
 links: [
 { label: 'Help Center', href: '/help' },
 { label: 'Creator Guide', href: '/creator-guide' },
 { label: 'Community', href: '/community' },
 { label: 'Blog', href: '/blog' }
 ]
 },
 {
 title: 'Company',
 links: [
 { label: 'About Us', href: '/about' },
 { label: 'Careers', href: '/careers' },
 { label: 'Press Kit', href: '/press' },
 { label: 'Contact', href: '/contact' }
 ]
 }
 ],
 finalCta: {
 title: 'Ready to Start Earning?',
 description: 'Join Crensa today and turn your creativity into a sustainable income stream.',
 buttonText: 'Get Started Now',
 buttonLink: environmentConfig.signupUrl
 },
 legal: {
 copyright: '© 2024 Crensa. All rights reserved.',
 links: [
 { label: 'Privacy Policy', href: '/privacy' },
 { label: 'Terms of Service', href: '/terms' },
 { label: 'Cookie Policy', href: '/cookies' },
 { label: 'Community Guidelines', href: '/guidelines' }
 ]
 }
}