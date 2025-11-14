import { environmentConfig } from '../environment'

export interface UrgencyContent {
 title: string
 benefits: string[]
 ctaText: string
 ctaLink: string
}

export const whyJoinNowContent: UrgencyContent = {
 title: 'Why Join Now?',
 benefits: environmentConfig.features.showFounderBenefits ? [
 'Lock in 50% lower platform fees forever as a founding creator',
 'Get exclusive early access to premium features before anyone else',
 'Receive priority support and direct influence on platform development',
 'Build your audience from day one with zero competition',
 'Join our exclusive founder community with networking opportunities'
 ] : [
 'Be among the first creators on a revolutionary platform',
 'Get early access to premium features',
 'Build your audience from day one',
 'Join our growing creator community'
 ],
 ctaText: environmentConfig.features.enableEarlyAccess ? 'Claim Your Spot' : 'Join Now',
 ctaLink: environmentConfig.features.enableEarlyAccess ? environmentConfig.earlyAccessUrl : environmentConfig.signupUrl
}