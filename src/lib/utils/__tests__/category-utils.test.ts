

import { getCategoryNameFromSlug, getCategorySlugFromName, getAllCategories } from '../category-utils';

describe('Category Utils', () => {
 describe('getCategoryNameFromSlug', () => {
 it('should convert slug to name', () => {
 expect(getCategoryNameFromSlug('education')).toBe('Education');
 expect(getCategoryNameFromSlug('entertainment')).toBe('Entertainment');
 expect(getCategoryNameFromSlug('art-design')).toBe('Art & Design');
 });

 it('should return null for "all"', () => {
 expect(getCategoryNameFromSlug('all')).toBeNull();
 });

 it('should return null for unknown slug', () => {
 expect(getCategoryNameFromSlug('unknown')).toBeNull();
 });

 it('should handle case insensitivity', () => {
 expect(getCategoryNameFromSlug('EDUCATION')).toBe('Education');
 expect(getCategoryNameFromSlug('Education')).toBe('Education');
 });
 });

 describe('getCategorySlugFromName', () => {
 it('should convert name to slug', () => {
 expect(getCategorySlugFromName('Education')).toBe('education');
 expect(getCategorySlugFromName('Entertainment')).toBe('entertainment');
 expect(getCategorySlugFromName('Art & Design')).toBe('art-design');
 });

 it('should return null for unknown name', () => {
 expect(getCategorySlugFromName('Unknown')).toBeNull();
 });
 });

 describe('getAllCategories', () => {
 it('should return all categories', () => {
 const categories = getAllCategories();
 expect(categories.length).toBeGreaterThan(0);
 expect(categories[0]).toHaveProperty('slug');
 expect(categories[0]).toHaveProperty('name');
 });

 it('should include standard categories', () => {
 const categories = getAllCategories();
 const slugs = categories.map(c => c.slug);
 expect(slugs).toContain('education');
 expect(slugs).toContain('entertainment');
 expect(slugs).toContain('music');
 });
 });
});
