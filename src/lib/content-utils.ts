import { LandingPageContent, FAQItem, Testimonial, FeatureItem } from "@/types";

export function filterFAQByCategory(
 faqs: FAQItem[],
 category: FAQItem["category"]
): FAQItem[] {
 return faqs.filter((faq) => faq.category === category);
}

export function filterTestimonialsByRole(
 testimonials: Testimonial[],
 role: Testimonial["role"]
): Testimonial[] {
 return testimonials.filter((testimonial) => testimonial.role === role);
}

export function getHighRatedTestimonials(
 testimonials: Testimonial[],
 minRating: number = 4
): Testimonial[] {
 return testimonials.filter((testimonial) => testimonial.rating >= minRating);
}

export function searchFAQ(faqs: FAQItem[], searchTerm: string): FAQItem[] {
 const term = searchTerm.toLowerCase();
 return faqs.filter(
 (faq) =>
 faq.question.toLowerCase().includes(term) ||
 faq.answer.toLowerCase().includes(term)
 );
}

export function getRandomTestimonials(
 testimonials: Testimonial[],
 count: number
): Testimonial[] {
 const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
 return shuffled.slice(0, count);
}

export function formatFeatureForDisplay(feature: FeatureItem): FeatureItem {
 return {
 ...feature,
 title: feature.title.trim(),
 description: feature.description.trim(),
 };
}

export function getContentStats(content: LandingPageContent) {
 return {
 totalFeatures: content.whyCrensa.features.length,
 totalSteps: content.howItWorks.steps.length,
 totalTestimonials: content.testimonials.items.length,
 totalFAQs: content.faq.items.length,
 faqByCategory: {
 general: filterFAQByCategory(content.faq.items, "general").length,
 creator: filterFAQByCategory(content.faq.items, "creator").length,
 viewer: filterFAQByCategory(content.faq.items, "viewer").length,
 payment: filterFAQByCategory(content.faq.items, "payment").length,
 },
 testimonialsByRole: {
 creator: filterTestimonialsByRole(content.testimonials.items, "creator")
 .length,
 viewer: filterTestimonialsByRole(content.testimonials.items, "viewer")
 .length,
 },
 averageTestimonialRating:
 content.testimonials.items.length > 0
 ? content.testimonials.items.reduce((sum, t) => sum + t.rating, 0) /
 content.testimonials.items.length
 : 0,
 };
}

export function validateContentAssets(content: LandingPageContent): string[] {
 const missingAssets: string[] = [];

 if (
 content.hero.backgroundVideo &&
 !content.hero.backgroundVideo.startsWith("http")
 ) {

 if (!content.hero.backgroundVideo.startsWith("/")) {
 missingAssets.push(
 `Hero background video: ${content.hero.backgroundVideo}`
 );
 }
 }

 content.testimonials.items.forEach((testimonial, index) => {
 if (
 testimonial.avatar &&
 !testimonial.avatar.startsWith("http") &&
 !testimonial.avatar.startsWith("/")
 ) {
 missingAssets.push(
 `Testimonial ${index + 1} avatar: ${testimonial.avatar}`
 );
 }
 });

 return missingAssets;
}

export function generateContentSummary(content: LandingPageContent): string {
 const stats = getContentStats(content);

 return `
Content Summary:
================

Hero Section:
- Headline: "${content.hero.headline}"
- CTA: "${content.hero.ctaText}" → ${content.hero.ctaLink}

Features:
- ${stats.totalFeatures} features in "Why Crensa" section
- ${stats.totalSteps} steps in "How It Works" section

Social Proof:
- ${stats.totalTestimonials} testimonials (${
 stats.testimonialsByRole.creator
 } creators, ${stats.testimonialsByRole.viewer} viewers)
- Average rating: ${stats.averageTestimonialRating.toFixed(1)}/5

Support:
- ${stats.totalFAQs} FAQ items across ${
 Object.keys(stats.faqByCategory).length
 } categories
- Contact: ${content.footer.contactEmail}

Call-to-Actions:
- Hero: ${content.hero.ctaText} → ${content.hero.ctaLink}
- Urgency: ${content.whyJoinNow.ctaText} → ${content.whyJoinNow.ctaLink}
- Footer: ${content.footer.finalCta.buttonText} → ${
 content.footer.finalCta.buttonLink
 }
 `.trim();
}
