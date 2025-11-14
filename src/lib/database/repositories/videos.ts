

import { eq, desc, asc, and, or, ilike, sql } from 'drizzle-orm'
import { db } from '../connection'
import { videos, users, type Video, type NewVideo } from '../schema'

export interface VideoWithCreator extends Video {
 creator: {
 id: string
 username: string
 avatar: string | null
 }
}

export interface VideoFilters {
 creatorId?: string
 category?: string
 isActive?: boolean
 search?: string
}

export interface PaginationOptions {
 page?: number
 limit?: number
 sortBy?: 'createdAt' | 'viewCount' | 'totalEarnings' | 'title'
 sortOrder?: 'asc' | 'desc'
}

export class VideoRepository {
 
 async create(videoData: NewVideo): Promise<Video> {
 const result = await db.insert(videos).values(videoData).returning()
 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create video')
 }
 return result[0] as Video
 }

 async findById(id: string): Promise<VideoWithCreator | null> {
 const result = await db
 .select({
 video: videos,
 creator: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(eq(videos.id, id))
 .limit(1)

 if (result.length === 0) return null

 const row = result[0]
 return {
 ...row.video,
 creator: row.creator
 }
 }

 async findMany(
 filters: VideoFilters = {},
 pagination: PaginationOptions = {}
 ): Promise<{ videos: VideoWithCreator[]; total: number }> {
 const {
 page = 1,
 limit = 20,
 sortBy = 'createdAt',
 sortOrder = 'desc'
 } = pagination

 const offset = (page - 1) * limit

 const conditions = []
 
 if (filters.creatorId) {
 conditions.push(eq(videos.creatorId, filters.creatorId))
 }
 
 if (filters.category) {
 conditions.push(eq(videos.category, filters.category))
 }
 
 if (filters.isActive !== undefined) {
 conditions.push(eq(videos.isActive, filters.isActive))
 }
 
 if (filters.search) {
 conditions.push(
 or(
 ilike(videos.title, `%${filters.search}%`),
 ilike(videos.description, `%${filters.search}%`)
 )
 )
 }

 const whereClause = conditions.length > 0 ? and(...conditions) : undefined

 const sortColumn = videos[sortBy]
 const orderClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

 const videosResult = await db
 .select({
 video: videos,
 creator: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(whereClause)
 .orderBy(orderClause)
 .limit(limit)
 .offset(offset)

 const countResult = await db
 .select({ count: sql<number>`count(*)` })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(whereClause)
 const { count } = countResult[0] as { count: number }

 const videosWithCreator = videosResult.map(row => ({
 ...row.video,
 creator: row.creator
 }))

 return {
 videos: videosWithCreator,
 total: count
 }
 }

 async findByCreator(
 creatorId: string,
 pagination: PaginationOptions = {}
 ): Promise<{ videos: Video[]; total: number }> {
 const {
 page = 1,
 limit = 20,
 sortBy = 'createdAt',
 sortOrder = 'desc'
 } = pagination

 const offset = (page - 1) * limit
 const sortColumn = videos[sortBy]
 const orderClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

 const videosResult = await db
 .select()
 .from(videos)
 .where(eq(videos.creatorId, creatorId))
 .orderBy(orderClause)
 .limit(limit)
 .offset(offset)

 const countResult = await db
 .select({ count: sql<number>`count(*)` })
 .from(videos)
 .where(eq(videos.creatorId, creatorId))
 const { count } = countResult[0] as { count: number }

 return {
 videos: videosResult,
 total: count
 }
 }

 async update(id: string, videoData: Partial<NewVideo>): Promise<Video | null> {
 const result = await db
 .update(videos)
 .set({ ...videoData, updatedAt: new Date() })
 .where(eq(videos.id, id))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as Video : null
 }

 async delete(id: string): Promise<boolean> {
 const result = await db.delete(videos).where(eq(videos.id, id))
 return (result.rowCount ?? 0) > 0
 }

 async incrementViewCount(id: string): Promise<Video | null> {
 const result = await db
 .update(videos)
 .set({ 
 viewCount: sql`${videos.viewCount} + 1`,
 updatedAt: new Date()
 })
 .where(eq(videos.id, id))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as Video : null
 }

 async updateEarnings(id: string, amount: number): Promise<Video | null> {
 const result = await db
 .update(videos)
 .set({ 
 totalEarnings: sql`${videos.totalEarnings} + ${amount}`,
 updatedAt: new Date()
 })
 .where(eq(videos.id, id))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as Video : null
 }

 async getTrending(limit: number = 10): Promise<VideoWithCreator[]> {
 const result = await db
 .select({
 video: videos,
 creator: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(eq(videos.isActive, true))
 .orderBy(desc(videos.viewCount), desc(videos.createdAt))
 .limit(limit)

 return result.map(row => ({
 ...row.video,
 creator: row.creator
 }))
 }

 async getFeatured(limit: number = 10): Promise<VideoWithCreator[]> {
 const result = await db
 .select({
 video: videos,
 creator: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(eq(videos.isActive, true))
 .orderBy(desc(videos.totalEarnings), desc(videos.viewCount))
 .limit(limit)

 return result.map(row => ({
 ...row.video,
 creator: row.creator
 }))
 }

 async getCategories(): Promise<string[]> {
 const result = await db
 .selectDistinct({ category: videos.category })
 .from(videos)
 .where(eq(videos.isActive, true))
 .orderBy(asc(videos.category))

 return result.map(row => row.category)
 }

 async findPremiumContent(category?: string | null): Promise<VideoWithCreator[]> {
 const conditions = [
 eq(videos.isActive, true),
 sql`${videos.creditCost} >= 10` // Consider videos with 10+ credits as premium
 ]

 if (category && category !== 'all') {
 conditions.push(eq(videos.category, category))
 }

 const result = await db
 .select({
 video: videos,
 creator: {
 id: users.id,
 username: users.username,
 displayName: users.username, // Use username as displayName for now
 avatar: users.avatar
 }
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(and(...conditions))
 .orderBy(desc(videos.createdAt))
 .limit(20)

 return result.map(row => ({
 ...row.video,
 creator: row.creator
 }))
 }
}

export const videoRepository = new VideoRepository()