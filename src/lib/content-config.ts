import { landingPageContent } from '@/config/content'
import { validateContentOrThrow } from './content-validation'
import { LandingPageContent } from '@/types'

export function getLandingPageContent(): LandingPageContent {
 try {

 validateContentOrThrow(landingPageContent)
 return landingPageContent
 } catch (error) {
 console.error('Content validation failed:', error)

 if (process.env.NODE_ENV === 'development') {
 throw error
 }

 throw new Error('Content configuration is invalid. Please check the content files.')
 }
}

export function getSectionContent<T extends keyof LandingPageContent>(
 section: T
): LandingPageContent[T] {
 try {
 const content = getLandingPageContent()
 return content[section]
 } catch (error) {
 console.error(`Failed to get content for section: ${section}`, error)
 throw error
 }
}

export function isFeatureEnabled(feature: string): boolean {
 try {
 const { environmentConfig } = require('@/config/environment')
 
 switch (feature) {
 case 'earlyAccess':
 return environmentConfig.features.enableEarlyAccess
 case 'founderBenefits':
 return environmentConfig.features.showFounderBenefits
 case 'testimonials':
 return environmentConfig.features.enableTestimonials
 default:
 return false
 }
 } catch (error) {
 console.error(`Failed to check feature flag: ${feature}`, error)
 return false
 }
}

export function getEnvironmentUrls() {
 try {
 const { environmentConfig } = require('@/config/environment')
 return {
 creatorSignup: environmentConfig.creatorSignupUrl,
 memberSignup: environmentConfig.memberSignupUrl,
 creatorSignin: environmentConfig.creatorSigninUrl,
 memberSignin: environmentConfig.memberSigninUrl,
 earlyAccess: environmentConfig.earlyAccessUrl,
 login: environmentConfig.loginUrl,
 signup: environmentConfig.signupUrl,
 baseUrl: environmentConfig.baseUrl
 }
 } catch (error) {
 console.error('Failed to get environment URLs:', error)

 return {
 creatorSignup: '/sign-up?role=creator',
 memberSignup: '/sign-up?role=member',
 creatorSignin: '/sign-in?role=creator',
 memberSignin: '/sign-in?role=member',
 earlyAccess: '/sign-up?role=member',
 login: '/sign-in',
 signup: '/sign-up',
 baseUrl: 'http://localhost:3000'
 }
 }
}