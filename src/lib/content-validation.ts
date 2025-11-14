import { 
 LandingPageContent, 
 ContentValidationError, 
 ContentValidationResult,
 HeroContent,
 WhyCrensaSection,
 WhyJoinNowSection,
 HowItWorksSection,
 TestimonialsSection,
 FAQSection,
 FooterContent
} from '@/types'

function validateHeroContent(hero: HeroContent): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!hero.headline || hero.headline.trim().length === 0) {
 errors.push({
 field: 'headline',
 message: 'Hero headline is required and cannot be empty',
 section: 'hero'
 })
 }

 if (!hero.subheadline || hero.subheadline.trim().length === 0) {
 errors.push({
 field: 'subheadline',
 message: 'Hero subheadline is required and cannot be empty',
 section: 'hero'
 })
 }

 if (!hero.ctaText || hero.ctaText.trim().length === 0) {
 errors.push({
 field: 'ctaText',
 message: 'Hero CTA text is required and cannot be empty',
 section: 'hero'
 })
 }

 if (!hero.ctaLink || hero.ctaLink.trim().length === 0) {
 errors.push({
 field: 'ctaLink',
 message: 'Hero CTA link is required and cannot be empty',
 section: 'hero'
 })
 }

 if (!hero.backgroundVideo || hero.backgroundVideo.trim().length === 0) {
 errors.push({
 field: 'backgroundVideo',
 message: 'Hero background video is required and cannot be empty',
 section: 'hero'
 })
 }

 return errors
}

function validateWhyCrensaSection(whyCrensa: WhyCrensaSection): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!whyCrensa.title || whyCrensa.title.trim().length === 0) {
 errors.push({
 field: 'title',
 message: 'Why Crensa title is required and cannot be empty',
 section: 'whyCrensa'
 })
 }

 if (!whyCrensa.features || whyCrensa.features.length === 0) {
 errors.push({
 field: 'features',
 message: 'Why Crensa must have at least one feature',
 section: 'whyCrensa'
 })
 } else {
 whyCrensa.features.forEach((feature, index) => {
 if (!feature.title || feature.title.trim().length === 0) {
 errors.push({
 field: `features[${index}].title`,
 message: `Feature ${index + 1} title is required and cannot be empty`,
 section: 'whyCrensa'
 })
 }
 if (!feature.description || feature.description.trim().length === 0) {
 errors.push({
 field: `features[${index}].description`,
 message: `Feature ${index + 1} description is required and cannot be empty`,
 section: 'whyCrensa'
 })
 }
 })
 }

 return errors
}

function validateWhyJoinNowSection(whyJoinNow: WhyJoinNowSection): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!whyJoinNow.title || whyJoinNow.title.trim().length === 0) {
 errors.push({
 field: 'title',
 message: 'Why Join Now title is required and cannot be empty',
 section: 'whyJoinNow'
 })
 }

 if (!whyJoinNow.benefits || whyJoinNow.benefits.length === 0) {
 errors.push({
 field: 'benefits',
 message: 'Why Join Now must have at least one benefit',
 section: 'whyJoinNow'
 })
 } else {
 whyJoinNow.benefits.forEach((benefit, index) => {
 if (!benefit || benefit.trim().length === 0) {
 errors.push({
 field: `benefits[${index}]`,
 message: `Benefit ${index + 1} cannot be empty`,
 section: 'whyJoinNow'
 })
 }
 })
 }

 if (!whyJoinNow.ctaText || whyJoinNow.ctaText.trim().length === 0) {
 errors.push({
 field: 'ctaText',
 message: 'Why Join Now CTA text is required and cannot be empty',
 section: 'whyJoinNow'
 })
 }

 if (!whyJoinNow.ctaLink || whyJoinNow.ctaLink.trim().length === 0) {
 errors.push({
 field: 'ctaLink',
 message: 'Why Join Now CTA link is required and cannot be empty',
 section: 'whyJoinNow'
 })
 }

 return errors
}

function validateHowItWorksSection(howItWorks: HowItWorksSection): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!howItWorks.title || howItWorks.title.trim().length === 0) {
 errors.push({
 field: 'title',
 message: 'How It Works title is required and cannot be empty',
 section: 'howItWorks'
 })
 }

 if (!howItWorks.steps || howItWorks.steps.length === 0) {
 errors.push({
 field: 'steps',
 message: 'How It Works must have at least one step',
 section: 'howItWorks'
 })
 } else {
 howItWorks.steps.forEach((step, index) => {
 if (!step.title || step.title.trim().length === 0) {
 errors.push({
 field: `steps[${index}].title`,
 message: `Step ${index + 1} title is required and cannot be empty`,
 section: 'howItWorks'
 })
 }
 if (!step.description || step.description.trim().length === 0) {
 errors.push({
 field: `steps[${index}].description`,
 message: `Step ${index + 1} description is required and cannot be empty`,
 section: 'howItWorks'
 })
 }
 })
 }

 return errors
}

