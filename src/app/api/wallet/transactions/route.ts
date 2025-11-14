import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import { userRepository } from '@/lib/database/repositories/users'
import type { TransactionFilters, PaginationOptions } from '@/lib/database/repositories/transactions'
import type { TransactionType } from '@/types/database'

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
 const limit = parseInt(searchParams.get('limit') || '20')
 const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'amount'
 const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

 const filters: TransactionFilters = {
 userId: user.id, // Always filter by current user (using database UUID)
 }

 const type = searchParams.get('type')
 if (type && type !== 'all') {

 const typeMap: Record<string, TransactionType> = {
 'purchase': 'credit_purchase',
 'spend': 'video_view',
 'earn': 'creator_earning',
 'series': 'series_purchase',
 'membership': 'membership_activation'
 }
 filters.type = typeMap[type] || type as TransactionType
 }

 const status = searchParams.get('status')
 if (status && status !== 'all') {
 filters.status = status as 'pending' | 'completed' | 'failed'
 }

 const startDate = searchParams.get('startDate')
 if (startDate) {
 filters.startDate = new Date(startDate)
 }

 const endDate = searchParams.get('endDate')
 if (endDate) {
 filters.endDate = new Date(endDate)
 }

 const videoId = searchParams.get('videoId')
 if (videoId) {
 filters.videoId = videoId
 }

 const paginationOptions: PaginationOptions = {
 page,
 limit: Math.min(limit, 100), // Cap at 100 items per page
 sortBy,
 sortOrder
 }

 const result = await transactionRepository.findMany(filters, paginationOptions)

 return NextResponse.json({
 transactions: result.transactions,
 total: result.total,
 page,
 limit: paginationOptions.limit,
 totalPages: Math.ceil(result.total / (paginationOptions.limit || 10))
 })
 } catch (error) {
 console.error('Error fetching wallet transactions:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}

export async function POST(request: NextRequest) {
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

 const body = await request.json()
 const { type, amount, videoId, creatorId, razorpayPaymentId, razorpayOrderId, metadata } = body

 if (!type || !amount) {
 return NextResponse.json(
 { error: 'Missing required fields: type, amount' },
 { status: 400 }
 )
 }

 const validTypes = ['credit_purchase', 'video_view', 'creator_earning']
 if (!validTypes.includes(type)) {
 return NextResponse.json(
 { error: 'Invalid transaction type' },
 { status: 400 }
 )
 }

 const transaction = await transactionRepository.create({
 userId: user.id,
 type,
 amount: amount.toString(),
 videoId,
 creatorId,
 razorpayPaymentId,
 razorpayOrderId,
 status: 'pending',
 metadata
 })

 return NextResponse.json(transaction, { status: 201 })
 } catch (error) {
 console.error('Error creating transaction:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}