import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userRepository } from '@/lib/database/repositories/users'
import { db } from '@/lib/database/connection'
import { coinTransactions, type CoinTransactionType, type CoinTransactionStatus } from '@/lib/database/schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
 try {
 const { userId: clerkUserId } = await auth()
 
 if (!clerkUserId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const user = await userRepository.findByClerkId(clerkUserId)
 
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 const { searchParams } = new URL(request.url)

 const page = parseInt(searchParams.get('page') || '1')
 const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Cap at 100
 const offset = (page - 1) * limit

 const conditions = [eq(coinTransactions.userId, user.id)]

 const type = searchParams.get('type')
 if (type && ['purchase', 'spend', 'earn', 'refund'].includes(type)) {
 conditions.push(eq(coinTransactions.transactionType, type as CoinTransactionType))
 }

 const status = searchParams.get('status')
 if (status && ['pending', 'completed', 'failed', 'refunded'].includes(status)) {
 conditions.push(eq(coinTransactions.status, status as CoinTransactionStatus))
 }

 const startDate = searchParams.get('startDate')
 if (startDate) {
 try {
 const start = new Date(startDate)
 conditions.push(gte(coinTransactions.createdAt, start))
 } catch (e) {

 }
 }

 const endDate = searchParams.get('endDate')
 if (endDate) {
 try {
 const end = new Date(endDate)
 conditions.push(lte(coinTransactions.createdAt, end))
 } catch (e) {

 }
 }

 const contentType = searchParams.get('contentType')
 if (contentType && (contentType === 'video' || contentType === 'series')) {
 conditions.push(eq(coinTransactions.relatedContentType, contentType as 'video' | 'series'))
 }

 const transactions = await db
 .select({
 id: coinTransactions.id,
 transactionType: coinTransactions.transactionType,
 coinAmount: coinTransactions.coinAmount,
 rupeeAmount: coinTransactions.rupeeAmount,
 relatedContentType: coinTransactions.relatedContentType,
 relatedContentId: coinTransactions.relatedContentId,
 paymentId: coinTransactions.paymentId,
 status: coinTransactions.status,
 description: coinTransactions.description,
 createdAt: coinTransactions.createdAt,
 })
 .from(coinTransactions)
 .where(and(...conditions))
 .orderBy(desc(coinTransactions.createdAt))
 .limit(limit)
 .offset(offset)

 const countResult = await db
 .select({ count: sql<number>`count(*)::int` })
 .from(coinTransactions)
 .where(and(...conditions))

 const total = countResult[0]?.count || 0
 const totalPages = Math.ceil(total / limit)

 const formattedTransactions = transactions.map(tx => ({
 ...tx,
 rupeeAmount: tx.rupeeAmount ? parseFloat(tx.rupeeAmount) : null
 }))

 return NextResponse.json({
 transactions: formattedTransactions,
 pagination: {
 page,
 limit,
 total,
 totalPages,
 hasMore: page < totalPages
 }
 })
 } catch (error) {
 console.error('Error fetching coin transactions:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}
