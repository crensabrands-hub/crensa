import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { transactionRepository } from '@/lib/database/repositories/transactions'

export async function GET(
 _request: NextRequest,
 { params }: { params: Promise<{ userId: string }> }
) {
 try {
 const { userId } = await params

 if (!userId) {
 return NextResponse.json(
 { error: 'User ID is required' },
 { status: 400 }
 )
 }

 const user = await userRepository.findById(userId)
 if (!user || !user.memberProfile) {
 return NextResponse.json(
 { error: 'User not found or not a member' },
 { status: 404 }
 )
 }

 const membershipTransactions = await transactionRepository.findByUserAndTypes(
 userId,
 ['membership_activation', 'membership_upgrade', 'membership_renewal', 'membership_cancellation']
 )

 const membershipHistory = membershipTransactions.map(transaction => {
 const metadata = transaction.metadata as any || {}
 
 let type: 'activation' | 'upgrade' | 'renewal' | 'cancellation'
 switch (transaction.type) {
 case 'membership_activation':
 type = 'activation'
 break
 case 'membership_upgrade':
 type = 'upgrade'
 break
 case 'membership_renewal':
 type = 'renewal'
 break
 case 'membership_cancellation':
 type = 'cancellation'
 break
 default:
 type = 'activation'
 }

 return {
 id: transaction.id,
 type,
 planName: metadata.planName || 'Premium Membership',
 amount: parseFloat(transaction.amount),
 date: transaction.createdAt,
 status: transaction.status as 'completed' | 'pending' | 'failed'
 }
 })

 membershipHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

 return NextResponse.json(membershipHistory)
 } catch (error) {
 console.error('Error fetching membership history:', error)
 return NextResponse.json(
 { error: 'Failed to fetch membership history' },
 { status: 500 }
 )
 }
}