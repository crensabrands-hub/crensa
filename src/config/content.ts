import { LandingPageContent } from '@/types'
import { heroContent } from './content/hero'
import { whyCrensaFeatures, howItWorksSteps } from './content/features'
import { whyJoinNowContent } from './content/urgency'
import { testimonials } from './content/testimonials'
import { faqItems } from './content/faq'
import { footerContent } from './content/footer'
import { environmentConfig } from './environment'

export const landingPageContent: LandingPageContent = {
 hero: heroContent,
 whyCrensa: {
 title: 'Why Choose Crensa?',
 subtitle: 'The platform built for creators who want to maximize their earning potential',
 features: whyCrensaFeatures
 },
 whyJoinNow: whyJoinNowContent,
 howItWorks: {
 title: 'How It Works',
 steps: howItWorksSteps
 },
 testimonials: environmentConfig.features.enableTestimonials ? {
 title: 'What Our Community Says',
 items: testimonials
 } : {
 title: 'Join Our Growing Community',
 items: []
 },
 faq: {
 title: 'Frequently Asked Questions',
 items: faqItems
 },
 footer: footerContent
}