import { HeroContent } from '@/types'
import { environmentConfig } from '../environment'

export const heroContent: HeroContent = {
 backgroundVideo: '/videos/hero-background.mp4',
 headline: 'Monetize Your Short Videos Like Never Before',
 subheadline: 'Join Crensa and turn your creative content into a sustainable income stream with our innovative pay-per-view credit system.',
 ctaText: 'Start Creating Today',
 ctaLink: environmentConfig.creatorSignupUrl
}