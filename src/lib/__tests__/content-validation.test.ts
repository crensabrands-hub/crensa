import { validateLandingPageContent, validateContentOrThrow } from '../content-validation'
import { LandingPageContent } from '@/types'

const validContent: LandingPageContent = {
 hero: {
 backgroundVideo: '/videos/hero-background.mp4',
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Get Started',
 ctaLink: '/signup'
 },
 whyCrensa: {
 title: 'Why Choose Us',
 subtitle: 'The best platform',
 features: [
 {
 icon: '💰',
 title: 'Feature 1',
 description: 'Feature 1 description'
 }
 ]
 },
 whyJoinNow: {
 title: 'Why Join Now',
 benefits: ['Benefit 1', 'Benefit 2'],
 ctaText: 'Join Now',
 ctaLink: '/signup'
 },
 howItWorks: {
 title: 'How It Works',
 steps: [
 {
 icon: '📱',
 title: 'Step 1',
 description: 'Step 1 description'
 }
 ]
 },
 testimonials: {
 title: 'Testimonials',
 items: [
 {
 name: 'John Doe',
 role: 'creator',
 avatar: '/images/john.jpg',
 content: 'Great platform!',
 rating: 5
 }
 ]
 },
 faq: {
 title: 'FAQ',
 items: [
 {
 question: 'How does it work?',
 answer: 'It works great!',
 category: 'general'
 }
 ]
 },
 footer: {
 tagline: 'Crensa',
 description: 'The best platform',
 contactEmail: 'hello@crensa.com',
 socialLinks: [
 {
 name: 'Twitter',
 url: 'https://twitter.com/crensa',
 icon: '𝕏'
 }
 ],
 sections: [
 {
 title: 'Platform',
 links: [
 { label: 'Features', href: '/features' }
 ]
 }
 ],
 finalCta: {
 title: 'Ready to Start?',
 description: 'Join us today',
 buttonText: 'Get Started',
 buttonLink: '/signup'
 },
 legal: {
 copyright: '© 2024 Crensa',
 links: [
 { label: 'Privacy', href: '/privacy' }
 ]
 }
 }
}

describe('Content Validation', () => {
 describe('validateLandingPageContent', () => {
 it('should validate valid content successfully', () => {
 const result = validateLandingPageContent(validContent)
 expect(result.isValid).toBe(true)
 expect(result.errors).toHaveLength(0)
 })

 it('should fail validation for missing hero headline', () => {
 const invalidContent = {
 ...validContent,
 hero: {
 ...validContent.hero,
 headline: ''
 }
 }
 
 const result = validateLandingPageContent(invalidContent)
 expect(result.isValid).toBe(false)
 expect(result.errors).toContainEqual({
 field: 'headline',
 message: 'Hero headline is required and cannot be empty',
 section: 'hero'
 })
 })

 it('should fail validation for empty features array', () => {
 const invalidContent = {
 ...validContent,
 whyCrensa: {
 ...validContent.whyCrensa,
 features: []
 }
 }
 
 const result = validateLandingPageContent(invalidContent)
 expect(result.isValid).toBe(false)
 expect(result.errors).toContainEqual({
 field: 'features',
 message: 'Why Crensa must have at least one feature',
 section: 'whyCrensa'
 })
 })

 it('should fail validation for invalid email', () => {
 const invalidContent = {
 ...validContent,
 footer: {
 ...validContent.footer,
 contactEmail: 'invalid-email'
 }
 }
 
 const result = validateLandingPageContent(invalidContent)
 expect(result.isValid).toBe(false)
 expect(result.errors).toContainEqual({
 field: 'contactEmail',
 message: 'Footer contact email must be a valid email address',
 section: 'footer'
 })
 })

 it('should fail validation for invalid testimonial rating', () => {
 const invalidContent = {
 ...validContent,
 testimonials: {
 ...validContent.testimonials,
 items: [
 {
 ...validContent.testimonials.items[0],
 rating: 6
 }
 ]
 }
 }
 
 const result = validateLandingPageContent(invalidContent)
 expect(result.isValid).toBe(false)
 expect(result.errors).toContainEqual({
 field: 'items[0].rating',
 message: 'Testimonial 1 rating must be a number between 1 and 5',
 section: 'testimonials'
 })
 })

 it('should fail validation for invalid FAQ category', () => {
 const invalidContent = {
 ...validContent,
 faq: {
 ...validContent.faq,
 items: [
 {
 ...validContent.faq.items[0],
 category: 'invalid' as any
 }
 ]
 }
 }
 
 const result = validateLandingPageContent(invalidContent)
 expect(result.isValid).toBe(false)
 expect(result.errors).toContainEqual({
 field: 'items[0].category',
 message: 'FAQ 1 category must be one of: general, creator, viewer, payment',
 section: 'faq'
 })
 })
 })

 describe('validateContentOrThrow', () => {
 it('should not throw for valid content', () => {
 expect(() => validateContentOrThrow(validContent)).not.toThrow()
 })

 it('should throw for invalid content', () => {
 const invalidContent = {
 ...validContent,
 hero: {
 ...validContent.hero,
 headline: ''
 }
 }
 
 expect(() => validateContentOrThrow(invalidContent)).toThrow('Content validation failed')
 })
 })
})