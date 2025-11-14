

import { db } from '@/lib/database/connection'
import { 
 videoLikes, 
 videoSaves, 
 videoComments, 
 creatorFollows, 
 videos,
 users,
 notifications,
 type NewVideoLike,
 type NewVideoSave,
 type NewVideoComment,
 type NewCreatorFollow,
 type NewNotification
} from '@/lib/database/schema'
import { eq, and, sql, desc, isNull } from 'drizzle-orm'
import { userRepository } from '@/lib/database/repositories/users'

export interface VideoInteraction {
 userId: string
 videoId: string
 type: 'like' | 'save' | 'comment'
 metadata?: any
}

export class VideoInteractionService {
 
 async toggleLike(userId: string, videoId: string): Promise<{ isLiked: boolean; likeCount: number }> {
 try {

 const existingLike = await db
 .select()
 .from(videoLikes)
 .where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)))
 .limit(1)

 let isLiked: boolean

 if (existingLike.length > 0) {

 await db
 .delete(videoLikes)
 .where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)))
 isLiked = false
 } else {

 const newLike: NewVideoLike = {
 userId,
 videoId
 }
 await db.insert(videoLikes).values(newLike)
 isLiked = true

 const video = await db
 .select({ creatorId: videos.creatorId })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1)

 if (video.length > 0 && video[0].creatorId !== userId) {
 const user = await userRepository.findById(userId)
 if (user) {
 const notification: NewNotification = {
 userId: video[0].creatorId,
 type: 'like',
 title: 'New Like',
 message: `${user.username} liked your video`,
 metadata: { videoId, likerId: userId }
 }
 await db.insert(notifications).values(notification)
 }
 }
 }

 const [{ count }] = await db
 .select({ count: sql<number>`count(*)` })
 .from(videoLikes)
 .where(eq(videoLikes.videoId, videoId))

 return {
 isLiked,
 likeCount: count
 }
 } catch (error) {
 console.error('Error toggling like:', error)
 throw error
 }
 }

 async toggleSave(userId: string, videoId: string): Promise<{ isSaved: boolean }> {
 try {

 const existingSave = await db
 .select()
 .from(videoSaves)
 .where(and(eq(videoSaves.userId, userId), eq(videoSaves.videoId, videoId)))
 .limit(1)

 let isSaved: boolean

 if (existingSave.length > 0) {

 await db
 .delete(videoSaves)
 .where(and(eq(videoSaves.userId, userId), eq(videoSaves.videoId, videoId)))
 isSaved = false
 } else {

 const newSave: NewVideoSave = {
 userId,
 videoId
 }
 await db.insert(videoSaves).values(newSave)
 isSaved = true
 }

 return {
 isSaved
 }
 } catch (error) {
 console.error('Error toggling save:', error)
 throw error
 }
 }

 async addComment(userId: string, videoId: string, content: string, parentId?: string): Promise<{ success: boolean; commentId?: string }> {
 try {
 const user = await userRepository.findById(userId)
 if (!user) {
 throw new Error('User not found')
 }

 const newComment: NewVideoComment = {
 userId,
 videoId,
 content,
 parentId: parentId || null
 }

 const [comment] = await db.insert(videoComments).values(newComment).returning()

 const video = await db
 .select({ creatorId: videos.creatorId })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1)

 if (video.length > 0 && video[0].creatorId !== userId) {
 const notification: NewNotification = {
 userId: video[0].creatorId,
 type: 'comment',
 title: 'New Comment',
 message: `${user.username} commented on your video`,
 metadata: { videoId, commentId: comment.id, commenterId: userId }
 }
 await db.insert(notifications).values(notification)
 }

 return {
 success: true,
 commentId: comment.id
 }
 } catch (error) {
 console.error('Error adding comment:', error)
 return {
 success: false
 }
 }
 }

 async toggleFollow(userId: string, creatorId: string): Promise<{ isFollowing: boolean }> {
 try {
 if (userId === creatorId) {
 throw new Error('Cannot follow yourself')
 }

 const existingFollow = await db
 .select()
 .from(creatorFollows)
 .where(and(eq(creatorFollows.followerId, userId), eq(creatorFollows.creatorId, creatorId)))
 .limit(1)

 let isFollowing: boolean

 if (existingFollow.length > 0) {

 await db
 .delete(creatorFollows)
 .where(and(eq(creatorFollows.followerId, userId), eq(creatorFollows.creatorId, creatorId)))
 isFollowing = false
 } else {

 const newFollow: NewCreatorFollow = {
 followerId: userId,
 creatorId
 }
 await db.insert(creatorFollows).values(newFollow)
 isFollowing = true

 const user = await userRepository.findById(userId)
 if (user) {
 const notification: NewNotification = {
 userId: creatorId,
 type: 'follower',
 title: 'New Follower',
 message: `${user.username} started following you`,
 metadata: { followerId: userId }
 }
 await db.insert(notifications).values(notification)
 }
 }

 return {
 isFollowing
 }
 } catch (error) {
 console.error('Error toggling follow:', error)
 throw error
 }
 }

 async getInteractionStatus(userId: string, videoId: string): Promise<{
 isLiked: boolean
 isSaved: boolean
 isFollowingCreator: boolean
 likeCount: number
 commentCount: number
 }> {
 try {

 const video = await db
 .select({ creatorId: videos.creatorId })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1)

 if (video.length === 0) {
 throw new Error('Video not found')
 }

 const creatorId = video[0].creatorId

 const likeCheck = await db
 .select()
 .from(videoLikes)
 .where(and(eq(videoLikes.userId, userId), eq(videoLikes.videoId, videoId)))
 .limit(1)

 const saveCheck = await db
 .select()
 .from(videoSaves)
 .where(and(eq(videoSaves.userId, userId), eq(videoSaves.videoId, videoId)))
 .limit(1)

 const followCheck = await db
 .select()
 .from(creatorFollows)
 .where(and(eq(creatorFollows.followerId, userId), eq(creatorFollows.creatorId, creatorId)))
 .limit(1)

 const [{ likeCount }] = await db
 .select({ likeCount: sql<number>`count(*)` })
 .from(videoLikes)
 .where(eq(videoLikes.videoId, videoId))

 const [{ commentCount }] = await db
 .select({ commentCount: sql<number>`count(*)` })
 .from(videoComments)
 .where(eq(videoComments.videoId, videoId))

 return {
 isLiked: likeCheck.length > 0,
 isSaved: saveCheck.length > 0,
 isFollowingCreator: followCheck.length > 0,
 likeCount,
 commentCount
 }
 } catch (error) {
 console.error('Error getting interaction status:', error)
 return {
 isLiked: false,
 isSaved: false,
 isFollowingCreator: false,
 likeCount: 0,
 commentCount: 0
 }
 }
 }

 async getVideoComments(videoId: string, limit: number = 20, offset: number = 0): Promise<{
 comments: Array<{
 id: string
 content: string
 createdAt: Date
 isEdited: boolean
 user: {
 id: string
 username: string
 avatar: string | null
 }
 replies?: Array<{
 id: string
 content: string
 createdAt: Date
 isEdited: boolean
 user: {
 id: string
 username: string
 avatar: string | null
 }
 }>
 }>
 total: number
 }> {
 try {

 const commentsResult = await db
 .select({
 comment: videoComments,
 user: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(videoComments)
 .innerJoin(users, eq(videoComments.userId, users.id))
 .where(and(eq(videoComments.videoId, videoId), isNull(videoComments.parentId)))
 .orderBy(desc(videoComments.createdAt))
 .limit(limit)
 .offset(offset)

 const [{ total }] = await db
 .select({ total: sql<number>`count(*)` })
 .from(videoComments)
 .where(and(eq(videoComments.videoId, videoId), isNull(videoComments.parentId)))

 const commentsWithReplies = await Promise.all(
 commentsResult.map(async (row) => {
 const repliesResult = await db
 .select({
 comment: videoComments,
 user: {
 id: users.id,
 username: users.username,
 avatar: users.avatar
 }
 })
 .from(videoComments)
 .innerJoin(users, eq(videoComments.userId, users.id))
 .where(eq(videoComments.parentId, row.comment.id))
 .orderBy(videoComments.createdAt)
 .limit(5) // Limit replies per comment

 return {
 id: row.comment.id,
 content: row.comment.content,
 createdAt: row.comment.createdAt,
 isEdited: row.comment.isEdited,
 user: row.user,
 replies: repliesResult.map(reply => ({
 id: reply.comment.id,
 content: reply.comment.content,
 createdAt: reply.comment.createdAt,
 isEdited: reply.comment.isEdited,
 user: reply.user
 }))
 }
 })
 )

 return {
 comments: commentsWithReplies,
 total
 }
 } catch (error) {
 console.error('Error getting video comments:', error)
 return {
 comments: [],
 total: 0
 }
 }
 }
}

export const videoInteractionService = new VideoInteractionService()