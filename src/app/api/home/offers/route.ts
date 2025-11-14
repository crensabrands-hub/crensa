import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'
import { promotionalOffers } from '@/lib/database/schema'
import { and, eq, gte, lte, or, isNull, sql } from 'drizzle-orm'

export async function GET(_request: NextRequest) {
 try {
 const now = new Date()

 const activeOffers = await db
 .select()
 .from(promotionalOffers)
 .where(
 and(
 eq(promotionalOffers.isActive, true),
 lte(promotionalOffers.validFrom, now),
 gte(promotionalOffers.validUntil, now),
 or(
 eq(promotionalOffers.isLimited, false),
 and(
 eq(promotionalOffers.isLimited, true),
 or(
 isNull(promotionalOffers.totalCount),
 sql`${promotionalOffers.usedCount} < ${promotionalOffers.totalCount}`
 )
 )
 )
 )
 )
 .orderBy(promotionalOffers.createdAt)

 const offersWithRemainingCount = activeOffers.map(offer => ({
 ...offer,
 remainingCount: offer.isLimited && offer.totalCount 
 ? offer.totalCount - offer.usedCount 
 : null
 }))

 return NextResponse.json(offersWithRemainingCount)
 } catch (error) {
 console.error('Error fetching offers:', error)
 return NextResponse.json(
 { error: 'Failed to fetch offers' },
 { status: 500 }
 )
 }
}