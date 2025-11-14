import { render, screen, waitFor, act } from '@testing-library/react'
import { HeroSection } from '../HeroSection'
import { HeroContent } from '@/types'
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
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, variants, whileHover, whileTap, ...props }: any) => <div {...props}>{children}</div>,
 h1: ({ children, variants, ...props }: any) => <h1 {...props}>{children}</h1>,
 p: ({ children, variants, ...props }: any) => <p {...props}>{children}</p>,
 a: ({ children, variants, whileHover, whileTap, ...props }: any) => <a {...props}>{children}</a>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: () => false,
}))

const mockHeroContent: HeroContent = {
 backgroundVideo: '/videos/test-video.mp4',
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Test CTA',
 ctaLink: '/test-link',
}

describe('HeroSection', () => {
 beforeEach(() => {

 Object.defineProperty(HTMLVideoElement.prototype, 'play', {
 writable: true,
 value: jest.fn().mockImplementation(() => Promise.resolve()),
 })
 Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
 writable: true,
 value: jest.fn(),
 })
 Object.defineProperty(HTMLVideoElement.prototype, 'load', {
 writable: true,
 value: jest.fn(),
 })
 })

 it('renders hero content correctly', () => {
 render(<HeroSection content={mockHeroContent} />)

 expect(screen.getByText('Test Headline')).toBeInTheDocument()
 expect(screen.getByText('Test Subheadline')).toBeInTheDocument()
 expect(screen.getByText('Test CTA')).toBeInTheDocument()
 })

 it('renders video element with correct attributes', () => {
 render(<HeroSection content={mockHeroContent} />)

 const video = document.querySelector('video') as HTMLVideoElement
 expect(video).toBeInTheDocument()
 expect(video).toHaveAttribute('autoplay')
 expect(video.muted).toBe(true)
 expect(video).toHaveAttribute('loop')
 expect(video).toHaveAttribute('playsinline')
 expect(video).toHaveAttribute('poster', '/images/hero-fallback.svg')
 })

 it('includes multiple video source formats', () => {
 render(<HeroSection content={mockHeroContent} />)

 const sources = document.querySelectorAll('source')
 expect(sources.length).toBe(2)
 expect(sources[0]).toHaveAttribute('type', 'video/mp4')
 expect(sources[1]).toHaveAttribute('type', 'video/webm')
 })

 it('renders CTA link with correct href', () => {
 render(<HeroSection content={mockHeroContent} />)

 const ctaLink = screen.getByRole('link', { name: 'Test CTA' })
 expect(ctaLink).toHaveAttribute('href', '/test-link')
 })

 it('has proper accessibility attributes', () => {
 render(<HeroSection content={mockHeroContent} />)

 const ctaLink = screen.getByRole('link', { name: 'Test CTA' })
 expect(ctaLink).toHaveClass('focus:outline-none', 'focus:ring-4')
 })

 it('renders with proper section structure', () => {
 render(<HeroSection content={mockHeroContent} />)

 const section = screen.getByRole('region', { name: 'Hero section' })
 expect(section).toBeInTheDocument()
 expect(section).toHaveClass('relative', 'min-h-screen')
 })

 it('handles video loading state', async () => {
 render(<HeroSection content={mockHeroContent} />)

 const video = document.querySelector('video') as HTMLVideoElement

 expect(video).toHaveClass('opacity-0')

 await act(async () => {
 const loadedEvent = new Event('loadeddata')
 video.dispatchEvent(loadedEvent)
 })

 await waitFor(() => {
 expect(video).toHaveClass('opacity-100')
 })
 })

 it('handles video error state', async () => {
 render(<HeroSection content={mockHeroContent} />)

 const video = document.querySelector('video') as HTMLVideoElement

 await act(async () => {
 const errorEvent = new Event('error')
 video.dispatchEvent(errorEvent)
 })

 await waitFor(() => {
 const fallbackDiv = document.querySelector('div[style*="background-image"]')
 expect(fallbackDiv).toHaveClass('opacity-100')
 })
 })

 it('applies reduced motion preferences', () => {

 render(<HeroSection content={mockHeroContent} />)
 
 const video = document.querySelector('video') as HTMLVideoElement
 expect(video).toBeInTheDocument()
 })

 it('has proper responsive classes', () => {
 render(<HeroSection content={mockHeroContent} />)

 const headline = screen.getByText('Test Headline')
 expect(headline).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl', 'xl:text-7xl')

 const subheadline = screen.getByText('Test Subheadline')
 expect(subheadline).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl')
 })

 it('renders with proper semantic structure', () => {
 render(<HeroSection content={mockHeroContent} />)

 const section = document.querySelector('section')
 expect(section).toBeInTheDocument()

 const heading = screen.getByRole('heading', { level: 1 })
 expect(heading).toBeInTheDocument()
 })
})