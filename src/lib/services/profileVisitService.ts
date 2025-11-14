

import { db } from '@/lib/database/connection';
import { profileVisits, users, memberActivities } from '@/lib/database/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';

export interface ProfileVisitData {
 creatorId: string;
 source: 'dashboard' | 'search' | 'recommendation' | 'direct' | 'trending';
 duration?: number;
}

export interface ProfileVisitRecord {
 id: string;
 userId: string;
 creatorId: string;
 visitedAt: Date;
 source: string;
 duration?: number;
}

export interface VisitHistoryItem {
 id: string;
 visitedAt: Date;
 source: string;
 duration?: number;
 creator: {
 id: string;
 username: string;
 avatar?: string;
 };
}

export interface VisitStats {
 totalVisits: number;
 uniqueVisitors: number;
 averageDuration?: number;
 topSources: Array<{
 source: string;
 count: number;
 }>;
}

class ProfileVisitService {
 
 async trackVisit(userId: string, visitData: ProfileVisitData): Promise<ProfileVisitRecord> {
 const { creatorId, source, duration } = visitData;

 if (userId === creatorId) {
 throw new Error('Cannot track visits to own profile');
 }

 const creator = await db
 .select({ id: users.id })
 .from(users)
 .where(eq(users.id, creatorId))
 .limit(1);

 if (creator.length === 0) {
 throw new Error('Creator not found');
 }

 const [visitRecord] = await db
 .insert(profileVisits)
 .values({
 userId,
 creatorId,
 source,
 duration,
 visitedAt: new Date()
 })
 .returning();

 await this.logVisitActivity(userId, creatorId, source);

 return {
 id: visitRecord.id,
 userId: visitRecord.userId,
 creatorId: visitRecord.creatorId,
 visitedAt: visitRecord.visitedAt,
 source: visitRecord.source,
 duration: visitRecord.duration || undefined
 };
 }

 async getVisitHistory(
 userId: string,
 options: {
 limit?: number;
 offset?: number;
 creatorId?: string;
 } = {}
 ): Promise<{
 visits: VisitHistoryItem[];
 total: number;
 }> {
 const { limit = 20, offset = 0, creatorId } = options;

 const whereCondition = creatorId 
 ? and(
 eq(profileVisits.userId, userId),
 eq(profileVisits.creatorId, creatorId)
 )
 : eq(profileVisits.userId, userId);

 const visits = await db
 .select({
 id: profileVisits.id,
 visitedAt: profileVisits.visitedAt,
 source: profileVisits.source,
 duration: profileVisits.duration,
 creator: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(profileVisits)
 .innerJoin(users, eq(profileVisits.creatorId, users.id))
 .where(whereCondition)
 .orderBy(desc(profileVisits.visitedAt))
 .limit(limit)
 .offset(offset);

 const [{ total }] = await db
 .select({ total: count() })
 .from(profileVisits)
 .where(whereCondition);

 return {
 visits: visits.map(visit => ({
 id: visit.id,
 visitedAt: visit.visitedAt,
 source: visit.source,
 duration: visit.duration || undefined,
 creator: {
 ...visit.creator,
 avatar: visit.creator.avatar || undefined
 }
 })),
 total
 };
 }

 async getRecentVisits(userId: string, limit: number = 5): Promise<VisitHistoryItem[]> {
 const result = await this.getVisitHistory(userId, { limit });
 return result.visits;
 }

 async getCreatorVisitStats(creatorId: string, days: number = 30): Promise<VisitStats> {
 const dateThreshold = new Date();
 dateThreshold.setDate(dateThreshold.getDate() - days);

 const [totalStats] = await db
 .select({
 totalVisits: count(),
 uniqueVisitors: sql<number>`COUNT(DISTINCT ${profileVisits.userId})`,
 averageDuration: sql<number>`AVG(${profileVisits.duration})`
 })
 .from(profileVisits)
 .where(
 and(
 eq(profileVisits.creatorId, creatorId),
 sql`${profileVisits.visitedAt} >= ${dateThreshold}`
 )
 );

 const topSources = await db
 .select({
 source: profileVisits.source,
 count: count()
 })
 .from(profileVisits)
 .where(
 and(
 eq(profileVisits.creatorId, creatorId),
 sql`${profileVisits.visitedAt} >= ${dateThreshold}`
 )
 )
 .groupBy(profileVisits.source)
 .orderBy(desc(count()))
 .limit(5);

 return {
 totalVisits: totalStats.totalVisits,
 uniqueVisitors: totalStats.uniqueVisitors,
 averageDuration: totalStats.averageDuration || undefined,
 topSources: topSources.map(item => ({
 source: item.source,
 count: item.count
 }))
 };
 }

 async updateVisitDuration(visitId: string, duration: number): Promise<void> {
 await db
 .update(profileVisits)
 .set({ duration })
 .where(eq(profileVisits.id, visitId));
 }

 async getFrequentlyVisitedCreators(
 userId: string,
 limit: number = 10
 ): Promise<Array<{
 creator: {
 id: string;
 username: string;
 avatar?: string;
 };
 visitCount: number;
 lastVisit: Date;
 }>> {
 const frequentCreators = await db
 .select({
 creatorId: profileVisits.creatorId,
 visitCount: count(),
 lastVisit: sql<Date>`MAX(${profileVisits.visitedAt})`,
 creator: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(profileVisits)
 .innerJoin(users, eq(profileVisits.creatorId, users.id))
 .where(eq(profileVisits.userId, userId))
 .groupBy(profileVisits.creatorId, users.id, users.username, users.avatar)
 .orderBy(desc(count()))
 .limit(limit);

 return frequentCreators.map(item => ({
 creator: {
 ...item.creator,
 avatar: item.creator.avatar || undefined
 },
 visitCount: item.visitCount,
 lastVisit: item.lastVisit
 }));
 }

 private async logVisitActivity(
 userId: string,
 creatorId: string,
 source: string
 ): Promise<void> {
 try {

 const [creator] = await db
 .select({
 username: users.username
 })
 .from(users)
 .where(eq(users.id, creatorId))
 .limit(1);

 if (creator) {
 await db
 .insert(memberActivities)
 .values({
 userId,
 activityType: 'profile_visit',
 title: 'Visited Creator Profile',
 description: `Visited ${creator.username}'s profile`,
 metadata: {
 creatorId,
 source
 }
 });
 }
 } catch (error) {

 console.error('Failed to log visit activity:', error);
 }
 }

 async trackVisitFromClient(creatorId: string, source: string): Promise<{
 success: boolean;
 visitId?: string;
 error?: string;
 }> {
 try {
 const response = await fetch('/api/member/profile-visits', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 creatorId,
 source
 })
 });

 const data = await response.json();

 if (!response.ok) {
 return {
 success: false,
 error: data.error || 'Failed to track visit'
 };
 }

 return {
 success: true,
 visitId: data.data?.visitId
 };
 } catch (error) {
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Network error'
 };
 }
 }
}

export const profileVisitService = new ProfileVisitService();