

import { eq, and, ne } from 'drizzle-orm'
import { db } from '../connection'
import { users, creatorProfiles, memberProfiles, type User, type NewUser, type CreatorProfile, type NewCreatorProfile, type MemberProfile, type NewMemberProfile } from '../schema'

export interface UserWithProfile extends User {
 creatorProfile?: CreatorProfile
 memberProfile?: MemberProfile
}

export class UserRepository {
 
 async create(userData: NewUser): Promise<User> {
 const result = await db.insert(users).values(userData).returning()
 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create user')
 }
 return result[0] as User
 }

 async findById(id: string): Promise<UserWithProfile | null> {
 const result = await db
 .select()
 .from(users)
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .leftJoin(memberProfiles, eq(users.id, memberProfiles.userId))
 .where(eq(users.id, id))
 .limit(1)

 if (result.length === 0) return null

 const row = result[0]
 if (!row || !row.users) return null

 return {
 ...row.users,
 creatorProfile: row.creator_profiles || undefined,
 memberProfile: row.member_profiles || undefined
 }
 }

 async findByClerkId(clerkId: string): Promise<UserWithProfile | null> {
 const result = await db
 .select()
 .from(users)
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .leftJoin(memberProfiles, eq(users.id, memberProfiles.userId))
 .where(eq(users.clerkId, clerkId))
 .limit(1)

 if (result.length === 0) return null

 const row = result[0]
 if (!row || !row.users) return null

 return {
 ...row.users,
 creatorProfile: row.creator_profiles || undefined,
 memberProfile: row.member_profiles || undefined
 }
 }

 async findByEmail(email: string): Promise<UserWithProfile | null> {
 const result = await db
 .select()
 .from(users)
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .leftJoin(memberProfiles, eq(users.id, memberProfiles.userId))
 .where(eq(users.email, email))
 .limit(1)

 if (result.length === 0) return null

 const row = result[0]
 if (!row || !row.users) return null

 return {
 ...row.users,
 creatorProfile: row.creator_profiles || undefined,
 memberProfile: row.member_profiles || undefined
 }
 }

 async findByUsername(username: string): Promise<UserWithProfile | null> {
 const result = await db
 .select()
 .from(users)
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .leftJoin(memberProfiles, eq(users.id, memberProfiles.userId))
 .where(eq(users.username, username))
 .limit(1)

 if (result.length === 0) return null

 const row = result[0]
 if (!row || !row.users) return null

 return {
 ...row.users,
 creatorProfile: row.creator_profiles || undefined,
 memberProfile: row.member_profiles || undefined
 }
 }

 async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
 const result = await db
 .update(users)
 .set({ ...userData, updatedAt: new Date() })
 .where(eq(users.id, id))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as User : null
 }

 async delete(id: string): Promise<boolean> {
 const result = await db.delete(users).where(eq(users.id, id))
 return (result.rowCount ?? 0) > 0
 }

 async createCreatorProfile(profileData: NewCreatorProfile): Promise<CreatorProfile> {
 const result = await db.insert(creatorProfiles).values(profileData).returning()
 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create creator profile')
 }
 return result[0] as CreatorProfile
 }

 async createMemberProfile(profileData: NewMemberProfile): Promise<MemberProfile> {
 const result = await db.insert(memberProfiles).values(profileData).returning()
 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create member profile')
 }
 return result[0] as MemberProfile
 }

 async updateCreatorProfile(userId: string, profileData: Partial<NewCreatorProfile>): Promise<CreatorProfile | null> {
 const result = await db
 .update(creatorProfiles)
 .set({ ...profileData, updatedAt: new Date() })
 .where(eq(creatorProfiles.userId, userId))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as CreatorProfile : null
 }

 async updateMemberProfile(userId: string, profileData: Partial<NewMemberProfile>): Promise<MemberProfile | null> {
 const result = await db
 .update(memberProfiles)
 .set({ ...profileData, updatedAt: new Date() })
 .where(eq(memberProfiles.userId, userId))
 .returning()

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as MemberProfile : null
 }

 async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
 const conditions = [eq(users.username, username)]
 
 if (excludeUserId) {

 conditions.push(ne(users.id, excludeUserId))
 }

 const result = await db
 .select({ id: users.id })
 .from(users)
 .where(conditions.length > 1 ? and(...conditions) : conditions[0])
 .limit(1)

 return result.length === 0
 }

 async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
 const conditions = [eq(users.email, email)]
 
 if (excludeUserId) {

 conditions.push(ne(users.id, excludeUserId))
 }

 const result = await db
 .select({ id: users.id })
 .from(users)
 .where(conditions.length > 1 ? and(...conditions) : conditions[0])
 .limit(1)

 return result.length === 0
 }

 async findAll(): Promise<UserWithProfile[]> {
 const result = await db
 .select()
 .from(users)
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .leftJoin(memberProfiles, eq(users.id, memberProfiles.userId))

 return result
 .filter(row => row && row.users)
 .map(row => ({
 ...row.users,
 creatorProfile: row.creator_profiles || undefined,
 memberProfile: row.member_profiles || undefined
 }))
 }
}

export const userRepository = new UserRepository()