

import { eq } from 'drizzle-orm'
import { db } from '../connection'
import { userPreferences, type UserPreferences, type NewUserPreferences } from '../schema'

export class PreferencesRepository {
 
 async findByUserId(userId: string): Promise<UserPreferences | null> {
 const result = await db
 .select()
 .from(userPreferences)
 .where(eq(userPreferences.userId, userId))
 .limit(1)

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as UserPreferences : null
 }

 async create(preferencesData: NewUserPreferences): Promise<UserPreferences> {
 const result = await db
 .insert(userPreferences)
 .values(preferencesData)
 .returning()

 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create user preferences')
 }
 return result[0] as UserPreferences
 }

 async update(userId: string, preferencesData: Partial<NewUserPreferences>): Promise<UserPreferences | null> {
 const result = await db
 .update(userPreferences)
 .set({ ...preferencesData, updatedAt: new Date() })
 .where(eq(userPreferences.userId, userId))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as UserPreferences : null
 }

 async upsert(userId: string, preferencesData: Partial<NewUserPreferences>): Promise<UserPreferences> {
 const existing = await this.findByUserId(userId)
 
 if (existing) {
 return await this.update(userId, preferencesData) || existing
 } else {
 return await this.create({
 userId,
 ...preferencesData
 })
 }
 }

 async delete(userId: string): Promise<boolean> {
 const result = await db
 .delete(userPreferences)
 .where(eq(userPreferences.userId, userId))

 return (result.rowCount ?? 0) > 0
 }
}

export const preferencesRepository = new PreferencesRepository()