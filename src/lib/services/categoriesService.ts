

import { db } from "@/lib/database/connection";
import { categories, videos, series } from "@/lib/database/schema";
import { eq, sql, desc } from "drizzle-orm";
import { CacheService } from "./cacheService";

export interface Category {
 id: string;
 name: string;
 slug: string;
 description: string | null;
 iconUrl: string | null;
 contentCount: number;
 videoCount: number;
 seriesCount: number;
 isActive: boolean;
 displayOrder: number;
}

export class CategoriesService {
 
 static async getActiveCategories(): Promise<Category[]> {
 return CacheService.getOrSet(
 CacheService.CACHE_KEYS.CATEGORIES,
 () => this._getActiveCategoriesFromDB(),
 CacheService.CACHE_TTL.CATEGORIES
 );
 }

 private static async _getActiveCategoriesFromDB(): Promise<Category[]> {
 try {
 const categoriesWithCounts = await db
 .select({
 id: categories.id,
 name: categories.name,
 slug: categories.slug,
 description: categories.description,
 iconUrl: categories.iconUrl,
 videoCount: categories.videoCount,
 seriesCount: categories.seriesCount,
 isActive: categories.isActive,
 displayOrder: categories.displayOrder,

 actualVideoCount: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${videos} 
 WHERE ${videos.category} = ${categories.name}
 AND ${videos.isActive} = true
 AND ${videos.moderationStatus} = 'approved'
 ), 0)
 `,
 actualSeriesCount: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${series} 
 WHERE ${series.category} = ${categories.name}
 AND ${series.isActive} = true
 AND ${series.moderationStatus} = 'approved'
 ), 0)
 `
 })
 .from(categories)
 .where(eq(categories.isActive, true))
 .orderBy(categories.displayOrder, categories.name);

 return categoriesWithCounts.map(cat => ({
 id: cat.id,
 name: cat.name,
 slug: cat.slug,
 description: cat.description,
 iconUrl: cat.iconUrl,
 contentCount: cat.actualVideoCount + cat.actualSeriesCount,
 videoCount: cat.actualVideoCount,
 seriesCount: cat.actualSeriesCount,
 isActive: cat.isActive,
 displayOrder: cat.displayOrder
 }));

 } catch (error) {
 console.error('Error fetching categories:', error);
 throw new Error('Failed to fetch categories');
 }
 }

 static async getCategoryBySlug(slug: string): Promise<Category | null> {
 try {
 const result = await db
 .select({
 id: categories.id,
 name: categories.name,
 slug: categories.slug,
 description: categories.description,
 iconUrl: categories.iconUrl,
 videoCount: categories.videoCount,
 seriesCount: categories.seriesCount,
 isActive: categories.isActive,
 displayOrder: categories.displayOrder,
 actualVideoCount: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${videos} 
 WHERE ${videos.category} = ${categories.name}
 AND ${videos.isActive} = true
 AND ${videos.moderationStatus} = 'approved'
 ), 0)
 `,
 actualSeriesCount: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${series} 
 WHERE ${series.category} = ${categories.name}
 AND ${series.isActive} = true
 AND ${series.moderationStatus} = 'approved'
 ), 0)
 `
 })
 .from(categories)
 .where(eq(categories.slug, slug))
 .limit(1);

 if (result.length === 0) {
 return null;
 }

 const cat = result[0];
 return {
 id: cat.id,
 name: cat.name,
 slug: cat.slug,
 description: cat.description,
 iconUrl: cat.iconUrl,
 contentCount: cat.actualVideoCount + cat.actualSeriesCount,
 videoCount: cat.actualVideoCount,
 seriesCount: cat.actualSeriesCount,
 isActive: cat.isActive,
 displayOrder: cat.displayOrder
 };

 } catch (error) {
 console.error('Error fetching category by slug:', error);
 throw new Error('Failed to fetch category');
 }
 }

 static async updateCategoryCounts(): Promise<void> {
 try {

 const allCategories = await db
 .select({
 id: categories.id,
 name: categories.name
 })
 .from(categories);

 for (const category of allCategories) {

 const videoCountResult = await db
 .select({
 count: sql<number>`COUNT(*)::int`
 })
 .from(videos)
 .where(
 sql`${videos.category} = ${category.name} 
 AND ${videos.isActive} = true 
 AND ${videos.moderationStatus} = 'approved'`
 );

 const seriesCountResult = await db
 .select({
 count: sql<number>`COUNT(*)::int`
 })
 .from(series)
 .where(
 sql`${series.category} = ${category.name} 
 AND ${series.isActive} = true 
 AND ${series.moderationStatus} = 'approved'`
 );

 const videoCount = videoCountResult[0]?.count || 0;
 const seriesCount = seriesCountResult[0]?.count || 0;

 await db
 .update(categories)
 .set({
 videoCount,
 seriesCount,
 updatedAt: new Date()
 })
 .where(eq(categories.id, category.id));
 }

 CacheService.delete(CacheService.CACHE_KEYS.CATEGORIES);

 } catch (error) {
 console.error('Error updating category counts:', error);
 throw new Error('Failed to update category counts');
 }
 }

 static async seedDefaultCategories(): Promise<void> {
 try {
 const existingCategories = await db
 .select({ count: sql<number>`COUNT(*)::int` })
 .from(categories);

 if (existingCategories[0].count > 0) {
 return; // Categories already exist
 }

 const defaultCategories = [
 {
 name: 'Entertainment',
 slug: 'entertainment',
 description: 'Fun and entertaining content',
 displayOrder: 1
 },
 {
 name: 'Education',
 slug: 'education',
 description: 'Educational and learning content',
 displayOrder: 2
 },
 {
 name: 'Music',
 slug: 'music',
 description: 'Music videos and performances',
 displayOrder: 3
 },
 {
 name: 'Comedy',
 slug: 'comedy',
 description: 'Funny and humorous content',
 displayOrder: 4
 },
 {
 name: 'Lifestyle',
 slug: 'lifestyle',
 description: 'Lifestyle and personal content',
 displayOrder: 5
 },
 {
 name: 'Technology',
 slug: 'technology',
 description: 'Tech reviews and tutorials',
 displayOrder: 6
 },
 {
 name: 'Gaming',
 slug: 'gaming',
 description: 'Gaming content and streams',
 displayOrder: 7
 },
 {
 name: 'Sports',
 slug: 'sports',
 description: 'Sports and fitness content',
 displayOrder: 8
 }
 ];

 await db.insert(categories).values(defaultCategories);
 
 console.log('Default categories seeded successfully');

 } catch (error) {
 console.error('Error seeding default categories:', error);
 throw new Error('Failed to seed default categories');
 }
 }
}