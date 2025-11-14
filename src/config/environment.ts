

export interface EnvironmentConfig {
 baseUrl: string;
 creatorSignupUrl: string;
 memberSignupUrl: string;
 creatorSigninUrl: string;
 memberSigninUrl: string;
 earlyAccessUrl: string;
 loginUrl: string;
 signupUrl: string;
 supportEmail: string;
 socialLinks: {
 twitter: string;
 instagram: string;
 tiktok: string;
 youtube: string;
 };
 features: {
 enableEarlyAccess: boolean;
 showFounderBenefits: boolean;
 enableTestimonials: boolean;
 };
}

const developmentConfig: EnvironmentConfig = {
 baseUrl: "http://localhost:3000",
 creatorSignupUrl: "/sign-up?role=creator",
 memberSignupUrl: "/sign-up?role=member",
 creatorSigninUrl: "/sign-in?role=creator",
 memberSigninUrl: "/sign-in?role=member",
 earlyAccessUrl: "/sign-up?role=member",
 loginUrl: "/sign-in",
 signupUrl: "/sign-up",
 supportEmail: "dev@crensa.com",
 socialLinks: {
 twitter: "https://twitter.com/crensa",
 instagram: "https://instagram.com/crensa",
 tiktok: "https://tiktok.com/@crensa",
 youtube: "https://youtube.com/@crensa",
 },
 features: {
 enableEarlyAccess: true,
 showFounderBenefits: true,
 enableTestimonials: true,
 },
};

const productionConfig: EnvironmentConfig = {
 baseUrl: "https://crensa.com",
 creatorSignupUrl: "/sign-up?role=creator",
 memberSignupUrl: "/sign-up?role=member",
 creatorSigninUrl: "/sign-in?role=creator",
 memberSigninUrl: "/sign-in?role=member",
 earlyAccessUrl: "/sign-up?role=member",
 loginUrl: "/sign-in",
 signupUrl: "/sign-up",
 supportEmail: "hello@crensa.com",
 socialLinks: {
 twitter: "https://twitter.com/crensa",
 instagram: "https://instagram.com/crensa",
 tiktok: "https://tiktok.com/@crensa",
 youtube: "https://youtube.com/@crensa",
 },
 features: {
 enableEarlyAccess: true,
 showFounderBenefits: true,
 enableTestimonials: true,
 },
};

const stagingConfig: EnvironmentConfig = {
 baseUrl: "https://staging.crensa.com",
 creatorSignupUrl: "/sign-up?role=creator",
 memberSignupUrl: "/sign-up?role=member",
 creatorSigninUrl: "/sign-in?role=creator",
 memberSigninUrl: "/sign-in?role=member",
 earlyAccessUrl: "/sign-up?role=member",
 loginUrl: "/sign-in",
 signupUrl: "/sign-up",
 supportEmail: "staging@crensa.com",
 socialLinks: {
 twitter: "https://twitter.com/crensa",
 instagram: "https://instagram.com/crensa",
 tiktok: "https://tiktok.com/@crensa",
 youtube: "https://youtube.com/@crensa",
 },
 features: {
 enableEarlyAccess: true,
 showFounderBenefits: true,
 enableTestimonials: true,
 },
};

function getEnvironmentConfig(): EnvironmentConfig {
 const env = process.env.NODE_ENV || "development";
 const stage = process.env.NEXT_PUBLIC_STAGE || "development";

 let baseConfig: EnvironmentConfig;

 if (env === "production" && stage === "production") {
 baseConfig = productionConfig;
 } else if (stage === "staging") {
 baseConfig = stagingConfig;
 } else {
 baseConfig = developmentConfig;
 }

 return {
 baseUrl: process.env.NEXT_PUBLIC_BASE_URL || baseConfig.baseUrl,
 creatorSignupUrl: baseConfig.creatorSignupUrl,
 memberSignupUrl: baseConfig.memberSignupUrl,
 creatorSigninUrl: baseConfig.creatorSigninUrl,
 memberSigninUrl: baseConfig.memberSigninUrl,
 earlyAccessUrl: baseConfig.earlyAccessUrl,
 loginUrl: baseConfig.loginUrl,
 signupUrl: baseConfig.signupUrl,
 supportEmail:
 process.env.NEXT_PUBLIC_SUPPORT_EMAIL || baseConfig.supportEmail,
 socialLinks: {
 twitter:
 process.env.NEXT_PUBLIC_TWITTER_URL || baseConfig.socialLinks.twitter,
 instagram:
 process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
 baseConfig.socialLinks.instagram,
 tiktok:
 process.env.NEXT_PUBLIC_TIKTOK_URL || baseConfig.socialLinks.tiktok,
 youtube:
 process.env.NEXT_PUBLIC_YOUTUBE_URL || baseConfig.socialLinks.youtube,
 },
 features: {
 enableEarlyAccess:
 process.env.NEXT_PUBLIC_ENABLE_EARLY_ACCESS === "true" ||
 baseConfig.features.enableEarlyAccess,
 showFounderBenefits:
 process.env.NEXT_PUBLIC_SHOW_FOUNDER_BENEFITS === "true" ||
 baseConfig.features.showFounderBenefits,
 enableTestimonials:
 process.env.NEXT_PUBLIC_ENABLE_TESTIMONIALS === "true" ||
 baseConfig.features.enableTestimonials,
 },
 };
}

export const environmentConfig = getEnvironmentConfig();