function validateTestimonialsSection(testimonials: TestimonialsSection): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!testimonials.title || testimonials.title.trim().length === 0) {
 errors.push({
 field: 'title',
 message: 'Testimonials title is required and cannot be empty',
 section: 'testimonials'
 })
 }

 if (testimonials.items && testimonials.items.length > 0) {
 testimonials.items.forEach((testimonial, index) => {
 if (!testimonial.name || testimonial.name.trim().length === 0) {
 errors.push({
 field: `items[${index}].name`,
 message: `Testimonial ${index + 1} name is required and cannot be empty`,
 section: 'testimonials'
 })
 }
 if (!testimonial.content || testimonial.content.trim().length === 0) {
 errors.push({
 field: `items[${index}].content`,
 message: `Testimonial ${index + 1} content is required and cannot be empty`,
 section: 'testimonials'
 })
 }
 if (!testimonial.role || !['creator', 'viewer'].includes(testimonial.role)) {
 errors.push({
 field: `items[${index}].role`,
 message: `Testimonial ${index + 1} role must be either 'creator' or 'viewer'`,
 section: 'testimonials'
 })
 }
 if (typeof testimonial.rating !== 'number' || testimonial.rating < 1 || testimonial.rating > 5) {
 errors.push({
 field: `items[${index}].rating`,
 message: `Testimonial ${index + 1} rating must be a number between 1 and 5`,
 section: 'testimonials'
 })
 }
 })
 }

 return errors
}

function validateFAQSection(faq: FAQSection): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!faq.title || faq.title.trim().length === 0) {
 errors.push({
 field: 'title',
 message: 'FAQ title is required and cannot be empty',
 section: 'faq'
 })
 }

 if (!faq.items || faq.items.length === 0) {
 errors.push({
 field: 'items',
 message: 'FAQ must have at least one question',
 section: 'faq'
 })
 } else {
 faq.items.forEach((item, index) => {
 if (!item.question || item.question.trim().length === 0) {
 errors.push({
 field: `items[${index}].question`,
 message: `FAQ ${index + 1} question is required and cannot be empty`,
 section: 'faq'
 })
 }
 if (!item.answer || item.answer.trim().length === 0) {
 errors.push({
 field: `items[${index}].answer`,
 message: `FAQ ${index + 1} answer is required and cannot be empty`,
 section: 'faq'
 })
 }
 if (!item.category || !['general', 'creator', 'viewer', 'payment'].includes(item.category)) {
 errors.push({
 field: `items[${index}].category`,
 message: `FAQ ${index + 1} category must be one of: general, creator, viewer, payment`,
 section: 'faq'
 })
 }
 })
 }

 return errors
}

function validateFooterContent(footer: FooterContent): ContentValidationError[] {
 const errors: ContentValidationError[] = []

 if (!footer.tagline || footer.tagline.trim().length === 0) {
 errors.push({
 field: 'tagline',
 message: 'Footer tagline is required and cannot be empty',
 section: 'footer'
 })
 }

 if (!footer.description || footer.description.trim().length === 0) {
 errors.push({
 field: 'description',
 message: 'Footer description is required and cannot be empty',
 section: 'footer'
 })
 }

 if (!footer.contactEmail || footer.contactEmail.trim().length === 0) {
 errors.push({
 field: 'contactEmail',
 message: 'Footer contact email is required and cannot be empty',
 section: 'footer'
 })
 } else {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 if (!emailRegex.test(footer.contactEmail)) {
 errors.push({
 field: 'contactEmail',
 message: 'Footer contact email must be a valid email address',
 section: 'footer'
 })
 }
 }

 if (!footer.finalCta.title || footer.finalCta.title.trim().length === 0) {
 errors.push({
 field: 'finalCta.title',
 message: 'Footer final CTA title is required and cannot be empty',
 section: 'footer'
 })
 }

 if (!footer.finalCta.buttonText || footer.finalCta.buttonText.trim().length === 0) {
 errors.push({
 field: 'finalCta.buttonText',
 message: 'Footer final CTA button text is required and cannot be empty',
 section: 'footer'
 })
 }

 if (!footer.finalCta.buttonLink || footer.finalCta.buttonLink.trim().length === 0) {
 errors.push({
 field: 'finalCta.buttonLink',
 message: 'Footer final CTA button link is required and cannot be empty',
 section: 'footer'
 })
 }

 return errors
}

export function validateLandingPageContent(content: LandingPageContent): ContentValidationResult {
 const allErrors: ContentValidationError[] = []

 allErrors.push(...validateHeroContent(content.hero))
 allErrors.push(...validateWhyCrensaSection(content.whyCrensa))
 allErrors.push(...validateWhyJoinNowSection(content.whyJoinNow))
 allErrors.push(...validateHowItWorksSection(content.howItWorks))
 allErrors.push(...validateTestimonialsSection(content.testimonials))
 allErrors.push(...validateFAQSection(content.faq))
 allErrors.push(...validateFooterContent(content.footer))

 return {
 isValid: allErrors.length === 0,
 errors: allErrors
 }
}

export function validateContentOrThrow(content: LandingPageContent): void {
 const validation = validateLandingPageContent(content)
 
 if (!validation.isValid) {
 const errorMessage = validation.errors
 .map(error => `${error.section}.${error.field}: ${error.message}`)
 .join('\n')
 
 throw new Error(`Content validation failed:\n${errorMessage}`)
 }
}