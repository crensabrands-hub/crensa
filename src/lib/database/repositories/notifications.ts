

import { eq, desc, and } from 'drizzle-orm'
import { db } from '../connection'
import { notifications, type Notification, type NewNotification } from '../schema'

export class NotificationsRepository {
 
 async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
 return await db
 .select()
 .from(notifications)
 .where(eq(notifications.userId, userId))
 .orderBy(desc(notifications.createdAt))
 .limit(limit)
 }

 async findUnreadByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
 return await db
 .select()
 .from(notifications)
 .where(and(
 eq(notifications.userId, userId),
 eq(notifications.isRead, false)
 ))
 .orderBy(desc(notifications.createdAt))
 .limit(limit)
 }

 async create(notificationData: NewNotification): Promise<Notification> {
 const result = await db
 .insert(notifications)
 .values(notificationData)
 .returning()

 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create notification')
 }
 return result[0] as Notification
 }

 async markAsRead(id: string): Promise<Notification | null> {
 const result = await db
 .update(notifications)
 .set({ isRead: true, updatedAt: new Date() })
 .where(eq(notifications.id, id))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as Notification : null
 }

 async markAllAsRead(userId: string): Promise<number> {
 const result = await db
 .update(notifications)
 .set({ isRead: true, updatedAt: new Date() })
 .where(and(
 eq(notifications.userId, userId),
 eq(notifications.isRead, false)
 ))

 return result.rowCount ?? 0
 }

 async delete(id: string): Promise<boolean> {
 const result = await db
 .delete(notifications)
 .where(eq(notifications.id, id))

 return (result.rowCount ?? 0) > 0
 }

 async deleteAllForUser(userId: string): Promise<number> {
 const result = await db
 .delete(notifications)
 .where(eq(notifications.userId, userId))

 return result.rowCount ?? 0
 }

 async getUnreadCount(userId: string): Promise<number> {
 const result = await db
 .select({ count: notifications.id })
 .from(notifications)
 .where(and(
 eq(notifications.userId, userId),
 eq(notifications.isRead, false)
 ))

 return result.length
 }
}

export const notificationsRepository = new NotificationsRepository()