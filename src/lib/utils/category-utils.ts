

const CATEGORY_MAP: Record<string, string> = {
 'entertainment': 'Entertainment',
 'education': 'Education',
 'music': 'Music',
 'comedy': 'Comedy',
 'lifestyle': 'Lifestyle',
 'technology': 'Technology',
 'gaming': 'Gaming',
 'sports': 'Sports',
 'dance': 'Dance',
 'art-design': 'Art & Design',
 'fitness-health': 'Fitness & Health',
 'business': 'Business',
 'art': 'Art',
 'other': 'Other',
};

const NAME_TO_SLUG_MAP: Record<string, string> = Object.entries(CATEGORY_MAP).reduce(
 (acc, [slug, name]) => {
 acc[name] = slug;
 return acc;
 },
 {} as Record<string, string>
);

export function getCategoryNameFromSlug(slug: string): string | null {
 if (!slug || slug === "all") {
 return null;
 }

 const normalizedSlug = slug.toLowerCase();
 return CATEGORY_MAP[normalizedSlug] || null;
}

export function getCategorySlugFromName(name: string): string | null {
 if (!name) {
 return null;
 }

 return NAME_TO_SLUG_MAP[name] || null;
}

export function getAllCategories(): Array<{ slug: string; name: string }> {
 return Object.entries(CATEGORY_MAP).map(([slug, name]) => ({
 slug,
 name,
 }));
}
