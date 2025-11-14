

import { db } from '../database/connection';
import { sql, eq } from 'drizzle-orm';
import { creatorProfiles, series } from '../database/schema';

export async function updateCreatorSeriesCount(creatorId: string): Promise<number> {
 try {

 const result = await db
 .select({
 count: sql<number>`COUNT(*)`,
 })
 .from(series)
 .where(sql`${series.creatorId} = ${creatorId} AND ${series.isActive} = true`);

 const seriesCount = Number(result[0]?.count || 0);

 await db
 .update(creatorProfiles)
 .set({ 
 seriesCount,
 updatedAt: new Date(),
 })
 .where(eq(creatorProfiles.userId, creatorId));

 return seriesCount;
 } catch (error) {
 console.error('Error updating creator series count:', error);
 throw error;
 }
}

export async function incrementCreatorSeriesCount(creatorId: string): Promise<void> {
 try {
 await db
 .update(creatorProfiles)
 .set({
 seriesCount: sql`${creatorProfiles.seriesCount} + 1`,
 updatedAt: new Date(),
 })
 .where(eq(creatorProfiles.userId, creatorId));
 } catch (error) {
 console.error('Error incrementing creator series count:', error);

 await updateCreatorSeriesCount(creatorId);
 }
}

export async function decrementCreatorSeriesCount(creatorId: string): Promise<void> {
 try {
 await db
 .update(creatorProfiles)
 .set({
 seriesCount: sql`GREATEST(${creatorProfiles.seriesCount} - 1, 0)`,
 updatedAt: new Date(),
 })
 .where(eq(creatorProfiles.userId, creatorId));
 } catch (error) {
 console.error('Error decrementing creator series count:', error);

 await updateCreatorSeriesCount(creatorId);
 }
}

export async function recalculateAllSeriesCounts(): Promise<void> {
 try {
 await db.execute(sql`
 UPDATE creator_profiles
 SET series_count = (
 SELECT COUNT(*)
 FROM series
 WHERE series.creator_id = creator_profiles.user_id
 AND series.is_active = true
 ),
 updated_at = NOW()
 `);
 
 console.log('✅ All series counts recalculated successfully');
 } catch (error) {
 console.error('Error recalculating all series counts:', error);
 throw error;
 }
}
